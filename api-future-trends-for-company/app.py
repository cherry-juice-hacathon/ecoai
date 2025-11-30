from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

app = Flask(__name__)

# --------- FUNKCJE MODELI --------- #

def forecast_linear(years, values, steps_ahead):
    """
    Prosta regresja liniowa: y = a * year + b
    Działa dobrze nawet przy bardzo małej liczbie lat.
    """
    x = np.array(years)
    y = np.array(values)

    # dopasowanie prostej
    coeffs = np.polyfit(x, y, 1)
    poly = np.poly1d(coeffs)

    last_year = int(years[-1])
    future_years = [last_year + i for i in range(1, steps_ahead + 1)]
    preds = [poly(yr) for yr in future_years]

    return [
        {"year": int(year), "predicted_value": float(pred)}
        for year, pred in zip(future_years, preds)
    ]


def forecast_poly2(years, values, steps_ahead):
    """
    Regresja wielomianowa 2. stopnia: y = a*year^2 + b*year + c
    Wymaga co najmniej 3 punktów.
    """
    if len(years) < 3:
        raise ValueError("Regresja poly2 wymaga minimum 3 lat danych.")

    x = np.array(years)
    y = np.array(values)

    coeffs = np.polyfit(x, y, 2)
    poly = np.poly1d(coeffs)

    last_year = int(years[-1])
    future_years = [last_year + i for i in range(1, steps_ahead + 1)]
    preds = [poly(yr) for yr in future_years]

    return [
        {"year": int(year), "predicted_value": float(pred)}
        for year, pred in zip(future_years, preds)
    ]


def forecast_arima(years, values, steps_ahead):
    """
    ARIMA(1,1,1) – lepiej, gdy danych jest trochę więcej (np. >= 8 lat).
    Tutaj wrzucam minimalne zabezpieczenie.
    """
    if len(years) < 8:
        raise ValueError("Model ARIMA wymaga minimum 8 lat danych.")

    series = pd.Series(values, index=years)
    model = ARIMA(series, order=(1, 1, 1))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=steps_ahead)

    last_year = int(years[-1])
    future_years = [last_year + i for i in range(1, steps_ahead + 1)]

    return [
        {"year": int(y), "predicted_value": float(v)}
        for y, v in zip(future_years, forecast)
    ]


# --------- ENDPOINTY --------- #

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    """
    Oczekiwany JSON (przykład):

    {
      "years": [2021, 2022, 2023],
      "values": [10, 15, 20],
      "steps_ahead": 3,
      "model": "linear"   // albo "poly2", albo "arima"
    }
    """
    data = request.get_json()

    if data is None:
        return jsonify({"error": "Brak danych JSON"}), 400

    years = data.get("years")
    values = data.get("values")
    steps_ahead = data.get("steps_ahead", 3)
    model_name = data.get("model", "linear")  # domyślnie regresja liniowa

    # --- walidacja podstawowa --- #
    if not years or not values or len(years) != len(values):
        return jsonify({"error": "years i values muszą mieć tę samą długość i nie mogą być puste"}), 400

    if len(values) < 2:
        return jsonify({"error": "Za mało punktów danych (min. 2 lata)."}), 400

    try:
        years = [int(y) for y in years]
        values = [float(v) for v in values]
    except Exception:
        return jsonify({"error": "years muszą być int, values muszą być liczbami."}), 400

    try:
        steps_ahead = int(steps_ahead)
        if steps_ahead <= 0:
            raise ValueError
    except ValueError:
        return jsonify({"error": "steps_ahead musi być dodatnią liczbą całkowitą."}), 400

    model_name = str(model_name).lower()

    # --- wybór modelu --- #
    try:
        if model_name == "linear":
            forecast = forecast_linear(years, values, steps_ahead)
        elif model_name == "poly2":
            forecast = forecast_poly2(years, values, steps_ahead)
        elif model_name == "arima":
            forecast = forecast_arima(years, values, steps_ahead)
        else:
            return jsonify({"error": "Nieznany model. Użyj: 'linear', 'poly2' lub 'arima'."}), 400
    except Exception as e:
        # np. za mało danych pod arima/poly2
        return jsonify({"error": f"Błąd podczas predykcji modelem '{model_name}': {str(e)}"}), 400

    history = [
        {"year": int(y), "value": float(v)}
        for y, v in zip(years, values)
    ]

    return jsonify({
        "model": model_name,
        "history": history,
        "forecast": forecast
    })


if __name__ == "__main__":
    # debug=True tylko na dev
    app.run(host="0.0.0.0", port=5000, debug=True)
