import { Gamepad2, Download, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGames } from '@/hooks/useGames';
import { useGameRequests } from '@/hooks/useGameRequests';

export function AdminStatsTab() {
  const { data: games } = useGames();
  const { data: requests } = useGameRequests();

  const totalGames = games?.length || 0;
  const totalDownloads = games?.reduce((sum, g) => sum + (g.download_count || 0), 0) || 0;
  const pendingRequests = requests?.filter((r) => r.status === 'pending').length || 0;
  const featuredGames = games?.filter((g) => g.is_featured).length || 0;

  const stats = [
    {
      title: 'Total Games',
      value: totalGames,
      icon: Gamepad2,
      description: `${featuredGames} featured`,
    },
    {
      title: 'Total Downloads',
      value: totalDownloads.toLocaleString(),
      icon: Download,
      description: 'All time',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      icon: MessageSquare,
      description: `${requests?.length || 0} total requests`,
    },
    {
      title: 'Avg Downloads',
      value: totalGames ? Math.round(totalDownloads / totalGames) : 0,
      icon: TrendingUp,
      description: 'Per game',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
