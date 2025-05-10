# app.py - Flask Application Routes

import sqlite3 # Keep for potential direct error handling if needed
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Import Logic Modules ---
try:
    import ML as ml_logic 
    print("Done")
    # Import the logic functions and initialization from ML.py
    
except ImportError:
    print("FATAL ERROR: ML.py not found. Scan processing will fail.")
    # Define dummy functions to prevent app crash on import error, but log clearly
    ml_logic = type('obj', (object,), {'init_db': lambda: False, 'process_scan': lambda img, usr: (_ for _ in ()).throw(ImportError("ML module missing"))})()


try:
    from risk_assessment import run_quiz_from_conversation
except ImportError:
    print("Warning: risk_assessment module not found. /api/risk-assessment endpoint will fail.")
    def run_quiz_from_conversation(conv): return {"error": "Module not found"}

try:
    from chatbot import get_chat_response
except ImportError:
    print("Warning: chatbot module not found. /api/chat endpoint will fail.")
    def get_chat_response(msg): return "Chatbot module not found"


# --- Flask App Initialization ---
app = Flask("her's")
CORS(app, origins=["http://localhost:3000", "YOUR_PRODUCTION_FRONTEND_URL"]) # Add production URL

# --- Initialize Database via ML module ---
if not ml_logic.init_db():
     print("FATAL ERROR: Database initialization failed. Application might not function correctly.")
     # You might want to exit here if the DB is absolutely critical
     # import sys
     # sys.exit(1)


# --- API Routes ---

@app.route('/api/check_scan', methods=['POST'])
def check_scan_route():
    """Endpoint to receive scan image and user info, process via ML module, and return results."""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 415

    data = request.get_json()
    img_b64 = data.get("image")
    user_info = {
        "fullName": data.get("fullName"),
        "age": data.get("age"),
        "gender": data.get("gender"),
        "contact": data.get("contact"),
    }

    # Basic Validation
    if not img_b64:
        return jsonify({"error": "Missing 'image' data (base64 encoded)."}), 400
    if not user_info["fullName"] or not user_info["age"] or not user_info["gender"]:
        return jsonify({"error": "Missing required fields: 'fullName', 'age', 'gender'."}), 400

    try:
        # Call the processing function from the ML module
        results = ml_logic.process_scan(img_b64, user_info)

        # The previous result is already a JSON string, current is a dict/list
        # We can return this structure directly
        return jsonify(results), 200

    # Handle specific errors that might be raised from process_scan
    except ConnectionError as e:
        print(f"Connection/Processing Error in check_scan_route: {e}")
        return jsonify({"error": f"Processing failed: {e}"}), 500 # Use 500 for server-side issues
    except ValueError as e:
        print(f"Value Error in check_scan_route: {e}")
        return jsonify({"error": f"Invalid input data: {e}"}), 400 # Use 400 for client-side data errors
    except sqlite3.Error as e: # Catch potential DB errors bubbled up
        print(f"Database Error in check_scan_route: {e}")
        return jsonify({"error": "A database error occurred."}), 500
    except Exception as e:
        # Catch-all for other unexpected errors
        print(f"Unexpected Error in /api/check_scan route: {e.__class__.__name__}: {e}")
        return jsonify({"error": "An unexpected server error occurred."}), 500


# --- Other Routes (Risk Assessment, Chatbot) ---
# Keep these routes as they were in the previous combined version,
# ensuring they handle errors gracefully.

@app.route('/api/risk-assessment', methods=['POST'])
def risk_assessment():
    """Endpoint for risk assessment based on conversation."""
    # (Keep implementation from previous version)
    if not request.is_json: return jsonify({"error": "Request must be JSON"}), 415
    try:
        data = request.get_json(); conversation = data.get("conversation", [])
        if not conversation or not isinstance(conversation, list): return jsonify({"error": "Conversation must be a non-empty list."}), 400
        result = run_quiz_from_conversation(conversation)
        if isinstance(result, dict) and "interpretation" in result:
            risk_assessment_result = result.get("interpretation")
            return jsonify({"risk_assessment_result": risk_assessment_result or "No interpretation available."}), 200
        elif isinstance(result, dict) and "error" in result: return jsonify({"error": result["error"]}), 400
        else: return jsonify({"error": "Failed to process risk assessment."}), 500
    except Exception as e: print(f"Error in /api/risk-assessment: {e}"); return jsonify({"error": "Internal server error."}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Endpoint for the chatbot."""
    # (Keep implementation from previous version)
    if not request.is_json: return jsonify({"error": "Request must be JSON"}), 415
    try:
        user_message = request.get_json().get('message', '')
        if not user_message: return jsonify({"error": "Empty message received."}), 400
        response_message = get_chat_response(user_message)
        return jsonify({'response': response_message}), 200
    except Exception as e: print(f"Error in /api/chat: {e}"); return jsonify({"error": "Internal server error."}), 500


# --- Run Application ---
if __name__ == '__main__':
    print("Starting Flask server...")
    # Use host='0.0.0.0' for network access
    app.run(host='0.0.0.0', port=5000, debug=True) # Use appropriate port