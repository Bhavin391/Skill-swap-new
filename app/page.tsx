'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles, Users, MessageSquare, TrendingUp, Zap, Shield } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-32 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm animate-slide-down">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">Peer-to-Peer Learning Evolved</span>
          </div>

          {/* Main Heading with Animation */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-tight tracking-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="block">Exchange Skills.</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-soft">Grow Forever.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Connect with brilliant peers worldwide. Learn what matters. Teach what you know. Build lasting relationships through genuine skill exchange.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/signup">
              <Button size="lg" className="relative group bg-primary text-primary-foreground hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500 px-10 py-6 text-base font-semibold overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-5 h-5 group-hover:animate-pulse" />
                  Start Free Today
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-2 border-foreground/20 text-foreground hover:bg-foreground/5 hover:border-foreground/40 transition-all duration-300 px-10 py-6 text-base font-semibold">
                Already a Member
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid with Staggered Animation */}
        <div className="grid md:grid-cols-3 gap-6 mt-28">
          {[
            {
              icon: Users,
              title: 'Smart Matching',
              desc: 'AI finds your perfect learning partner based on complementary skills and growth goals.',
              delay: 0.4
            },
            {
              icon: MessageSquare,
              title: 'Real-Time Connection',
              desc: 'Seamless messaging with read receipts to coordinate and collaborate instantly.',
              delay: 0.5
            },
            {
              icon: TrendingUp,
              title: 'Track Your Growth',
              desc: 'Monitor progress, celebrate wins, and stay motivated on your learning journey.',
              delay: 0.6
            }
          ].map((feature, i) => (
            <Card 
              key={i}
              className="relative p-8 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 hover:border-primary/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group overflow-hidden animate-fade-scale"
              style={{ animationDelay: `${feature.delay}s` }}
            >
              {/* Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-3 text-lg">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section (Premium Style) */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Active Learners' },
              { value: '500+', label: 'Skills Shared' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '25K+', label: 'Connections Made' }
            ].map((stat, i) => (
              <div key={i} className="space-y-2 animate-fade-scale" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
                <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Premium CTA Section */}
      <section className="relative px-6 py-28 max-w-7xl mx-auto text-center">
        <div className="relative z-10 space-y-8">
          <div className="space-y-5 animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <p className="text-sm font-bold text-primary uppercase tracking-wider">Limited Time Offer</p>
            <h2 className="text-5xl md:text-6xl font-black text-foreground leading-tight">
              Ready to Unlock Your Potential?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join a thriving global community where learning happens peer-to-peer. No boring courses. Just real skills, real people, real growth.
            </p>
          </div>
          <Link href="/signup" className="inline-block animate-slide-up" style={{ animationDelay: '0.9s' }}>
            <Button size="lg" className="relative group bg-primary text-primary-foreground hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 px-12 py-7 text-lg font-bold overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Get Started Free Today
              </span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative border-t border-primary/10 bg-gradient-to-b from-background to-secondary/5 py-12 px-6 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-foreground">SkillSwap</span>
              </div>
              <p className="text-sm text-muted-foreground">Peer-to-peer learning reimagined for the modern world.</p>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-foreground text-sm">Product</p>
              <div className="space-y-2 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Features</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Pricing</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Security</Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-foreground text-sm">Company</p>
              <div className="space-y-2 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors block">About</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Blog</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Careers</Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-foreground text-sm">Legal</p>
              <div className="space-y-2 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Privacy</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Terms</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Contact</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2026 SkillSwap. Built with passion for learning.</p>
            <p className="text-muted-foreground text-xs mt-4 md:mt-0">Premium peer learning platform • Learn anything, teach everything</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
