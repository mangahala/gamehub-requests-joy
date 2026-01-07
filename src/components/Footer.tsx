import { Gamepad2, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 mt-auto">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              Game<span className="text-primary">Vault</span>
            </span>
            <span className="text-muted-foreground text-sm">
              © {new Date().getFullYear()}
            </span>
          </div>
          
          <p className="text-muted-foreground text-sm text-center">
            Your trusted source for game downloads
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
