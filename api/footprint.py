from flask import Flask, request, jsonify
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
import os

app = Flask(__name__)

# --- 1. ŁADOWANIE BAZ DANYCH (Globalnie) ---
# Program próbuje załadować pliki przy starcie.
datasets = {}

def load_data():
    try:
        # Plik energetyczny (Krajowy miks)
        if os.path.exists('co2-per-unit-energy.csv'):
            df_energy = pd.read_csv('co2-per-unit-energy.csv')
            df_energy.rename(columns={'Annual CO₂ emissions per unit energy (kg per kilowatt-hour)': 'factor'}, inplace=True)
            datasets['energy'] = df_energy
        
        # Pliki sprzętowe
        if os.path.exists('Hardware.csv'):
            datasets['hardware'] = pd.read_csv('Hardware.csv')
        
        if os.path.exists('Serwers.csv'):
            datasets['servers'] = pd.read_csv('Serwers.csv')
            
        print(f"Załadowano bazy danych: {list(datasets.keys())}")
    except Exception as e:
        print(f"Błąd ładowania danych: {e}")

load_data()

# --- 2. SILNIK AI (Regresja Liniowa) ---

def predict_value_with_regression(df, region_col, region_name, year_col, target_value_col, target_year):
    """
    Uniwersalna funkcja. Bierze dowolną tabelę (df), filtruje po regionie/kraju,
    uczy się trendu z kolumny `target_value_col` i przewiduje wartość na `target_year`.
    """
    # 1. Filtrowanie danych dla konkretnego regionu/kraju
    if df is None: return 0.0
    
    # Sprawdzamy czy region istnieje w bazie
    subset = df[df[region_col] == region_name]
    
    # Jeśli nie ma danych dla tego kraju, próbujemy 'Global' lub 'World' (opcjonalny fallback)
    # Tutaj dla uproszczenia zwracamy 0 lub średnią, jeśli brak danych
    if subset.empty or len(subset) < 1:
        return 0.0

    # 2. Przygotowanie danych do nauki (X=Rok, Y=Wartość)
    # Usuwamy wiersze gdzie brakuje danych (NaN)
    subset = subset.dropna(subset=[target_value_col])
    
    if subset.empty: return 0.0

    X = subset[[year_col]].values
    y = subset[target_value_col].values

    # 3. Trening modelu
    model = LinearRegression()
    model.fit(X, y)

    # 4. Predykcja
    prediction = model.predict(np.array([[target_year]]))[0]
    
    # Zabezpieczenie: Emisja nie może być ujemna
    return max(0.0, prediction)

# --- 3. ENDPOINT GŁÓWNY ---

@app.route('/calculate_total_footprint', methods=['POST'])
def calculate_total_footprint():
    data = request.get_json()
    
    # Pobieranie parametrów wejściowych (z domyślnymi)
    country = data.get('country', 'Poland')
    year = data.get('year', 2024)
    energy_kwh = data.get('energy_kwh', 0)
    
    laptops_count = data.get('laptops_count', 0)
    monitors_count = data.get('monitors_count', 0)
    servers_count = data.get('servers_count', 0)

    # --- A. OBLICZANIE ENERGII (PRĄD) ---
    # Przewidujemy współczynnik emisji prądu (kg/kWh) na dany rok
    energy_factor = predict_value_with_regression(
        df=datasets.get('energy'),
        region_col='Entity',
        region_name=country,
        year_col='Year',
        target_value_col='factor',
        target_year=year
    )
    energy_footprint = energy_kwh * energy_factor

    # --- B. OBLICZANIE SPRZĘTU (HARDWARE) ---
    # Musimy przewidzieć osobno PRODUKCJĘ i UŻYTKOWANIE (Maintenance) dla każdego typu
    
    # 1. Laptopy
    lap_prod_factor = predict_value_with_regression(datasets.get('hardware'), 'Region', country, 'Year', 'Laptop_Production', year)
    lap_use_factor  = predict_value_with_regression(datasets.get('hardware'), 'Region', country, 'Year', 'Laptop_Use', year)
    laptops_total = (laptops_count * lap_prod_factor) + (laptops_count * lap_use_factor)

    # 2. Monitory
    mon_prod_factor = predict_value_with_regression(datasets.get('hardware'), 'Region', country, 'Year', 'Monitor_Production', year)
    mon_use_factor  = predict_value_with_regression(datasets.get('hardware'), 'Region', country, 'Year', 'Monitor_Use', year)
    monitors_total = (monitors_count * mon_prod_factor) + (monitors_count * mon_use_factor)

    # 3. Serwery
    serv_prod_factor = predict_value_with_regression(datasets.get('servers'), 'Region', country, 'Year', 'Server_Production', year)
    serv_use_factor  = predict_value_with_regression(datasets.get('servers'), 'Region', country, 'Year', 'Server_Use', year)
    servers_total = (servers_count * serv_prod_factor) + (servers_count * serv_use_factor)

    # --- C. SUMOWANIE ---
    total_hardware = laptops_total + monitors_total + servers_total
    total_footprint = energy_footprint + total_hardware

    return jsonify({
        "rok_kalkulacji": year,
        "kraj": country,
        "szczegoly": {
            "energia_elektryczna": {
                "zuzycie_kwh": energy_kwh,
                "prognozowany_wspolczynnik_kg_kwh": round(energy_factor, 4),
                "emisja_kg": round(energy_footprint, 2)
            },
            "sprzet": {
                "laptopy_emisja_kg": round(laptops_total, 2),
                "monitory_emisja_kg": round(monitors_total, 2),
                "serwery_emisja_kg": round(servers_total, 2),
                "suma_sprzet_kg": round(total_hardware, 2)
            }
        },
        "WYNIK_KONCOWY": {
            "TOTAL_FOOTPRINT_KG": round(total_footprint, 2),
            "TOTAL_FOOTPRINT_TONY": round(total_footprint / 1000, 4)
        },
        "info": "Wartości oparte na predykcji AI (Regresja Liniowa) trendów historycznych."
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)