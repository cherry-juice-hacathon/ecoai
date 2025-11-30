## 1. Przedstawienie problemu

CarbonGenius to system do inteligentnego obrazowania trendów emisji CO₂. Pomaga dużym przedsiębiorstwom – szczególnie z branży IT – monitorować, jak zmienia się ich ślad węglowy w czasie, wskazuje momenty wzrostu oraz podpowiada, gdzie szukać redukcji zgodnych z CSRD. Raportowanie staje się dzięki temu mniej uciążliwe, a wnioski dla działów finansowych i ESG są budowane na twardych danych zamiast statycznych tabel.
 
 ## 2. Dokumentacja Danych (Data Sets)

Nasz system opiera swoje obliczenia na trzech kluczowych zbiorach danych, które pozwalają na kompleksową analizę cyklu życia zasobów (LCA):

###  A. `co2-per-unit-energy.csv` (Energia)
Fundamentalny zbiór danych makroekonomicznych dotyczący emisyjności sieci energetycznych.
* **Opis:** Zawiera historyczne dane o intensywności węglowej (kg CO₂ / kWh) dla ponad 100 krajów na przestrzeni lat 1980–2023.
* **Źródło:** Dane pochodzą ze strony Our World in Data. Link do danych https://ourworldindata.org/grapher/co2-per-unit-energy?tab=table.

###  B. `Hardware.csv` (Sprzęt Biurowy)
Baza danych dotycząca śladu węglowego urządzeń końcowych (End-User Devices).
* **Kluczowe metryki:** Emisja wbudowana (Embodied Carbon) powstała w procesie produkcji laptopów i monitorów.
* **Źródło:** Dane Dell dotyczące emisji CO2 przy produkcji laptopów - https://www.dell.com/en-us/dt/corporate/social-impact/reporting/carbon-footprint.htm

###  C. `Serwers.csv` (Infrastruktura Data Center)
Specjalistyczny zbiór danych dla infrastruktury serwerowej.
* **Opis:** Dane dotyczące kosztu węglowego wyprodukowania serwerów rackowych i macierzy dyskowych.
* **Źródło:** Dane z raportu "Data Centres and Data Transmission Networks - https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks

---

## 3. Ranking i Testy Modeli AI

Chcieliśmy, żeby CarbonGenius potrafił przewidywać przyszłość (np. emisję w roku 2030). Aby to zrobić, przetestowaliśmy trzy różne metody uczenia maszynowego.

### Benchmark moodeli AI i wybieranie najdokładniejszego modelu dla naszych danych:
1. Wczytuje test.csv (ten, który wrzuciłeś).
2. Oblicza „prawdziwe CO₂” za lata 2020–2025 — wykorzystując wszystkie kolumny, bo inaczej suma nie ma sensu.
3. Bierze dane 2010–2019 i wysyła do modelu /predict (dla każdej kolumny CO₂ osobno).
4. Sumuje prognozy modeli na lata (2020–2025).
5. Liczy odchylenie prognoz od wartości prawdziwych.
6. Na tej podstawie wybiera najlepszy model (linear, poly2, arima).

### Wyniki naszego rankingu:
| **Linear (Linia Prosta)** | Zakłada, że trendy są stałe. | **ZWYCIĘZCA** Najbardziej bezpieczny. Rzadko się mylił i nie wymyślał niestworzonych rzeczy. |
| **Poly (Krzywa)** | Próbuje rysować łuki i zakręty na wykresie. | **Ryzykowny.** Czasem przewidywał dziwne rzeczy (np. że emisja nagle wystrzeli w kosmos), co było błędem. |
| **ARIMA** | Bardzo skomplikowana statystyka. | **Zbyt wymagający.** Potrzebuje idealnych danych bez przerw, a w życiu dane rzadko są idealne. |

**Decyzja:** CarbonGenius używa domyślnie **modelu Liniowego**, bo w biznesie ważniejsza jest stabilność i przewidywalność niż eksperymenty.

--- 

## 4. Podsumowanie: Odpowiedź CarbonGenius na Wyzwania Regulacyjne Uni Europejskiej

Projekt **CarbonGenius** to radar trendów emisji CO₂, który odpowiada na palący problem rynkowy: jak wykazać, że firma naprawdę zmniejsza ślad klimatyczny i robi to świadomie.
 
 ### Rozwiązanie Problemu Biznesowego
Branża IT stoi przed unikalnym wyzwaniem: rosnące zapotrzebowanie na moc obliczeniową generuje ogromne zużycie energii oraz kumulację tzw. długu technologicznego w postaci sprzętu. Niesie to za sobą dużą emisję CO2, którą trzeba rozumieć nie tylko na poziomie rocznych słupków, lecz przede wszystkim trajektorii i odchyleń od celu.
 
**CarbonGenius rozwiązuje to poprzez:**
1. **Analizę historyczną:** Pokazuje, jak zmieniał się ślad węglowy firmy na przestrzeni lat. I jaki ma trend.
2. **Prognozowanie przyszłości:** Dzięki AI przewiduje, jak będzie wyglądać emisja w kolejnych latach, pomagając planować działania redukcyjne.
3. **Pokazuje co można poprawić:** Identyfikuje obszary, w których emisja wzrosła i sugeruje, gdzie szukać oszczędności.