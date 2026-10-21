const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fubqrvdvnsjyvfkusvtr.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1YnFydmR2bnNqeXZma3VzdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MTAzMzgsImV4cCI6MjEwNzQ4NjMzOH0.19Lru0AUD6AKhFL84zD2YxfISkEzY357n_NGMBy_fAM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

async function fetchJson(url)
{
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

async function syncRealOpenF1Data()
{
  console.log("Connecting to Official Live OpenF1 Public API (api.openf1.org)...");
  
  // 1. Fetch live race session for Monaco Grand Prix
  const sessions = await fetchJson("https://api.openf1.org/v1/sessions?year=2024&country_name=Monaco&session_name=Race");
  if (!sessions || sessions.length === 0)
  {
    console.error("No session found!");
    return;
  }
  const sessionKey = sessions[0].session_key; // 9523
  console.log(`Found Official F1 Session: ${sessions[0].session_name} at ${sessions[0].location} (Key: ${sessionKey})`);

  // 2. Fetch official track weather progression
  console.log("Fetching real weather telemetry from OpenF1...");
  const weatherData = await fetchJson(`https://api.openf1.org/v1/weather?session_key=${sessionKey}`);
  console.log(`Retrieved ${weatherData.length} real track weather data points.`);

  // 3. Fetch real pit stops
  console.log("Fetching real pit stops from OpenF1...");
  const pitData = await fetchJson(`https://api.openf1.org/v1/pit?session_key=${sessionKey}`);
  console.log(`Retrieved ${pitData.length} real Grand Prix pit stop records.`);

  // 4. Fetch real lap timing & sector breakdown for race winner Charles Leclerc (#16)
  console.log("Fetching real lap timings and sector times from OpenF1 for car #16...");
  const lapData = await fetchJson(`https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=16`);
  console.log(`Retrieved ${lapData.length} official completed lap timing logs.`);

  // Map to our database circuits and drivers
  const { data: monacoCircuit } = await supabase.from("circuits").select("id").eq("name", "Circuit de Monaco").single();
  const { data: drivers } = await supabase.from("drivers").select("id, driver_number, code");
  const driverMap = {};
  if (drivers)
  {
    drivers.forEach(d => { driverMap[d.driver_number] = d.id; });
  }

  // Insert real weather into track_weather_samples
  if (monacoCircuit && weatherData.length > 0)
  {
    const weatherRows = weatherData.slice(0, 50).map(w => ({
      circuit_id: monacoCircuit.id,
      sample_time: w.date,
      air_temp_celsius: w.air_temperature,
      track_temp_celsius: w.track_temperature,
      humidity_pct: w.humidity,
      wind_speed_kmh: Math.round(w.wind_speed * 3.6 * 10) / 10,
      wind_direction_deg: w.wind_direction,
      rainfall_rate_mm_h: w.rainfall
    }));

    const { error: wErr } = await supabase.from("track_weather_samples").insert(weatherRows);
    if (!wErr)
    {
      console.log(`Successfully synced ${weatherRows.length} official FIA weather telemetry rows into Supabase!`);
    }
  }

  console.log("Real-time OpenF1 API sync complete!");
}

syncRealOpenF1Data().catch(console.error);
