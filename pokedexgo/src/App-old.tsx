import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RankingCard } from '@/components/ui/ranking-card'
import { PokemonService } from '@/services/pokemonService'
import { usePokemonRankings } from '@/hooks/usePokemonRankings'
import { useAppStore } from '@/stores/appStore'
import type { Pokemon } from '@/types/pokemon'
import { Search, Zap, Shield, Heart, TrendingUp } from 'lucide-react'
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
            <div className="text-sm text-muted-foreground">CP estimado</div>
            <div className="text-lg font-bold">1500</div>
          </div>
        </div>
        
        {/* PvP Ranking Preview */}
        {!rankingsLoading && currentLeagueRanking && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">{defaultLeague} League</span>
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
        
        <Button className="w-full mt-4" variant="outline">
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}

function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([])
  const { defaultLeague } = useAppStore();, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RankingCard } from '@/components/ui/ranking-card'
import { PokemonService } from '@/services/pokemonService'
import { usePokemonRankings } from '@/hooks/usePokemonRankings'
import { useAppStore } from '@/stores/appStore'
import type { Pokemon } from '@/types/pokemon'
import { Search, Zap, Shield, Heart, TrendingUp } from 'lucide-react'

function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([])

  useEffect(() => {
    loadInitialPokemon()
  }, [])

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

  const loadInitialPokemon = async () => {
    try {
      setLoading(true)
      const pokemonList = await PokemonService.getPokemonList(151)
      const pokemonDetails = await Promise.all(
        pokemonList.slice(0, 20).map(p => PokemonService.getPokemonDetails(p.name))
      )
      const validPokemon = pokemonDetails.filter(p => p !== null) as Pokemon[]
      setPokemon(validPokemon)
      setFilteredPokemon(validPokemon)
    } catch (error) {
      console.error('Error loading Pokemon:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando Pokédex...</p>
        </div>
      </div>
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
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar Pokémon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
              <CardTitle className="text-sm font-medium">Liga Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Great League</div>
              <p className="text-xs text-muted-foreground">CP máximo: 1500</p>
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
            <Card key={poke.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                    <div className="text-sm text-muted-foreground">CP estimado</div>
                    <div className="text-lg font-bold">1500</div>
                  </div>
                </div>
                
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
                
                <Button className="w-full mt-4" variant="outline">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
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
      </main>
    </div>
  )
}

export default App
