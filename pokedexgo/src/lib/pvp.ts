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
const CPM: Record<string, number> = {
  "1": 0.094,
  "1.5": 0.135137432,
  "2": 0.16639787,
  "2.5": 0.192650919,
  "3": 0.21573247,
  "3.5": 0.236572661,
  "4": 0.25572005,
  "4.5": 0.273530381,
  "5": 0.29024988,
  "5.5": 0.306057377,
  "6": 0.3210876,
  "6.5": 0.335445036,
  "7": 0.34921268,
  "7.5": 0.362457751,
  "8": 0.37523559,
  "8.5": 0.387592407,
  "9": 0.39956728,
  "9.5": 0.411193551,
  "10": 0.42250001,
  "10.5": 0.432926419,
  "11": 0.44310755,
  "11.5": 0.4530599578,
  "12": 0.46279839,
  "12.5": 0.472336083,
  "13": 0.48168495,
  "13.5": 0.490856987,
  "14": 0.49985844,
  "14.5": 0.508701765,
  "15": 0.51739395,
  "15.5": 0.525942511,
  "16": 0.53435433,
  "16.5": 0.542635767,
  "17": 0.55079269,
  "17.5": 0.558830576,
  "18": 0.56675452,
  "18.5": 0.574569153,
  "19": 0.58227891,
  "19.5": 0.589887917,
  "20": 0.59740001,
  "20.5": 0.604818814,
  "21": 0.61215728,
  "21.5": 0.619399365,
  "22": 0.62656713,
  "22.5": 0.633644533,
  "23": 0.64065295,
  "23.5": 0.647576426,
  "24": 0.65443563,
  "24.5": 0.661214806,
  "25": 0.667934,
  "25.5": 0.674577537,
  "26": 0.68116492,
  "26.5": 0.687680648,
  "27": 0.69414365,
  "27.5": 0.700538673,
  "28": 0.70688421,
  "28.5": 0.713164996,
  "29": 0.71939909,
  "29.5": 0.725571552,
  "30": 0.7317,
  "30.5": 0.734741009,
  "31": 0.73776948,
  "31.5": 0.740785574,
  "32": 0.74378943,
  "32.5": 0.746781211,
  "33": 0.74976104,
  "33.5": 0.752729087,
  "34": 0.75568551,
  "34.5": 0.758630378,
  "35": 0.76156384,
  "35.5": 0.764486065,
  "36": 0.76739717,
  "36.5": 0.770297266,
  "37": 0.7731865,
  "37.5": 0.776064962,
  "38": 0.77893275,
  "38.5": 0.781790055,
  "39": 0.78463697,
  "39.5": 0.787473578,
  "40": 0.79030001,
  // L41–50
  "40.5": 0.792803968,
  "41": 0.79530001,
  "41.5": 0.797800015,
  "42": 0.8003,
  "42.5": 0.802799995,
  "43": 0.8053,
  "43.5": 0.807799995,
  "44": 0.8103,
  "44.5": 0.812799995,
  "45": 0.8153,
  "45.5": 0.817799995,
  "46": 0.8203,
  "46.5": 0.822799995,
  "47": 0.8253,
  "47.5": 0.827799995,
  "48": 0.8303,
  "48.5": 0.832799995,
  "49": 0.8353,
  "49.5": 0.837799995,
  "50": 0.8403,
  // Best Buddy 50.5/51
  "50.5": 0.84279999,
  "51": 0.8453
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

import type { Pokemon } from '@/types/pokemon';

// Função helper para converter Pokemon da API para BaseStats
export function pokemonToBaseStats(pokemon: Pokemon): BaseStats {
  const baseAtk = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 100;
  const baseDef = pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 100;
  const baseSta = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 100;
  
  return {
    speciesId: pokemon.name,
    baseAtk,
    baseDef,
    baseSta,
    isShadow: false
  };
}

// Função para obter o melhor CP para uma liga específica
export function getBestCPForLeague(pokemon: Pokemon, league: League): number {
  const baseStats = pokemonToBaseStats(pokemon);
  const rankings = rankBestIVsForLeague(baseStats, {
    league,
    allowXL: true,
    bestBuddy: true,
    topN: 1
  });
  
  return rankings.length > 0 ? rankings[0].cp : 1500;
}
