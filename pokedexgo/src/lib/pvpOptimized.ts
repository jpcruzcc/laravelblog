import type { Pokemon } from '@/types/pokemon';

type League = "great" | "ultra" | "master";

interface OptimalData {
  cp: number;
  level: number;
  ivs: { atk: number; def: number; sta: number };
}

// Cache para resultados calculados
const cpCache = new Map<string, OptimalData>();

// Database pré-calculada para Pokemon populares
const POPULAR_POKEMON_OPTIMAL: Record<string, Record<League, OptimalData>> = {
  'azumarill': {
    great: { cp: 1500, level: 40, ivs: { atk: 8, def: 15, sta: 15 } },
    ultra: { cp: 2500, level: 51, ivs: { atk: 0, def: 15, sta: 15 } },
    master: { cp: 2500, level: 51, ivs: { atk: 15, def: 15, sta: 15 } }
  },
  'registeel': {
    great: { cp: 1500, level: 25.5, ivs: { atk: 0, def: 15, sta: 15 } },
    ultra: { cp: 2500, level: 40, ivs: { atk: 0, def: 15, sta: 15 } },
    master: { cp: 2500, level: 40, ivs: { atk: 15, def: 15, sta: 15 } }
  },
  'bastiodon': {
    great: { cp: 1500, level: 40, ivs: { atk: 0, def: 15, sta: 15 } },
    ultra: { cp: 2500, level: 51, ivs: { atk: 0, def: 15, sta: 15 } },
    master: { cp: 2500, level: 51, ivs: { atk: 15, def: 15, sta: 15 } }
  },
  'altaria': {
    great: { cp: 1498, level: 29, ivs: { atk: 0, def: 14, sta: 15 } },
    ultra: { cp: 2500, level: 46.5, ivs: { atk: 0, def: 15, sta: 15 } },
    master: { cp: 2500, level: 46.5, ivs: { atk: 15, def: 15, sta: 15 } }
  },
  'skarmory': {
    great: { cp: 1500, level: 27.5, ivs: { atk: 0, def: 15, sta: 14 } },
    ultra: { cp: 2500, level: 44, ivs: { atk: 0, def: 15, sta: 15 } },
    master: { cp: 2500, level: 44, ivs: { atk: 15, def: 15, sta: 15 } }
  },
  'medicham': {
    great: { cp: 1500, level: 50.5, ivs: { atk: 12, def: 15, sta: 15 } },
    ultra: { cp: 1500, level: 50.5, ivs: { atk: 12, def: 15, sta: 15 } },
    master: { cp: 1500, level: 50.5, ivs: { atk: 15, def: 15, sta: 15 } }
  },
  'umbreon': {
    great: { cp: 1500, level: 27.5, ivs: { atk: 0, def: 15, sta: 15 } },
    ultra: { cp: 2500, level: 44.5, ivs: { atk: 0, def: 15, sta: 15 } },
    master: { cp: 2500, level: 44.5, ivs: { atk: 15, def: 15, sta: 15 } }
  },
  'cresselia': {
    great: { cp: 1500, level: 16, ivs: { atk: 0, def: 15, sta: 15 } },
    ultra: { cp: 2500, level: 25.5, ivs: { atk: 0, def: 15, sta: 15 } },
    master: { cp: 3200, level: 40, ivs: { atk: 15, def: 15, sta: 15 } }
  },
  'swampert': {
    great: { cp: 1500, level: 19, ivs: { atk: 0, def: 14, sta: 15 } },
    ultra: { cp: 2500, level: 31, ivs: { atk: 0, def: 15, sta: 15 } },
    master: { cp: 2974, level: 40, ivs: { atk: 15, def: 15, sta: 15 } }
  },
  'venusaur': {
    great: { cp: 1500, level: 18.5, ivs: { atk: 0, def: 15, sta: 14 } },
    ultra: { cp: 2500, level: 30, ivs: { atk: 0, def: 15, sta: 15 } },
    master: { cp: 2720, level: 40, ivs: { atk: 15, def: 15, sta: 15 } }
  }
};

// Função de estimativa rápida baseada em stats
function estimateOptimalCP(pokemon: Pokemon, league: League): OptimalData {
  const maxCP = getMaxCPForLeague(league);
  
  const attackStat = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 100;
  const defenseStat = pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 100;
  const hpStat = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 100;
  
  const total = attackStat + defenseStat + hpStat;
  const defenseRatio = defenseStat / total;
  const hpRatio = hpStat / total;
  
  // Estimativa baseada no perfil do Pokemon
  let cpRatio: number;
  let defaultIVs: { atk: number; def: number; sta: number };
  
  if (defenseRatio > 0.4 || hpRatio > 0.4) {
    // Pokemon defensivo/tanky - pode usar mais CP
    cpRatio = 0.95;
    defaultIVs = { atk: 0, def: 15, sta: 15 };
  } else if (defenseRatio > 0.3 && hpRatio > 0.3) {
    // Pokemon balanceado
    cpRatio = 0.87;
    defaultIVs = { atk: 1, def: 14, sta: 15 };
  } else {
    // Pokemon ofensivo
    cpRatio = 0.80;
    defaultIVs = { atk: 3, def: 12, sta: 15 };
  }
  
  const estimatedCP = Math.min(Math.floor(maxCP * cpRatio), maxCP);
  
  return {
    cp: estimatedCP,
    level: league === 'great' ? 25 : league === 'ultra' ? 35 : 40,
    ivs: defaultIVs
  };
}

function getMaxCPForLeague(league: League): number {
  switch (league) {
    case 'great': return 1500;
    case 'ultra': return 2500;
    case 'master': return 4500; // Limite prático
    default: return 1500;
  }
}

// Função principal otimizada
export function getOptimalCPForLeague(pokemon: Pokemon, league: League): number {
  const cacheKey = `${pokemon.name}_${league}`;
  
  // Verifica cache primeiro
  if (cpCache.has(cacheKey)) {
    return cpCache.get(cacheKey)!.cp;
  }
  
  // Verifica database pré-calculada
  const pokemonName = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const preCalculated = POPULAR_POKEMON_OPTIMAL[pokemonName]?.[league];
  
  if (preCalculated) {
    cpCache.set(cacheKey, preCalculated);
    return preCalculated.cp;
  }
  
  // Fallback para estimativa rápida
  const estimated = estimateOptimalCP(pokemon, league);
  cpCache.set(cacheKey, estimated);
  
  return estimated.cp;
}

// Função para obter dados completos (para página de detalhes)
export function getOptimalDataForLeague(pokemon: Pokemon, league: League): OptimalData {
  const cacheKey = `${pokemon.name}_${league}`;
  
  if (cpCache.has(cacheKey)) {
    return cpCache.get(cacheKey)!;
  }
  
  const pokemonName = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const preCalculated = POPULAR_POKEMON_OPTIMAL[pokemonName]?.[league];
  
  if (preCalculated) {
    cpCache.set(cacheKey, preCalculated);
    return preCalculated;
  }
  
  const estimated = estimateOptimalCP(pokemon, league);
  cpCache.set(cacheKey, estimated);
  
  return estimated;
}

// Função para limpar cache se necessário
export function clearCache(): void {
  cpCache.clear();
}

// Função para pré-carregar cache com Pokemon populares
export function preloadPopularPokemon(): void {
  // Esta função pode ser chamada no início da aplicação
  // para pré-carregar o cache com dados populares
  Object.entries(POPULAR_POKEMON_OPTIMAL).forEach(([name, leagues]) => {
    Object.entries(leagues).forEach(([league, data]) => {
      const cacheKey = `${name}_${league}`;
      cpCache.set(cacheKey, data);
    });
  });
}
