export interface EncouragementResult {
  tier: "Beginner" | "Intermediate" | "Advanced" | "Elite" | "Titan";
  tierColor: string;
  badge: string;
  percentile: number;
  message: string;
  title: string;
  ratio?: number;
}

export function evaluateStrength(
  machineName: string,
  category: string,
  weightCharged: number,
  userBodyweight: number = 75,
  benchmarks?: {
    beginner: number;
    intermediate: number;
    advanced: number;
    elite: number;
  }
): EncouragementResult {
  // Default benchmarks if machine doesn't have custom ones
  const b = benchmarks || getDefaultBenchmarks(category, machineName);

  let tier: "Beginner" | "Intermediate" | "Advanced" | "Elite" | "Titan" = "Beginner";
  let tierColor = "text-amber-500 border-amber-500/30 bg-amber-500/10";
  let badge = "🥉 IRON ROOKIE";
  let percentile = 35;
  let title = "GREAT EFFORT!";
  let message = "Good work loading that machine! Consistency is king—keep coming back and stacking weight!";

  if (weightCharged >= b.elite * 1.15) {
    tier = "Titan";
    tierColor = "text-red-500 border-red-500/40 bg-red-500/15";
    badge = "👑 OLYMPUS TITAN";
    percentile = 99;
    title = "LIGHTWEIGHT BABY! UNHUMAN POWER!";
    message = `WTF BRO?! ${weightCharged}kg on the ${machineName}?! Ronnie Coleman just gave a nod of respect from across the cosmos! Your friends stand no chance! 🔥`;
  } else if (weightCharged >= b.elite) {
    tier = "Elite";
    tierColor = "text-rose-400 border-rose-500/40 bg-rose-500/15";
    badge = "🏆 ELITE BEAST";
    percentile = 95;
    title = "TOP 5% GYM WARRIOR!";
    message = `INSANE POWER! Charging ${weightCharged}kg puts you in the elite lifter bracket! You're bending the machine pins! Keep dominating! 💥`;
  } else if (weightCharged >= b.advanced) {
    tier = "Advanced";
    tierColor = "text-purple-400 border-purple-500/40 bg-purple-500/15";
    badge = "🥇 ADVANCED CRUSHER";
    percentile = 80;
    title = "BEAST MODE ACTIVATED!";
    message = `Huge lift! ${weightCharged}kg is heavy iron territory. You're out-lifting 80% of regular gym goers on the ${machineName}. Absolute unit! 💪`;
  } else if (weightCharged >= b.intermediate) {
    tier = "Intermediate";
    tierColor = "text-blue-400 border-blue-500/40 bg-blue-500/15";
    badge = "🥈 SOLID GYM BRO";
    percentile = 60;
    title = "SERIOUS GAINS!";
    message = `Solid numbers! ${weightCharged}kg on ${machineName} is well above average. Next stop: Advanced tier. Load another 5kg next week! 🚀`;
  } else if (weightCharged >= b.beginner) {
    tier = "Beginner";
    tierColor = "text-emerald-400 border-emerald-500/40 bg-emerald-500/15";
    badge = "🥉 IRON ASCENDANT";
    percentile = 45;
    title = "SOLID WORKOUT FOUNDATION!";
    message = `Nice push! Charging ${weightCharged}kg is laying heavy bricks for monster strength. Keep the tempo controlled! ⚡`;
  }

  const ratio = userBodyweight > 0 ? Number((weightCharged / userBodyweight).toFixed(2)) : 0;

  return {
    tier,
    tierColor,
    badge,
    percentile,
    title,
    message,
    ratio,
  };
}

export function getDefaultBenchmarks(category: string, machineName: string = "") {
  const lower = machineName.toLowerCase();

  // Custom checks based on specific gym machines
  if (lower.includes("leg press")) {
    return { beginner: 100, intermediate: 180, advanced: 260, elite: 350 };
  }
  if (lower.includes("hack squat")) {
    return { beginner: 70, intermediate: 120, advanced: 180, elite: 240 };
  }
  if (lower.includes("lat pulldown")) {
    return { beginner: 45, intermediate: 70, advanced: 95, elite: 120 };
  }
  if (lower.includes("chest press") || lower.includes("bench")) {
    return { beginner: 40, intermediate: 75, advanced: 105, elite: 140 };
  }
  if (lower.includes("cable row") || lower.includes("seated row")) {
    return { beginner: 40, intermediate: 70, advanced: 95, elite: 125 };
  }
  if (lower.includes("shoulder") || lower.includes("military")) {
    return { beginner: 30, intermediate: 55, advanced: 80, elite: 105 };
  }
  if (lower.includes("bicep") || lower.includes("curl") || lower.includes("preacher")) {
    return { beginner: 20, intermediate: 35, advanced: 50, elite: 70 };
  }
  if (lower.includes("tricep") || lower.includes("pushdown")) {
    return { beginner: 25, intermediate: 45, advanced: 65, elite: 85 };
  }
  if (lower.includes("leg extension") || lower.includes("leg curl")) {
    return { beginner: 35, intermediate: 60, advanced: 85, elite: 110 };
  }

  // Fallback category standards
  switch (category) {
    case "Legs":
      return { beginner: 90, intermediate: 160, advanced: 240, elite: 320 };
    case "Back":
      return { beginner: 45, intermediate: 70, advanced: 95, elite: 120 };
    case "Chest":
      return { beginner: 40, intermediate: 70, advanced: 100, elite: 135 };
    case "Shoulders":
      return { beginner: 30, intermediate: 55, advanced: 75, elite: 100 };
    case "Arms":
      return { beginner: 20, intermediate: 35, advanced: 55, elite: 75 };
    default:
      return { beginner: 35, intermediate: 60, advanced: 90, elite: 120 };
  }
}
