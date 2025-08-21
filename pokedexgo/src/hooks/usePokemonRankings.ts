import { useQuery } from '@tanstack/react-query';
import { PokemonService } from '@/services/pokemonService';
import type { League } from '@/types/pokemon';

export const usePokemonRankings = (pokemonName: string) => {
  return useQuery({
    queryKey: ['pokemon-rankings', pokemonName],
    queryFn: () => PokemonService.getPokemonRankings(pokemonName),
    enabled: !!pokemonName,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useLeagueRankings = (league: League) => {
  return useQuery({
    queryKey: ['league-rankings', league],
    queryFn: () => PokemonService.getPvPRankings(league),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const usePokemonMetaScore = (pokemonName: string) => {
  const { data: pokemon } = useQuery({
    queryKey: ['pokemon', pokemonName],
    queryFn: () => PokemonService.getPokemonDetails(pokemonName),
    enabled: !!pokemonName,
  });

  const { data: rankings } = usePokemonRankings(pokemonName);

  return {
    pokemon,
    rankings,
    metaScore: pokemon && rankings ? PokemonService.calculateMetaScore(pokemon, rankings) : undefined,
    isLoading: !pokemon || !rankings,
  };
};
