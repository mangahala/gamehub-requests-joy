import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Shield, LogOut, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameRequestModal } from './GameRequestModal';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Gamepad2 className="w-8 h-8 text-primary group-hover:animate-pulse-glow transition-all" />
          <span className="font-orbitron font-bold text-xl tracking-tight">
            Game<span className="text-primary">Vault</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-4">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/games">
              <Images className="w-4 h-4" />
              <span className="hidden sm:inline">Games</span>
            </Link>
          </Button>
          
          <GameRequestModal />
          
          {isAdmin && !isAdminRoute && (
            <Button asChild variant="ghost" className="gap-2">
              <Link to="/admin">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          )}

          {isAdminRoute && (
            <Button asChild variant="ghost">
              <Link to="/">Home</Link>
            </Button>
          )}

          {user ? (
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          ) : (
            <Button asChild variant="ghost">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
