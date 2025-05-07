import pandas as pd
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
import logging

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # model_training directory
ARTIFACTS_DIR = os.path.join(BASE_DIR, '..', 'backend', 'artifacts')
PROCESSED_DATA_DIR = os.path.join(ARTIFACTS_DIR, 'processed_data')

X_TRAIN_PATH = os.path.join(PROCESSED_DATA_DIR, 'X_train.csv')
Y_TRAIN_PATH = os.path.join(PROCESSED_DATA_DIR, 'y_train.csv')
X_TEST_PATH = os.path.join(PROCESSED_DATA_DIR, 'X_test.csv')
Y_TEST_PATH = os.path.join(PROCESSED_DATA_DIR, 'y_test.csv')

MODEL_OUTPUT_PATH = os.path.join(ARTIFACTS_DIR, 'diabetes_model.joblib')

def run_training():
    logging.info("Starting model training...")
    # 1. Load Preprocessed Data
    try:
        X_train = pd.read_csv(X_TRAIN_PATH)
        y_train = pd.read_csv(Y_TRAIN_PATH)['Outcome']
        X_test = pd.read_csv(X_TEST_PATH)
        y_test = pd.read_csv(Y_TEST_PATH)['Outcome']
        logging.info("Preprocessed data loaded successfully.")
    except FileNotFoundError as e:
        logging.error(f"Error: Preprocessed data file not found: {e}. Run preprocess_data.py first.")
        return

    # 2. Define Models and Hyperparameter Grids (Example using fewer params for speed)
    models_params = {
        'LogisticRegression': {
            'model': LogisticRegression(solver='liblinear', max_iter=500, random_state=42),
            'params': {'C': [0.1, 1, 10], 'penalty': ['l2']} # Reduced for speed
        },
        'RandomForestClassifier': {
            'model': RandomForestClassifier(random_state=42),
            'params': {'n_estimators': [100, 150], 'max_depth': [5, 10], 'min_samples_split': [2, 4]}
        },
        'GradientBoostingClassifier': {
            'model': GradientBoostingClassifier(random_state=42),
            'params': {'n_estimators': [100, 150], 'learning_rate': [0.05, 0.1], 'max_depth': [3, 4]}
        }
    }

    # 3. Train and Evaluate Models using GridSearchCV
    best_model_candidate = None
    best_cv_score = 0.0
    best_model_name = ""
    cv_strategy = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for model_name, mp in models_params.items():
        logging.info(f"--- Training {model_name} ---")
        grid_search = GridSearchCV(mp['model'], mp['params'], cv=cv_strategy, scoring='accuracy', n_jobs=-1, verbose=0)
        grid_search.fit(X_train, y_train)

        logging.info(f"Best parameters for {model_name}: {grid_search.best_params_}")
        logging.info(f"Best cross-validation accuracy for {model_name}: {grid_search.best_score_:.4f}")

        if grid_search.best_score_ > best_cv_score:
            best_cv_score = grid_search.best_score_
            best_model_candidate = grid_search.best_estimator_
            best_model_name = model_name

    if not best_model_candidate:
        logging.error("No model was successfully trained or selected.")
        return

    logging.info(f"\n--- Best Model based on CV: {best_model_name} with CV Accuracy: {best_cv_score:.4f} ---")

    # 4. Evaluate the chosen best model on the test set
    y_pred_test = best_model_candidate.predict(X_test)
    test_accuracy = accuracy_score(y_test, y_pred_test)
    logging.info(f"Test set accuracy for the best model ({best_model_name}): {test_accuracy:.4f}")
    logging.info(f"Classification Report for {best_model_name} on Test Set:\n{classification_report(y_test, y_pred_test)}")
    logging.info(f"Confusion Matrix for {best_model_name} on Test Set:\n{confusion_matrix(y_test, y_pred_test)}")

    # 5. Save the Best Model
    joblib.dump(best_model_candidate, MODEL_OUTPUT_PATH)
    logging.info(f"Best model ({best_model_name}) saved to {MODEL_OUTPUT_PATH}")
    logging.info("Model training complete.")

if __name__ == '__main__':
    run_training()