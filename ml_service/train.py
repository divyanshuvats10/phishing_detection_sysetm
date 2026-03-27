"""
ML Training Script for Phishing Detection

Usage (raw text):
    python train.py --data phishing_data.csv --model_dir ./models

    CSV format: text,label
    "Please click here to verify your account",1
    "Meeting notes for tomorrow",0

Usage (pre-vectorized):
    python train.py --data phishing_combined_dataset.csv --model_dir ./models --vectorized

This script:
  1. Loads CSV data (raw text OR pre-vectorized)
  2. Splits train/test
  3. If raw text: Vectorizes with TF-IDF
     If pre-vectorized: Skips vectorization, uses features directly
  4. Trains a Logistic Regression classifier
  5. Evaluates and saves model + vectorizer (or dummy vectorizer for pre-vectorized data)
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
except ImportError:  # pragma: no cover - optional dependency
    XGBClassifier = None


def load_data(csv_path, vectorized=False):
    """Load CSV data"""
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} samples from {csv_path}")
    print(f"Columns: {df.columns.tolist()[:10]}... (showing first 10)")
    
    if vectorized:
        # Pre-vectorized format: all columns except 'label' are features
        if 'label' not in df.columns:
            raise ValueError("Pre-vectorized CSV must have 'label' column")
        print(f"Detected pre-vectorized data with {len(df.columns) - 1} features")
    else:
        # Raw text format
        if 'text' not in df.columns or 'label' not in df.columns:
            raise ValueError("Raw text CSV must have 'text' and 'label' columns")
    
    return df


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


def train(df, model_dir="./models", test_size=0.2, vectorized=False):
    """Train and save model"""
    os.makedirs(model_dir, exist_ok=True)
    
    labels = df['label']
    
    if vectorized:
        # Pre-vectorized: use all columns except 'label' as features
        feature_cols = [col for col in df.columns if col != 'label']
        X = df[feature_cols].values
        vectorizer = None  # No vectorizer needed for pre-vectorized data
        print(f"\nUsing pre-vectorized features: shape {X.shape}")
    else:
        # Raw text: extract and vectorize
        texts = df['text'].fillna('')
        X = texts
        vectorizer = None  # Will create during split
    
    # Split (with stratification for small datasets)
    X_train, X_test, y_train, y_test = train_test_split(
        X, labels, test_size=test_size, random_state=42, stratify=labels
    )
    print(f"Train/test split: {len(X_train)}/{len(X_test)}")
    train_counts = np.bincount(y_train)
    test_counts = np.bincount(y_test)
    print(f"Class distribution - Train: {train_counts}, Test: {test_counts}")
    
    # Vectorize (if needed)
    if not vectorized:
        print("Vectorizing text with TF-IDF...")
        vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.9
        )
        X_train_vec = vectorizer.fit_transform(X_train)
        X_test_vec = vectorizer.transform(X_test)
    else:
        X_train_vec = X_train.astype(np.float32)
        X_test_vec = X_test.astype(np.float32)
    
    # Define models to train
    models = {}

    # Keep Logistic Regression as the primary model (existing behavior)
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
        print(
            "xgboost is not installed; skipping XGBoost model. "
            "Install `xgboost` to include it in training."
        )

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
    model_path = os.path.join(model_dir, "model.joblib")
    joblib.dump(primary_model, model_path)
    print(f"\nPrimary model (RandomForest) saved to: {model_path}")
    
    if vectorizer:
        vectorizer_path = os.path.join(model_dir, "vectorizer.joblib")
        joblib.dump(vectorizer, vectorizer_path)
        print(f"Vectorizer saved to: {vectorizer_path}")

    # Log comparison results to file
    log_path = os.path.join(model_dir, "model_comparison.log")
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    best_model = max(results, key=lambda r: r["accuracy"])

    with open(log_path, "a", encoding="utf-8") as f:
        f.write(f"\n=== Training run at {timestamp} ===\n")
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
    parser = argparse.ArgumentParser(description='Train phishing detection model')
    parser.add_argument('--data', required=True, help='Path to CSV file')
    parser.add_argument('--model_dir', default='./models', help='Directory to save model files')
    parser.add_argument('--test_size', type=float, default=0.2, help='Test set fraction')
    parser.add_argument('--vectorized', action='store_true', help='Data is pre-vectorized (not raw text)')
    
    args = parser.parse_args()
    
    df = load_data(args.data, vectorized=args.vectorized)
    train(df, model_dir=args.model_dir, test_size=args.test_size, vectorized=args.vectorized)
