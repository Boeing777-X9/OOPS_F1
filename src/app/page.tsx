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

interface QualiGridEntry
{
  pos: number;
  code: string;
  name: string;
  team: string;
  time?: string;
  gap?: string;
}

export const ALL_2026_DRIVERS = [
  { code: "ANT", name: "A.K. Antonelli", team: "Mercedes" },
  { code: "RUS", name: "G. Russell", team: "Mercedes" },
  { code: "HAM", name: "L. Hamilton", team: "Ferrari" },
  { code: "VER", name: "M. Verstappen", team: "Red Bull" },
  { code: "LEC", name: "C. Leclerc", team: "Ferrari" },
  { code: "NOR", name: "L. Norris", team: "McLaren" },
  { code: "PIA", name: "O. Piastri", team: "McLaren" },
  { code: "HAD", name: "I. Hadjar", team: "Red Bull" },
  { code: "LAW", name: "L. Lawson", team: "RB" },
  { code: "GAS", name: "P. Gasly", team: "Alpine" },
  { code: "LIN", name: "A. Lindblad", team: "RB" },
  { code: "COL", name: "F. Colapinto", team: "Alpine" },
  { code: "BEA", name: "O. Bearman", team: "Haas" },
  { code: "HUL", name: "N. Hülkenberg", team: "Audi" },
  { code: "BOR", name: "G. Bortoleto", team: "Audi" },
  { code: "ALO", name: "F. Alonso", team: "Aston Martin" },
  { code: "OCO", name: "E. Ocon", team: "Haas" },
  { code: "SAI", name: "C. Sainz Jr.", team: "Williams" },
  { code: "ALB", name: "A. Albon", team: "Williams" },
  { code: "TSU", name: "Y. Tsunoda", team: "RB" },
  { code: "STR", name: "L. Stroll", team: "Aston Martin" },
  { code: "BOT", name: "V. Bottas", team: "Cadillac" },
  { code: "PER", name: "S. Pérez", team: "Cadillac" },
  { code: "MAG", name: "K. Magnussen", team: "Haas" }
];

export const DEFAULT_TOP10_BY_TRACK: Record<string, string[]> = {
  monaco: ["ANT", "RUS", "HAM", "VER", "LEC", "NOR", "PIA", "HAD", "LAW", "GAS"],
  silverstone: ["RUS", "HAM", "NOR", "VER", "ANT", "PIA", "LEC", "HAD", "BEA", "ALB"],
  monza: ["VER", "NOR", "RUS", "HAM", "LEC", "ANT", "PIA", "HUL", "HAD", "COL"],
  cota: ["ANT", "VER", "HAD", "LEC", "HAM", "RUS", "PIA", "NOR", "LAW", "GAS"]
};

export interface ConstructorTrackAssessment
{
  team: string;
  tier: "Tier 1 Pacesetter" | "Tier 2 Midfield" | "Backmarker / High Attrition";
  tierNum: 1 | 2 | 3;
  carSuitabilityScore: number;
  paceDeltaPerLap: string;
  dnfRatePct: number;
  carDnaAdvantage: string;
  trackVerdict: string;
}

interface TopDriverPrediction
{
  name: string;
  code: string;
  team: string;
  grid: number;
  probPct: number;
  podiumProbPct?: number;
  pointsProbPct?: number;
  expectedPos?: number;
  dnfProbPct?: number;
  fastestLapProbPct?: number;
}

interface CircuitPhysicsData
{
  totalLaps: number;
  baseLapTimeSeconds: number;
  deltaToPass: number;
  overtakingDifficulty: string;
  pitLossGreenSeconds: number;
  pitLossSCSeconds: number;
  safetyCarProbabilityPct: number;
  vscProbabilityPct: number;
  tyreWearFactor: number;
  tyreDegradationIndex: string;
}

interface TyreStrategyData
{
  primarySequence: string;
  pitWindowLaps: string;
  undercutAdvantageSeconds: string;
  plannedPitStops: number;
  tyreWearAssessment: string;
}

interface TeammateBattleData
{
  team: string;
  driver1: {
    code: string;
    name: string;
    headToHeadWinPct: number;
  };
  driver2: {
    code: string;
    name: string;
    headToHeadWinPct: number;
  };
}

interface MLModelMetricsData
{
  architecture: string;
  trainingDataset: string;
  samplesTrained: number;
  rocAucScore: number;
  accuracyPct: number;
  brierScore: number;
  featureImportances: Record<string, number>;
  learnedWeights: Record<string, number>;
}

interface PredictionResult
{
  circuit: "monaco" | "silverstone" | "monza" | "cota";
  circuitName?: string;
  qualiMode?: "without_quali" | "official_quali" | "manual_quali";
  modeLabel?: string;
  appliedGrid?: QualiGridEntry[];
  bestConstructor?: ConstructorTrackAssessment;
  constructorHierarchy?: ConstructorTrackAssessment[];
  mlModel?: MLModelMetricsData;
  circuitPhysics?: CircuitPhysicsData;
  tyreStrategy?: TyreStrategyData;
  teammateBattles?: TeammateBattleData[];
  monteCarloRuns?: number;
  predictedWinner: string;
  winnerTeam: string;
  winProbabilityPct: number;
  runnerUp?: string;
  runnerUpProbPct?: number;
  topDrivers?: TopDriverPrediction[];
  allDrivers?: TopDriverPrediction[];
  fastestLapDriver: string;
  safetyCarProbabilityPct: number;
  keyStrategicFactor: string;
  recommendedCompoundSequence: string;
  pitStopsExpected: number;
  trainingDataset?: string;
  poleConversionRate20Yr?: string;
  modelVersion?: string;
}

export default function Home()
{
  const [selectedTrack, setSelectedTrack] = useState<"monaco" | "silverstone" | "monza" | "cota">("monaco");
  const [qualiMode, setQualiMode] = useState<"without_quali" | "official_quali" | "manual_quali">("official_quali");
  const [manualTop10, setManualTop10] = useState<string[]>(DEFAULT_TOP10_BY_TRACK.monaco);
  const [showAllDrivers, setShowAllDrivers] = useState(false);
  const [showConstructorHierarchy, setShowConstructorHierarchy] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isWetWeather, setIsWetWeather] = useState(false);
  const [showCotaCaseStudy, setShowCotaCaseStudy] = useState(true);

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
    { id: "monza", name: "Italian Grand Prix", track: "Monza National Autodrome", flag: "🇮🇹", date: "Sep 06" },
    { id: "cota", name: "United States Grand Prix", track: "Circuit of the Americas (Austin)", flag: "🇺🇸", date: "Oct 18" }
  ] as const;

  const loadPrediction = (
    track: "monaco" | "silverstone" | "monza" | "cota" = selectedTrack,
    mode: "without_quali" | "official_quali" | "manual_quali" = qualiMode,
    top10: string[] = manualTop10,
    wet: boolean = isWetWeather
  ) =>
  {
    setSelectedTrack(track);
    setQualiMode(mode);
    setIsSimulating(true);

    let url = `/api/predictions?track=${track}&mode=${mode}&rain=${wet}`;
    if (mode === "manual_quali")
    {
      const gridParam = top10.map((code, idx) => `${code}:${idx + 1}`).join(",");
      url += `&pole=${top10[0]}&customGrid=${gridParam}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) =>
      {
        if (data.prediction)
        {
          setPredictionData(data.prediction);
        }
      })
      .catch(console.error)
      .finally(() => setTimeout(() => setIsSimulating(false), 200));
  };

  const handleTrackChange = (trackId: "monaco" | "silverstone" | "monza" | "cota") =>
  {
    const nextTop10 = DEFAULT_TOP10_BY_TRACK[trackId] || DEFAULT_TOP10_BY_TRACK.monaco;
    setManualTop10(nextTop10);
    loadPrediction(trackId, qualiMode, nextTop10);
  };

  const handleTop10SlotChange = (posIndex: number, newDriverCode: string) =>
  {
    const nextTop10 = [...manualTop10];
    const existingIndex = nextTop10.indexOf(newDriverCode);

    if (existingIndex !== -1 && existingIndex !== posIndex)
    {
      const displacedDriver = nextTop10[posIndex];
      nextTop10[posIndex] = newDriverCode;
      nextTop10[existingIndex] = displacedDriver;
    }
    else
    {
      nextTop10[posIndex] = newDriverCode;
    }

    setManualTop10(nextTop10);
    loadPrediction(selectedTrack, "manual_quali", nextTop10);
  };

  const applyPresetGrid = (preset: "official" | "reverse" | "ferrari" | "redbull" | "mclaren" | "mercedes") =>
  {
    const official = DEFAULT_TOP10_BY_TRACK[selectedTrack] || DEFAULT_TOP10_BY_TRACK.monaco;
    let nextTop10: string[];

    if (preset === "official")
    {
      nextTop10 = [...official];
    }
    else if (preset === "reverse")
    {
      nextTop10 = [...manualTop10].reverse();
    }
    else if (preset === "ferrari")
    {
      nextTop10 = ["HAM", "LEC", ...official.filter((c) => c !== "HAM" && c !== "LEC")].slice(0, 10);
    }
    else if (preset === "redbull")
    {
      nextTop10 = ["VER", "HAD", ...official.filter((c) => c !== "VER" && c !== "HAD")].slice(0, 10);
    }
    else if (preset === "mclaren")
    {
      nextTop10 = ["NOR", "PIA", ...official.filter((c) => c !== "NOR" && c !== "PIA")].slice(0, 10);
    }
    else
    {
      nextTop10 = ["ANT", "RUS", ...official.filter((c) => c !== "ANT" && c !== "RUS")].slice(0, 10);
    }

    setManualTop10(nextTop10);
    loadPrediction(selectedTrack, "manual_quali", nextTop10);
  };

  useEffect
  (
    () =>
    {
      loadPrediction("monaco", "official_quali");

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
      <header className="border-b border-zinc-800/80 bg-[#0B0B0E] relative z-20">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {tracks.map
            (
              (t) =>
              (
                <button
                  key={t.id}
                  onClick={() => handleTrackChange(t.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedTrack === t.id
                      ? "bg-zinc-900 border-[#E10600] shadow-sm"
                      : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/80 hover:border-zinc-700"
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

          {/* Qualifying Integration Controls */}
          <div className="mb-6 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
              <button
                onClick={() => loadPrediction(selectedTrack, "without_quali")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  qualiMode === "without_quali"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                1. Without Qualifying (Race Pace)
              </button>
              <button
                onClick={() => loadPrediction(selectedTrack, "official_quali")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  qualiMode === "official_quali"
                    ? "bg-[#E10600] text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                2. Official Quali Grid
              </button>
              <button
                onClick={() => loadPrediction(selectedTrack, "manual_quali", manualTop10)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  qualiMode === "manual_quali"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                3. Manual Grid Editor (Top 10)
              </button>
            </div>

            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Mode: <span className="text-zinc-200 font-mono">{predictionData?.modeLabel || "Official Grid"}</span>
              </span>
            </div>
          </div>

          {/* Mode 1: Without Quali Info */}
          {qualiMode === "without_quali" && (
            <div className="mb-6 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/90 text-xs text-zinc-300 flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  <strong className="text-white">Pre-Qualifying Mode:</strong> Predictions are computed purely from vehicle horsepower, downforce aerodynamic index, and 2026 driver form without starting grid bias.
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 shrink-0 hidden sm:inline">Grid Bias: 0%</span>
            </div>
          )}

          {/* Mode 2: Official Quali Grid Banner */}
          {qualiMode === "official_quali" && predictionData?.appliedGrid && (
            <div className="mb-6 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/90 text-xs">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-zinc-800/80">
                <div className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5 text-[#E10600]" />
                  Official Saturday Qualifying Starting Order
                </div>
                <span className="text-zinc-500 font-mono text-[11px]">Official Q3 Times</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {predictionData.appliedGrid.slice(0, 5).map
                (
                  (entry) =>
                  (
                    <div key={entry.code} className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                      <div className="flex items-center justify-between text-zinc-400 font-mono">
                        <span className={`font-bold ${entry.pos === 1 ? "text-amber-400" : "text-zinc-300"}`}>P{entry.pos}</span>
                        <span className="text-[10px] text-zinc-500">{entry.time || entry.gap}</span>
                      </div>
                      <div className="font-semibold text-white text-xs truncate mt-0.5">{entry.name}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{entry.team}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Mode 3: Manual Grid Editor (Top 10 Starting Grid Configurator) */}
          {qualiMode === "manual_quali" && (
            <div className="mb-6 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/80 gap-2.5">
                <div>
                  <span className="font-semibold text-zinc-200 uppercase tracking-wider text-xs block">
                    Top 10 Starting Grid Configurator (Q3 Shootout Grid)
                  </span>
                  <span className="text-zinc-500 text-[11px]">
                    Customize starting positions for the top 10. Positions 11–23 adapt automatically.
                  </span>
                </div>

                {/* Grid Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase mr-1 hidden sm:inline">Presets:</span>
                  <button
                    onClick={() => applyPresetGrid("official")}
                    className="px-2.5 py-1 text-[11px] font-mono rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                  >
                    Official Grid
                  </button>
                  <button
                    onClick={() => applyPresetGrid("reverse")}
                    className="px-2.5 py-1 text-[11px] font-mono rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                  >
                    Reverse Top 10
                  </button>
                  <button
                    onClick={() => applyPresetGrid("ferrari")}
                    className="px-2.5 py-1 text-[11px] font-mono rounded bg-zinc-900 border border-red-900/60 text-red-400 hover:text-red-300 hover:border-red-600 transition-colors"
                  >
                    Ferrari 1-2
                  </button>
                  <button
                    onClick={() => applyPresetGrid("redbull")}
                    className="px-2.5 py-1 text-[11px] font-mono rounded bg-zinc-900 border border-blue-900/60 text-blue-400 hover:text-blue-300 hover:border-blue-600 transition-colors"
                  >
                    Red Bull 1-2
                  </button>
                  <button
                    onClick={() => applyPresetGrid("mclaren")}
                    className="px-2.5 py-1 text-[11px] font-mono rounded bg-zinc-900 border border-amber-900/60 text-amber-400 hover:text-amber-300 hover:border-amber-600 transition-colors"
                  >
                    McLaren 1-2
                  </button>
                  <button
                    onClick={() => applyPresetGrid("mercedes")}
                    className="px-2.5 py-1 text-[11px] font-mono rounded bg-zinc-900 border border-teal-900/60 text-teal-400 hover:text-teal-300 hover:border-teal-600 transition-colors"
                  >
                    Mercedes 1-2
                  </button>
                </div>
              </div>

              {/* 5 Rows (10 Starting Grid Slots) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map
                (
                  (idx) =>
                  {
                    const pos = idx + 1;
                    const currentCode = manualTop10[idx] || ALL_2026_DRIVERS[idx]?.code || "VER";
                    const rowNum = Math.floor(idx / 2) + 1;
                    const side = idx % 2 === 0 ? "Left" : "Right";
                    const isPole = pos === 1;

                    return (
                      <div
                        key={pos}
                        className={`p-3 rounded-lg border transition-all ${
                          isPole
                            ? "bg-zinc-900 border-[#E10600]/80 shadow-sm"
                            : "bg-zinc-900/40 border-zinc-800/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${
                            isPole ? "text-amber-400" : "text-zinc-300"
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isPole ? "bg-amber-400" : "bg-zinc-600"}`} />
                            {isPole ? "P1 POLE POSITION" : `P${pos}`}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            Row {rowNum} ({side})
                          </span>
                        </div>

                        <select
                          value={currentCode}
                          onChange={(e) => handleTop10SlotChange(idx, e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700/80 text-white text-xs rounded px-2.5 py-1.5 outline-none focus:border-[#E10600] font-mono cursor-pointer"
                        >
                          {ALL_2026_DRIVERS.map
                          (
                            (d) =>
                            (
                              <option key={d.code} value={d.code}>
                                {d.code} — {d.name} ({d.team})
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {predictionData && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-zinc-800 gap-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                    Projected Race Winner
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {predictionData.predictedWinner}
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">
                    Team: <span className="text-white font-medium">{predictionData.winnerTeam}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-mono text-zinc-300 mt-2.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{predictionData.monteCarloRuns ? predictionData.monteCarloRuns.toLocaleString() : "10,000"} Monte Carlo Stint Iterations</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">Delta-to-Pass Stint Model</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {predictionData.poleConversionRate20Yr && (
                    <div className="text-left lg:text-right hidden sm:block">
                      <span className="text-xs uppercase tracking-wider text-zinc-500 block">Historic Pole Win Rate</span>
                      <div className="text-xl sm:text-2xl font-bold text-zinc-300 font-mono">
                        {predictionData.poleConversionRate20Yr}
                      </div>
                    </div>
                  )}
                  <div className="text-left lg:text-right">
                    <span className="text-xs uppercase tracking-wider text-zinc-500 block">Win Probability</span>
                    <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                      {predictionData.winProbabilityPct}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Projected Race Classification with 23 Drivers View Toggle */}
              {predictionData.topDrivers && predictionData.topDrivers.length > 0 && (
                <div className="mb-6 pb-6 border-b border-zinc-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                      {showAllDrivers
                        ? `Full 2026 Grid Projected Classification (${predictionData.allDrivers?.length || 23} Drivers)`
                        : "Projected Top 5 Race Classification"}
                    </div>
                    <button
                      onClick={() => setShowAllDrivers(!showAllDrivers)}
                      className="text-xs font-mono font-medium text-zinc-300 hover:text-white px-3 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors w-fit"
                    >
                      {showAllDrivers ? "Show Top 5 Only" : "View Full 23-Driver Grid →"}
                    </button>
                  </div>

                  {!showAllDrivers ? (
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {predictionData.topDrivers.map
                      (
                        (d, idx) =>
                        (
                          <div
                            key={d.code}
                            className={`p-3.5 rounded-lg border transition-all ${
                              idx === 0
                                ? "bg-zinc-900 border-[#E10600]/80 shadow-sm"
                                : "bg-zinc-950/60 border-zinc-800/80"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className={`font-bold font-mono ${idx === 0 ? "text-amber-400" : "text-zinc-300"}`}>P{idx + 1}</span>
                              {qualiMode !== "without_quali" && (
                                <span className="text-[10px] font-mono text-zinc-500">Grid: P{d.grid}</span>
                              )}
                            </div>
                            <div className="font-bold text-white text-sm truncate">{d.name}</div>
                            <div className="text-[11px] text-zinc-400 truncate mb-3">{d.team}</div>

                            <div className="pt-2 border-t border-zinc-800/80 flex items-end justify-between font-mono">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Win Rate</span>
                                <span className="text-base font-bold text-emerald-400">{d.probPct}%</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Podium</span>
                                <span className="text-xs font-semibold text-zinc-200">{d.podiumProbPct ?? 0}%</span>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {(predictionData.allDrivers || predictionData.topDrivers).map
                      (
                        (d, idx) =>
                        (
                          <div
                            key={d.code}
                            className={`p-2.5 rounded-lg border transition-all ${
                              idx === 0
                                ? "bg-zinc-900 border-[#E10600]/80 shadow-sm"
                                : "bg-zinc-950/60 border-zinc-800/80"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-bold font-mono ${idx === 0 ? "text-amber-400" : idx < 3 ? "text-zinc-200" : "text-zinc-500"}`}>
                                  P{idx + 1}
                                </span>
                                <span className="font-bold text-white font-mono">{d.code}</span>
                              </div>
                              <span className="text-xs font-mono font-bold text-emerald-400">{d.probPct}%</span>
                            </div>
                            <div className="text-xs text-zinc-200 font-medium truncate">{d.name}</div>
                            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                              <span className="truncate">{d.team}</span>
                              <span className="font-mono text-zinc-400 shrink-0">
                                {qualiMode !== "without_quali" ? `Grid P${d.grid}` : `Podium ${d.podiumProbPct ?? 0}%`}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

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

              {/* Circuit Strategy & Overtaking Telemetry */}
              {predictionData.circuitPhysics && predictionData.tyreStrategy && (
                <div className="mb-6 p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <div className="text-xs uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2 mb-3">
                    <Gauge className="w-3.5 h-3.5 text-[#E10600]" />
                    Circuit Strategy & Overtaking Telemetry
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[11px] text-zinc-500 font-medium">Passing Delta</div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        +{predictionData.circuitPhysics.deltaToPass}s <span className="text-xs font-normal text-zinc-500">/ lap</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 truncate">{predictionData.circuitPhysics.overtakingDifficulty}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[11px] text-zinc-500 font-medium">Pit Delta (Green vs SC)</div>
                      <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                        {predictionData.circuitPhysics.pitLossGreenSeconds}s / {predictionData.circuitPhysics.pitLossSCSeconds}s
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-1 font-mono">
                        SC Delta Advantage: -{(predictionData.circuitPhysics.pitLossGreenSeconds - predictionData.circuitPhysics.pitLossSCSeconds).toFixed(1)}s
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[11px] text-zinc-500 font-medium">Optimal Undercut Window</div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        {predictionData.tyreStrategy.pitWindowLaps}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 truncate">{predictionData.tyreStrategy.undercutAdvantageSeconds}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[11px] text-zinc-500 font-medium">Tyre Thermal Wear Load</div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        {predictionData.circuitPhysics.tyreDegradationIndex}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">{predictionData.circuitPhysics.totalLaps} Total Race Distance Laps</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Teammate Head-to-Head Simulated Battles */}
              {predictionData.teammateBattles && predictionData.teammateBattles.length > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <div className="text-xs uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    Teammate Head-to-Head Simulated Battles (10,000 Runs)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {predictionData.teammateBattles.slice(0, 4).map
                    (
                      (battle) =>
                      (
                        <div key={battle.team} className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                          <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                            <span>{battle.team}</span>
                            <span className="text-[10px] font-mono text-zinc-500">H2H Split</span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                            <span className="text-white font-bold">{battle.driver1.code} ({battle.driver1.headToHeadWinPct}%)</span>
                            <span className="text-zinc-400">{battle.driver2.code} ({battle.driver2.headToHeadWinPct}%)</span>
                          </div>

                          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden flex">
                            <div
                              className="bg-emerald-500 h-full transition-all"
                              style={{ width: `${battle.driver1.headToHeadWinPct}%` }}
                            />
                            <div
                              className="bg-zinc-600 h-full transition-all"
                              style={{ width: `${battle.driver2.headToHeadWinPct}%` }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Scikit-Learn Machine Learning Pipeline & Feature Importances */}
              {predictionData.mlModel && (
                <div className="mb-6 p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        Scikit-Learn ML Model Architecture & Feature Weights
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Trained on {predictionData.mlModel.samplesTrained.toLocaleString()} historical FIA Grand Prix driver-race entries (2004–2024) with 5-Fold Stratified Cross-Validation.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ROC-AUC: {predictionData.mlModel.rocAucScore}
                      </span>
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        Accuracy: {predictionData.mlModel.accuracyPct}%
                      </span>
                    </div>
                  </div>

                  {/* Feature Importances Horizontal Progress Bars */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/60 text-xs font-mono">
                    {Object.entries(predictionData.mlModel.featureImportances)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([feature, pct]) => (
                        <div key={feature} className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-zinc-300">{feature}</span>
                            <span className="font-bold text-emerald-400">{pct}% Weight</span>
                          </div>
                          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, pct * 1.6)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-zinc-950/40 border border-zinc-800/80">
                <div className="text-xs font-semibold text-[#E10600] uppercase tracking-wider mb-1">
                  Circuit Strategic Factor
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {predictionData.keyStrategicFactor}
                </p>
              </div>

              {/* COTA Multi-Phase Case Study Progression */}
              {selectedTrack === "cota" && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900/60 to-zinc-950 border border-zinc-800/90">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs uppercase tracking-wider text-zinc-200 font-semibold flex items-center gap-2">
                        Austin COTA Empirical Case Study: Multi-Phase Progression
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Pre-Race → Actual
                      </span>
                    </div>
                    <button
                      onClick={() => setShowCotaCaseStudy(!showCotaCaseStudy)}
                      className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 w-fit"
                    >
                      {showCotaCaseStudy ? "Hide Details" : "Expand Case Study"}
                    </button>
                  </div>

                  {showCotaCaseStudy && (
                    <div className="space-y-3">
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Demonstrating how the inference engine performs sequential Bayesian updating across a race weekend: from zero session data to Free Practice telemetry ingestion, official Saturday Qualifying, and Sunday night ground-truth verification.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                        {/* Phase 1 */}
                        <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                              <span>PHASE 1</span>
                              <span className="text-zinc-400">Zero Data</span>
                            </div>
                            <div className="font-bold text-xs text-zinc-200">Pre-Weekend Baseline</div>
                            <div className="text-[11px] font-semibold text-sky-400 mt-1.5">
                              A.K. Antonelli <span className="font-mono text-zinc-400 font-normal">(54.8%)</span>
                            </div>
                            <div className="text-[10px] text-zinc-400">Runner-up: G. Russell (11.7%)</div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 leading-snug">
                            Evaluated on static 1055 HP engine dyno & championship points lead.
                          </div>
                        </div>

                        {/* Phase 2 */}
                        <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                              <span>PHASE 2</span>
                              <span className="text-emerald-400">FP Telemetry</span>
                            </div>
                            <div className="font-bold text-xs text-zinc-200">Post-Free Practice (FP1/2)</div>
                            <div className="text-[11px] font-semibold text-emerald-400 mt-1.5">
                              A.K. Antonelli <span className="font-mono text-zinc-400 font-normal">(58.2%)</span>
                            </div>
                            <div className="text-[10px] text-zinc-400">Runner-up: C. Leclerc (22.4%) • VER (11.2%)</div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 leading-snug">
                            Mercedes 346.2 km/h back straight speed & low tyre degradation vs Red Bull front graining.
                          </div>
                        </div>

                        {/* Phase 3 */}
                        <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                              <span>PHASE 3</span>
                              <span className="text-amber-400">Official Quali</span>
                            </div>
                            <div className="font-bold text-xs text-zinc-200">Saturday Quali Grid</div>
                            <div className="text-[11px] font-semibold text-amber-400 mt-1.5">
                              A.K. Antonelli <span className="font-mono text-zinc-400 font-normal">(71.4%)</span>
                            </div>
                            <div className="text-[10px] text-zinc-400">P2: M. Verstappen (1:34.214)</div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 leading-snug">
                            Pole position (1:34.035) & 1055 HP straight-line speed into T1 uphill apex.
                          </div>
                        </div>

                        {/* Phase 4 */}
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 mb-1">
                              <span>PHASE 4</span>
                              <span className="font-bold text-emerald-400">Sunday Night Race</span>
                            </div>
                            <div className="font-bold text-xs text-white">Actual 2026 GP Outcome</div>
                            <div className="text-[11px] font-semibold text-emerald-300 mt-1.5">
                              🏆 A.K. Antonelli <span className="font-mono text-zinc-300 font-normal">(P1, 1:35:16)</span>
                            </div>
                            <div className="text-[10px] text-zinc-300 font-medium">P2: Leclerc (+13.0s) • P3: Verstappen</div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[10px] text-zinc-300 leading-snug">
                            🎯 100% Winner Prediction Hit: Antonelli dominated from pole for his 9th win of 2026!
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Constructor Car Hierarchy & Track Suitability Analysis */}
              {predictionData.constructorHierarchy && predictionData.constructorHierarchy.length > 0 && (
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        Constructor Car Hierarchy & Track Suitability
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Assessing which constructor engineered the superior car for {tracks.find((t) => t.id === selectedTrack)?.name || "this circuit"}, factoring in long-run pace delta and mechanical DNF attrition.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowConstructorHierarchy(!showConstructorHierarchy)}
                      className="text-xs font-mono font-medium text-zinc-300 hover:text-white px-3 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors w-fit shrink-0"
                    >
                      {showConstructorHierarchy ? "Collapse Full Matrix" : "View All 11 Constructors →"}
                    </button>
                  </div>

                  {/* Best Car Spotlight Banner */}
                  {predictionData.bestConstructor && (
                    <div className="mb-4 p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded font-black font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
                          #1 CAR RATED
                        </span>
                        <div>
                          <span className="font-bold text-white text-sm">{predictionData.bestConstructor.team}</span>
                          <span className="text-zinc-400 ml-2">— {predictionData.bestConstructor.trackVerdict}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                        <span>Rating: <strong className="text-emerald-400">{predictionData.bestConstructor.carSuitabilityScore}/100</strong></span>
                        <span>Pace: <strong className="text-zinc-200">{predictionData.bestConstructor.paceDeltaPerLap}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Hierarchy Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {(showConstructorHierarchy
                      ? predictionData.constructorHierarchy
                      : predictionData.constructorHierarchy.slice(0, 6)
                    ).map
                    (
                      (teamItem, rankIdx) =>
                      {
                        const isTop = rankIdx === 0;
                        const isBackmarker = teamItem.tierNum === 3;

                        return (
                          <div
                            key={teamItem.team}
                            className={`p-3 rounded-lg border transition-all ${
                              isTop
                                ? "bg-zinc-900/90 border-emerald-500/40"
                                : isBackmarker
                                ? "bg-zinc-950/50 border-red-900/30"
                                : "bg-zinc-950/60 border-zinc-800/80"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-mono font-bold ${
                                  isTop ? "text-emerald-400" : isBackmarker ? "text-red-400" : "text-zinc-400"
                                }`}>
                                  #{rankIdx + 1}
                                </span>
                                <span className="font-bold text-white text-xs">{teamItem.team}</span>
                              </div>

                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                                isTop
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : isBackmarker
                                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                  : "bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                              }`}>
                                {teamItem.tier.replace("Tier ", "T")}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                              <span>Rating: <strong className={isTop ? "text-emerald-400" : isBackmarker ? "text-red-400" : "text-zinc-200"}>{teamItem.carSuitabilityScore}/100</strong></span>
                              <span>Pace: {teamItem.paceDeltaPerLap}</span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/50 mt-1">
                              <span className="truncate max-w-[170px]">{teamItem.carDnaAdvantage}</span>
                              <span className={`font-mono shrink-0 ${teamItem.dnfRatePct > 20 ? "text-red-400 font-bold" : "text-zinc-400"}`}>
                                DNF: {teamItem.dnfRatePct}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
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
              { label: "Apex Speed", value: telemetry?.speed_kmh ? `${telemetry.speed_kmh} km/h` : "349.6 km/h", sub: "Active Aero Low Drag" },
              { label: "Engine RPM", value: telemetry?.rpm ? `${telemetry.rpm.toLocaleString()} rpm` : "11,383 rpm", sub: `Gear ${telemetry?.gear || 8} • Full Throttle` },
              { label: "Lateral Load", value: telemetry?.g_force ? `${telemetry.g_force} G` : "5.5 G", sub: "Turn Entry Deceleration" },
              { label: "Brake Caliper", value: telemetry?.brake_temp_celsius ? `${telemetry.brake_temp_celsius} °C` : "840 °C", sub: "Carbon Composite Core" }
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
