from flask import Flask, request, jsonify, abort,send_from_directory, render_template
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
import logging

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Paths to artifacts
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # backend directory
ARTIFACTS_DIR = os.path.join(BASE_DIR, 'artifacts')
MODEL_PATH = os.path.join(ARTIFACTS_DIR, 'diabetes_model.joblib')
SCALER_PATH = os.path.join(ARTIFACTS_DIR, 'scaler.joblib')
FEATURE_NAMES_PATH = os.path.join(ARTIFACTS_DIR, 'feature_names.joblib')



# --- Application Initialization ---
app = Flask(__name__, static_folder='build', static_url_path='')

# --- CORS Configuration ---
# Allow requests from your React frontend (adjust origin if React runs on a different port/domain)
CORS(app, resources={
    r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}
})

# --- Load ML Components ---
model = None
scaler = None
feature_names = None

def load_ml_components():
    global model, scaler, feature_names
    try:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(f"Scaler file not found at {SCALER_PATH}")
        if not os.path.exists(FEATURE_NAMES_PATH):
            raise FileNotFoundError(f"Feature names file not found at {FEATURE_NAMES_PATH}")

        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        feature_names = joblib.load(FEATURE_NAMES_PATH)
        logging.info("ML model, scaler, and feature names loaded successfully.")
    except Exception as e:
        logging.error(f"Error loading ML components: {e}", exc_info=True)
        # Keep app running but predictions will fail
        model, scaler, feature_names = None, None, None

# Load components when the Flask app starts
with app.app_context():
    load_ml_components()

# --- API Endpoints ---
@app.route('/api/health', methods=['GET'])
def health_check():
    if model and scaler and feature_names:
        return jsonify({"status": "healthy", "message": "API and ML components are up."})
    else:
        return jsonify({"status": "unhealthy", "message": "ML components failed to load."}), 503

@app.route('/api/predict', methods=['POST'])
def predict_diabetes():
    if not model or not scaler or not feature_names:
        logging.error("Prediction attempt while ML components are not loaded.")
        abort(503, description="ML components not available. Prediction service unavailable.")

    if not request.is_json:
        abort(400, description="Request must be JSON.")

    input_data_raw = request.get_json()
    if not input_data_raw:
        abort(400, description="No input data provided in JSON format.")

    # Validate presence of all required features
    missing_keys = [key for key in feature_names if key not in input_data_raw]
    if missing_keys:
        abort(400, description=f"Missing input features: {', '.join(missing_keys)}")

    try:
        # Prepare input DataFrame in the correct order and type
        input_values_ordered = {}
        for feature in feature_names:
            try:
                input_values_ordered[feature] = float(input_data_raw[feature])
            except (ValueError, TypeError):
                abort(400, description=f"Invalid or non-numeric value for feature: '{feature}' ('{input_data_raw.get(feature)}')")

        input_df = pd.DataFrame([input_values_ordered], columns=feature_names)

        # Scale the input data
        scaled_input = scaler.transform(input_df)

        # Make prediction
        prediction_val = model.predict(scaled_input)
        prediction_proba_val = model.predict_proba(scaled_input)

        result = {
            "prediction": int(prediction_val[0]),
            "probability_no_diabetes": float(prediction_proba_val[0][0]),
            "probability_diabetes": float(prediction_proba_val[0][1]),
            "model_info": str(type(model).__name__) # Optional: info about the model used
        }
        logging.info(f"Prediction successful for input: {input_data_raw}, result: {result}")
        return jsonify(result)

    except Exception as e:
        logging.error(f"Prediction error: {str(e)} for input {input_data_raw}", exc_info=True)
        abort(500, description="An internal error occurred during prediction.")

# Serve React build files
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_file(path):
    # Handle React routing, allowing nested routes
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# --- Run the Flask App ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    # For production, use a WSGI server like Gunicorn:
    # gunicorn --bind 0.0.0.0:8000 app:app
    app.run(host='0.0.0.0', port=port, debug=True) # debug=False for production