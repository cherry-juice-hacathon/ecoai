# Future Trends Forecast API

A lightweight Flask service that provides forecast endpoints used by the UI to extrapolate operational data (electricity, hardware, travel, etc.) with linear, quadratic, or ARIMA models.

## Features
- `/health` readiness probe for container orchestrators
- `/predict` endpoint supporting `linear`, `poly2`, and `arima` models
- Built-in validation and fallbacks (e.g., poly2 requires ≥3 years, ARIMA ≥8 years)
- Docker- and docker-compose-ready

## Requirements
- Python 3.12+
- Recommended: virtual environment (`python -m venv .venv && .venv\Scripts\activate` on Windows)

Install dependencies:
```bash
pip install -r requirements.txt
```

## Local development
Run the Flask server directly (debug for local only):
```bash
set FLASK_ENV=development
python app.py
```
Server listens on `http://127.0.0.1:5000` by default.

### Gunicorn (production-like)
```bash
gunicorn app:app --bind 0.0.0.0:5000
```

## Docker
Build and run the standalone image:
```bash
cd api-future-trends-for-company
docker build -t co2-trends-api .
docker run -p 5000:5000 co2-trends-api
```

## Docker Compose
The repo root contains `docker-compose.yml` wiring the UI, footprint API, and this trends API:
```bash
docker compose up --build
```
The UI service expects `OPENAI_API_KEY` in your environment before running the compose stack.

## Endpoints
### `GET /health`
Returns `{ "status": "ok" }`.

### `POST /predict`
Payload example:
```json
{
  "years": [2016, 2017, 2018, 2019],
  "values": [100, 120, 150, 190],
  "steps_ahead": 3,
  "model": "poly2"
}
```
Response:
```json
{
  "model": "poly2",
  "history": [
    {"year": 2016, "value": 100.0},
    {"year": 2017, "value": 120.0},
    {"year": 2018, "value": 150.0},
    {"year": 2019, "value": 190.0}
  ],
  "forecast": [
    {"year": 2020, "predicted_value": 237.5},
    {"year": 2021, "predicted_value": 293.6},
    {"year": 2022, "predicted_value": 358.3}
  ]
}
```
Validation rules:
- `years` and `values` arrays must be the same length (≥2 entries)
- `steps_ahead` must be a positive integer
- `poly2` needs ≥3 data points
- `arima` needs ≥8 data points

If requirements are not met, a `400` with a clear error message is returned.

## Quick test with `curl`
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"years":[2020,2021,2022],"values":[10,15,21],"steps_ahead":2,"model":"linear"}'
```

---
Need anything else (e.g., schema docs, additional regressors)? Ping me and I can extend this service further.

