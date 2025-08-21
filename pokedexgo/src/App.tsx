import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PokemonService } from '@/services/pokemonService'
import { getOptimalCPForLeague, preloadPopularPokemon } from '@/lib/pvpOptimized'
import { usePokemonRankings } from '@/hooks/usePokemonRankings'
import { useAppStore } from '@/stores/appStore'
import type { Pokemon } from '@/types/pokemon'
import { Search, Zap, Shield, Heart, TrendingUp } from 'lucide-react'
import { LeagueSelector } from '@/components/ui/league-selector'
import PokemonDetailPage from '@/components/PokemonDetailPage'

const PokemonCard = memo(({ poke, onSelect }: { poke: Pokemon, onSelect: (p: Pokemon) => void }) => {
  const { data: rankings, isLoading: rankingsLoading } = usePokemonRankings(poke.name);
  const { defaultLeague } = useAppStore();
  
  // Calcular CP otimizado para a liga atual (memoizado)
  const optimalCP = useMemo(() => {
    return getOptimalCPForLeague(poke, defaultLeague);
  }, [poke, defaultLeague]);
  
  const currentLeagueRanking = rankings?.find(r => r.league === defaultLeague);

  const getTypeColor = (type: string) => {
    return PokemonService.getTypeColor(type)
  }

  const getStatIcon = (statName: string) => {
    switch (statName) {
      case 'attack': return <Zap className="w-4 h-4" />
      case 'defense': return <Shield className="w-4 h-4" />
      case 'hp': return <Heart className="w-4 h-4" />
      default: return null
    }
  }
  
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg capitalize">{poke.name}</CardTitle>
          <span className="text-sm text-muted-foreground">#{poke.id.toString().padStart(3, '0')}</span>
        </div>
        <div className="flex gap-2">
          {poke.types.map((type) => (
            <Badge 
              key={type.type.name}
              variant="secondary"
              style={{ 
                backgroundColor: getTypeColor(type.type.name),
                color: 'white',
                border: 'none'
              }}
            >
              {type.type.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <img 
            src={poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default}
            alt={poke.name}
            className="w-20 h-20 object-contain"
          />
          <div className="text-right">
            <div className="text-sm text-muted-foreground">CP ótimo</div>
            <div className="text-lg font-bold text-primary">{optimalCP}</div>
          </div>
        </div>
        
        {/* PvP Ranking Preview */}
        {!rankingsLoading && currentLeagueRanking && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">{defaultLeague} League</span>
              </div>
              <Badge variant="outline">#{currentLeagueRanking.rank}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {currentLeagueRanking.percentageOfMax}% performance • Rating: {currentLeagueRanking.rating}
            </div>
          </div>
        )}
        
        {/* Stats Preview */}
        <div className="space-y-2">
          {poke.stats.slice(0, 3).map((stat) => (
            <div key={stat.stat.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getStatIcon(stat.stat.name)}
                <span className="capitalize">{stat.stat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                  ></div>
                </div>
                <span className="w-8 text-right">{stat.base_stat}</span>
              </div>
            </div>
          ))}
        </div>
        
        <Button className="w-full mt-4" variant="outline" onClick={() => onSelect(poke)}>
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
});

function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([])
  const { defaultLeague } = useAppStore()
  // Base list and pagination state
  const [baseList, setBaseList] = useState<{ name: string; url: string }[]>([])
  const [loadedCount, setLoadedCount] = useState(0)
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)

  const ITEMS_PER_PAGE = 12

  const loadMoreInternal = useCallback(async (list: { name: string; url: string }[], start: number, count: number) => {
    const slice = list.slice(start, start + count)
    const details = await Promise.all(
      slice.map(p => PokemonService.getPokemonDetails(p.name))
    )
    const valid = details.filter(p => p !== null) as Pokemon[]
    setPokemon(prev => {
      const merged = [...prev, ...valid]
      if (searchQuery.trim() === '') setFilteredPokemon(merged)
      return merged
    })
    setLoadedCount(prev => prev + valid.length)
  }, [searchQuery])

  useEffect(() => {
    // Pré-carregar cache de Pokemon populares para melhor performance
    preloadPopularPokemon();
    // inline async IIFE to avoid dependency on loadInitialPokemon
    (async () => {
      try {
        setLoading(true)
        const list = await PokemonService.getPokemonList(151)
        setBaseList(list)
        await loadMoreInternal(list, 0, ITEMS_PER_PAGE)
      } catch (error) {
        console.error('Error loading Pokemon:', error)
      } finally {
        setLoading(false)
      }
    })();
  }, [loadMoreInternal])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPokemon(pokemon)
    } else {
      const filtered = pokemon.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPokemon(filtered)
    }
  }, [searchQuery, pokemon])

  const loadMore = async () => {
    if (loadedCount >= baseList.length) return
    setLoading(true)
    try {
      await loadMoreInternal(baseList, loadedCount, ITEMS_PER_PAGE)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading && pokemon.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando Pokédex...</p>
        </div>
      </div>
    )
  }

  // Detail page view
  if (selectedPokemon) {
    return (
      <PokemonDetailPage pokemon={selectedPokemon} onBack={() => setSelectedPokemon(null)} />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">PokéDex GO PvP</h1>
              <p className="text-muted-foreground">Sistema completo de análise competitiva</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:items-center w-full md:w-auto">
              <div className="relative max-w-md w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar Pokémon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <LeagueSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pokémon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pokemon.length}</div>
              <p className="text-xs text-muted-foreground">Primeira geração</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Liga Padrão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{defaultLeague} League</div>
              <p className="text-xs text-muted-foreground">
                CP máximo: {defaultLeague === 'great' ? '1500' : defaultLeague === 'ultra' ? '2500' : 'Sem limite'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Meta Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Temporada 19</div>
              <p className="text-xs text-muted-foreground">Atualizado hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Pokemon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPokemon.map((poke) => (
            <PokemonCard key={poke.id} poke={poke} onSelect={setSelectedPokemon} />
          ))}
        </div>

        {filteredPokemon.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Nenhum Pokémon encontrado para "{searchQuery}"</p>
            <Button 
              onClick={() => setSearchQuery('')}
              variant="outline"
              className="mt-4"
            >
              Limpar busca
            </Button>
          </div>
        )}

        {/* Load More */}
        {searchQuery.trim() === '' && loadedCount < baseList.length && (
          <div className="flex justify-center mt-8">
            <Button onClick={loadMore} variant="default" disabled={loading}>
              {loading ? 'Carregando...' : 'Carregar mais'}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
