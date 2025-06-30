# Nodal Staging Analysis Tool (v5.1.0)

Dieses Repository enthält den Quellcode für das Analysewerkzeug **"Nodal Staging: Avocado Sign vs. T2 Criteria"**. Hierbei handelt es sich um eine eigenständige, clientseitige Webanwendung, die für die fortgeschrittene und reproduzierbare Forschung im Bereich der medizinischen Bildgebung, speziell für das Nodal-Staging des Rektumkarzinoms, entwickelt wurde.

**Live-Anwendung:** Die Anwendung ist direkt im Web unter folgender Adresse erreichbar: **[avocadosign.pages.dev](https://avocadosign.pages.dev)**

Für eine umfassende Anleitung zum wissenschaftlichen Hintergrund, den Anwendungsfunktionen, dem Benutzer-Workflow und den technischen Details lesen Sie bitte den detaillierten **[Anwendungsleitfaden](./docs/Application_Guide.md)**.

## 1. Projektübersicht

### 1.1. Zweck
Diese Anwendung dient als spezialisiertes Forschungsinstrument für die tiefgehende Analyse und den Vergleich der diagnostischen Leistungsfähigkeit verschiedener MRT-basierter Kriterien zur Beurteilung des mesorektalen Lymphknotenstatus (N-Status). Ihr primäres wissenschaftliches Ziel ist die rigorose Evaluierung eines neuartigen, kontrastmittelbasierten Markers – des **Avocado Signs (AS)** – im Vergleich zu einem umfassenden Spektrum morphologischer Kriterien aus T2-gewichteten (T2w) Sequenzen. Diese Vergleichsstandards umfassen sowohl etablierte, literaturbasierte Richtlinien (z.B. ESGAR, SAR) als auch datengestützte, rechnerisch optimierte Benchmarks.

### 1.2. Kernfunktionen
*   **Interaktive Datenexploration:** Eine hochperformante, sortierbare und filterbare Tabellenansicht des vollständigen Patientendatensatzes mit erweiterbaren Details zu den Merkmalen einzelner Lymphknoten.
*   **Dynamische Kriteriendefinition:** Ein interaktives Bedienfeld ermöglicht die Echtzeit-Definition und Kombination von T2w-Malignitätskriterien (Größe, Form, Rand, Homogenität) und den sie verbindenden logischen Operatoren (AND/OR).
*   **Automatisierte Kriterienoptimierung:** Ein integrierter Brute-Force-Algorithmus, der in einem dedizierten Web Worker läuft, identifiziert systematisch die mathematisch optimale Kombination von T2w-Kriterien für eine vom Benutzer ausgewählte diagnostische Metrik.
*   **Fortgeschrittene statistische Einblicke (`Insights`-Tab):**
    *   **Power-Analyse:** Post-hoc-Berechnung der statistischen Power und A-priori-Schätzung der erforderlichen Stichprobengröße für zukünftige Studien.
    *   **Diskrepanz-Analyse:** Interaktive 2x2-Matrix zur qualitativen Untersuchung von Fällen, in denen die diagnostischen Methoden zu unterschiedlichen Ergebnissen kommen.
    *   **Merkmals-Wichtigkeitsanalyse:** Visualisierung der prädiktiven Kraft einzelner T2-Merkmale mittels Odds Ratios.
*   **Umfassende statistische Analyse:** Automatisierte Berechnung aller relevanten Metriken zur diagnostischen Leistungsfähigkeit (Sensitivität, Spezifität, PPV, NPV, Genauigkeit, AUC) einschließlich 95%-Konfidenzintervallen und geeigneten statistischen Vergleichstests (z.B. DeLong, McNemar).
*   **Automatisierter Publikationsassistent:** Ein dediziertes Modul, das einen vollständigen, formatierten, englischsprachigen Manuskriptentwurf (einschließlich Text, Tabellen und Abbildungen) generiert, der sich präzise an die wissenschaftlichen Stilrichtlinien des Journals *Radiology* hält und die Ergebnisse der Power-Analyse kontextsensitiv in die Diskussion integriert.
*   **Vielseitige Exportfunktionalität:** Ermöglicht den Export des vollständigen Manuskripts, einzelner Tabellen (Markdown) und aller Diagramme (SVG).

### 1.3. Haftungsausschluss: Nur für Forschungszwecke
**Diese Anwendung ist ausschließlich für Forschungs- und Bildungszwecke konzipiert.** Die dargestellten Daten, Statistiken und generierten Texte basieren auf einem statischen, pseudonymisierten Forschungsdatensatz. **Die Ergebnisse dürfen unter keinen Umständen für die klinische Diagnosestellung, direkte Behandlungsentscheidungen oder andere primäre medizinische Anwendungen verwendet werden.** Die wissenschaftliche und klinische Verantwortung für die Interpretation und Nutzung der generierten Ergebnisse liegt allein beim Anwender.

## 2. Setup und Nutzung

### 2.1. Live-Anwendung
Der einfachste Weg, die Anwendung zu nutzen, ist der direkte Zugriff über den Browser:
**[https://avocadosign.pages.dev](https://avocadosign.pages.dev)**

### 2.2. Lokale Nutzung
Für Entwicklungszwecke oder Offline-Nutzung kann das Repository lokal ausgeführt werden.
1.  Klonen oder laden Sie dieses Repository auf Ihren lokalen Rechner herunter.
2.  Öffnen Sie die Datei `index.html` in einem kompatiblen Webbrowser.
3.  Beim ersten Start ist eine Internetverbindung erforderlich, um externe Bibliotheken (z.B. Bootstrap, D3.js) von ihren jeweiligen Content Delivery Networks (CDNs) zu laden.

### 2.3. Systemanforderungen
*   Ein moderner Desktop-Webbrowser (z.B. die neuesten Versionen von Google Chrome, Mozilla Firefox, Microsoft Edge oder Safari).
*   Web-Worker-Unterstützung ist für die Brute-Force-Optimierungsfunktion erforderlich.

## 3. Technische Architektur

Die Anwendung wurde mit Vanilla JavaScript (ES2020+) erstellt und folgt einer modularen Architektur, die Datenlogik, Servicefunktionen und UI-Rendering voneinander trennt. Dies gewährleistet Wartbarkeit und Skalierbarkeit.

*   **App Controller (`js/app/main.js`):** Der zentrale Orchestrator, der den Lebenszyklus der Anwendung, den Datenfluss und die UI-Updates verwaltet.
*   **State Manager (`js/app/state.js`):** Ein zentralisiertes Modul zur Verwaltung des globalen Anwendungszustands, einschließlich der aktiven Kohorte, der Sortierpräferenzen und des entscheidenden "Analyse-Kontexts".
*   **Kernmodule (`js/core/`):** Behandeln die grundlegende Datenverarbeitung und die Verwaltung der verschiedenen Kriteriensets.
*   **Service-Schicht (`js/services/`):** Enthält die komplexe Geschäftslogik für statistische Berechnungen, die Brute-Force-Optimierung und den Publikationsdienst.
*   **UI-Schicht (`js/ui/`):** Verantwortlich für das Rendern aller UI-Komponenten und Tabs, einschließlich des neuen `insights_tab.js`.
*   **Web Worker (`workers/brute_force_worker.js`):** Die Datei `brute_force_worker.js` führt den rechenintensiven Optimierungsprozess in einem separaten Thread aus, um die Haupt-UI reaktionsschnell zu halten.

Für eine detaillierte Aufschlüsselung jeder Datei und Funktion konsultieren Sie bitte den **[Anwendungsleitfaden](./docs/Application_Guide.md)**.
