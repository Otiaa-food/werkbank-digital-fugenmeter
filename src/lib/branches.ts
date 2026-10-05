// Geteilte Geschäftslogik: Branchen-Profile und Formel-Auswertung.
// Direkt aus dem Maßwerk-Prototyp (Claude-Artifact) übernommen.

export type BrancheKey = "FUGEN" | "FLIESEN" | "GALABAU";

export type PositionPreset = { name: string; unit: string };

export type BrancheProfile = {
  label: string;
  etageLabel: string;
  raumLabel: string;
  positions: PositionPreset[];
  etagenVorschlaege: string[];
};

export const ALL_UNITS = ["m", "m²", "m³", "Stück", "Std."] as const;

export const PROFILES: Record<BrancheKey, BrancheProfile> = {
  FUGEN: {
    label: "Fugenabdichtung",
    etageLabel: "Etage",
    raumLabel: "Raum",
    positions: [
      { name: "BODEN", unit: "m" },
      { name: "ECKEN", unit: "m" },
      { name: "WAND", unit: "m" },
      { name: "WC", unit: "m" },
      { name: "WB", unit: "m" },
      { name: "DUSCHE", unit: "m" },
      { name: "WANNE", unit: "m" },
      { name: "PISS", unit: "m" },
      { name: "FENSTER", unit: "m" },
      { name: "SONSTIGES", unit: "m" },
    ],
    etagenVorschlaege: ["UG", "EG", "1. OG", "2. OG", "3. OG", "DG"],
  },
  FLIESEN: {
    label: "Fliesen-/Bodenleger",
    etageLabel: "Etage",
    raumLabel: "Raum",
    positions: [
      { name: "FLÄCHE", unit: "m²" },
      { name: "SOCKEL", unit: "m" },
      { name: "TREPPE", unit: "m²" },
      { name: "VERSCHNITT", unit: "m²" },
      { name: "SONSTIGES", unit: "m²" },
    ],
    etagenVorschlaege: ["UG", "EG", "1. OG", "2. OG", "3. OG", "DG"],
  },
  GALABAU: {
    label: "Garten- & Landschaftsbau",
    etageLabel: "Bereich",
    raumLabel: "Teilfläche",
    positions: [
      { name: "PFLASTER/PLATTEN", unit: "m²" },
      { name: "RASEN", unit: "m²" },
      { name: "ERDAUSHUB", unit: "m³" },
      { name: "RANDSTEINE", unit: "m" },
      { name: "ZAUN/MAUER", unit: "m" },
      { name: "PFLANZEN", unit: "Stück" },
      { name: "ARBEITSSTUNDEN", unit: "Std." },
      { name: "SONSTIGES", unit: "m²" },
    ],
    etagenVorschlaege: ["Vorgarten", "Garten", "Terrasse", "Einfahrt", "Außenanlage"],
  },
};

/**
 * Wertet einen Handwerker-Aufmaß-Ausdruck aus, z. B. "4.65 x 2 + 3.86 x 2 + 0.10 x 4".
 * Unterstützt +, -, x/×/* , /, Klammern sowie Komma oder Punkt als Dezimaltrennzeichen.
 * Gibt `null` zurück, wenn der Ausdruck (noch) nicht gültig ist.
 */
export function evalFormula(raw: string): number | null {
  if (!raw) return null;
  let expr = raw.trim();
  if (!expr) return null;
  expr = expr.replace(/,/g, ".").replace(/[x×X]/g, "*").replace(/÷/g, "/");
  if (!/^[0-9+\-*/.() \t]+$/.test(expr)) return null;

  const tokens = expr.match(/\d+\.?\d*|\+|-|\*|\/|\(|\)/g);
  if (!tokens || tokens.length === 0) return null;

  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseFactor(): number {
    const t = peek();
    if (t === undefined) throw new Error("unexpected end");
    if (t === "(") {
      next();
      const v = parseExpr();
      if (peek() === ")") next();
      else throw new Error("missing )");
      return v;
    }
    if (t === "-") {
      next();
      return -parseFactor();
    }
    if (t === "+") {
      next();
      return parseFactor();
    }
    const num = parseFloat(next());
    if (isNaN(num)) throw new Error("bad number");
    return num;
  }

  function parseTerm(): number {
    let v = parseFactor();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      const rhs = parseFactor();
      v = op === "*" ? v * rhs : v / rhs;
    }
    return v;
  }

  function parseExpr(): number {
    let v = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const rhs = parseTerm();
      v = op === "+" ? v + rhs : v - rhs;
    }
    return v;
  }

  try {
    const result = parseExpr();
    if (pos !== tokens.length) return null;
    if (isNaN(result) || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

export function sumByUnit(list: { menge: number; einheit: string }[]) {
  const sums: Record<string, number> = {};
  const order: string[] = [];
  for (const e of list) {
    if (!(e.einheit in sums)) {
      sums[e.einheit] = 0;
      order.push(e.einheit);
    }
    sums[e.einheit] += e.menge;
  }
  return order.map((unit) => ({ unit, total: sums[unit] }));
}

export function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
