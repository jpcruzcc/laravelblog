// lib/pvp.ts
type League = "little" | "great" | "ultra" | "master";

export interface BaseStats {
  speciesId: string;        // ex.: "giratina_altered"
  baseAtk: number;
  baseDef: number;
  baseSta: number;
  isShadow?: boolean;       // se quiser tratar shadow aqui
}

export interface RankOptions {
  league: League;
  allowXL?: boolean;        // permite nível > 40
  bestBuddy?: boolean;      // permite 50.5/51
  topN?: number;            // quantos resultados retornar
}

export interface IVCombo {
  atk: number;
  def: number;
  sta: number;
}

export interface RankEntry {
  level: number;
  iv: IVCombo;
  cp: number;
  hp: number;
  atkScaled: number;
  defScaled: number;
  staScaled: number;
  statProduct: number;
}

// CP multipliers oficiais (1.0 → 51.0 em passos de 0.5).
// Mantenha a lista completa. (Truncado aqui por brevidade — use sua tabela completa!)
const CPM: Record<string, number> = {
  "1": 0.094,
  "1.5": 0.135137432,
  "2": 0.16639787,
  // ...
  "39.5": 0.787473578,
  "40": 0.79030001,
  // L41–50
  "40.5": 0.792803968,
  "41": 0.79530001,
  // ...
  "50": 0.835299991,
  // Best Buddy 50.5/51
  "50.5": 0.835299991, // algumas fontes usam mesmo CPM do 50; mantenha consistência com sua tabela
  "51": 0.835299991
};

function leagueCap(league: League): number {
  switch (league) {
    case "little": return 500;
    case "great":  return 1500;
    case "ultra":  return 2500;
    case "master": return Number.POSITIVE_INFINITY;
  }
}

function modifiers(isShadow?: boolean): { atk: number; def: number } {
  if (isShadow) return { atk: 1.2, def: 0.8333333333 };
  return { atk: 1.0, def: 1.0 };
}

export function calcHP(baseSta: number, ivSta: number, cpm: number): number {
  return Math.floor((baseSta + ivSta) * cpm);
}

export function calcScaledAtkDef(
  baseAtk: number,
  baseDef: number,
  ivAtk: number,
  ivDef: number,
  cpm: number,
  isShadow?: boolean
): { atkScaled: number; defScaled: number } {
  const mods = modifiers(isShadow);
  const atk = (baseAtk * mods.atk + ivAtk) * cpm;
  const def = (baseDef * mods.def + ivDef) * cpm;
  return { atkScaled: atk, defScaled: def };
}

export function calcCP(atkScaled: number, defScaled: number, hp: number): number {
  const cp = Math.floor((atkScaled * Math.sqrt(defScaled) * Math.sqrt(hp)) / 10);
  return Math.max(10, cp);
}

function* levelIterator(allowXL: boolean, bestBuddy: boolean): Generator<number> {
  const max = allowXL ? 50 : 40;
  for (let l = 1.0; l <= max; l += 0.5) yield parseFloat(l.toFixed(1));
  if (bestBuddy && allowXL) {
    yield 50.5;
    yield 51.0;
  }
}

export function rankBestIVsForLeague(
  base: BaseStats,
  opts: RankOptions
): RankEntry[] {
  const cap = leagueCap(opts.league);
  const out: RankEntry[] = [];
  const topN = opts.topN ?? 50;

  for (const lvl of levelIterator(!!opts.allowXL, !!opts.bestBuddy)) {
    const cpm = CPM[String(lvl)];
    if (!cpm) continue; // garanta que sua tabela CPM esteja completa

    for (let atk = 0; atk <= 15; atk++) {
      for (let def = 0; def <= 15; def++) {
        for (let sta = 0; sta <= 15; sta++) {
          const hp = calcHP(base.baseSta, sta, cpm);
          if (hp <= 0) continue;

          const { atkScaled, defScaled } = calcScaledAtkDef(
            base.baseAtk, base.baseDef, atk, def, cpm, base.isShadow
          );

          const cp = calcCP(atkScaled, defScaled, hp);
          if (cp > cap) continue;

          const statProduct = atkScaled * defScaled * hp;

          out.push({
            level: lvl,
            iv: { atk, def, sta },
            cp,
            hp,
            atkScaled,
            defScaled,
            staScaled: (base.baseSta + sta) * cpm, // útil para debug
            statProduct
          });
        }
      }
    }
  }

  // ordene por stat product desc; depois use desempates úteis
  out.sort((a, b) => {
    if (b.statProduct !== a.statProduct) return b.statProduct - a.statProduct;
    // desempates (opcional): maior HP, depois menor CP (ou maior), etc.
    if (b.hp !== a.hp) return b.hp - a.hp;
    if (a.cp !== b.cp) return a.cp - b.cp;
    return 0;
  });

  return out.slice(0, topN);
}




________________________




Exemplo de uso

import { rankBestIVsForLeague } from "./lib/pvp";

const giratinaAltered = {
  speciesId: "giratina_altered",
  baseAtk: 187,
  baseDef: 225,
  baseSta: 284,
  isShadow: false
};

const top = rankBestIVsForLeague(giratinaAltered, {
  league: "ultra",
  allowXL: true,
  bestBuddy: true,
  topN: 25
});

// top => lista com os 25 melhores combos (nível, IVs, CP, HP, statProduct)