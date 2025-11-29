from flask import Flask, request, jsonify
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
import os

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

# --- 2. FUNKCJE OBLICZENIOWE I AI ---

def predict_value_with_regression(df, region_col, region_name, year_col, target_value_col, target_year):
    """Silnik AI do predykcji współczynników emisji"""
    if df is None: return 0.0
    subset = df[df[region_col] == region_name]
    if subset.empty or len(subset) < 1: return 0.0
    subset = subset.dropna(subset=[target_value_col])
    if subset.empty: return 0.0

    X = subset[[year_col]].values
    y = subset[target_value_col].values

    model = LinearRegression()
    model.fit(X, y)
    prediction = model.predict(np.array([[target_year]]))[0]
    return max(0.0, prediction)

def calculate_fuel_emission(fuel_type, consumption):
    """Obliczanie emisji z transportu (Scope 1)"""
    if not fuel_type or not consumption: return 0.0
    fuel_type = str(fuel_type).capitalize()
    
    if fuel_type == "Benzyna": return round(2.31 * consumption, 2)
    elif fuel_type == "Diesel": return round(2.68 * consumption, 2)
    elif fuel_type == "LPG": return round(1.51 * consumption, 2)
    else: return 0.0

def calculate_cloud_emission(provider, kwh_usage):
    """
    NOWA FUNKCJA: Obliczanie emisji z chmury obliczeniowej (Scope 3).
    Współczynniki są przybliżonymi średnimi rynkowymi (kg CO2 / kWh).
    """
    if not provider or not kwh_usage:
        return 0.0
    
    provider = str(provider).lower()
    
    # Przykładowe współczynniki (można je doprecyzować w zależności od regionu Data Center)
    if "google" in provider or "gcp" in provider:
        # Google chwali się zerową emisją netto (matching 100% renewable), ale realnie:
        return round(0.05 * kwh_usage, 2) 
    elif "azure" in provider or "microsoft" in provider:
        return round(0.30 * kwh_usage, 2)
    elif "aws" in provider or "amazon" in provider:
        return round(0.35 * kwh_usage, 2)
    else:
        # Domyślny, generyczny hosting
        return round(0.45 * kwh_usage, 2)

# --- 3. ENDPOINT GŁÓWNY ---

@app.route('/calculate_total_footprint', methods=['POST'])
def calculate_total_footprint():
    data = request.get_json()
    
    # 1. Dane podstawowe
    country = data.get('country', 'Poland')
    year = data.get('year', 2024)
    
    # 2. Scope 2: Energia elektryczna (biuro/serwerownia lokalna)
    energy_kwh = data.get('energy_kwh', 0)
    
    # 3. Scope 3: Hardware (Produkcja)
    laptops_count = data.get('laptops_count', 0)
    monitors_count = data.get('monitors_count', 0)
    servers_count = data.get('servers_count', 0)
    
    # 4. Scope 1: Transport
    fuel_type = data.get('fuel_type', None)       
    fuel_liters = data.get('fuel_consumption', 0) 
    
    # 5. Scope 3: Cloud Computing (NOWE)
    cloud_provider = data.get('cloud_provider', None) # np. "AWS", "Azure"
    cloud_kwh = data.get('cloud_kwh', 0)              # Zużycie energii w chmurze

    # --- OBLICZENIA ---
    
    # A. Energia lokalna
    energy_factor = predict_value_with_regression(
        df=datasets.get('energy'),
        region_col='Entity',
        region_name=country,
        year_col='Year',
        target_value_col='factor',
        target_year=year
    )
    energy_footprint = energy_kwh * energy_factor

    # B. Sprzęt (Produkcja)
    lap_prod = laptops_count * predict_value_with_regression(datasets.get('hardware'), 'Region', country, 'Year', 'Laptop_Production', year)
    mon_prod = monitors_count * predict_value_with_regression(datasets.get('hardware'), 'Region', country, 'Year', 'Monitor_Production', year)
    serv_prod = servers_count * predict_value_with_regression(datasets.get('servers'), 'Region', country, 'Year', 'Server_Production', year)
    total_hardware = lap_prod + mon_prod + serv_prod

    # C. Transport
    transport_footprint = calculate_fuel_emission(fuel_type, fuel_liters)
    
    # D. Cloud (NOWE)
    cloud_footprint = calculate_cloud_emission(cloud_provider, cloud_kwh)

    # --- SUMA ---
    total_footprint = energy_footprint + total_hardware + transport_footprint + cloud_footprint

    return jsonify({
        "rok_kalkulacji": year,
        "kraj": country,
        "szczegoly": {
            "energia_lokalna": {
                "opis": "Prąd w biurze (Scope 2)",
                "zuzycie_kwh": energy_kwh,
                "emisja_kg": round(energy_footprint, 2)
            },
            "chmura": {
                "opis": "Zasoby Cloud (Scope 3)",
                "dostawca": cloud_provider if cloud_provider else "Brak",
                "zuzycie_cloud_kwh": cloud_kwh,
                "emisja_kg": round(cloud_footprint, 2)
            },
            "sprzet_produkcja": {
                "opis": "Produkcja sprzętu (Scope 3)",
                "suma_sprzet_kg": round(total_hardware, 2)
            },
            "transport": {
                "opis": "Flota samochodowa (Scope 1)",
                "paliwo": fuel_type,
                "emisja_kg": transport_footprint
            }
        },
        "WYNIK_KONCOWY": {
            "TOTAL_FOOTPRINT_KG": round(total_footprint, 2)
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)