import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/stores/appStore"
import type { League } from "@/types/pokemon"

const leagueConfig = {
  great: {
    label: 'Great League',
    maxCP: 1500,
    color: 'bg-green-600',
    description: 'CP máximo 1500'
  },
  ultra: {
    label: 'Ultra League', 
    maxCP: 2500,
    color: 'bg-blue-600',
    description: 'CP máximo 2500'
  },
  master: {
    label: 'Master League',
    maxCP: null,
    color: 'bg-purple-600', 
    description: 'Sem limite de CP'
  }
} as const;

export function LeagueSelector() {
  const { defaultLeague, setDefaultLeague } = useAppStore();

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-muted-foreground">Liga Ativa</div>
      <div className="flex gap-2">
        {(Object.keys(leagueConfig) as League[]).map((league) => {
          const config = leagueConfig[league];
          const isActive = defaultLeague === league;
          
          return (
            <Button
              key={league}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setDefaultLeague(league)}
              className="flex-1 text-xs"
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${config.color}`}
                  />
                  {config.label}
                </div>
                {isActive && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {config.description}
                  </Badge>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
