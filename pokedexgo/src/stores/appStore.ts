import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pokemon, League } from '@/types/pokemon';

export type ViewType = 'grid' | 'list' | 'compact';

interface AppState {
  // Pokemon data
  pokemonList: Pokemon[];
  favorites: string[];
  searchHistory: string[];
  
  // UI state
  sidebarOpen: boolean;
  currentView: ViewType;
  
  // User preferences
  defaultLeague: League;
  showIVs: boolean;
  compactMode: boolean;
  
  // Actions
  setPokemonList: (pokemon: Pokemon[]) => void;
  addToFavorites: (pokemonId: string) => void;
  removeFromFavorites: (pokemonId: string) => void;
  addToSearchHistory: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: ViewType) => void;
  setDefaultLeague: (league: League) => void;
  setShowIVs: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      pokemonList: [],
      favorites: [],
      searchHistory: [],
      sidebarOpen: false,
      currentView: 'grid',
      defaultLeague: 'great',
      showIVs: true,
      compactMode: false,
      
      // Actions
      setPokemonList: (pokemon) => set({ pokemonList: pokemon }),
      
      addToFavorites: (pokemonId) => set((state) => ({
        favorites: [...state.favorites, pokemonId]
      })),
      
      removeFromFavorites: (pokemonId) => set((state) => ({
        favorites: state.favorites.filter(id => id !== pokemonId)
      })),
      
      addToSearchHistory: (query) => set((state) => {
        const history = [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 10);
        return { searchHistory: history };
      }),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentView: (view) => set({ currentView: view }),
      setDefaultLeague: (league) => set({ defaultLeague: league }),
      setShowIVs: (show) => set({ showIVs: show }),
      setCompactMode: (compact) => set({ compactMode: compact }),
    }),
    {
      name: 'pokedex-go-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        searchHistory: state.searchHistory,
        defaultLeague: state.defaultLeague,
        showIVs: state.showIVs,
        compactMode: state.compactMode,
      }),
    }
  )
);
