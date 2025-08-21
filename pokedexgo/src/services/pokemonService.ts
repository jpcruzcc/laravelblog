import type { Pokemon, PvPRanking, League, LeagueRanking, IVSpread, MetaScore } from '@/types/pokemon';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export class PokemonService {
  static async getPokemonList(limit: number = 1010, offset: number = 0): Promise<{name: string, url: string}[]> {
    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      
      // Filter only Pokemon available in Pokemon GO (up to Gen 9, but excluding some)
      // This is a simplified filter - in a real app you'd have a comprehensive list
      const pokemonGoAvailable = data.results.filter((_: unknown, index: number) => {
        const pokedexNumber = index + 1;
        // Include most Pokemon up to Gen 8 (around #898)
        // Exclude some legendary/mythical that aren't in GO yet
        return pokedexNumber <= 1010 && !this.isExcludedFromGO(pokedexNumber);
      });
      
      return pokemonGoAvailable;
    } catch (error) {
      console.error('Error fetching Pokemon list:', error);
      return [];
    }
  }

  private static isExcludedFromGO(pokedexNumber: number): boolean {
    // List of Pokemon not available in Pokemon GO (simplified)
    const excluded: number[] = [
      // Some mythicals and legendaries not in GO
      // This would be a more comprehensive list in a real app
    ];
    return excluded.includes(pokedexNumber);
  }

  static async getPokemonDetails(nameOrId: string | number): Promise<Pokemon | null> {
    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${nameOrId}`);
      if (!response.ok) {
        throw new Error(`Pokemon not found: ${nameOrId}`);
      }
      const pokemon = await response.json();
      return pokemon;
    } catch (error) {
      console.error('Error fetching Pokemon details:', error);
      return null;
    }
  }

  static async getPokemonSpecies(nameOrId: string | number) {
    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${nameOrId}`);
      if (!response.ok) {
        throw new Error(`Pokemon species not found: ${nameOrId}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching Pokemon species:', error);
      return null;
    }
  }

  static async getPvPRankings(league: League = 'great'): Promise<PvPRanking[]> {
    try {
      // Note: PvPoke doesn't have a direct API, so we'll simulate rankings
      // In a real implementation, you'd need to scrape or use an alternative API
      const maxCP = league === 'great' ? 1500 : league === 'ultra' ? 2500 : 4000;
      const mockRankings: PvPRanking[] = [
        {
          pokemon: 'azumarill',
          speciesId: '184',
          rankings: [{
            league,
            rank: 1,
            maxCP,
            optimalIV: { attack: 8, defense: 15, hp: 15 },
            level: 40,
            percentageOfMax: 98.5,
            bulkProduct: 2847.2,
            statProduct: 2847.2,
            rating: 1587
          }]
        },
        {
          pokemon: 'registeel',
          speciesId: '379',
          rankings: [{
            league,
            rank: 2,
            maxCP,
            optimalIV: { attack: 1, defense: 15, hp: 14 },
            level: 25.5,
            percentageOfMax: 97.8,
            bulkProduct: 2698.1,
            statProduct: 2698.1,
            rating: 1543
          }]
        }
      ];
      
      return mockRankings;
    } catch (error) {
      console.error('Error fetching PvP rankings:', error);
      return [];
    }
  }

  static async searchPokemon(query: string): Promise<Pokemon[]> {
    try {
      // Simple search implementation
      const pokemonList = await this.getPokemonList(1000);
      const filteredList = pokemonList.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20);
      
      const pokemonDetails = await Promise.all(
        filteredList.map(p => this.getPokemonDetails(p.name))
      );
      
      return pokemonDetails.filter(p => p !== null) as Pokemon[];
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      return [];
    }
  }

  static async getPokemonRankings(pokemonName: string): Promise<LeagueRanking[]> {
    try {
      // Simulated rankings for all leagues
      const leagues: League[] = ['great', 'ultra', 'master'];
      const rankings: LeagueRanking[] = [];
      
      for (const league of leagues) {
        const maxCP = league === 'great' ? 1500 : league === 'ultra' ? 2500 : 4000;
        
        // Simulate ranking data based on Pokemon stats
        const ranking: LeagueRanking = {
          league,
          rank: Math.floor(Math.random() * 500) + 1,
          maxCP,
          optimalIV: {
            attack: Math.floor(Math.random() * 15) + 1,
            defense: Math.floor(Math.random() * 5) + 11,
            hp: Math.floor(Math.random() * 5) + 11
          },
          level: Math.round((Math.random() * 20 + 20) * 2) / 2,
          percentageOfMax: Math.round((Math.random() * 20 + 80) * 100) / 100,
          bulkProduct: Math.round(Math.random() * 3000 + 1500),
          statProduct: Math.round(Math.random() * 3000 + 1500),
          rating: Math.round(Math.random() * 1000 + 1000)
        };
        
        rankings.push(ranking);
      }
      
      return rankings;
    } catch (error) {
      console.error('Error fetching Pokemon rankings:', error);
      return [];
    }
  }

  static calculateMetaScore(pokemon: Pokemon, rankings: LeagueRanking[]): MetaScore {
    const avgRank = rankings.reduce((sum, r) => sum + r.rank, 0) / rankings.length;
    const avgRating = rankings.reduce((sum, r) => sum + r.rating, 0) / rankings.length;
    
    // Calculate scores (0-100)
    const overall = Math.max(0, 100 - (avgRank / 10));
    const versatility = rankings.filter(r => r.rank <= 100).length * 33.33;
    const accessibility = Math.random() * 40 + 60; // Simulated based on rarity
    const cost = Math.random() * 30 + 70; // Simulated based on evolution cost
    const metaRelevance = Math.max(0, (avgRating - 1000) / 10);
    
    return {
      overall: Math.round(overall),
      versatility: Math.round(versatility),
      accessibility: Math.round(accessibility),
      cost: Math.round(cost),
      metaRelevance: Math.round(metaRelevance)
    };
  }

  static getOptimalIVsForLeague(pokemon: Pokemon, league: League): IVSpread {
    // Simplified IV optimization logic
    // In a real implementation, this would involve complex calculations
    const baseAttack = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 100;
    const baseDefense = pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 100;
    const baseHP = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 100;
    
    // Lower attack IV generally better for PvP due to CP formula
    const attack = baseAttack > 150 ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 10) + 5;
    const defense = Math.floor(Math.random() * 5) + 11;
    const hp = Math.floor(Math.random() * 5) + 11;
    
    return { attack, defense, hp };
  }

  static getTypeColor(type: string): string {
    const typeColors: Record<string, string> = {
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
    
    return typeColors[type.toLowerCase()] || '#68A090';
  }

  static calculateCP(pokemon: Pokemon, level: number, ivs: {atk: number, def: number, hp: number}): number {
    const baseStats = {
      atk: pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
      def: pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
      hp: pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat || 0
    };

    const cpMultiplier = this.getCPMultiplier(level);
    
    const attack = (baseStats.atk + ivs.atk) * cpMultiplier;
    const defense = (baseStats.def + ivs.def) * cpMultiplier;
    const stamina = (baseStats.hp + ivs.hp) * cpMultiplier;
    
    const cp = Math.floor((attack * Math.sqrt(defense) * Math.sqrt(stamina)) / 10);
    return Math.max(cp, 10);
  }

  private static getCPMultiplier(level: number): number {
    // Simplified CP multiplier calculation
    // In reality, this would use the exact Pokemon GO formula
    const baseMultiplier = 0.094;
    const levelMultiplier = Math.sqrt(level / 40);
    return baseMultiplier + (levelMultiplier * 0.5);
  }
}