const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fubqrvdvnsjyvfkusvtr.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1YnFydmR2bnNqeXZma3VzdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTAzMzgsImV4cCI6MjEwNzQ4NjMzOH0.19Lru0AUD6AKhFL84zD2YxfISkEzY357n_NGMBy_fAM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

async function populateLargeTelemetry(targetRows = 100000, batchSize = 1000)
{
  console.log(`Fetching relational reference IDs from Supabase...`);
  
  const { data: drivers, error: dErr } = await supabase.from("drivers").select("id, code, position, team_id");
  if (dErr || !drivers || drivers.length === 0)
  {
    console.error("Failed to fetch drivers:", dErr);
    process.exit(1);
  }

  const { data: circuits, error: cErr } = await supabase.from("circuits").select("id, name, lap_length_km");
  if (cErr || !circuits || circuits.length === 0)
  {
    console.error("Failed to fetch circuits:", cErr);
    process.exit(1);
  }

  const { data: events } = await supabase.from("grand_prix_events").select("id, circuit_id");
  const eventMap = {};
  if (events)
  {
    events.forEach(e => { eventMap[e.circuit_id] = e.id; });
  }

  const { data: cars } = await supabase.from("cars").select("id, team_id");
  const carMap = {};
  if (cars)
  {
    cars.forEach(c => { carMap[c.team_id] = c.id; });
  }

  console.log(`Relational mappings verified. Beginning upload of ${targetRows} rows directly to Supabase via connected API...`);

  let insertedTotal = 0;
  const startTime = Date.now();
  const timestampBase = new Date("2026-05-24T15:00:00Z").getTime();

  while (insertedTotal < targetRows)
  {
    const rowsToInsert = Math.min(batchSize, targetRows - insertedTotal);
    const batch = [];

    for (let i = 0; i < rowsToInsert; i++)
    {
      const seq = insertedTotal + i;
      const driver = drivers[seq % drivers.length];
      const circuit = circuits[seq % circuits.length];
      const eventId = eventMap[circuit.id] || null;
      const carId = carMap[driver.team_id] || null;

      const trackLenM = (circuit.lap_length_km || 3.337) * 1000;
      const dist = Math.round(((seq * 27.5) % trackLenM) * 10) / 10;
      const speed = Math.round((140 + 160 * Math.sin(seq * 0.15) + (24 - driver.position) * 1.5) * 10) / 10;
      const safeSpeed = Math.max(110, Math.min(352, speed));
      const rpm = Math.round(8200 + (safeSpeed / 350) * 4100);
      const gear = Math.min(8, Math.max(2, Math.floor(safeSpeed / 42) + 1));
      const throttle = safeSpeed > 230 ? 100.0 : Math.round((safeSpeed / 2.4) * 10) / 10;
      const brake = throttle > 75 ? 0.0 : Math.round((100 - throttle) * 10) / 10;
      const gLat = Math.round((Math.sin(seq * 0.2) * 3.8) * 10) / 10;
      const gLong = throttle > 90 ? 1.4 : (brake > 50 ? -3.5 : 0.1);
      const brakeTemp = Math.round(380 + (brake / 100) * 550);
      const recTime = new Date(timestampBase + seq * 250).toISOString();
      const lapNum = (Math.floor(seq / (drivers.length * 60)) % 70) + 1;
      const sector = (seq % 3) + 1;

      batch.push({
        event_id: eventId,
        circuit_id: circuit.id,
        driver_id: driver.id,
        car_id: carId,
        lap_number: lapNum,
        distance_along_track_m: dist,
        speed_kmh: safeSpeed,
        rpm: rpm,
        gear: gear,
        throttle_pct: throttle,
        brake_pct: brake,
        g_force_lateral: gLat,
        g_force_longitudinal: gLong,
        brake_temp_celsius: brakeTemp,
        tyre_surface_temp_fl_celsius: 101,
        tyre_surface_temp_fr_celsius: 104,
        tyre_surface_temp_rl_celsius: 108,
        tyre_surface_temp_rr_celsius: 111,
        drs_active: safeSpeed > 270,
        active_aero_mode: safeSpeed > 280 ? "X-mode" : "Z-mode",
        sector: sector,
        recorded_at: recTime
      });
    }

    const { error } = await supabase.from("telemetry_data").insert(batch);
    if (error)
    {
      console.error(`Error inserting batch at seq ${insertedTotal}:`, error.message);
      break;
    }

    insertedTotal += rowsToInsert;
    const progressPct = ((insertedTotal / targetRows) * 100).toFixed(1);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\r[${progressPct}%] Inserted ${insertedTotal}/${targetRows} rows (${elapsedSec}s elapsed)...`);
  }

  console.log(`\nDirect database seeding completed! Successfully populated ${insertedTotal} rows.`);
}

const target = parseInt(process.argv[2], 10) || 50000;
populateLargeTelemetry(target);
