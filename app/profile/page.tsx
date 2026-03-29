'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { User, Mail, Edit2, Sparkles, Award, TrendingUp, Users } from 'lucide-react'
import { Header } from '@/components/header'
import { apiClient } from '@/lib/api-client'

interface UserProfile {
  _id: string
  name: string
  email: string
  skills_offering: string[]
  skills_learning: string[]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await apiClient.get('/api/users/me')
      setProfile(data.user)
    } catch (err) {
      console.error('[v0] Error loading profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !profile) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-12">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-muted-foreground font-medium">Loading your profile...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-12">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 animate-slide-down">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm mb-6">
            <Award className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">Your Learning Profile</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-3">Welcome, {profile.name}</h1>
          <p className="text-lg text-muted-foreground">Manage your learning journey and share your expertise</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-8 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 animate-fade-scale group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm mb-1">Skills Teaching</p>
            <p className="text-4xl font-bold text-foreground">{profile.skills_offering.length}</p>
          </Card>
          
          <Card className="p-8 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 animate-fade-scale group" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <p className="text-muted-foreground text-sm mb-1">Skills Learning</p>
            <p className="text-4xl font-bold text-foreground">{profile.skills_learning.length}</p>
          </Card>
          
          <Card className="p-8 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 animate-fade-scale group" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-muted-foreground text-sm mb-1">Profile Completion</p>
            <p className="text-4xl font-bold text-foreground">
              {(((profile.skills_offering.length + profile.skills_learning.length) / 10) * 100).toFixed(0)}%
            </p>
          </Card>
        </div>

        {/* Personal Information */}
        <Card className="p-10 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 mb-8 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Personal Information</h2>
            <Link href="/dashboard">
              <Button size="sm" variant="outline" className="border-2 border-foreground/20">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">{profile.name}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <p className="text-lg font-semibold text-foreground">{profile.email}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Skills Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Can Teach */}
          <Card className="p-10 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 backdrop-blur-sm animate-slide-up group" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">Expertise</p>
                <h3 className="text-2xl font-bold text-foreground">Skills You Know</h3>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              {profile.skills_offering.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No skills added yet</p>
                  <Link href="/dashboard">
                    <Button size="sm" className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Add Skills
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills_offering.map(skill => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary text-sm font-semibold rounded-lg border border-primary/20 hover:border-primary/40 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="w-full border-primary/20 hover:border-primary/40 mt-4">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Skills
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </Card>

          {/* Want to Learn */}
          <Card className="p-10 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 backdrop-blur-sm animate-slide-up group" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-accent uppercase tracking-wider">Growth</p>
                <h3 className="text-2xl font-bold text-foreground">Want to Learn</h3>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              {profile.skills_learning.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No learning goals yet</p>
                  <Link href="/dashboard">
                    <Button size="sm" className="bg-gradient-to-r from-accent to-purple-600 text-primary-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      Add Learning Goals
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills_learning.map(skill => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-gradient-to-r from-accent/20 to-purple-500/20 text-accent text-sm font-semibold rounded-lg border border-accent/20 hover:border-accent/40 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="w-full border-accent/20 hover:border-accent/40 mt-4">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Goals
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
    </>
  )
}
