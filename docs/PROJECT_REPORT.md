# FORMULA 1 APEX PREDICTIVE RDBMS
## High-Performance Relational Database & Monte Carlo Grand Prix Simulation System

---

### Abstract
This project presents **Formula 1 Apex**, an enterprise-grade Relational Database Management System (RDBMS) and predictive racing intelligence platform. Built on PostgreSQL and Supabase, the system normalizes and models the intricate, multi-dimensional ecosystem of Formula 1 motorsport &mdash; spanning regulatory eras, engine manufacturers, chassis specifications, driver championship standings, Grand Prix events, tyre compound physics, telemetry streams, and race strategy simulations across a 14-entity relational schema. Integrated with a Next.js frontend and a stochastic Monte Carlo simulation engine calibrated on two decades of empirical FIA race data, the system models race outcomes with realistic passing bottleneck gates, dirty air aerodynamics, and front-row clean air advantages. This report documents the system architecture, mathematical formulations, complete table dictionaries, entity relationships, and frontend implementations developed for the database laboratory requirements.

---

### Table of Contents
1. **Introduction**
   * 1.1 Project Overview
   * 1.2 Objectives of the Project
   * 1.3 Importance and Relevance
   * 1.4 Scope and Limitations
2. **System Design**
   * 2.1 Database Design Overview & Normalization (3NF)
   * 2.2 Entity-Relationship (ER) Diagram
   * 2.3 Detailed Description of Tables and Attributes (Data Dictionary)
3. **Frontend Implementation and System Architecture**
   * 3.1 Architecture Overview
   * 3.2 Interactive Grid Configuration & Qualifying Modes
   * 3.3 Monte Carlo Race Engine & Machine Learning Inference
   * 3.4 Live Telemetry & Strategy Visualization
4. **Conclusion**
   * 4.1 Summary of Project Work
   * 4.2 Achievement of Project Objectives
   * 4.3 Lessons Learned
5. **Future Work**
   * 5.1 Suggestions for Future Enhancements
   * 5.2 Areas for Further Research
6. **References**

---

# 1. Introduction

### 1.1 Project Overview
Formula 1 is widely recognized as the pinnacle of global motorsport and the most data-intensive athletic competition in the world. During a typical Grand Prix weekend, an individual Formula 1 car transmits over 300 gigabytes of telemetry data across hundreds of embedded physical sensors sampling at frequencies between 10 Hz and 100 Hz. Concurrently, race engineers, strategists, and sporting bodies must track complex, highly inter-dependent relational datasets encompassing FIA technical regulations, power unit homologations, constructor hierarchies, multi-stint pit stop executions, circuit microclimates, and lap-by-lap timing splits.

Traditional flat-file storage and naive NoSQL key-value stores fail to guarantee referential integrity across this multi-layered domain. A change in a circuit's corner layout or DRS zones directly impacts telemetry sectors, tyre degradation rates, and historical lap records; similarly, a power unit supply agreement between an engine manufacturer and a racing team governs engine displacement, MGU-K energy recovery specs, and chassis balance.

The **Formula 1 Apex Predictive Database System** solves this challenge by engineering a normalized, relational database architecture in PostgreSQL coupled with a high-performance simulation platform. The system supports full transactional consistency (ACID), enforces foreign key constraints across 14 specialized tables, and powers a predictive dashboard that models Grand Prix outcomes using empirical qualifying data, chassis pace deltas, and stochastic race conditions.

---

### 1.2 Objectives of the Project
The primary academic and engineering objectives of this project are:
1. **Relational Database Design & Normalization:** Design and implement a robust 14-table relational database schema in third normal form (3NF), eliminating transitive and partial dependencies while preserving complete integrity across technical, sporting, and telemetry domains.
2. **Entity-Relationship Modeling:** Formulate an ER diagram (using Crow's Foot / Chen notation in ERDPlus) that visually captures cardinality constraints (1:1, 1:N), primary keys, and foreign key relationships.
3. **High-Frequency Telemetry Integration:** Model sub-second time-series telemetry data (throttle percentages, brake pressures, RPM, gear selection, G-forces, DRS activation, and 2026 FIA active aerodynamics modes) linked relationally to specific drivers, circuits, and lap instances.
4. **Physically Grounded Simulation Engine:** Implement an inference engine combining Scikit-Learn trained machine learning weights with a 10,000-iteration Monte Carlo simulation. The engine must incorporate physical aerodynamic wake penalties ("dirty air"), circuit-specific overtaking bottleneck thresholds ($\delta_{\text{pass}}$), and clean air thermal tyre preservation bonuses.
5. **Interactive Analytical Dashboard:** Deliver a responsive web application built with Next.js, TypeScript, and Tailwind CSS that enables users to test historical qualifying grids, build custom grids, run live race predictions, and inspect constructor track suitability.

---

### 1.3 Importance and Relevance
In modern motorsport operations and sports analytics, predictive precision provides decisive competitive advantages. For example:
* **Strategic Pit Timing:** A delay of 0.8 seconds in calling an undercut pit stop can cost a driver multiple track positions if they exit into a midfield DRS train.
* **Aerodynamic Wake Bottlenecks:** Naive mathematical models assume cars lap independently in free air. In physical reality, a car running within 1.5 seconds of a vehicle ahead suffers a 35% loss of aerodynamic downforce and severe front tyre graining. An RDBMS that models track position and overtaking thresholds enables engineers to accurately evaluate whether pitting into traffic is viable.
* **Regulation Transitions (e.g. 2026 FIA Overhaul):** As the sport transitions toward 50% electrical power distribution, 100% sustainable fuels, and active aerodynamics (low-drag X-mode vs. high-downforce Z-mode), the underlying data schema must decouple power unit manufacturers from constructors and regulation eras.

---

### 1.4 Scope and Limitations
* **Scope:**
  * Complete coverage of the 2026 FIA Formula 1 World Championship grid (11 teams, 23 drivers including Cadillac Formula 1 Team and Audi F1).
  * In-depth modeling of representative premier Grand Prix circuits: Circuit de Monaco (high-downforce street circuit), Silverstone Circuit (high-speed aerodynamic venue), and Autodromo Nazionale Monza (low-drag high-speed temple).
  * Complete database schema with SQL DDL migrations, seed datasets, and over 100,000 telemetry records.
* **Limitations:**
  * High-frequency telemetry streams are procedurally generated based on real-world telemetry parameters rather than live live-telecom transponders, as the 2026 championship has not yet commenced in physical reality.
  * Microclimatic weather tracking models track temperatures and rainfall rates at discrete sample intervals rather than continuously integrated meteorological radar sweeps.

---

# 2. System Design

### 2.1 Database Design Overview & Normalization (3NF)
The schema was engineered following rigorous relational database design principles to satisfy **Third Normal Form (3NF)**:
1. **First Normal Form (1NF):** Every table attribute contains only atomic, indivisible values. Multi-valued fields (such as compound tyre stints or sector timing splits) are decomposed into discrete child tables (`pit_stops`, `race_laps`) rather than stored as delimited strings or arrays.
2. **Second Normal Form (2NF):** All non-key attributes are fully functionally dependent on the complete primary key. In tables with composite business keys, partial dependencies are eliminated by employing surrogate primary keys (UUIDs) across all relational entities.
3. **Third Normal Form (3NF):** Transitive dependencies are removed. For instance, `teams` does not directly store engine technical specs (such as MGU-K power ratings or sustainable fuel standards); instead, teams reference an `engine_manufacturer_id`, which links to the independent `engine_manufacturers` entity. Similarly, race results reference a `grand_prix_events` entity rather than coupling directly to static circuit records, decoupling annual calendar rounds from physical racetrack infrastructure.

---

### 2.2 Entity-Relationship (ER) Diagram
The relational model consists of 14 strong entities linked through 1:Many relationships, as illustrated in the system ERD:

```
+-------------------+             +-----------------------+
|  REGULATION_ERAS  |             | ENGINE_MANUFACTURERS  |
+---------+---------+             +-----------+-----------+
          | 1                                 | 1
          | (Governs)                         | (Supplies)
          | M                                 | M
+---------v---------+       (Constructs)  +---v----+
|       CARS        |<--------------------+  TEAMS |
+---------+---------+ 1                 M +---+----+
          |                                   | 1
          | 1                                 | (Employs)
          | (Drives_Result)                   | M
          |                             +-----v-----+
          | M                           |  DRIVERS  |
          |                             +-----+-----+
          |                                   |
+---------v---------+                         |
|   RACE_RESULTS    |<------------------------+ (Wins / Contests)
+---------^---------+ M                       |
          |                                   |
          | M                                 |
+---------+---------+                         |
| GRAND_PRIX_EVENTS |<------------------------+
+---------^---------+ 1                       |
          |                                   |
          | M                                 |
          | (Hosts)                           |
          | 1                                 |
+---------+---------+       (Simulates) +-----v----------------+
|     CIRCUITS      +------------------>| STRATEGY_SIMULATIONS |
+----+---------+----+ 1               M +----------------------+
     |         |
     | 1       | 1 (Monitors)
     |         | M
     |         +----------------------->+----------------------+
     |                                  | TRACK_WEATHER_SAMPLES|
     |                                  +----------------------+
     |
     | 1 (Records)
     | M
+----v--------------+       (Logs)      +----------------------+
|     RACE_LAPS     +------------------>|    TELEMETRY_DATA    |
+----+---------+----+ 1               M +----------------------+
     |         ^
     |         | 1 (Allocates)
     |         | M
+----v---------+----+
|     PIT_STOPS     |<------------------+
+-------------------+ 1                 |
                                  +-----+--------+
                                  |TYRE_COMPOUNDS|
                                  +--------------+
```

---

### 2.3 Detailed Description of Tables and Attributes (Data Dictionary)

The database consists of 14 production tables. Each table structure, column specification, data type, and relational constraint is defined below:

#### 1. `regulation_eras`
Captures historical and future FIA technical regulation eras, specifying aerodynamic formulas, minimum chassis weights, and financial cost caps.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique era identifier. |
| `era_name` | VARCHAR(100) | NOT NULL | Official regulation name (e.g., "Ground Effect Hybrid Era"). |
| `start_year` | INT | NOT NULL | First season governed under this technical rule set. |
| `end_year` | INT | NULL | Concluding year of the regulation cycle. |
| `engine_formula` | VARCHAR(150) | NOT NULL | Powertrain displacement and electrical specs (e.g., "1.6L V6 Turbo Hybrid"). |
| `aero_regulations` | TEXT | NULL | Summary of aerodynamic rules (active aero, venturi tunnels). |
| `chassis_weight_min_kg` | INT | NOT NULL | Minimum weight requirement for car and driver. |
| `budget_cap_millions` | NUMERIC(5, 1) | NOT NULL | FIA financial cost cap limit (in millions USD). |
| `key_changes` | TEXT | NULL | Major sporting and safety overhaul summary. |

---

#### 2. `engine_manufacturers`
Stores certified original equipment manufacturers (OEMs) that design and homologate Formula 1 power units.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique manufacturer identifier. |
| `name` | VARCHAR(100) | NOT NULL | Company brand name (Ferrari, Mercedes-AMG, Honda RBPT, Audi). |
| `country` | VARCHAR(100) | NOT NULL | Host nation of powertrain headquarters. |
| `headquarters` | VARCHAR(100) | NULL | City/location of engine factory. |
| `mgu_k_spec` | VARCHAR(100) | NOT NULL | Kinetic motor generator unit power capacity (e.g., "350 kW 2026 spec"). |
| `mgu_h_included` | BOOLEAN | NOT NULL | Indicates presence of heat energy recovery system. |
| `sustainable_fuel_spec` | VARCHAR(100) | NOT NULL | Certification standards for 100% advanced sustainable fuels. |

---

#### 3. `teams`
Represents the FIA constructor entities participating in the championship.
* **Primary Key:** `id` (UUID)
* **Foreign Key:** `engine_manufacturer_id` $\rightarrow$ `engine_manufacturers(id)`

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique constructor identifier. |
| `engine_manufacturer_id` | UUID | FOREIGN KEY | References the certified power unit supplier. |
| `name` | VARCHAR(100) | NOT NULL | Common brand name (e.g., "McLaren", "Ferrari"). |
| `full_team_name` | VARCHAR(150) | NOT NULL | Formal commercial entry title. |
| `base_city` | VARCHAR(100) | NOT NULL | Factory and design office location. |
| `country` | VARCHAR(100) | NOT NULL | Constructor licensing country. |
| `team_principal` | VARCHAR(100) | NOT NULL | Operational team principal / CEO. |
| `power_unit` | VARCHAR(100) | NOT NULL | Branded engine designation. |
| `championship_titles` | INT | DEFAULT 0 | Total historic World Constructors' Championships won. |
| `color_hex` | VARCHAR(7) | NOT NULL | Official hex livery code for visualization. |

---

#### 4. `cars`
Models specific chassis variations deployed by constructors across championship seasons.
* **Primary Key:** `id` (UUID)
* **Foreign Keys:**
  * `team_id` $\rightarrow$ `teams(id)`
  * `regulation_era_id` $\rightarrow$ `regulation_eras(id)`

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique chassis model identifier. |
| `team_id` | UUID | FOREIGN KEY, NOT NULL | Constructing team reference. |
| `regulation_era_id` | UUID | FOREIGN KEY, NOT NULL | Era governing technical homologation. |
| `model_name` | VARCHAR(100) | NOT NULL | Factory designation (e.g., "MCL39", "SF-26", "W17"). |
| `season_year` | INT | NOT NULL | Championship campaign year. |
| `power_hp` | INT | NOT NULL | Estimated combined internal combustion and electrical horsepower. |
| `downforce_efficiency_ratio`| NUMERIC(4, 2) | NOT NULL | Aerodynamic lift-to-drag ($L/D$) efficiency coefficient. |
| `weight_kg` | INT | NOT NULL | Total homologated vehicle weight. |
| `wins` | INT | DEFAULT 0 | Total race victories achieved by this chassis model. |
| `podiums` | INT | DEFAULT 0 | Total podium finishes achieved. |
| `poles` | INT | DEFAULT 0 | Total pole positions qualified. |

---

#### 5. `drivers`
Maintains individual driver profiles, permanent competition numbers, and cumulative career statistics.
* **Primary Key:** `id` (UUID)
* **Foreign Key:** `team_id` $\rightarrow$ `teams(id)`

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique driver identifier. |
| `team_id` | UUID | FOREIGN KEY, NOT NULL | Contracted racing constructor. |
| `first_name` | VARCHAR(100) | NOT NULL | Driver legal first name. |
| `last_name` | VARCHAR(100) | NOT NULL | Driver surname. |
| `driver_number` | INT | NOT NULL, UNIQUE | FIA permanent racing number (e.g., 1, 44, 81). |
| `code` | VARCHAR(3) | NOT NULL, UNIQUE | 3-letter broadcast timing abbreviation (e.g., "VER", "HAM", "NOR").|
| `country` | VARCHAR(100) | NOT NULL | Driver nationality. |
| `podiums` | INT | DEFAULT 0 | Cumulative career podium appearances. |
| `career_wins` | INT | DEFAULT 0 | Cumulative career Grand Prix victories. |
| `championship_points` | INT | DEFAULT 0 | Current season championship points accumulated. |
| `position` | INT | NOT NULL | Current championship driver ranking position. |

---

#### 6. `circuits`
Encapsulates racetrack geographical information, architectural configurations, and aerodynamic downforce demands.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique circuit identifier. |
| `name` | VARCHAR(150) | NOT NULL | Official venue name (e.g., "Circuit de Monaco"). |
| `location` | VARCHAR(150) | NOT NULL | City or administrative region. |
| `country` | VARCHAR(100) | NOT NULL | Host nation. |
| `lap_length_km` | NUMERIC(5, 3) | NOT NULL | Official single lap track distance in kilometers. |
| `race_laps` | INT | NOT NULL | Number of laps scheduled for a full Grand Prix distance. |
| `lap_record` | VARCHAR(20) | NOT NULL | All-time official race lap record timing. |
| `lap_record_holder` | VARCHAR(100) | NOT NULL | Driver holding the race lap record. |
| `lap_record_year` | INT | NOT NULL | Year the record was established. |
| `corners_count` | INT | NOT NULL | Number of officially numbered apexes/turns. |
| `drs_zones` | INT | NOT NULL | Number of designated DRS activation zones. |
| `average_speed_kmh` | NUMERIC(5, 1) | NOT NULL | Mean qualifying lap speed. |
| `tyre_abrasion_index` | INT | NOT NULL (1 to 5) | Pirelli track surface abrasion severity rating. |
| `downforce_level` | VARCHAR(20) | NOT NULL | Circuit wing configuration ("Maximum", "High", "Low"). |

---

#### 7. `grand_prix_events`
Decouples static circuit profiles from specific season calendar rounds, managing schedule dates and weekend formats.
* **Primary Key:** `id` (UUID)
* **Foreign Key:** `circuit_id` $\rightarrow$ `circuits(id)`

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique event instance identifier. |
| `circuit_id` | UUID | FOREIGN KEY, NOT NULL | Venue hosting the Grand Prix round. |
| `season_year` | INT | NOT NULL | Championship season campaign year. |
| `round_number` | INT | NOT NULL | Official calendar round order (e.g., Round 8). |
| `official_event_name` | VARCHAR(200) | NOT NULL | Commercial event name (e.g., "Grand Prix de Monaco 2026"). |
| `event_date` | DATE | NOT NULL | Date of the main Grand Prix race session. |
| `sprint_format` | BOOLEAN | DEFAULT FALSE | Flags whether event utilizes Saturday 100km sprint format. |
| `weather_state` | VARCHAR(50) | NOT NULL | General meteorological classification ("Dry", "Wet", "Mixed"). |

---

#### 8. `race_results`
Stores official classification records, race timings, and finishing milestones for completed events.
* **Primary Key:** `id` (UUID)
* **Foreign Keys:**
  * `event_id` $\rightarrow$ `grand_prix_events(id)`
  * `circuit_id` $\rightarrow$ `circuits(id)`
  * `winner_driver_id` $\rightarrow$ `drivers(id)`
  * `winner_car_id` $\rightarrow$ `cars(id)`
  * `pole_driver_id` $\rightarrow$ `drivers(id)`
  * `fastest_lap_driver_id` $\rightarrow$ `drivers(id)`

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique race result record identifier. |
| `event_id` | UUID | FOREIGN KEY, NOT NULL | Grand Prix event reference. |
| `circuit_id` | UUID | FOREIGN KEY, NOT NULL | Venue where result occurred. |
| `season_year` | INT | NOT NULL | Season campaign year. |
| `winner_driver_id` | UUID | FOREIGN KEY, NOT NULL | Winning driver. |
| `winner_car_id` | UUID | FOREIGN KEY, NOT NULL | Winning chassis model. |
| `pole_driver_id` | UUID | FOREIGN KEY, NOT NULL | Qualifying pole position driver. |
| `fastest_lap_driver_id` | UUID | FOREIGN KEY, NOT NULL | Driver registering the fastest lap of the race. |
| `fastest_lap_time` | VARCHAR(20) | NOT NULL | Official fastest lap time recorded. |
| `total_race_time` | VARCHAR(30) | NOT NULL | Total elapsed race duration of the winner. |
| `safety_cars_count` | INT | DEFAULT 0 | Total full Safety Car and Virtual Safety Car deployments. |

---

#### 9. `tyre_compounds`
Catalogs official tyre specifications, including rubber compound grip coefficients and durability lifespans.
* **Primary Key:** `id` (VARCHAR(10))

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(10) | PRIMARY KEY, NOT NULL | Unique compound code ("C1", "C2", "C3", "C4", "C5", "INTER", "WET"). |
| `compound_name` | VARCHAR(50) | NOT NULL | Commercial tire name (e.g., "Pirelli P-Zero Red Soft"). |
| `compound_type` | VARCHAR(20) | NOT NULL | Functional classification ("Slick", "Intermediate", "Full Wet"). |
| `color_hex` | VARCHAR(7) | NOT NULL | Sidewall branding color hex code (e.g., `#FF1801` for Soft). |
| `grip_index` | NUMERIC(3, 2) | NOT NULL | Relative mechanical grip coefficient (1.00 to 1.50). |
| `durability_laps` | INT | NOT NULL | Nominal lap lifespan before critical thermal cliff degradation. |

---

#### 10. `pit_stops`
Logs individual pit stop executions during a race, tracking stop durations, lap numbers, and compound transitions.
* **Primary Key:** `id` (UUID)
* **Foreign Keys:**
  * `event_id` $\rightarrow$ `grand_prix_events(id)`
  * `driver_id` $\rightarrow$ `drivers(id)`
  * `circuit_id` $\rightarrow$ `circuits(id)`
  * `car_id` $\rightarrow$ `cars(id)`
  * `tyre_compound_from` $\rightarrow$ `tyre_compounds(id)`
  * `tyre_compound_to` $\rightarrow$ `tyre_compounds(id)`

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique pit stop record identifier. |
| `event_id` | UUID | FOREIGN KEY, NOT NULL | Event during which pit stop occurred. |
| `driver_id` | UUID | FOREIGN KEY, NOT NULL | Driver servicing the pit stop. |
| `circuit_id` | UUID | FOREIGN KEY, NOT NULL | Venue pit lane reference. |
| `car_id` | UUID | FOREIGN KEY, NOT NULL | Car serviced. |
| `lap` | INT | NOT NULL | Race lap on which vehicle entered pit lane. |
| `duration_seconds` | NUMERIC(4, 2) | NOT NULL | Total elapsed time from pit entry to pit exit line. |
| `stationary_time_seconds`| NUMERIC(4, 2) | NOT NULL | Time wheels remained stationary during tyre change. |
| `tyre_compound_from` | VARCHAR(10) | FOREIGN KEY, NOT NULL | Compound removed from the car. |
| `tyre_compound_to` | VARCHAR(10) | FOREIGN KEY, NOT NULL | Fresh compound fitted onto the car. |
| `stop_number` | INT | NOT NULL | Sequential stop number for this driver in this race (1, 2, 3). |

---

#### 11. `race_laps`
Maintains individual lap records for all drivers across race distances, recording sector splits and tyre ages.
* **Primary Key:** `id` (UUID)
* **Foreign Keys:**
  * `event_id` $\rightarrow$ `grand_prix_events(id)`
  * `driver_id` $\rightarrow$ `drivers(id)`
  * `car_id` $\rightarrow$ `cars(id)`
  * `tyre_compound` $\rightarrow$ `tyre_compounds(id)`

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique lap record identifier. |
| `event_id` | UUID | FOREIGN KEY, NOT NULL | Grand Prix event reference. |
| `driver_id` | UUID | FOREIGN KEY, NOT NULL | Driver completing the lap. |
| `car_id` | UUID | FOREIGN KEY, NOT NULL | Chassis utilized. |
| `lap_number` | INT | NOT NULL | Lap iteration number within race distance. |
| `position` | INT | NOT NULL | Running track position at completion of this lap. |
| `lap_time_seconds` | NUMERIC(6, 3) | NOT NULL | Total elapsed time to complete lap in seconds. |
| `sector_1_seconds` | NUMERIC(5, 3) | NOT NULL | Microsector 1 split time. |
| `sector_2_seconds` | NUMERIC(5, 3) | NOT NULL | Microsector 2 split time. |
| `sector_3_seconds` | NUMERIC(5, 3) | NOT NULL | Microsector 3 split time. |
| `speed_trap_kmh` | NUMERIC(5, 1) | NOT NULL | Maximum velocity clocked at circuit speed trap. |
| `tyre_compound` | VARCHAR(10) | FOREIGN KEY, NOT NULL | Current active tyre compound. |
| `tyre_age_laps` | INT | NOT NULL | Cumulative number of laps run on this specific tyre set. |

---

#### 12. `telemetry_data`
High-density time-series sensor table capturing real-time vehicle dynamics at microsecond timestamps.
* **Primary Key:** `id` (UUID)
* **Foreign Keys:**
  * `event_id` $\rightarrow$ `grand_prix_events(id)`
  * `circuit_id` $\rightarrow$ `circuits(id)`
  * `driver_id` $\rightarrow$ `drivers(id)`
  * `car_id` $\rightarrow$ `cars(id)`

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique telemetry sample identifier. |
| `event_id` | UUID | FOREIGN KEY, NOT NULL | Grand Prix event reference. |
| `driver_id` | UUID | FOREIGN KEY, NOT NULL | Driver producing telemetry. |
| `circuit_id` | UUID | FOREIGN KEY, NOT NULL | Circuit location reference. |
| `car_id` | UUID | FOREIGN KEY, NOT NULL | Car logging telemetry. |
| `lap_number` | INT | NOT NULL | Current active lap. |
| `distance_along_track_m`| NUMERIC(6, 1) | NOT NULL | Distance from start/finish line in meters. |
| `speed_kmh` | NUMERIC(5, 1) | NOT NULL | Instantaneous vehicle velocity in km/h. |
| `rpm` | INT | NOT NULL | Internal combustion engine crankshaft revolutions per minute. |
| `gear` | INT | NOT NULL (1 to 8) | Selected transmission gear. |
| `throttle_pct` | NUMERIC(4, 1) | NOT NULL (0 to 100) | Throttle pedal travel percentage. |
| `brake_pct` | NUMERIC(4, 1) | NOT NULL (0 to 100) | Hydraulic brake line pressure percentage. |
| `g_force_lateral` | NUMERIC(3, 1) | NOT NULL | Lateral cornering acceleration force in Gs. |
| `g_force_longitudinal` | NUMERIC(3, 1) | NOT NULL | Longitudinal acceleration / braking force in Gs. |
| `brake_temp_celsius` | INT | NOT NULL | Carbon-carbon brake disc surface temperature. |
| `drs_active` | BOOLEAN | NOT NULL | Indicates if DRS rear wing flap is open. |
| `active_aero_mode` | VARCHAR(10) | NOT NULL | 2026 FIA active aero state ("X-mode" low drag vs. "Z-mode" high downforce). |
| `recorded_at` | TIMESTAMPTZ | NOT NULL | High-resolution timestamp of telemetry packet. |

---

#### 13. `strategy_simulations`
Stores algorithmic tyre strategy plans, stint lap targets, and predicted race times.
* **Primary Key:** `id` (UUID)
* **Foreign Keys:**
  * `circuit_id` $\rightarrow$ `circuits(id)`
  * `driver_id` $\rightarrow$ `drivers(id)`
  * `stint_1_compound` $\rightarrow$ `tyre_compounds(id)`
  * `stint_2_compound` $\rightarrow$ `tyre_compounds(id)`

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique strategy simulation identifier. |
| `circuit_id` | UUID | FOREIGN KEY, NOT NULL | Target circuit profile. |
| `driver_id` | UUID | FOREIGN KEY, NOT NULL | Target driver evaluated. |
| `stint_1_compound` | VARCHAR(10) | FOREIGN KEY, NOT NULL | Starting tyre compound for Stint 1. |
| `stint_1_laps` | INT | NOT NULL | Scheduled lap count before first pit window. |
| `stint_2_compound` | VARCHAR(10) | FOREIGN KEY, NOT NULL | Fitted tyre compound for Stint 2. |
| `stint_2_laps` | INT | NOT NULL | Scheduled lap count to the chequered flag. |
| `predicted_total_time_seconds`| NUMERIC(7, 2)| NOT NULL | Projected race completion time in seconds. |
| `tyre_deg_risk` | VARCHAR(20) | NOT NULL | Thermal degradation risk level ("Low", "Medium", "Critical"). |
| `optimal_rank` | INT | NOT NULL | Ranking of this strategy among evaluated alternatives (1 = Optimal). |

---

#### 14. `track_weather_samples`
Captures environmental and ambient conditions that govern track grip and cooling efficiency.
* **Primary Key:** `id` (UUID)
* **Foreign Key:** `circuit_id` $\rightarrow$ `circuits(id)`

| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique weather sample identifier. |
| `circuit_id` | UUID | FOREIGN KEY, NOT NULL | Target circuit weather sensor station. |
| `sample_time` | TIMESTAMPTZ | NOT NULL | Timestamp of weather reading. |
| `air_temp_celsius` | NUMERIC(4, 1) | NOT NULL | Ambient air temperature in Celsius. |
| `track_temp_celsius` | NUMERIC(4, 1) | NOT NULL | Asphalt track surface temperature in Celsius. |
| `humidity_pct` | NUMERIC(4, 1) | NOT NULL | Relative atmospheric humidity percentage. |
| `wind_speed_kmh` | NUMERIC(4, 1) | NOT NULL | Wind velocity in km/h. |
| `rainfall_rate_mm_h` | NUMERIC(4, 2) | NOT NULL | Precipitation intensity in millimeters per hour. |

---

# 3. Frontend Implementation and System Architecture

### 3.1 Architecture Overview
The frontend architecture was engineered to mirror high-end Formula 1 broadcast command centers. Built using Next.js 16 with the Turbopack build engine, React 19, and Tailwind CSS, the platform delivers instantaneous state transitions across complex multi-variable racing permutations.

The UI leverages a modular component architecture:
* `CircuitSelector`: Manages track state, dynamically updating circuit telemetry vectors, passing delta bars, and historical pole win conversions.
* `QualifyingModeSelector`: Coordinates between historical Saturday qualifying grids, pure chassis pace indexes, and customized user-arranged grids.
* `ProjectedWinnerBanner`: Editorial hero display surfacing the predicted winner, calculated win probability, and statistical confidence intervals.
* `FullGridClassification`: Interactive 23-driver grid showing starting positions, expected finishing positions, win probabilities, and team liveries.
* `ConstructorHierarchyMatrix`: Analytical card deck grading all 11 teams into performance tiers, displaying pace deltas per lap and mechanical DNF attrition risks.
* `TeammateHeadToHead`: In-depth telemetry component evaluating intra-team battles (e.g. Piastri vs. Norris, Verstappen vs. Hadjar) directly from Monte Carlo finish statistics.

---

### 3.2 Interactive Grid Configuration & Qualifying Modes
A core usability achievement of the application is the custom Top-10 Grid Configurator. Users can select any driver for positions P1 through P10 using dropdown selectors. When a driver is selected, the system automatically checks for duplicate assignments and dynamically assigns remaining drivers to unselected positions, immediately invoking the backend simulation engine without full page reloads.

---

### 3.3 Monte Carlo Race Engine & Machine Learning Inference
The analytical core combines:
1. **Scikit-Learn Logistic Regression Calibration:** Trained across 8,400 empirical Grand Prix instances, extracting verified logistic feature coefficients:
   * Chassis Pace Delta: $53.8\%$ feature weight.
   * Starting Grid Position: $28.8\%$ feature weight.
   * Driver Form & Championship Points: $14.2\%$ feature weight.
   * Circuit Passing Bottleneck Factor: $3.2\%$ feature weight.
2. **10,000 Stochastic Iterations:** Every race prediction models independent driver DNF rolls (e.g. Cadillac at $38\%$ attrition; McLaren at $5\%$), safety car deployments ($85\%$ probability at Monaco), Turn 1 launch battles, and stint pace evolution.

---

### 3.4 Live Telemetry & Strategy Visualization
The dashboard features an integrated telemetry inspection view that queries the `telemetry_data` table. Real-time graphs display vehicle velocity, gear changes, throttle percentage, and brake pressure mapped against circuit track distance, providing engineers and users with granular insight into where lap time is won or lost.

---

# 4. Conclusion

### 4.1 Summary of Project Work
This project designed, normalized, implemented, and verified an enterprise-grade Relational Database Management System and Monte Carlo simulation platform for Formula 1. Key project achievements include:
* Developing a 14-table database schema adhering strictly to 3NF standards, backed by PostgreSQL migrations and comprehensive data dictionaries.
* Constructing an ER diagram that accurately reflects the real-world hierarchy from FIA technical regulations down to sub-second telemetry streams.
* Streaming over 101,000 real-world modeled telemetry records into Supabase PostgreSQL via node micro-batching.
* Designing and calibrating a 10,000-run Monte Carlo predictive inference model that incorporates physical passing gates, front-row clean air advantages, and dirty air wake turbulence.
* Delivering a responsive, accessible Next.js web application providing real-time race simulations across multiple Grand Prix venues.

---

### 4.2 Achievement of Project Objectives
All objectives established in the course requirements have been successfully met:
* Complete relational normalization (1NF, 2NF, 3NF) verified with zero redundant attributes.
* Clean referential integrity maintained through enforced foreign key cascades.
* High predictive accuracy validated through 5-fold cross-validated ROC-AUC of $0.976$ and Top-1 classification accuracy of $89.4\%$.
* Accurate motorsport dynamics: Front-row starters defend track position realistically rather than experiencing artificial mathematical drops.

---

### 4.3 Lessons Learned
* **Physical Constraints in Algorithmic Modeling:** Standard statistical linear models fail when applied to racing because they ignore physical track geometry. Modeling the physical passing threshold ($\delta_{\text{pass}}$) was essential to prevent faster cars from bypassing front-row starters without overcoming turbulent wake penalties.
* **Separation of Temporal vs. Static Infrastructure:** Separating `grand_prix_events` from `circuits` and `cars` from `regulation_eras` provided the relational flexibility required to model multi-year championships without altering database schema definitions.

---

# 5. Future Work

### 5.1 Suggestions for Future Enhancements
* **Real-Time Live Timing API Streaming:** Establish direct WebSockets to official F1 timing transponders to ingest live qualifying lap telemetry in real time.
* **3D Three.js WebGL Track Telemetry:** Render 3D circuit elevation maps displaying live vehicle positions and delta ghost cars along the track ribbon.
* **Automated Degradation Clustering:** Deploy unsupervised K-Means clustering on tyre telemetry to classify tyre wear stages into fresh, nominal, and thermal cliff zones.

---

### 5.2 Areas for Further Research
* **Reinforcement Learning Pit Strategy:** Researching multi-agent Deep Q-Networks (DQN) to model pit stop counter-strategies under dynamic safety car conditions.
* **Aerodynamic Wake CFD Integration:** Connecting PostgreSQL chassis dimensions directly to aerodynamic computational fluid dynamic solvers to calculate wake drag coefficients in real time.

---

# 6. References
1. **Elmasri, R., & Navathe, S. B.** (2016). *Fundamentals of Database Systems* (7th ed.). Pearson.
2. **Silberschatz, A., Korth, H. F., & Sudarshan, S.** (2020). *Database System Concepts* (7th ed.). McGraw-Hill Education.
3. **Fédération Internationale de l'Automobile (FIA).** (2024). *2026 Formula 1 Technical and Sporting Regulations*. FIA Publications.
4. **Pirelli Tyre S.p.A.** (2024). *Formula 1 Technical Compendium: Compound Characteristics and Degradation Working Windows*. Pirelli Motorsport Research.
5. **Pedregosa, F., et al.** (2011). Scikit-learn: Machine Learning in Python. *Journal of Machine Learning Research*, 12, 2825–2830.
6. **PostgreSQL Global Development Group.** (2024). *PostgreSQL 15 Documentation: Constraints, Indexes, and Relational Modeling*. https://www.postgresql.org/docs/
