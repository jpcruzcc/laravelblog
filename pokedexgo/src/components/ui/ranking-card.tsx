import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { LeagueRanking } from "@/types/pokemon"
import { Crown, Trophy, Medal } from "lucide-react"

interface RankingCardProps {
  ranking: LeagueRanking
}

export function RankingCard({ ranking }: RankingCardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />
    if (rank <= 3) return <Trophy className="w-4 h-4 text-gray-400" />
    if (rank <= 10) return <Medal className="w-4 h-4 text-orange-500" />
    return null
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500"
    if (rank <= 10) return "text-orange-500"
    if (rank <= 50) return "text-green-500"
    if (rank <= 100) return "text-blue-500"
    return "text-muted-foreground"
  }

  const getLeagueLabel = (league: string) => {
    switch (league) {
      case 'great': return 'Great League'
      case 'ultra': return 'Ultra League'
      case 'master': return 'Master League'
      default: return league
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {getLeagueLabel(ranking.league)}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            CP ≤ {ranking.maxCP}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rank Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRankIcon(ranking.rank)}
            <span className={`text-lg font-bold ${getRankColor(ranking.rank)}`}>
              #{ranking.rank}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Rating</div>
            <div className="font-semibold">{ranking.rating}</div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Performance</span>
            <span>{ranking.percentageOfMax}% of max</span>
          </div>
          <Progress value={ranking.percentageOfMax} className="h-2" />
        </div>

        {/* Optimal IVs */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">Optimal IVs</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">{ranking.optimalIV.attack}</div>
              <div className="text-muted-foreground">ATK</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">{ranking.optimalIV.defense}</div>
              <div className="text-muted-foreground">DEF</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">{ranking.optimalIV.hp}</div>
              <div className="text-muted-foreground">HP</div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground">Level</div>
            <div className="font-medium">{ranking.level}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Stat Product</div>
            <div className="font-medium">{ranking.statProduct.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
