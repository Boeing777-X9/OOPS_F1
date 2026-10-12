"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Gauge,
  Activity,
  Flame,
  Zap,
  ChevronRight,
  TrendingUp,
  Clock,
  Flag,
  ShieldAlert
} from "lucide-react";
import { F1Logo } from "@/components/F1Logo";
import {
  Driver,
  Circuit,
  TelemetrySample,
  RaceResult,
  StrategySimulation,
  HeadToHeadComparison
} from "@/types/f1";

interface PredictionResult
{
  circuit: "monaco" | "silverstone" | "monza";
  predictedWinner: string;
  winnerTeam: string;
  winProbabilityPct: number;
  fastestLapDriver: string;
  safetyCarProbabilityPct: number;
  keyStrategicFactor: string;
  recommendedCompoundSequence: string;
  pitStopsExpected: number;
}

export default function Home()
{
  const [selectedTrack, setSelectedTrack] = useState<"monaco" | "silverstone" | "monza">("monaco");
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);

  const [standings, setStandings] = useState<Driver[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetrySample | null>(null);
  const [historicalResults, setHistoricalResults] = useState<RaceResult[]>([]);
  const [strategies, setStrategies] = useState<StrategySimulation[]>([]);
  const [headToHead, setHeadToHead] = useState<{ driverA: HeadToHeadComparison; driverB: HeadToHeadComparison } | null>(null);
  const [selectedDriverA, setSelectedDriverA] = useState("VER");
  const [selectedDriverB, setSelectedDriverB] = useState("NOR");

  const tracks = [
    { id: "monaco", name: "Monaco Grand Prix", track: "Circuit de Monaco", flag: "🇲🇨", date: "May 24" },
    { id: "silverstone", name: "British Grand Prix", track: "Silverstone Circuit", flag: "🇬🇧", date: "Jul 05" },
    { id: "monza", name: "Italian Grand Prix", track: "Monza National Autodrome", flag: "🇮🇹", date: "Sep 06" }
  ] as const;

  const loadPrediction = (track: "monaco" | "silverstone" | "monza") =>
  {
    setSelectedTrack(track);
    fetch(`/api/predictions?track=${track}`)
      .then((res) => res.json())
      .then((data) => data.prediction && setPredictionData(data.prediction))
      .catch(console.error);
  };

  useEffect
  (
    () =>
    {
      loadPrediction("monaco");

      fetch("/api/standings")
        .then((res) => res.json())
        .then((data) => data.data && setStandings(data.data))
        .catch(console.error);

      fetch("/api/historical-results")
        .then((res) => res.json())
        .then((data) => data.data && setHistoricalResults(data.data))
        .catch(console.error);

      fetch("/api/strategy-simulation")
        .then((res) => res.json())
        .then((data) => data.data && setStrategies(data.data))
        .catch(console.error);

      const fetchTelemetry = () =>
      {
        fetch("/api/telemetry?driver=VER")
          .then((res) => res.json())
          .then((data) => data.telemetry && setTelemetry(data.telemetry))
          .catch(console.error);
      };

      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 2500);
      return () => clearInterval(interval);
    },
    []
  );

  useEffect
  (
    () =>
    {
      fetch(`/api/analytics/head-to-head?driverA=${selectedDriverA}&driverB=${selectedDriverB}`)
        .then((res) => res.json())
        .then((data) => data.driverA && setHeadToHead({ driverA: data.driverA, driverB: data.driverB }))
        .catch(console.error);
    },
    [selectedDriverA, selectedDriverB]
  );

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-zinc-100 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-[#0B0B0E]/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <F1Logo size="sm" showGlow={false} />
            <div className="h-5 w-[1px] bg-zinc-800" />
            <span className="text-sm font-semibold tracking-tight text-zinc-200">
              Grand Prix Race Predictor
            </span>
          </div>

          <nav className="flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#predictions" className="hover:text-white transition-colors">Race Forecast</a>
            <a href="#telemetry" className="hover:text-white transition-colors">Pit Wall Telemetry</a>
            <a href="#headtohead" className="hover:text-white transition-colors">Head-to-Head</a>
            <a href="#standings" className="hover:text-white transition-colors">Standings</a>
          </nav>
        </div>
      </header>

      <section id="predictions" className="relative border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-[#0B0B0E] to-[#0B0B0E] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
              2026 FIA Formula One World Championship
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              Race Winner <span className="text-[#E10600]">Forecast</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
              Select an upcoming Grand Prix to review computed win probabilities, pit strategy stint splits,
              and critical track variables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {tracks.map
            (
              (t) =>
              (
                <button
                  key={t.id}
                  onClick={() => loadPrediction(t.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedTrack === t.id
                      ? "bg-zinc-900 border-[#E10600] shadow-lg shadow-red-950/20"
                      : "bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{t.flag}</span>
                    <span className="text-xs font-mono text-zinc-500">{t.date}</span>
                  </div>
                  <div className="font-bold text-white text-base">{t.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{t.track}</div>
                </button>
              )
            )}
          </div>

          {predictionData && (
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-zinc-800 gap-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                    Projected Race Winner
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {predictionData.predictedWinner}
                  </div>
                  <div className="text-sm text-zinc-400 mt-1 font-medium">
                    Constructor: <span className="text-zinc-200">{predictionData.winnerTeam}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left lg:text-right">
                    <span className="text-xs uppercase tracking-wider text-zinc-500 block">Win Rate</span>
                    <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                      {predictionData.winProbabilityPct}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <div className="text-xs text-zinc-500 font-medium">Fastest Lap Pick</div>
                  <div className="text-base font-bold text-white mt-1">{predictionData.fastestLapDriver}</div>
                </div>

                <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <div className="text-xs text-zinc-500 font-medium">Safety Car Risk</div>
                  <div className="text-base font-bold text-amber-400 mt-1">{predictionData.safetyCarProbabilityPct}% Likelihood</div>
                </div>

                <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <div className="text-xs text-zinc-500 font-medium">Tire Strategy</div>
                  <div className="text-base font-bold text-white mt-1">{predictionData.recommendedCompoundSequence}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{predictionData.pitStopsExpected} Planned Stop</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/40 border border-zinc-800/80">
                <div className="text-xs font-semibold text-[#E10600] uppercase tracking-wider mb-1">
                  Race Engineer Strategic Note
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {predictionData.keyStrategicFactor}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 w-full">
        <section id="telemetry">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                Live Sector Telemetry
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Direct from Red Bull Racing RB22 sensor array</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Stream
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Apex Speed", value: telemetry ? `${telemetry.speed_kmh} km/h` : "349.6 km/h", sub: "Active Aero Low Drag" },
              { label: "Engine RPM", value: telemetry ? `${telemetry.rpm.toLocaleString()} rpm` : "11,383 rpm", sub: `Gear ${telemetry?.gear || 8} • Full Throttle` },
              { label: "Lateral Load", value: telemetry ? `${telemetry.g_force} G` : "5.5 G", sub: "Turn Entry Deceleration" },
              { label: "Brake Caliper", value: telemetry ? `${telemetry.brake_temp_celsius} °C` : "840 °C", sub: "Carbon Composite Core" }
            ].map
            (
              (item, i) =>
              (
                <div key={i} className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                  <div className="text-xs text-zinc-400 font-medium mb-2">{item.label}</div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">{item.value}</div>
                  <div className="text-xs text-zinc-500 mt-2 font-mono">{item.sub}</div>
                </div>
              )
            )}
          </div>
        </section>

        <section id="headtohead">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                Head-to-Head Comparison
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Cross-team performance metrics and records</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <select
                value={selectedDriverA}
                onChange={(e) => setSelectedDriverA(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-white rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600"
              >
                <option value="VER">Max Verstappen</option>
                <option value="NOR">Lando Norris</option>
                <option value="LEC">Charles Leclerc</option>
                <option value="HAM">Lewis Hamilton</option>
              </select>
              <span className="text-zinc-600 font-bold">vs</span>
              <select
                value={selectedDriverB}
                onChange={(e) => setSelectedDriverB(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-white rounded-md px-3 py-2 focus:outline-none focus:border-zinc-600"
              >
                <option value="NOR">Lando Norris</option>
                <option value="VER">Max Verstappen</option>
                <option value="LEC">Charles Leclerc</option>
                <option value="HAM">Lewis Hamilton</option>
              </select>
            </div>
          </div>

          {headToHead && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                <div className="text-xs font-bold text-[#E10600] uppercase mb-1">Driver 1</div>
                <div className="text-2xl font-black text-white">{headToHead.driverA.driver_name}</div>
                <div className="text-xs text-zinc-400 mb-6">{headToHead.driverA.team_name}</div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Championship Points</span>
                    <span className="font-bold text-white font-mono">{headToHead.driverA.championship_points} PTS</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Career Victories</span>
                    <span className="font-bold text-white font-mono">{headToHead.driverA.career_wins} Wins</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Average Telemetry Speed</span>
                    <span className="font-bold text-emerald-400 font-mono">{headToHead.driverA.avg_speed_kmh} km/h</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-zinc-400">Fastest Pit Stop</span>
                    <span className="font-bold text-white font-mono">{headToHead.driverA.best_pitstop_seconds}s</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Driver 2</div>
                <div className="text-2xl font-black text-white">{headToHead.driverB.driver_name}</div>
                <div className="text-xs text-zinc-400 mb-6">{headToHead.driverB.team_name}</div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Championship Points</span>
                    <span className="font-bold text-white font-mono">{headToHead.driverB.championship_points} PTS</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Career Victories</span>
                    <span className="font-bold text-white font-mono">{headToHead.driverB.career_wins} Wins</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Average Telemetry Speed</span>
                    <span className="font-bold text-emerald-400 font-mono">{headToHead.driverB.avg_speed_kmh} km/h</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-zinc-400">Fastest Pit Stop</span>
                    <span className="font-bold text-white font-mono">{headToHead.driverB.best_pitstop_seconds}s</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section id="standings">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                Championship Standings
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Official drivers leaderboard</p>
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Pos</th>
                  <th className="py-3.5 px-6">Driver</th>
                  <th className="py-3.5 px-6">Team</th>
                  <th className="py-3.5 px-6 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {standings.map
                (
                  (d) =>
                  (
                    <tr key={d.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#E10600]">P{d.position}</td>
                      <td className="py-4 px-6 font-bold text-white">{d.first_name} {d.last_name}</td>
                      <td className="py-4 px-6 text-zinc-400">{d.team?.name || "Independent"}</td>
                      <td className="py-4 px-6 text-right font-black text-white font-mono">{d.championship_points} PTS</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950 py-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <F1Logo size="sm" showGlow={false} />
            <span>Formula 1 Grand Prix Predictor Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
