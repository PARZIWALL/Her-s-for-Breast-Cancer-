from flask import Flask, request, jsonify
from risk_assessment import run_quiz_from_conversation
from ML import check
from chatbot import get_chat_response

app = Flask("her's")

# -------------------------------
# 1. Risk Assessment Route
# -------------------------------
@app.route('/api/risk-assessment', methods=['POST'])
def risk_assessment():
    try:
        data = request.get_json()
        conversation = data.get("conversation", [])

        if not conversation or not isinstance(conversation, list):
            return jsonify({"error": "Conversation must be a non-empty list."}), 400

        result = run_quiz_from_conversation(conversation)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# # -------------------------------
# # 3. Chatbot Route
# # -------------------------------
@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.get_json().get('message', '')
    # Logic: call get_chat_response(user_message) to generate AI-driven reply
    return jsonify({'response': get_chat_response(user_message)})

@app.route("/api/check_scan", methods=["POST"])
def check_scan():
    try:
        # Get base64 or URL of image from the POST body
        data = request.get_json()
        img = data.get("image")

        if not img:
            return jsonify({"error": "No image provided."}), 400

        # Call the ML function and return the result
        result = check(img)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/api/check_scan", methods=["POST"])
def check_scan():
    try:
        # Get base64 or URL of image from the POST body
        data = request.get_json()
        img = data.get("image")

        if not img:
            return jsonify({"error": "No image provided."}), 400

        # Call the ML function and return the result
        result = check(img)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
