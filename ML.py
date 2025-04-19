# ML.py - Logic for Scan Processing and Database Interaction
from config import ROBOFLOW
import sqlite3
import base64
from datetime import datetime
from flask import jsonify # Keep jsonify temporarily for serialization if needed, or use json module
import json # Use standard json for serialization within this module
from inference_sdk import InferenceHTTPClient

# --- Configuration ---
DB_PATH = "scans.db"  # Database file path

# --- Roboflow Client Initialization ---
# !! IMPORTANT: Replace with your actual API key and Model ID !!
# Consider using environment variables for the API key in production.
try:
    RF_API_KEY = ROBOFLOW  # Replace!
    RF_MODEL_ID = "early-detection-xvxmf/1" # Replace! e.g., "early-detection-xvxmf/1"


    RF = InferenceHTTPClient(
        api_url="https://detect.roboflow.com", # Or appropriate URL for your model type
        api_key=RF_API_KEY
    )
    print("Roboflow client initialized successfully.")
except ValueError as ve:
     print(f"Configuration Error: {ve}")
     RF = None
except Exception as e:
    print(f"Error initializing Roboflow client: {e}")
    RF = None

# --- Database Initialization Function ---
def init_db():
    """Creates the scans table if it doesn't already exist."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS scans (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fullName TEXT NOT NULL,
                    age INTEGER NOT NULL,
                    gender TEXT NOT NULL,
                    contact TEXT,
                    timestamp TEXT NOT NULL,
                    result_json TEXT NOT NULL,
                    primary_class TEXT
                )
            """)
            conn.commit()
        print(f"Database initialized successfully at {DB_PATH}")
        return True # Indicate success
    except sqlite3.Error as e:
        print(f"Database Error during initialization: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during DB init: {e}")
    return False # Indicate failure

# --- Core Scan Processing Function ---
def process_scan(img_b64, user_info):
    """
    Performs inference, fetches previous scan, saves current scan, and returns results.

    Args:
        img_b64 (str): Base64 encoded image string.
        user_info (dict): Dictionary containing 'fullName', 'age', 'gender', 'contact'.

    Returns:
        dict: Contains 'current' (inference result) and 'previous' (previous result JSON string or None).

    Raises:
        ConnectionError: If Roboflow client isn't initialized or inference/DB operations fail.
        ValueError: If image decoding fails.
        sqlite3.Error: If database operations encounter issues.
    """
    if not RF or not RF_MODEL_ID:
        raise ConnectionError("Roboflow client not properly initialized.")

    # 1) Run inference
    try:
        img_bytes = base64.b64decode(img_b64)
        current_result = RF.infer(img_b64, model_id=RF_MODEL_ID)
        print(f"Inference successful for user: {user_info.get('fullName')}")
    except Exception as e:
      print("new error",e)

    # Extract primary prediction (adjust based on your model type - detection/classification)
    primary_class = "Unknown"
    try:
        if isinstance(current_result, dict) and 'predictions' in current_result and current_result['predictions']:
            predictions = sorted(current_result['predictions'], key=lambda x: x.get('confidence', 0), reverse=True)
            if predictions:
                primary_class = predictions[0].get('class', 'Unknown')
        elif isinstance(current_result, list) and current_result: # Simple classification list
            # Assuming the list is sorted or the first item is relevant
             primary_class = current_result[0].get('class', 'Unknown')
        print(f"Extracted primary class: {primary_class}")
    except Exception as e:
        print(f"Warning: Could not extract primary class from result. {e}")
        # Continue without primary_class if extraction fails

    # Serialize the full result using standard json
    try:
        result_json_str = json.dumps(current_result)
    except TypeError as e:
        print(f"Error serializing inference result: {e}")
        # Decide how to handle: store placeholder, raise error?
        result_json_str = json.dumps({"error": "Result serialization failed"})


    # 2) Fetch previous scan for this contact
    previous_result_json_str = None
    contact = user_info.get("contact")
    if contact: # Only query if contact info is provided and not empty
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cur = conn.execute(
                    "SELECT result_json FROM scans WHERE contact = ? ORDER BY timestamp DESC LIMIT 1",
                    (contact,)
                )
                row = cur.fetchone()
                if row:
                    previous_result_json_str = row[0]
                # print(f"Previous scan lookup for contact {contact}: {'Found' if row else 'Not Found'}")
        except sqlite3.Error as e:
            print(f"Database Error fetching previous scan for contact {contact}: {e}")
            # Decide if this is critical. Maybe log and continue.

    # 3) Save the new scan
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                """INSERT INTO scans
                   (fullName, age, gender, contact, timestamp, result_json, primary_class)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    user_info.get("fullName", "N/A"),
                    user_info.get("age", 0),
                    user_info.get("gender", "N/A"),
                    contact, # Store None if not provided
                    datetime.utcnow().isoformat() + "Z", # ISO 8601 UTC format
                    result_json_str,
                    primary_class
                )
            )
            conn.commit()
            print(f"New scan saved for user {user_info.get('fullName')}")
    except sqlite3.Error as e:
        print(f"Database Error saving new scan for user {user_info.get('fullName')}: {e}")
        # This is likely a critical error, re-raise it to be caught by the route handler
        raise ConnectionError(f"Failed to save scan results to database: {e}") from e

    # 4) Return structured results
    return {
        "current": current_result,
        "previous": previous_result_json_str # Send back the raw JSON string from DB
    }