import { useState } from 'react';
import { Video, Youtube, Twitter, Instagram, Gift, CheckCircle, Send, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function ContentRewardsSection() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    youtube: '',
    twitter: '',
    instagram: '',
    tiktok: '',
    videoUrl: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would save to database
    toast.success('Application submitted! We will review your content and get back to you.');
    setOpen(false);
    setFormData({ youtube: '', twitter: '', instagram: '', tiktok: '', videoUrl: '', description: '' });
  };

  const rewards = [
    { tier: 'Bronze', views: '1K-10K', reward: '$5', color: 'text-orange-400' },
    { tier: 'Silver', views: '10K-50K', reward: '$25', color: 'text-gray-400' },
    { tier: 'Gold', views: '50K-100K', reward: '$50', color: 'text-yellow-400' },
    { tier: 'Diamond', views: '100K+', reward: '$100+', color: 'text-cyan-400' },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-accent/10 via-background to-primary/10">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent mb-4">
            <Video className="w-5 h-5" />
            <span className="font-orbitron font-bold">CONTENT REWARDS</span>
          </div>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            Create Content, Earn Rewards
          </h2>
          <p className="text-muted-foreground text-lg font-rajdhani max-w-2xl mx-auto">
            Make videos about GameVault on YouTube, TikTok, or other platforms and earn real money based on your views!
          </p>
        </div>

        {/* Reward Tiers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {rewards.map((reward) => (
            <Card key={reward.tier} className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardContent className="p-6">
                <Gift className={`w-8 h-8 mx-auto mb-2 ${reward.color}`} />
                <h3 className={`font-orbitron font-bold ${reward.color}`}>{reward.tier}</h3>
                <p className="text-sm text-muted-foreground font-rajdhani">{reward.views} views</p>
                <p className="text-2xl font-bold font-orbitron mt-2">{reward.reward}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Youtube className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-orbitron font-bold text-lg mb-2">1. Create Video</h3>
              <p className="text-muted-foreground font-rajdhani text-sm">
                Make a video showcasing GameVault, reviewing games, or tutorials. Be creative!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="font-orbitron font-bold text-lg mb-2">2. Submit Link</h3>
              <p className="text-muted-foreground font-rajdhani text-sm">
                Add your social media profiles and submit your video link for review.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="font-orbitron font-bold text-lg mb-2">3. Get Rewarded</h3>
              <p className="text-muted-foreground font-rajdhani text-sm">
                Once verified, receive your reward based on video views and engagement.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="neon-glow gap-2 font-rajdhani text-lg px-8">
                <Video className="w-5 h-5" />
                Submit Your Content
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-orbitron">Content Rewards Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube" className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      YouTube
                    </Label>
                    <Input
                      id="youtube"
                      placeholder="@yourchannel"
                      value={formData.youtube}
                      onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      Twitter/X
                    </Label>
                    <Input
                      id="twitter"
                      placeholder="@yourhandle"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      placeholder="@yourprofile"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      placeholder="@yourtiktok"
                      value={formData.tiktok}
                      onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Video URL *
                  </Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Tell us about your content</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your video and why you made it..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Submit Application
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <p className="text-muted-foreground text-sm mt-4 font-rajdhani">
            Minimum 1,000 views required • Any platform accepted • Paid within 7 days
          </p>
        </div>
      </div>
    </section>
  );
}