import re
import os
import joblib

# Global model and vectorizer (lazy-loaded on first use)
_model = None
_vectorizer = None
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

_url_model = None
_url_vectorizer = None
URL_MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models_url')

def load_url_model():
    """Load trained URL model and vectorizer if they exist; otherwise None"""
    global _url_model, _url_vectorizer
    if _url_model is not None and _url_vectorizer is not None:
        return _url_model, _url_vectorizer
    
    model_path = os.path.join(URL_MODEL_DIR, 'url_model.joblib')
    vectorizer_path = os.path.join(URL_MODEL_DIR, 'url_vectorizer.joblib')
    
    if os.path.exists(model_path) and os.path.exists(vectorizer_path):
        try:
            _url_model = joblib.load(model_path)
            _url_vectorizer = joblib.load(vectorizer_path)
            print(f"[ML] Loaded URL model from {URL_MODEL_DIR}")
            return _url_model, _url_vectorizer
        except Exception as e:
            print(f"[ML] Failed to load URL model: {e}")
    
    return None, None


def load_model():
    """Load trained model and vectorizer if they exist; otherwise None"""
    global _model, _vectorizer
    if _model is not None and _vectorizer is not None:
        return _model, _vectorizer
    
    model_path = os.path.join(MODEL_DIR, 'model.joblib')
    vectorizer_path = os.path.join(MODEL_DIR, 'vectorizer.joblib')
    
    if os.path.exists(model_path) and os.path.exists(vectorizer_path):
        try:
            _model = joblib.load(model_path)
            _vectorizer = joblib.load(vectorizer_path)
            print(f"[ML] Loaded model from {MODEL_DIR}")
            return _model, _vectorizer
        except Exception as e:
            print(f"[ML] Failed to load model: {e}")
    
    return None, None


def simple_analyze(input_type, raw):
    """
    Analyze text using trained model (if available) or heuristic fallback.
    
    Returns:
        {
            'classification': 'phishing'|'legitimate'|'unknown',
            'score': <0-100>,
            'explain': {
                'method': 'model'|'heuristic',
                ...
            }
        }
    """
    text = (raw or '').lower().strip()
    
    # Try to use trained model first
    if input_type == 'url':
        model, vectorizer = load_url_model()
    else:
        model, vectorizer = load_model()
        
    if model and vectorizer:
        try:
            vec = vectorizer.transform([text])
            proba = model.predict_proba(vec)[0]
            # proba[1] is phishing probability
            phishing_prob = proba[1] * 100
            
            if phishing_prob > 70:
                classification = 'phishing'
            elif phishing_prob > 40:
                classification = 'unknown'
            else:
                classification = 'legitimate'
            
            return {
                'classification': classification,
                'score': int(phishing_prob),
                'explain': {
                    'method': 'trained_model',
                    'phishing_probability': round(phishing_prob, 2),
                    'legitimate_probability': round(proba[0] * 100, 2)
                }
            }
        except Exception as e:
            print(f"[ML] Model inference failed: {e}; falling back to heuristic")
    
    # Fallback to heuristic
    score = 0
    classification = 'unknown'
    
    suspicious_words = ['login', 'verify', 'confirm', 'account', 'password', 'update', 'bank', 'click', 'urgent']
    count = sum(1 for w in suspicious_words if w in text)
    
    urls = re.findall(r'https?://\S+', text)
    
    if count >= 2 or len(urls) >= 2:
        classification = 'phishing'
        score = 85
    elif count == 1 or len(urls) == 1:
        classification = 'unknown'
        score = 55
    else:
        classification = 'legitimate'
        score = 10
    
    return {
        'classification': classification,
        'score': score,
        'explain': {
            'method': 'heuristic',
            'suspicious_word_count': count,
            'urls_found': len(urls)
        }
    }
