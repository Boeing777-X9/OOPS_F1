import { runLiveMLInference } from "../src/lib/f1InferenceModel";

console.log("=== PHASE 3 / MODE: OFFICIAL QUALI GRID ===");
const official = runLiveMLInference("cota", "official_quali");
console.log("Predicted Winner:", official.predictedWinner, `(${official.winProbabilityPct}%)`);
console.log("Runner Up:", official.runnerUp, `(${official.runnerUpProbPct}%)`);
console.log("\nTop 10 Simulated Drivers (Post-Qualifying Grid):");
official.topDrivers.slice(0, 10).forEach((d, idx) => {
  console.log(`${idx + 1}. ${d.name} (${d.team}) | Grid: P${d.grid} | Win: ${d.probPct}% | Podium: ${d.podiumProbPct}% | Points: ${d.pointsProbPct}% | ExpPos: ${d.expectedPos}`);
});

console.log("\n=== PHASE 2 / MODE: WITHOUT QUALI (RACE PACE CORRELATED) ===");
const withoutQuali = runLiveMLInference("cota", "without_quali");
console.log("Predicted Winner:", withoutQuali.predictedWinner, `(${withoutQuali.winProbabilityPct}%)`);
console.log("Runner Up:", withoutQuali.runnerUp, `(${withoutQuali.runnerUpProbPct}%)`);
console.log("\nTop 10 Simulated Drivers (Race Pace / FP Correlated):");
withoutQuali.topDrivers.slice(0, 10).forEach((d, idx) => {
  console.log(`${idx + 1}. ${d.name} (${d.team}) | Win: ${d.probPct}% | Podium: ${d.podiumProbPct}% | Points: ${d.pointsProbPct}% | ExpPos: ${d.expectedPos}`);
});
