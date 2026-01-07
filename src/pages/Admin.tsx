import { useState } from 'react';
import { Gamepad2, MessageSquare, BarChart3, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminGamesTab } from '@/components/admin/AdminGamesTab';
import { AdminRequestsTab } from '@/components/admin/AdminRequestsTab';
import { AdminStatsTab } from '@/components/admin/AdminStatsTab';
import { GameFormDialog } from '@/components/admin/GameFormDialog';

export default function Admin() {
  const [gameDialogOpen, setGameDialogOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage games, requests, and more</p>
            </div>
            <Button onClick={() => setGameDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Game
            </Button>
          </div>

          <Tabs defaultValue="games" className="space-y-6">
            <TabsList>
              <TabsTrigger value="games" className="gap-2">
                <Gamepad2 className="w-4 h-4" />
                Games
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Requests
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="games">
              <AdminGamesTab onAddGame={() => setGameDialogOpen(true)} />
            </TabsContent>

            <TabsContent value="requests">
              <AdminRequestsTab />
            </TabsContent>

            <TabsContent value="stats">
              <AdminStatsTab />
            </TabsContent>
          </Tabs>
        </main>

        <GameFormDialog open={gameDialogOpen} onOpenChange={setGameDialogOpen} />
      </div>
    </AdminLayout>
  );
}
