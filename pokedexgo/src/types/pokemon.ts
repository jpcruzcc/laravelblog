export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  stats: Stat[];
  height: number;
  weight: number;
  abilities?: PokemonAbility[];
  moves?: PokemonMove[];
}

export interface Stat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonType {
  type: {
    name: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: Array<{
    level_learned_at: number;
    move_learn_method: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }>;
}

export type League = 'great' | 'ultra' | 'master';

export interface IVSpread {
  attack: number;
  defense: number;
  hp: number;
}

export interface LeagueRanking {
  league: League;
  rank: number;
  maxCP: number;
  optimalIV: IVSpread;
  level: number;
  percentageOfMax: number;
  bulkProduct: number;
  statProduct: number;
  rating: number;
}

// Novos tipos para análise PvP detalhada
export interface PvPMove {
  name: string;
  displayName: string;
  type: string;
  category: 'fast' | 'charged';
  power: number;
  energy: number;
  duration: number;
  dps: number;
  eps: number;
  damageWindow: number;
  pvpPower?: number;
  pvpEnergy?: number;
  cooldown?: number;
}

export interface OptimalIVs {
  league: League;
  attack: number;
  defense: number;
  hp: number;
  level: number;
  cp: number;
  statProduct: number;
  rank: number;
  percentage: number;
}

export interface TypeEffectiveness {
  type: string;
  effectiveness: number;
  label: 'Super Efetivo' | 'Efetivo' | 'Não Muito Efetivo' | 'Sem Efeito';
}

export interface PvPAnalysis {
  recommendedLeagues: League[];
  strengths: string[];
  weaknesses: string[];
  roles: string[];
  counters: string[];
  countered_by: string[];
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  usage: number;
}

export interface Moveset {
  fastMove: PvPMove;
  chargedMoves: PvPMove[];
  dps: number;
  tdo: number;
  rating: number;
  usage: number;
  winRate: number;
}

export interface PokemonDetail extends Pokemon {
  optimalIVs: OptimalIVs[];
  bestMovesets: {
    [key in League]: Moveset[];
  };
  typeEffectiveness: {
    weakTo: TypeEffectiveness[];
    resistantTo: TypeEffectiveness[];
    strongAgainst: TypeEffectiveness[];
  };
  pvpAnalysis: PvPAnalysis;
  availableMoves: {
    fast: PvPMove[];
    charged: PvPMove[];
  };
  cpCaps: {
    great: number;
    ultra: number;
    master: number;
  };
}

export interface PvPRanking {
  pokemon: string;
  speciesId: string;
  rankings: LeagueRanking[];
}

export interface MetaScore {
  overall: number;
  versatility: number;
  accessibility: number;
  cost: number;
  metaRelevance: number;
}

export interface Move {
  moveId: string;
  name: string;
  type: string;
  power: number;
  energy: number;
  energyGain?: number;
  cooldown: number;
  archetype: 'fast' | 'charged';
}

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

export type PokemonTypeName = typeof POKEMON_TYPES[number];

export const TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};