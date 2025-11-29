# 🌱 EcoAI - Carbon Footprint Predictor

API oparte na sztucznej inteligencji (Machine Learning), które oblicza i **prognozuje** ślad węglowy firmy. System analizuje zużycie energii oraz infrastrukturę sprzętową (laptopy, monitory, serwery), wykorzystując Regresję Liniową do przewidywania współczynników emisji na przyszłe lata (np. 2025, 2030).

## 🚀 Funkcjonalności

* **Predykcja emisji energii:** Oblicza ślad węglowy z prądu na podstawie miksu energetycznego danego kraju.
* **Analiza cyklu życia sprzętu:** Uwzględnia emisję z produkcji (Manufacturing) oraz użytkowania (Use phase) sprzętu IT.
* **Prognozowanie przyszłości:** Dzięki modelom AI (Scikit-Learn) aplikacja potrafi wyliczyć przewidywany ślad węglowy na lata przyszłe, analizując historyczne trendy zmian technologicznych i energetycznych.

## 🛠️ Instalacja i Uruchomienie

1.  **Sklonuj repozytorium:**
    ```bash
    git clone [https://github.com/TWOJA_NAZWA/ecoai.git](https://github.com/TWOJA_NAZWA/ecoai.git)
    cd ecoai
    ```

2.  **Zainstaluj wymagane biblioteki:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Upewnij się, że posiadasz pliki danych w folderze:**
    * `co2-per-unit-energy.csv` (Dane energetyczne krajów)
    * `Hardware.csv` (Dane o emisji laptopów i monitorów)
    * `Serwers.csv` (Dane o emisji serwerów)

4.  **Uruchom serwer:**
    ```bash
    python app.py
    ```
    API będzie dostępne pod adresem: `http://127.0.0.1:5000`

---

## 📡 Dokumentacja API

### Endpoint: `/calculate_total_footprint`

Główny punkt wejścia aplikacji. Przyjmuje dane o firmie i zwraca kompleksowy raport środowiskowy.

* **Metoda:** `POST`
* **Content-Type:** `application/json`

### 📥 Dane wejściowe (Request Body)

Wysyłasz obiekt JSON z parametrami:

| Parametr | Typ | Opis | Przykład |
| :--- | :--- | :--- | :--- |
| `country` | `string` | Kraj, w którym działa firma (musi być w bazie CSV). | `"Poland"` |
| `year` | `int` | Rok, dla którego robimy wyliczenie (może być przyszły!). | `2027` |
| `energy_kwh` | `float` | Roczne zużycie prądu w kWh. | `50000` |
| `laptops_count` | `int` | Liczba używanych laptopów. | `50` |
| `monitors_count` | `int` | Liczba używanych monitorów. | `50` |
| `servers_count` | `int` | Liczba używanych serwerów. | `5` |

**Przykładowy JSON:**

```json
{
  "country": "Poland",
  "year": 2028,
  "energy_kwh": 12000,
  "laptops_count": 40,
  "monitors_count": 45,
  "servers_count": 2
}
