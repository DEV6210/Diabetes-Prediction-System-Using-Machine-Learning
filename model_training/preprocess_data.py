import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os
import logging

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # model_training directory
DATASET_PATH = os.path.join(BASE_DIR, 'diabetes.csv')
ARTIFACTS_DIR = os.path.join(BASE_DIR, '..', 'backend', 'artifacts') # Output to backend/artifacts
# Create artifacts directory if it doesn't exist
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

SCALER_PATH = os.path.join(ARTIFACTS_DIR, 'scaler.joblib')
PROCESSED_DATA_DIR = os.path.join(ARTIFACTS_DIR, 'processed_data')
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)

X_TRAIN_PATH = os.path.join(PROCESSED_DATA_DIR, 'X_train.csv')
Y_TRAIN_PATH = os.path.join(PROCESSED_DATA_DIR, 'y_train.csv')
X_TEST_PATH = os.path.join(PROCESSED_DATA_DIR, 'X_test.csv')
Y_TEST_PATH = os.path.join(PROCESSED_DATA_DIR, 'y_test.csv')

def run_preprocessing():
    logging.info("Starting data preprocessing...")
    # 1. Load Data
    try:
        df = pd.read_csv(DATASET_PATH)
        logging.info(f"Dataset '{DATASET_PATH}' loaded successfully. Shape: {df.shape}")
    except FileNotFoundError:
        logging.error(f"Error: Dataset file '{DATASET_PATH}' not found.")
        return

    logging.info("Initial data sample:\n%s", df.head())
    # df.info() # For interactive exploration

    # 2. Handle "Missing" Values (represented as 0 in some columns)
    logging.info("Handling missing values (0s in specific columns)...")
    cols_to_replace_zero = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    for col in cols_to_replace_zero:
        original_zeros = (df[col] == 0).sum()
        df[col] = df[col].replace(0, np.nan)
        logging.info(f"Replaced {original_zeros} zeros with NaN in column '{col}'.")

    # Impute missing values with the median
    for col in cols_to_replace_zero:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col].fillna(median_val, inplace=True)
            logging.info(f"Imputed NaNs in '{col}' with median value: {median_val:.2f}")

    logging.info("Data after imputation (checking for NaNs):\n%s", df.isnull().sum())

    # 3. Feature Engineering (Minimal for this example) & Separation
    if 'Outcome' not in df.columns:
        logging.error("Target column 'Outcome' not found in the dataset.")
        return
    X = df.drop('Outcome', axis=1)
    y = df['Outcome']
    feature_names = X.columns.tolist() # Save feature names

    # 4. Data Scaling
    logging.info("Scaling features using StandardScaler...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X) # Fit scaler on ALL relevant data before splitting
    X_scaled_df = pd.DataFrame(X_scaled, columns=feature_names)

    # Save the scaler
    joblib.dump(scaler, SCALER_PATH)
    logging.info(f"Scaler saved to {SCALER_PATH}")
    # Save feature names with the scaler for consistency
    joblib.dump(feature_names, os.path.join(ARTIFACTS_DIR, 'feature_names.joblib'))
    logging.info(f"Feature names saved to {os.path.join(ARTIFACTS_DIR, 'feature_names.joblib')}")


    # 5. Split Data
    logging.info("Splitting data into training and testing sets (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled_df, y, test_size=0.2, random_state=42, stratify=y
    )
    logging.info(f"Training set: X_train shape {X_train.shape}, y_train shape {y_train.shape}")
    logging.info(f"Test set: X_test shape {X_test.shape}, y_test shape {y_test.shape}")

    # Save the split data
    X_train.to_csv(X_TRAIN_PATH, index=False)
    y_train.to_csv(Y_TRAIN_PATH, index=False, header=True)
    X_test.to_csv(X_TEST_PATH, index=False)
    y_test.to_csv(Y_TEST_PATH, index=False, header=True)
    logging.info(f"Processed training and testing data saved to {PROCESSED_DATA_DIR}")
    logging.info("Data preprocessing complete.")

if __name__ == '__main__':
    run_preprocessing()