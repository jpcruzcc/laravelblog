import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Target, Shield, Zap, Heart, TrendingUp, Award, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/stores/appStore';
import { PvPAnalyzer } from '@/services/pvpAnalysisService';
import type { Pokemon, PokemonDetail, League } from '@/types/pokemon';

interface PokemonDetailPageProps {
  pokemon: Pokemon;
  onBack: () => void;
}

const PokemonDetailPage: React.FC<PokemonDetailPageProps> = ({ pokemon, onBack }) => {
  const [pokemonDetail, setPokemonDetail] = useState<PokemonDetail | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League>('great');
  const [loading, setLoading] = useState(true);
  const { defaultLeague } = useAppStore();

  useEffect(() => {
    setSelectedLeague(defaultLeague);
  }, [defaultLeague]);

  useEffect(() => {
    const loadPokemonDetail = async () => {
      setLoading(true);
      try {
        const detail = await PvPAnalyzer.getPokemonDetail(pokemon);
        setPokemonDetail(detail);
      } catch (error) {
        console.error('Error loading Pokemon detail:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPokemonDetail();
  }, [pokemon]);

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
      grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
      ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
      rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
      steel: '#B8B8D0', fairy: '#EE99AC'
    };
    return colors[type] || '#68D391';
  };

  const getStatIcon = (statName: string) => {
    switch (statName) {
      case 'attack': return <Zap className="w-4 h-4" />;
      case 'defense': return <Shield className="w-4 h-4" />;
      case 'hp': return <Heart className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      S: 'bg-red-500', A: 'bg-orange-500', B: 'bg-yellow-500',
      C: 'bg-blue-500', D: 'bg-gray-500'
    };
    return colors[tier] || 'bg-gray-500';
  };

  const formatPokemonName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  if (loading || !pokemonDetail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análise detalhada...</p>
        </div>
      </div>
    );
  }

  const currentLeagueOptimalIVs = pokemonDetail.optimalIVs.find(iv => iv.league === selectedLeague);
  const currentLeagueMovesets = pokemonDetail.bestMovesets[selectedLeague] || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-4">
              <img
                src={pokemon.sprites.other['official-artwork'].front_default}
                alt={pokemon.name}
                className="w-16 h-16"
              />
              <div>
                <h1 className="text-2xl font-bold">#{pokemon.id.toString().padStart(3, '0')} {formatPokemonName(pokemon.name)}</h1>
                <div className="flex gap-2 mt-1">
                  {pokemon.types.map((type) => (
                    <Badge
                      key={type.type.name}
                      style={{ backgroundColor: getTypeColor(type.type.name) }}
                      className="text-white"
                    >
                      {type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}
                    </Badge>
                  ))}
                  <Badge className={`${getTierColor(pokemonDetail.pvpAnalysis.tier)} text-white`}>
                    Tier {pokemonDetail.pvpAnalysis.tier}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* League Selector */}
        <div className="flex gap-2 mb-6">
          {(['great', 'ultra', 'master'] as League[]).map((league) => (
            <Button
              key={league}
              variant={selectedLeague === league ? 'default' : 'outline'}
              onClick={() => setSelectedLeague(league)}
              className="capitalize"
            >
              {league === 'great' ? 'Great League' : league === 'ultra' ? 'Ultra League' : 'Master League'}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & IVs */}
          <div className="space-y-6">
            {/* Base Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Stats Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pokemon.stats.map((stat) => (
                  <div key={stat.stat.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getStatIcon(stat.stat.name)}
                        <span className="capitalize font-medium">{stat.stat.name}</span>
                      </div>
                      <span className="font-bold">{stat.base_stat}</span>
                    </div>
                    <Progress value={(stat.base_stat / 255) * 100} className="h-2" />
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optimal IVs */}
            {currentLeagueOptimalIVs && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Optimal IVs - {selectedLeague === 'great' ? 'Great League' : selectedLeague === 'ultra' ? 'Ultra League' : 'Master League'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{currentLeagueOptimalIVs.attack}</div>
                      <div className="text-xs text-muted-foreground">ATK</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{currentLeagueOptimalIVs.defense}</div>
                      <div className="text-xs text-muted-foreground">DEF</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{currentLeagueOptimalIVs.hp}</div>
                      <div className="text-xs text-muted-foreground">HP</div>
                    </div>
                  </div>
                  
                  {/* Perfect PvP IV indicator */}
                  {(currentLeagueOptimalIVs.attack === 8 && currentLeagueOptimalIVs.defense === 15 && currentLeagueOptimalIVs.hp === 15 && pokemon.name.toLowerCase() === 'azumarill' && selectedLeague === 'great') && (
                    <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
                      <div className="text-xs text-green-700 dark:text-green-300 font-medium text-center">
                        ⭐ Perfect PvP IVs for Great League! ⭐
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="font-medium">{currentLeagueOptimalIVs.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CP:</span>
                      <span className="font-medium">{currentLeagueOptimalIVs.cp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stat Product:</span>
                      <span className="font-medium">{currentLeagueOptimalIVs.statProduct.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rank:</span>
                      <span className="font-medium">#{currentLeagueOptimalIVs.rank}</span>
                    </div>
                    
                    {/* Additional info for specific scenarios */}
                    {currentLeagueOptimalIVs.cp === 1500 && selectedLeague === 'great' && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Perfect CP cap for Great League!
                        </div>
                      </div>
                    )}
                    
                    {currentLeagueOptimalIVs.cp === 2500 && selectedLeague === 'ultra' && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Perfect CP cap for Ultra League!
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PvP Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Análise PvP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Recommended Leagues</h4>
                  <div className="flex gap-2">
                    {pokemonDetail.pvpAnalysis.recommendedLeagues.map((league) => (
                      <Badge key={league} variant="secondary">
                        {league === 'great' ? 'Great League' : league === 'ultra' ? 'Ultra League' : 'Master League'}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Funções</h4>
                  <div className="flex flex-wrap gap-1">
                    {pokemonDetail.pvpAnalysis.roles.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-600">Pontos Fortes</h4>
                  <ul className="text-sm space-y-1">
                    {pokemonDetail.pvpAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="text-muted-foreground">• {strength}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 text-red-600">Pontos Fracos</h4>
                  <ul className="text-sm space-y-1">
                    {pokemonDetail.pvpAnalysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-muted-foreground">• {weakness}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Movesets */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Best Movesets - {selectedLeague === 'great' ? 'Great League' : selectedLeague === 'ultra' ? 'Ultra League' : 'Master League'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLeagueMovesets.map((moveset, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                      <div className="text-right text-sm">
                        <div className="font-medium">Rating: {moveset.rating.toFixed(1)}</div>
                        <div className="text-muted-foreground">Win Rate: {moveset.winRate.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium mb-1">Fast Move</div>
                        <Badge
                          style={{ backgroundColor: getTypeColor(moveset.fastMove.type) }}
                          className="text-white"
                        >
                          {moveset.fastMove.displayName}
                        </Badge>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-1">Charged Moves</div>
                        <div className="flex flex-wrap gap-1">
                          {moveset.chargedMoves.map((move, moveIndex) => (
                            <Badge
                              key={moveIndex}
                              style={{ backgroundColor: getTypeColor(move.type) }}
                              className="text-white"
                            >
                              {move.displayName}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">DPS:</span>
                            <span className="ml-1 font-medium">{moveset.dps.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">TDO:</span>
                            <span className="ml-1 font-medium">{moveset.tdo.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Type Effectiveness */}
          <div className="space-y-6">
            {/* Weak To */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Shield className="w-5 h-5" />
                  Fraco Contra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {pokemonDetail.typeEffectiveness.weakTo.map((weakness) => (
                    <div key={weakness.type} className="flex items-center gap-2">
                      <Badge
                        style={{ backgroundColor: getTypeColor(weakness.type) }}
                        className="text-white flex-1 justify-center"
                      >
                        {weakness.type.charAt(0).toUpperCase() + weakness.type.slice(1)}
                      </Badge>
                      <span className="text-xs text-red-600 font-bold">
                        {weakness.effectiveness}x
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strong Against */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Target className="w-5 h-5" />
                  Forte Contra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {pokemonDetail.typeEffectiveness.strongAgainst.map((strength) => (
                    <div key={strength.type} className="flex items-center gap-2">
                      <Badge
                        style={{ backgroundColor: getTypeColor(strength.type) }}
                        className="text-white flex-1 justify-center"
                      >
                        {strength.type.charAt(0).toUpperCase() + strength.type.slice(1)}
                      </Badge>
                      <span className="text-xs text-green-600 font-bold">
                        {strength.effectiveness}x
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resistant To */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Shield className="w-5 h-5" />
                  Resiste A
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {pokemonDetail.typeEffectiveness.resistantTo.map((resistance) => (
                    <div key={resistance.type} className="flex items-center gap-2">
                      <Badge
                        style={{ backgroundColor: getTypeColor(resistance.type) }}
                        className="text-white flex-1 justify-center"
                      >
                        {resistance.type.charAt(0).toUpperCase() + resistance.type.slice(1)}
                      </Badge>
                      <span className="text-xs text-blue-600 font-bold">
                        {resistance.effectiveness}x
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Counters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Meta Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-600">Bom Contra</h4>
                  <div className="flex flex-wrap gap-1">
                    {pokemonDetail.pvpAnalysis.countered_by.map((counter) => (
                      <Badge key={counter} variant="outline" className="text-xs">
                        {counter}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 text-red-600">Counters</h4>
                  <div className="flex flex-wrap gap-1">
                    {pokemonDetail.pvpAnalysis.counters.map((counter) => (
                      <Badge key={counter} variant="outline" className="text-xs">
                        {counter}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Usage Rate:</span>
                    <span className="font-medium">{pokemonDetail.pvpAnalysis.usage.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PokemonDetailPage;
