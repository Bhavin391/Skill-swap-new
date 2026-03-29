'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Plus, X, Sparkles, TrendingUp, Edit2, MessageSquare, Users, Zap } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/header'
import { apiClient } from '@/lib/api-client'

interface SkillData {
  skills_offering: string[]
  skills_learning: string[]
}

export default function DashboardPage() {
  const [skillData, setSkillData] = useState<SkillData>({
    skills_offering: [],
    skills_learning: [],
  })
  const [newOffering, setNewOffering] = useState('')
  const [newLearning, setNewLearning] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await apiClient.get('/api/users/me')
        if (data.user) {
          setSkillData({
            skills_offering: data.user.skills_offering || [],
            skills_learning: data.user.skills_learning || [],
          })
        }
      } catch (err) {
        console.error('[v0] Error loading skills:', err)
      }
    }
    loadSkills()
  }, [])

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
        {/* Header */}
        <div className="mb-12 animate-slide-down">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">Manage Your Learning Profile</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-3">Your Skills Hub</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">Master your learning journey. Add skills you teach, skills you want to learn, and connect with perfect learning partners.</p>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Skills Teaching', value: skillData.skills_offering.length, icon: TrendingUp, color: 'from-primary/20 to-blue-500/20' },
            { label: 'Skills Learning', value: skillData.skills_learning.length, icon: Users, color: 'from-accent/20 to-purple-500/20' },
            { label: 'Active Matches', value: '—', icon: MessageSquare, color: 'from-green-500/20 to-emerald-500/20' },
            { label: 'Messages', value: '0', icon: Zap, color: 'from-yellow-500/20 to-orange-500/20' }
          ].map((stat, i) => (
            <Card key={i} className="p-6 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 hover:border-primary/40 backdrop-blur-sm animate-fade-scale group" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Tabbed Sections */}
        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="grid w-full md:grid-cols-4 bg-card/50 border border-primary/10 p-1 mb-8">
            <TabsTrigger value="skills" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Manage Skills</TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Your Matches</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Messages</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Settings</TabsTrigger>
          </TabsList>

          {/* Manage Skills Tab */}
          <TabsContent value="skills" className="space-y-8">
        {/* Skills Section */}
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
                    className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-blue-500/10 px-4 py-3 rounded-lg border border-primary/20 hover:border-primary/50 transition-all duration-200 animate-in fade-in slide-in-from-left"
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
                    className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-blue-500/10 px-4 py-3 rounded-lg border border-primary/20 hover:border-primary/50 transition-all duration-200 animate-in fade-in slide-in-from-right"
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
                className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 px-10 py-6 text-lg group disabled:opacity-70"
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
          </TabsContent>

          {/* Your Matches Tab */}
          <TabsContent value="matches" className="space-y-8">
            <div className="grid gap-6">
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No matches yet</h3>
                <p className="text-muted-foreground mb-6">Save your skills to find compatible learning partners</p>
                <Link href="/matches">
                  <Button className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    View All Matches
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-8">
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No messages yet</h3>
              <p className="text-muted-foreground mb-6">Start a conversation with your learning matches</p>
              <Link href="/chat">
                <Button className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Messages
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-8">
            <Card className="p-8 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10">
              <h3 className="text-2xl font-bold text-foreground mb-6">Account Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">Privacy</label>
                  <p className="text-sm text-muted-foreground">Manage who can see your profile and skills</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">Notifications</label>
                  <p className="text-sm text-muted-foreground">Get updates about matches and messages</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">Learning Goals</label>
                  <p className="text-sm text-muted-foreground">Set your learning targets and track progress</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
    </>
  )
}
