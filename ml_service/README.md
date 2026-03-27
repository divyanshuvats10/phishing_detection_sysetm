# ML Microservice Stub

This is a small Flask-based ML microservice stub that exposes:

- `POST /analyze` — accepts `{ inputType, raw }` and returns `{ classification, score, explain }`.

Start locally for development:

```bash
cd ml_service
python -m venv venv
venv\Scripts\activate  # on Windows
pip install -r requirements.txt
python app.py
```

Set `ML_SERVICE_URL` in server `.env` to `http://localhost:9000` to enable backend integration.
