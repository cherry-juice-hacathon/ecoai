from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import os
import warnings

# Modele
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tools.sm_exceptions import ConvergenceWarning

warnings.filterwarnings("ignore", category=ConvergenceWarning)
warnings.filterwarnings("ignore", category=UserWarning)

app = Flask(__name__)

# --- 1. ŁADOWANIE BAZ DANYCH ---
datasets = {}

def load_data():
    try:
        if os.path.exists('co2-per-unit-energy.csv'):
            df_energy = pd.read_csv('co2-per-unit-energy.csv')
            df_energy.rename(columns={'Annual CO₂ emissions per unit energy (kg per kilowatt-hour)': 'factor'}, inplace=True)
            datasets['energy'] = df_energy
        
        if os.path.exists('Hardware.csv'):
            datasets['hardware'] = pd.read_csv('Hardware.csv')
        
        if os.path.exists('Serwers.csv'):
            datasets['servers'] = pd.read_csv('Serwers.csv')
            
        print(f"Załadowano bazy danych: {list(datasets.keys())}")
    except Exception as e:
        print(f"Błąd ładowania danych: {e}")

load_data()

# --- 2. MULTI-MODEL PREDICTION ENGINE ---

def predict_value_smart(df, region_col, region_name, year_col, target_value_col, target_year, model_type='linear'):
    """Inteligentna predykcja: Linear, Poly, ARIMA"""
    if df is None: return 0.0
    subset = df[df[region_col] == region_name].copy()
    subset = subset.dropna(subset=[target_value_col])
    subset = subset.sort_values(by=year_col)
    
    if subset.empty or len(subset) < 2: return 0.0

    X = subset[[year_col]].values
    y = subset[target_value_col].values
    data_points_count = len(y)

    # Fallback dla ARIMA
    if model_type == 'arima' and data_points_count < 8:
        model_type = 'linear'

    try:
        if model_type == 'linear':
            model = LinearRegression()
            model.fit(X, y)
            prediction = model.predict(np.array([[target_year]]))[0]

        elif model_type == 'poly':
            poly = PolynomialFeatures(degree=2)
            X_poly = poly.fit_transform(X)
            model = LinearRegression()
            model.fit(X_poly, y)
            target_X_poly = poly.transform([[target_year]])
            prediction = model.predict(target_X_poly)[0]

        elif model_type == 'arima':
            last_year = subset[year_col].max()
            steps_ahead = target_year - last_year
            if steps_ahead <= 0:
                return predict_value_smart(df, region_col, region_name, year_col, target_value_col, target_year, 'linear')
            
            model = ARIMA(y, order=(1, 1, 1)) 
            model_fit = model.fit()
            forecast = model_fit.forecast(steps=steps_ahead)
            prediction = forecast[-1]
        else:
            return 0.0

    except Exception:
        return predict_value_smart(df, region_col, region_name, year_col, target_value_col, target_year, 'linear')

    return max(0.0, float(prediction))


# --- FUNKCJA POMOCNICZA (Tylko paliwo) ---
def calculate_fuel_emission(fuel_type, consumption):
    if not fuel_type or not consumption: return 0.0
    fuel_type = str(fuel_type).capitalize()
    if fuel_type == "Benzyna": return round(2.31 * consumption, 2)
    elif fuel_type == "Diesel": return round(2.68 * consumption, 2)
    elif fuel_type == "LPG": return round(1.51 * consumption, 2)
    else: return 0.0


# --- 3. ENDPOINT GŁÓWNY ---

@app.route('/calculate_total_footprint', methods=['POST'])
def calculate_total_footprint():
    data = request.get_json()
    
    # Parametry ogólne
    country = data.get('country', 'Poland')
    year = data.get('year', 2024)
    model_choice = data.get('model', 'linear')
    if model_choice not in ['linear', 'poly', 'arima']: model_choice = 'linear'

    # Dane wejściowe
    energy_kwh = data.get('energy_kwh', 0)
    laptops_count = data.get('laptops_count', 0)
    monitors_count = data.get('monitors_count', 0)
    servers_count = data.get('servers_count', 0)
    
    fuel_type = data.get('fuel_type', None)       
    fuel_liters = data.get('fuel_consumption', 0) 
    
    # --- ZMIANA TUTAJ: Bezpośrednia wartość emisji z chmury ---
    cloud_emission_kg = data.get('cloud_emission', 0)

    # --- OBLICZENIA ---
    def get_pred(df, target_col):
        return predict_value_smart(df, 'Entity' if 'Entity' in df.columns else 'Region', 
                                   country, 'Year', target_col, year, model_choice)

    # A. Energia (Scope 2)
    energy_factor = get_pred(datasets.get('energy'), 'factor')
    energy_footprint = energy_kwh * energy_factor

    # B. Sprzęt (Scope 3 - Embodied)
    lap_prod = laptops_count * get_pred(datasets.get('hardware'), 'Laptop_Production')
    mon_prod = monitors_count * get_pred(datasets.get('hardware'), 'Monitor_Production')
    serv_prod = servers_count * get_pred(datasets.get('servers'), 'Server_Production')
    total_hardware = lap_prod + mon_prod + serv_prod

    # C. Transport (Scope 1)
    transport_footprint = calculate_fuel_emission(fuel_type, fuel_liters)

    # D. Suma (dodajemy cloud_emission_kg bezpośrednio)
    total_footprint = energy_footprint + total_hardware + transport_footprint + cloud_emission_kg

    return jsonify({
        "rok_kalkulacji": year,
        "kraj": country,
        "model_ai": model_choice,
        "szczegoly": {
            "energia_lokalna": {
                "zuzycie_kwh": energy_kwh,
                "prognozowany_wspolczynnik": round(energy_factor, 4),
                "emisja_kg": round(energy_footprint, 2)
            },
            "chmura": {
                "opis": "Zadeklarowana emisja od dostawcy (Scope 3)",
                "emisja_kg": round(cloud_emission_kg, 2)
            },
            "sprzet_produkcja": {
                "suma_sprzet_kg": round(total_hardware, 2)
            },
            "transport": {
                "paliwo": fuel_type,
                "emisja_kg": transport_footprint
            }
        },
        "WYNIK_KONCOWY": {
            "TOTAL_FOOTPRINT_KG": round(total_footprint, 2),
        }
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
