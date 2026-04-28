"""
ML Training Script for URL Phishing Detection

Usage:
    python train_url.py --data ../DataSet/phiusiil+phishing+url+dataset/PhiUSIIL_Phishing_URL_Dataset.csv --model_dir ./models_url

This script:
  1. Loads the PhiUSIIL URL dataset
  2. Extracts the 'URL' column (text features) and 'label' column
  3. Splits train/test
  4. Vectorizes URL text with TF-IDF
  5. Trains multiple classifiers (LogisticRegression, RandomForest, MultinomialNB, XGBoost)
  6. Evaluates and saves the primary model (RandomForest) + vectorizer
"""

import os
import argparse
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)

try:
    from xgboost import XGBClassifier
except ImportError:
    XGBClassifier = None


def load_url_data(csv_path):
    """Load PhiUSIIL CSV data and extract URL and label columns"""
    print(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} samples.")
    
    if 'URL' not in df.columns or 'label' not in df.columns:
        raise ValueError("Dataset must have 'URL' and 'label' columns.")
    
    # We only need the URL string and the label
    return df[['URL', 'label']].copy()


def _evaluate_model(name, model, X_train, X_test, y_train, y_test):
    """Fit model and return metrics dictionary."""
    print(f"\nTraining {name}...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print(f"--- {name} Evaluation ---")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"Confusion Matrix:\n{cm}")

    return {
        "name": name,
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1": float(f1),
        "confusion_matrix": cm.tolist(),
    }


def train_url_model(df, model_dir="./models_url", test_size=0.2):
    """Train and save the URL model"""
    os.makedirs(model_dir, exist_ok=True)
    
    labels = df['label']
    texts = df['URL'].fillna('')
    
    # Split (with stratification)
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=test_size, random_state=42, stratify=labels
    )
    print(f"Train/test split: {len(X_train)}/{len(X_test)}")
    train_counts = np.bincount(y_train)
    test_counts = np.bincount(y_test)
    print(f"Class distribution - Train: {train_counts}, Test: {test_counts}")
    
    # Vectorize URLs using character n-grams
    print("Vectorizing URL text with TF-IDF...")
    vectorizer = TfidfVectorizer(
        analyzer='char', # Character-level n-grams are better for URLs
        ngram_range=(2, 5),
        max_features=10000,
        min_df=2,
        max_df=0.9
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Define models to train
    models = {}

    models["LogisticRegression"] = LogisticRegression(
        max_iter=1000, random_state=42, solver="lbfgs"
    )

    models["RandomForest"] = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        random_state=42,
        n_jobs=-1,
    )

    models["MultinomialNB"] = MultinomialNB()

    if XGBClassifier is not None:
        models["XGBoost"] = XGBClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1,
        )
    else:
        print("xgboost is not installed; skipping XGBoost model.")

    # Train and evaluate all models
    results = []
    fitted_models = {}

    for name, clf in models.items():
        metrics = _evaluate_model(name, clf, X_train_vec, X_test_vec, y_train, y_test)
        results.append(metrics)
        fitted_models[name] = clf

    # Pick RandomForest as the primary model to save
    primary_model = fitted_models["RandomForest"]

    # Save primary model
    model_path = os.path.join(model_dir, "url_model.joblib")
    joblib.dump(primary_model, model_path)
    print(f"\nPrimary model (RandomForest) saved to: {model_path}")
    
    vectorizer_path = os.path.join(model_dir, "url_vectorizer.joblib")
    joblib.dump(vectorizer, vectorizer_path)
    print(f"Vectorizer saved to: {vectorizer_path}")

    # Log comparison results to file
    log_path = os.path.join(model_dir, "model_comparison.log")
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    best_model = max(results, key=lambda r: r["accuracy"])

    with open(log_path, "a", encoding="utf-8") as f:
        f.write(f"\n=== URL Training run at {timestamp} ===\n")
        for r in results:
            f.write(
                f"{r['name']}: "
                f"accuracy={r['accuracy']:.4f}, "
                f"precision={r['precision']:.4f}, "
                f"recall={r['recall']:.4f}, "
                f"f1={r['f1']:.4f}\n"
            )
        f.write(
            f"Best model by accuracy: {best_model['name']} "
            f"(accuracy={best_model['accuracy']:.4f})\n"
        )

    print(f"\nModel comparison log written to: {log_path}")

    return primary_model, vectorizer


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train URL phishing detection model')
    parser.add_argument('--data', required=True, help='Path to URL CSV file (e.g. PhiUSIIL_Phishing_URL_Dataset.csv)')
    parser.add_argument('--model_dir', default='./models_url', help='Directory to save URL model files')
    parser.add_argument('--test_size', type=float, default=0.2, help='Test set fraction')
    
    args = parser.parse_args()
    
    df = load_url_data(args.data)
    train_url_model(df, model_dir=args.model_dir, test_size=args.test_size)
