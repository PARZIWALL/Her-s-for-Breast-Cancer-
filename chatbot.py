import os
import google.generativeai as genai
from config import GEMINI_API_KEY  # Or just hardcode if needed

# -----------------------------
# Setup Gemini Client
# -----------------------------
def setup_gemini():
    api_key = os.environ.get("GEMINI_API_KEY") or GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is required.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.0-flash")

# -----------------------------
# Get Chat Response Using Gemini
# -----------------------------
def get_chat_response(user_message):
    """
    Uses Gemini to generate an AI response to the user's breast cancer-related query.
    The prompt ensures it pulls from medically reliable information.
    """
    model = setup_gemini()

    # System prompt to anchor it on reliable, evidence-based knowledge
    prompt = f"""
You are an expert digital health assistant trained in cancer awareness and women's health.

Your task is to answer user questions specifically about **breast cancer** in a conversational yet medically reliable way.
Please follow these principles:

1. Only rely on credible and peer-reviewed medical sources such as:
   - American Cancer Society (https://www.cancer.org)
   - National Cancer Institute (https://www.cancer.gov)
   - Mayo Clinic (https://www.mayoclinic.org)
   - World Health Organization (https://www.who.int)
   - Susan G. Komen Foundation (https://komen.org)

2. Answer clearly, concisely, and empathetically. Avoid overly complex medical jargon.
3. If you don't have a certain answer, politely guide the user to speak with a certified healthcare provider.
4. Always prioritize patient safety and emotional support.
5. If u are unable to find satisfying results from the website then answer according to your knowledge or search over the web
6. Output format is just a paragraph of a maximum 100 words with no special characters paragraph change is good but do not exceed word limit of 100 keep it as concise as possible.

User question: "{user_message}"

Your response:
"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"⚠️ Gemini was unable to generate a response at this time. Please try again later. Error: {str(e)}"
