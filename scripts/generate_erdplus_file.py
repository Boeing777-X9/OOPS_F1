import json
import uuid
import math
import os

def create_f1_erdplus():
    # Entities definition
    entities_def = [
        # Col 1: Foundations (Regulations & Powertrain)
        {
            "name": "regulation_eras",
            "x": 120, "y": 140,
            "attrs": [
                ("era_id", True),
                ("era_name", False),
                ("start_year", False),
                ("engine_formula", False),
                ("budget_cap_millions", False)
            ]
        },
        {
            "name": "engine_manufacturers",
            "x": 120, "y": 520,
            "attrs": [
                ("manufacturer_id", True),
                ("name", False),
                ("country", False),
                ("mgu_k_spec", False),
                ("sustainable_fuel_spec", False)
            ]
        },

        # Col 2: Constructors, Drivers & Cars
        {
            "name": "teams",
            "x": 580, "y": 520,
            "attrs": [
                ("team_id", True),
                ("team_name", False),
                ("base_city", False),
                ("team_principal", False),
                ("championship_titles", False),
                ("color_hex", False)
            ]
        },
        {
            "name": "cars",
            "x": 580, "y": 140,
            "attrs": [
                ("car_id", True),
                ("model_name", False),
                ("season_year", False),
                ("power_hp", False),
                ("downforce_efficiency", False),
                ("weight_kg", False)
            ]
        },
        {
            "name": "drivers",
            "x": 580, "y": 880,
            "attrs": [
                ("driver_id", True),
                ("driver_code", False),
                ("first_name", False),
                ("last_name", False),
                ("driver_number", False),
                ("career_wins", False)
            ]
        },

        # Col 3: Tracks & Weather
        {
            "name": "circuits",
            "x": 1050, "y": 140,
            "attrs": [
                ("circuit_id", True),
                ("circuit_name", False),
                ("location", False),
                ("lap_length_km", False),
                ("corners_count", False),
                ("downforce_level", False)
            ]
        },
        {
            "name": "track_weather_samples",
            "x": 1050, "y": 520,
            "attrs": [
                ("weather_sample_id", True),
                ("sample_time", False),
                ("track_temp_celsius", False),
                ("air_temp_celsius", False),
                ("rainfall_rate_mm_h", False)
            ]
        },
        {
            "name": "grand_prix_events",
            "x": 1050, "y": 880,
            "attrs": [
                ("event_id", True),
                ("official_name", False),
                ("season_year", False),
                ("round_number", False),
                ("event_date", False),
                ("sprint_format", False)
            ]
        },

        # Col 4: Race Competition & Tyres
        {
            "name": "race_results",
            "x": 1550, "y": 880,
            "attrs": [
                ("result_id", True),
                ("fastest_lap_time", False),
                ("total_race_time", False),
                ("safety_cars_count", False)
            ]
        },
        {
            "name": "tyre_compounds",
            "x": 1550, "y": 520,
            "attrs": [
                ("compound_id", True),
                ("compound_name", False),
                ("compound_type", False),
                ("grip_index", False),
                ("durability_laps", False)
            ]
        },
        {
            "name": "strategy_simulations",
            "x": 1550, "y": 140,
            "attrs": [
                ("simulation_id", True),
                ("stint_1_laps", False),
                ("stint_2_laps", False),
                ("predicted_total_time", False),
                ("tyre_deg_risk", False)
            ]
        },

        # Col 5: Telemetry & Pit Stops
        {
            "name": "pit_stops",
            "x": 2020, "y": 520,
            "attrs": [
                ("pit_stop_id", True),
                ("lap_number", False),
                ("duration_seconds", False),
                ("stop_number", False),
                ("stationary_time", False)
            ]
        },
        {
            "name": "race_laps",
            "x": 2020, "y": 880,
            "attrs": [
                ("lap_id", True),
                ("lap_number", False),
                ("position", False),
                ("lap_time_seconds", False),
                ("speed_trap_kmh", False),
                ("tyre_age_laps", False)
            ]
        },
        {
            "name": "telemetry_data",
            "x": 2020, "y": 1250,
            "attrs": [
                ("telemetry_id", True),
                ("speed_kmh", False),
                ("throttle_pct", False),
                ("brake_pct", False),
                ("gear", False),
                ("drs_active", False)
            ]
        }
    ]

    # Map of entity name -> entity node dict
    entities = {}
    nodes = []
    edges = []

    # Create Entity nodes and Attribute nodes
    for ent in entities_def:
        ent_id = str(uuid.uuid4())
        ent_node = {
            "id": ent_id,
            "type": "Entity",
            "position": {
                "x": ent["x"],
                "y": ent["y"]
            },
            "data": {
                "label": ent["name"],
                "type": "Regular",
                "isConnectable": True,
                "isSelected": False
            },
            "measured": {
                "width": 120,
                "height": 50
            },
            "selected": False,
            "dragging": False
        }
        nodes.append(ent_node)
        entities[ent["name"]] = {
            "id": ent_id,
            "x": ent["x"],
            "y": ent["y"]
        }

        # Fan out attributes around the entity
        num_attrs = len(ent["attrs"])
        radius = 110
        for i, (attr_name, is_unique) in enumerate(ent["attrs"]):
            # Angle in radians (distribute in arc)
            angle = (2 * math.pi / num_attrs) * i - (math.pi / 2)
            dx = round(radius * math.cos(angle))
            dy = round(radius * math.sin(angle))
            attr_id = str(uuid.uuid4())

            attr_types = {"Unique": True} if is_unique else {}

            attr_node = {
                "id": attr_id,
                "parentId": ent_id,
                "type": "Attribute",
                "position": {
                    "x": dx,
                    "y": dy
                },
                "data": {
                    "label": attr_name,
                    "types": attr_types,
                    "isSelected": False,
                    "isConnectable": True
                },
                "measured": {
                    "width": 100,
                    "height": 45
                },
                "selected": False,
                "dragging": False
            }
            nodes.append(attr_node)

            # Edge from entity to attribute
            attr_edge = {
                "id": str(uuid.uuid4()),
                "type": "Attribute",
                "source": ent_id,
                "target": attr_id
            }
            edges.append(attr_edge)

    # Relationships definition
    # (rel_name, source_entity, target_entity, source_card, target_card)
    # in ERDPlus, source cardinality is often "One" and target is "Many" (1:M)
    relationships_def = [
        ("governs", "regulation_eras", "cars", "One", "Many"),
        ("supplies_pu", "engine_manufacturers", "teams", "One", "Many"),
        ("constructs", "teams", "cars", "One", "Many"),
        ("employs", "teams", "drivers", "One", "Many"),
        ("hosts_round", "circuits", "grand_prix_events", "One", "Many"),
        ("samples_track", "circuits", "track_weather_samples", "One", "Many"),
        ("calculates", "circuits", "strategy_simulations", "One", "Many"),
        ("models_driver", "drivers", "strategy_simulations", "One", "Many"),
        ("contests", "grand_prix_events", "race_results", "One", "Many"),
        ("wins_event", "drivers", "race_results", "One", "Many"),
        ("drives_result", "cars", "race_results", "One", "Many"),
        ("allocates_tyre", "tyre_compounds", "pit_stops", "One", "Many"),
        ("executes_stop", "grand_prix_events", "pit_stops", "One", "Many"),
        ("stops_driver", "drivers", "pit_stops", "One", "Many"),
        ("records_laps", "grand_prix_events", "race_laps", "One", "Many"),
        ("runs_laps", "drivers", "race_laps", "One", "Many"),
        ("streams_telemetry", "race_laps", "telemetry_data", "One", "Many")
    ]

    for rel_name, src_name, tgt_name, src_card, tgt_card in relationships_def:
        src = entities[src_name]
        tgt = entities[tgt_name]

        # Position relationship midpoint
        rel_x = (src["x"] + tgt["x"]) / 2
        rel_y = (src["y"] + tgt["y"]) / 2

        rel_id = str(uuid.uuid4())
        rel_node = {
            "id": rel_id,
            "type": "Relationship",
            "position": {
                "x": rel_x,
                "y": rel_y
            },
            "data": {
                "label": rel_name,
                "sourceEntityDetails": {
                    "id": src["id"],
                    "minCardinality": "Mandatory",
                    "maxCardinality": src_card
                },
                "targetEntityDetails": {
                    "id": tgt["id"],
                    "minCardinality": "Mandatory",
                    "maxCardinality": tgt_card
                },
                "isIdentifying": False,
                "isSelected": False,
                "isConnectable": True
            },
            "measured": {
                "width": 100,
                "height": 50
            },
            "selected": False,
            "dragging": False
        }
        nodes.append(rel_node)

        # Edge from relationship to source entity
        edge_src_id = f"{rel_id}->{src['id']};{src['id']}->{tgt['id']}"
        edges.append({
            "id": edge_src_id,
            "type": "Relationship",
            "source": rel_id,
            "target": src["id"],
            "data": {
                "id": f"{rel_id}->{src['id']}",
                "minCardinality": "Mandatory",
                "maxCardinality": src_card
            }
        })

        # Edge from relationship to target entity
        edge_tgt_id = f"{rel_id}->{tgt['id']};{src['id']}->{tgt['id']}"
        edges.append({
            "id": edge_tgt_id,
            "type": "Relationship",
            "source": rel_id,
            "target": tgt["id"],
            "data": {
                "id": f"{rel_id}->{tgt['id']}",
                "minCardinality": "Mandatory",
                "maxCardinality": tgt_card
            }
        })

    erdplus_doc = {
        "diagramType": 1,
        "data": {
            "nodes": nodes,
            "edges": edges,
            "viewport": {
                "x": 200,
                "y": 150,
                "zoom": 0.65
            }
        },
        "name": "F1_Apex_Database",
        "folder": {
            "name": "Diagrams",
            "folderType": 1,
            "depth": 0,
            "id": 1
        },
        "id": 10001,
        "updatedAtTimestamp": 1787151782
    }

    # Save to supabase/f1_database.erdplus
    supabase_path = r"C:\Users\moham\f1-dashboard\supabase\f1_database.erdplus"
    with open(supabase_path, "w", encoding="utf-8") as f:
        json.dump(erdplus_doc, f, indent=2)

    # Also save to user Downloads folder for easy 1-click import
    downloads_path = r"C:\Users\moham\Downloads\F1_Apex_Database.erdplus"
    with open(downloads_path, "w", encoding="utf-8") as f:
        json.dump(erdplus_doc, f, indent=2)

    print(f"Generated {len(nodes)} nodes and {len(edges)} edges.")
    print(f"Saved successfully to:\n- {supabase_path}\n- {downloads_path}")

if __name__ == "__main__":
    create_f1_erdplus()
