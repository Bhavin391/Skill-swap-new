'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Plus, X, Sparkles, TrendingUp, Edit2, MessageSquare, Users, Zap, AlertCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { apiClient } from '@/lib/api-client'

interface SkillData {
  skills_offering: string[]
  skills_learning: string[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [skillData, setSkillData] = useState<SkillData>({
    skills_offering: [],
    skills_learning: [],
  })
  const [newOffering, setNewOffering] = useState('')
  const [newLearning, setNewLearning] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check for token first
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        
        if (!token) {
          console.warn('[v0] No authentication token found - redirecting to login')
          router.push('/login')
          return
        }

        const data = await apiClient.get('/api/users/me')
        if (data.user) {
          setSkillData({
            skills_offering: data.user.skills_offering || [],
            skills_learning: data.user.skills_learning || [],
          })
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to load user data'
        console.error('[v0] Error loading skills:', err)
        
        // If user not found or unauthorized, redirect to login
        if (errorMsg.includes('User not found') || errorMsg.includes('Unauthorized')) {
          console.error('[v0] User authentication failed - redirecting to login')
          localStorage.removeItem('token')
          router.push('/login')
        } else {
          setError(errorMsg)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [router])

  useEffect(() => {
    const loadMatchCount = async () => {
      try {
        const data = await apiClient.get('/api/matches')
        setMatchCount(data.matches?.length || 0)
      } catch (err) {
        console.error('[v0] Error loading matches:', err)
      }
    }

    const loadMessageCount = async () => {
      try {
        const data = await apiClient.get('/api/chats')
        const unreadCount = data.chats?.reduce((sum: number, chat: any) => sum + (chat.unread_count || 0), 0) || 0
        setMessageCount(unreadCount)
      } catch (err) {
        console.error('[v0] Error loading messages:', err)
      }
    }

    if (skillData.skills_offering.length > 0) {
      loadMatchCount()
      loadMessageCount()
    }
  }, [skillData.skills_offering])

  const addOffering = () => {
    if (newOffering.trim() && !skillData.skills_offering.includes(newOffering)) {
      setSkillData(prev => ({
        ...prev,
        skills_offering: [...prev.skills_offering, newOffering],
      }))
      setNewOffering('')
    }
  }

  const addLearning = () => {
    if (newLearning.trim() && !skillData.skills_learning.includes(newLearning)) {
      setSkillData(prev => ({
        ...prev,
        skills_learning: [...prev.skills_learning, newLearning],
      }))
      setNewLearning('')
    }
  }

  const removeOffering = (skill: string) => {
    setSkillData(prev => ({
      ...prev,
      skills_offering: prev.skills_offering.filter(s => s !== skill),
    }))
  }

  const removeLearning = (skill: string) => {
    setSkillData(prev => ({
      ...prev,
      skills_learning: prev.skills_learning.filter(s => s !== skill),
    }))
  }

  const saveSkills = async () => {
    setIsSaving(true)
    try {
      await apiClient.put('/api/users/me/skills', skillData)
      console.log('[v0] Skills saved successfully')
    } catch (err) {
      console.error('[v0] Error saving skills:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-12">
          <div className="max-w-2xl mx-auto px-6">
            <Card className="p-8 bg-destructive/10 border border-destructive/30">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
                  <p className="text-destructive/80 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </>
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

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Dashboard Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Skills Teaching', value: skillData.skills_offering.length, icon: TrendingUp, color: 'from-primary/20 to-blue-500/20' },
              { label: 'Skills Learning', value: skillData.skills_learning.length, icon: Users, color: 'from-accent/20 to-purple-500/20' },
              { label: 'Active Matches', value: matchCount, icon: MessageSquare, color: 'from-green-500/20 to-emerald-500/20' },
              { label: 'Unread Messages', value: messageCount, icon: Zap, color: 'from-yellow-500/20 to-orange-500/20' }
            ].map((stat, i) => (
              <Card key={i} className="p-6 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 hover:border-primary/40 backdrop-blur-sm animate-fade-scale group" style={{ animation: `fadeScale 0.5s ease-out ${i * 0.1}s both` }}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>  
                  <stat.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </Card>
            ))}
          </div>

          <div className="space-y-8">
            {/* Manage Your Skills */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Can Teach */}
              <Card className="p-8 bg-card border-border/50 hover:border-primary/30 transition-all duration-300 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Can Teach</h2>
                    <p className="text-sm text-muted-foreground">Skills you can share</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Python, Guitar, Design..."
                      value={newOffering}
                      onChange={e => setNewOffering(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addOffering()}
                      className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={addOffering}
                      className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {skillData.skills_offering.map((skill, i) => (
                      <div
                        key={skill}
                        className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-blue-500/10 px-4 py-3 rounded-lg border border-primary/20 hover:border-primary/50 transition-all"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <span className="text-foreground font-medium">{skill}</span>
                        <button
                          onClick={() => removeOffering(skill)}
                          className="text-muted-foreground hover:text-destructive transition-colors duration-200 hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Want to Learn */}
              <Card className="p-8 bg-card border-border/50 hover:border-primary/30 transition-all duration-300 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Want to Learn</h2>
                    <p className="text-sm text-muted-foreground">Skills you'd like to acquire</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., JavaScript, Yoga, Marketing..."
                      value={newLearning}
                      onChange={e => setNewLearning(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addLearning()}
                      className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={addLearning}
                      className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {skillData.skills_learning.map((skill, i) => (
                      <div
                        key={skill}
                        className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-blue-500/10 px-4 py-3 rounded-lg border border-primary/20 hover:border-primary/50 transition-all"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <span className="text-foreground font-medium">{skill}</span>
                        <button
                          onClick={() => removeLearning(skill)}
                          className="text-muted-foreground hover:text-destructive transition-colors duration-200 hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-center">
              <Button
                onClick={saveSkills}
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 px-10 py-6 text-lg group disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Saving Skills...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                    Save Skills & Find Matches
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}