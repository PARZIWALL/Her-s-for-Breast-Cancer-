import json
import os
from groq import Groq
from config import GROQ_API_KEY, GEMINI_API_KEY
import google.generativeai as genai

# ------------------------------
# LLM Chat Completion (Groq)
# ------------------------------
def groq_chat_completion(prompt: str, api_key: str) -> str:
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        stream=False
    )
    return response.choices[0].message.content.strip()

# ------------------------------
# Prompt Generator for Groq Mapping
# ------------------------------
def generate_prompt(question: str, options: list, user_response: str) -> str:
    options_text = "\n".join([
        f"{chr(65+i)}: {opt['text']} - {opt['points']} points"
        for i, opt in enumerate(options)
    ])
    prompt = f"""
You are a helpful assistant categorizing health quiz answers.

Given the question and the user’s free-text response, match it to the most appropriate option from the list. Return only a JSON in the format:
{{
  "selected_option": "A"/"B"/"C"/...,
  "score": number
}}

Question: "{question}"

Options:
{options_text}

User response: "{user_response}"
"""
    print(prompt)
    return prompt

# ------------------------------
# Risk Level Evaluation
# ------------------------------
def get_risk_level(score, scoring_rules):
    for rule in scoring_rules:
        # Allow for ranges like "21+" by replacing '+' with '-999'
        min_score, max_score = map(int, rule["range"].replace("+", "-999").split("-"))
        if min_score <= score <= max_score:
            return rule["risk_level"], rule["interpretation"]
    return "Unknown", "Unable to determine risk level."

# ------------------------------
# Gemini Final Call Function (Structured JSON Output)
# ------------------------------
def gemini_final_call(
    score: int,
    risk_level: str,
    interpretation: str,
    answers: list,
    user_name: str,
    api_key: str
) -> str:
    """
    Sends quiz summary to Gemini and gets a structured JSON response with detailed insights.
    The expected JSON schema is:
    {
      "quiz_analysis": "<educational summary and red flags>",
      "system_recommendation": "<whether the user should see a doctor or not>",
      "credible_sources": [ "<Resource 1>", "<Resource 2>", "<Resource 3>" ],
      "motivational_note": "<motivational closing message with signature>"
    }
    """
    # Configure Gemini
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    # Build the answer summary
    answer_summary = "\n".join([
        f"{i+1}. {a['question']}\n   → You answered: {a['user_answer']}\n   → Mapped to: {a['matched_option']} (Score: {a['score']})"
        for i, a in enumerate(answers)
    ])

    # Construct the prompt with structured output instructions
    prompt = f"""
You are a trusted health assistant tasked with analyzing breast cancer self-assessment results for a user named {user_name}. Your response must be clear, empathetic, and educational.

Here are the key results from the user's quiz:
- Total Score: {score}
- Risk Level: {risk_level}
- Interpretation: {interpretation}

Below is a summary of the user's responses:
{answer_summary}

Based on this, please produce a structured JSON output that strictly follows this schema:

{{
  "quiz_analysis": "<Provide an educational summary including an explanation of the risk factors and any red flags>",
  "system_recommendation": "<State whether the user should see a doctor urgently or if routine follow-up is sufficient>",
  "credible_sources": [ "<Name or URL of credible resource 1>", "<Name or URL of credible resource 2>", "<Name or URL of credible resource 3>" ],
  "motivational_note": "<Include a kind, motivational closing message with a signature>"
}}

Please make sure your output adheres exactly to this JSON structure. Do not include any extra text or keys.
"""
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"⚠️ Gemini API call failed: {e}"

# ------------------------------
# Helper: Parse Gemini Structured Response
# ------------------------------
def parse_gemini_response(gemini_output: str) -> dict:
    """
    Parse the JSON response from Gemini and extract the structured fields.
    Returns a dictionary with keys:
      - quiz_analysis
      - system_recommendation
      - credible_sources
      - motivational_note
    """
    try:
        structured_output = json.loads(gemini_output)
        # Validate that all required keys exist
        required_keys = ["quiz_analysis", "system_recommendation", "credible_sources", "motivational_note"]
        for key in required_keys:
            if key not in structured_output:
                structured_output[key] = ""
        return structured_output
    except Exception as e:
        print(f"Error parsing Gemini output: {e}")
        return {}

# ------------------------------
# Quiz Engine
# ------------------------------
def run_quiz_from_conversation(conversation: list, api=GROQ_API_KEY):
    # Load quiz and API key
    groq_api_key = os.getenv("GROQ_API_KEY") or api
    if not groq_api_key.startswith("gsk_"):
        raise ValueError("Missing or invalid Groq API key.")

    with open("breast_cancer_quiz.json", "r") as f:
        quiz_data = json.load(f)

    # Try extracting user name from the conversation
    user_name = "User"
    for msg in conversation:
        if msg["role"] == "user" and "name is" in msg["content"].lower():
            user_name = msg["content"].split("name is")[-1].strip().strip(".!")
            break

    total_score = 0
    detailed_results = []

    # --- Match assistant question -> next user response ---
    q_index = 0
    i = 0
    while q_index < len(quiz_data["questions"]) and i < len(conversation) - 1:
        assistant_msg = conversation[i]
        next_msg = conversation[i + 1]

        if assistant_msg["role"] == "assistant" and quiz_data["questions"][q_index]["question"] in assistant_msg["content"]:
            if next_msg["role"] == "user":
                question_obj = quiz_data["questions"][q_index]
                user_answer = next_msg["content"]

                prompt = generate_prompt(question_obj["question"], question_obj["options"], user_answer)
                llm_output = groq_chat_completion(prompt, groq_api_key)

                try:
                    parsed = json.loads(llm_output)
                    selected_option = parsed.get("selected_option", "N/A")
                    score = parsed.get("score", 0)
                except Exception as e:
                    print(f"⚠️ Couldn't parse Groq output: {e}")
                    selected_option = "N/A"
                    score = 0

                total_score += score
                detailed_results.append({
                    "question": question_obj["question"],
                    "user_answer": user_answer,
                    "matched_option": selected_option,
                    "score": score
                })
                q_index += 1
                i += 1  # skip next_msg too (user answer)
        i += 1

    # ------------------------------
    # Final Summary and Risk Evaluation
    # ------------------------------
    risk_level, interpretation = get_risk_level(total_score, quiz_data["scoring"])

    gemini_output = gemini_final_call(
        score=total_score,
        risk_level=risk_level,
        interpretation=interpretation,
        answers=detailed_results,
        user_name=user_name,
        api_key=GEMINI_API_KEY
    )
    print(gemini_output)

    insights = parse_gemini_response(gemini_output)
    print(insights)
    return {
        "user_name": user_name,
        "total_score": total_score,
        "risk_level": risk_level,
        "interpretation": interpretation,
        "detailed_results": detailed_results,
        "gemini_insights": insights
    }

# ------------------------------
# Run the Quiz
# ------------------------------
# if __name__ == "__main__":
#     run_quiz(api=GROQ_API_KEY)
