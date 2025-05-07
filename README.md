# Diabetes Prediction Software

### Project Overview
The Diabetes Prediction Software is a machine learning-based application developed to predict the likelihood of diabetes in patients based on their health parameters. The software uses a trained ML model to make predictions and is built using Python for the backend and React.js for the frontend.

The application includes data preprocessing, model training, and a RESTful API for real-time predictions.

### Tech Stack
- **Frontend:** React.js  
- **Backend:** Flask, Flask-CORS  
- **Machine Learning:** Scikit-Learn, Pandas, NumPy  
- **Model Deployment:** Joblib  

### Dependencies
Ensure that the following Python libraries are installed by running:

# requirements.txt
```bash
Flask
Flask-CORS
Pandas
NumPy
Scikit-Learn
Joblib
```

```bash
pip install -r requirements.txt
```

```bash
/Diabetes-Prediction-System-Using-Machine-Learning
│
├── model_training/
│   ├── preprocess_data.py
│   ├── train_model.py
│   └── diabetes_model.pkl
│
├── backend/
│   ├── app.py
│   ├── dist/
│   └── requirements_ml.txt
│
└── frontend/
    └── [React.js Files]
```
### Setup and Installation
- **Install Dependencies:**

cd DiabetesPredictionPro/backend
```bash
pip install -r requirements_ml.txt
```

- **Data Preprocessing:**

Navigate to the model training directory and run:

cd DiabetesPredictionPro/model_training.py
```bash
python preprocess_data.py
```
- **Model Training:**
Execute the training script:
cd DiabetesPredictionPro/train_model.py
```bash
python train_model.py
```
- **Run the Backend Server:**
Navigate to the backend directory and start the Flask server:

cd ../backend
```bash
python app.py
```
Explanation of Dependencies
Flask: Backend server to handle API requests.
Flask-CORS: Enables cross-origin requests between the frontend and backend.
Pandas: Data manipulation and preprocessing.
NumPy: Fast numerical computations.
Scikit-Learn: Model training and prediction.
Joblib: Model serialization and deserialization.
