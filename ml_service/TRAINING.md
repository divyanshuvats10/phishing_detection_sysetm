# ML Model Training Guide

## Overview

The phishing detection system can use either:
1. **Rule-based heuristics** (current default) — fast, no model needed.
2. **Trained ML model** — better accuracy with labelled data.

If you have a CSV dataset, you can train a scikit-learn classifier that will automatically be used by the microservice (with heuristic fallback).

---

## Step 1: Prepare Your CSV

**Expected format** — CSV with columns: `text`, `label`

```csv
text,label
"Please click here to verify your account",1
"Meeting notes for tomorrow",0
"Confirm your banking credentials now",1
"Project update Q1 2026",0
"Urgent: Update payment method",1
```

Where:
- `text`: email body, message, or snippet to analyze
- `label`: `1` = phishing, `0` = legitimate

**Tips:**
- Clean text: remove HTML tags, normalize whitespace.
- Balance: ideally similar counts of phishing and legitimate samples.
- Size: 100+ samples recommended (500+ for better generalization).

---

## Step 2: Install ML Dependencies

From the `ml_service` folder:

```powershell
cd D:\Study\BTech\CapStone\Project\ml_service
.\venv\Scripts\activate
pip install scikit-learn pandas joblib numpy
```

Or reinstall all requirements:
```powershell
pip install -r requirements.txt
```

---

## Step 3: Train Your Model

From the `ml_service` folder with venv activated:

```powershell
python train.py --data path/to/your/phishing_data.csv --model_dir ./models
```

**Output:**
- Prints accuracy, precision, recall, F1 score, confusion matrix.
- Saves:
  - `ml_service/models/model.joblib` — trained classifier
  - `ml_service/models/vectorizer.joblib` — text vectorizer

**Example run:**
```
Loaded 500 samples from phishing_data.csv
Train/test split: 400/100

Vectorizing text...
Training LogisticRegression...

--- Evaluation Metrics ---
Accuracy:  0.9200
Precision: 0.9100
Recall:    0.9300
F1 Score:  0.9200
Confusion Matrix:
[[47  3]
 [ 2 48]]

Model saved to: ./models/model.joblib
Vectorizer saved to: ./models/vectorizer.joblib
```

---

## Step 4: Use the Trained Model

Once model files exist in `ml_service/models/`, the microservice automatically loads them:

```powershell
python -m ml_service.app
```

Or `python app.py` from the `ml_service` folder.

The Flask API will:
1. Check for `models/model.joblib` and `models/vectorizer.joblib`.
2. If found, use them for predictions → `explain.method: "trained_model"`.
3. If not found, fall back to heuristics → `explain.method: "heuristic"`.

**API response with trained model:**

```json
{
  "classification": "phishing",
  "score": 78,
  "explain": {
    "method": "trained_model",
    "phishing_probability": 78.45,
    "legitimate_probability": 21.55
  }
}
```

---

## Step 5: Experiment & Iterate

### Try different train/test splits:
```powershell
python train.py --data phishing_data.csv --model_dir ./models --test_size 0.3
```

### Advanced: Edit `train.py` to customize:
- **Vectorizer:** `max_features`, `ngram_range`, `min_df`, `max_df`.
- **Model:** change from `LogisticRegression` to `RandomForestClassifier`, `SVC`, etc.
- **Feature engineering:** add URL features, sender domain reputation, etc.

Example: swap in RandomForest

```python
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
```

---

## Common Issues

### 1. "ModuleNotFoundError: No module named 'sklearn'"
- Ensure ML dependencies are installed: `pip install -r requirements.txt`

### 2. "No module named 'analysis'"
- Ensure you're running from the project root or `ml_service/venv` is activated.

### 3. Low accuracy on live data
- Your CSV may not match real phishing patterns. Collect more diverse examples.
- Add feature engineering: extract domain, sender, URLs, and other metadata.

### 4. Model files not loading
- Check `ml_service/models/` folder exists and contains `model.joblib` and `vectorizer.joblib`.
- Check logs from `python -m ml_service.app` for load errors.

---

## Next Steps

1. **Collect/label data** — gather real phishing + legitimate emails/messages.
2. **Train** — run `train.py`.
3. **Validate:** test the microservice on new samples.
4. **Deploy:** commit model files or re-train on production data.
5. **Monitor:** log predictions and periodically re-train if accuracy drifts.

---

## Sample Datasets (for testing)

If you need sample data to start:
- [ISCX Spam Dataset](https://www.unb.ca/cic/)
- [SpamAssassin corpus](https://spamassassin.apache.org/publiccorpus/)
- [Kaggle Email Spam Dataset](https://www.kaggle.com/datasets/balaka18/email-spam-classification-dataset)

Preprocess and format to CSV as shown above, then train.
