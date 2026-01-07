import { DollarSign, Share2, Users, TrendingUp, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export function EarnMoneySection() {
  const handleJoinProgram = () => {
    // In a real implementation, this would open a signup modal or redirect to Gofile
    toast.info('Earn money by sharing game download links! Feature coming soon.');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-4">
            <DollarSign className="w-5 h-5" />
            <span className="font-orbitron font-bold">PLUS</span>
          </div>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            Earn Money by Sharing Games
          </h2>
          <p className="text-muted-foreground text-lg font-rajdhani max-w-2xl mx-auto">
            Join our affiliate program and earn real money for every download through your shared links. 
            Powered by Gofile's revenue sharing system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-orbitron font-bold text-lg mb-2">1. Share Links</h3>
              <p className="text-muted-foreground font-rajdhani text-sm">
                Get your unique affiliate link for any game and share it on social media, forums, or with friends.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-orbitron font-bold text-lg mb-2">2. People Download</h3>
              <p className="text-muted-foreground font-rajdhani text-sm">
                When someone clicks your link and downloads the game, you earn credit for that referral.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-warning" />
              </div>
              <h3 className="font-orbitron font-bold text-lg mb-2">3. Get Paid</h3>
              <p className="text-muted-foreground font-rajdhani text-sm">
                Accumulate earnings and withdraw to your preferred payment method. No minimum threshold!
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleJoinProgram}
            className="neon-glow gap-2 font-rajdhani text-lg px-8"
          >
            <LinkIcon className="w-5 h-5" />
            Start Earning Today
          </Button>
          <p className="text-muted-foreground text-sm mt-4 font-rajdhani">
            Free to join • No experience needed • Instant link generation
          </p>
        </div>
      </div>
    </section>
  );
}
