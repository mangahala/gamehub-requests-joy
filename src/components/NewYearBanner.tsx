import { useState, useEffect } from 'react';
import { Sparkles, Gift, PartyPopper } from 'lucide-react';

export function NewYearBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-01-31T23:59:59');
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-accent/20 to-neon-pink/20 border-b border-border/50">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Sparkles className="absolute top-2 left-[10%] w-4 h-4 text-primary animate-pulse" />
        <Gift className="absolute top-3 left-[30%] w-5 h-5 text-accent animate-float" />
        <PartyPopper className="absolute top-2 right-[25%] w-4 h-4 text-neon-pink animate-pulse" />
        <Sparkles className="absolute top-3 right-[10%] w-5 h-5 text-primary animate-float" />
      </div>

      <div className="container py-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎊</span>
            <h3 className="font-orbitron text-lg md:text-xl font-bold bg-gradient-to-r from-primary via-accent to-neon-pink bg-clip-text text-transparent">
              New Year Sale!
            </h3>
            <span className="text-2xl">🎉</span>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-sm text-muted-foreground">Ends in:</span>
            <div className="flex gap-1 md:gap-2">
              <TimeBlock value={timeLeft.days} label="D" />
              <span className="text-primary font-bold self-center">:</span>
              <TimeBlock value={timeLeft.hours} label="H" />
              <span className="text-primary font-bold self-center">:</span>
              <TimeBlock value={timeLeft.minutes} label="M" />
              <span className="text-primary font-bold self-center">:</span>
              <TimeBlock value={timeLeft.seconds} label="S" />
            </div>
          </div>

          {/* Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
            <span className="text-sm font-rajdhani text-primary">❄️ Winter Rewards Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-secondary/80 border border-border rounded-md px-2 py-1 min-w-[40px] text-center">
        <span className="font-orbitron text-lg font-bold text-foreground">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}
