'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { MessageSquare, Star, Users, Sparkles, Filter, TrendingUp, Bot } from 'lucide-react'
import { Header } from '@/components/header'
import { apiClient } from '@/lib/api-client'

interface Match {
  _id: string
  name: string
  email: string
  skills_offering: string[]
  skills_learning: string[]
  match_score: number
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [initiatingChat, setInitiatingChat] = useState<string | null>(null)
  const [currentUserSkills, setCurrentUserSkills] = useState<{offering: string[], learning: string[]} | null>(null)
  const [analyzingMatch, setAnalyzingMatch] = useState<string | null>(null)
  const [synergies, setSynergies] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    setIsLoading(true)
    try {
      console.log('[v0] Loading matches...')
      const userRes = await apiClient.get('/api/users/me')
      setCurrentUserSkills({
        offering: userRes.user.skills_offering || [],
        learning: userRes.user.skills_learning || []
      })

      const data = await apiClient.get('/api/matches')
      console.log('[v0] Matches loaded:', data.matches?.length || 0)
      setMatches(data.matches || [])
      setError('')
    } catch (err: any) {
      console.error('[v0] Error loading matches:', err)
      setError(err.message || 'Error loading matches')
    } finally {
      setIsLoading(false)
    }
  }

  const initiateChatWithMatch = async (userId: string) => {
    setInitiatingChat(userId)
    try {
      console.log('[v0] Initiating chat with user:', userId)
      const data = await apiClient.post(`/api/chats/init/${userId}`)
      console.log('[v0] Chat initiated, chat_id:', data.chat_id)
      router.push(`/chat/${data.chat_id}`)
    } catch (err: any) {
      console.error('[v0] Error initiating chat:', err)
      setError(err.message || 'Error starting chat')
    } finally {
      setInitiatingChat(null)
    }
  }

  const analyzeSynergy = async (matchId: string, matchName: string, matchOffering: string[], matchLearning: string[]) => {
    if (!currentUserSkills) return;
    setAnalyzingMatch(matchId)
    try {
      const response = await apiClient.post('/api/ai/synergy', { 
        myOffering: currentUserSkills.offering,
        myLearning: currentUserSkills.learning,
        matchName,
        matchOffering,
        matchLearning
      }, { timeout: 20000 })
      setSynergies(prev => ({ ...prev, [matchId]: response.synergy }))
    } catch (err: any) {
      console.error(err)
      setSynergies(prev => ({ ...prev, [matchId]: err.message || 'Failed to generate synergy analysis.' }))
    } finally {
      setAnalyzingMatch(null)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-12">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-muted-foreground font-medium">Finding your perfect matches...</p>
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

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 animate-slide-down">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm mb-6">
            <Users className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">Perfect Learning Partners</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-foreground mb-3">Your Matches</h1>
              <p className="text-lg text-muted-foreground">Found <span className="text-primary font-bold">{matches.length}</span> {matches.length === 1 ? 'match' : 'matches'} based on skill compatibility</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-2 border-foreground/20 hover:border-foreground/40">
                <TrendingUp className="w-4 h-4 mr-2" />
                Update Skills
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-6 py-4 rounded-lg mb-8 backdrop-blur-sm animate-slide-up">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {matches.length === 0 ? (
          <Card className="p-16 text-center bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 backdrop-blur-sm animate-fade-scale">
            <Users className="w-20 h-20 text-primary/30 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-3">No Matches Yet</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">Add more skills to your profile and we'll find your perfect learning partners from our global community.</p>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all px-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Your Profile
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, idx) => (
            <Card
              key={match._id}
              className="relative p-8 bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 hover:border-primary/40 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group overflow-hidden animate-fade-scale"
              style={{ animationDelay: `${0.1 * idx}s` }}
            >
              {/* Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col h-full">
                {/* Match Score Badge */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 rounded-full border border-primary/20 group-hover:scale-110 transition-transform">
                  <div className="flex items-center gap-1">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(match.match_score / 20)
                              ? 'fill-primary text-primary'
                              : 'text-border'
                          }`}
                        />
                      ))}
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {Math.round(match.match_score)}%
                  </span>
                </div>

                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-1">{match.name}</h3>
                  <p className="text-sm text-muted-foreground">{match.email}</p>
                </div>

                {/* Skills They Offer */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Can Teach</p>
                  <div className="flex flex-wrap gap-2">
                    {match.skills_offering.slice(0, 2).map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-2 bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary text-xs font-semibold rounded-lg border border-primary/20 hover:border-primary/40 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                    {match.skills_offering.length > 2 && (
                      <span className="px-3 py-2 bg-muted/50 text-muted-foreground text-xs font-semibold rounded-lg">
                        +{match.skills_offering.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills They Want */}
                <div className="mb-8">
                  <p className="text-xs font-bold text-accent uppercase tracking-wider mb-3">Wants to Learn</p>
                  <div className="flex flex-wrap gap-2">
                    {match.skills_learning.slice(0, 2).map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-2 bg-gradient-to-r from-accent/20 to-purple-500/20 text-accent text-xs font-semibold rounded-lg border border-accent/20 hover:border-accent/40 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                    {match.skills_learning.length > 2 && (
                      <span className="px-3 py-2 bg-muted/50 text-muted-foreground text-xs font-semibold rounded-lg">
                        +{match.skills_learning.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Synergy Analysis */}
                <div className="mb-6 mt-2 border-t border-border/50 pt-5">
                   {synergies[match._id] ? (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 animate-in fade-in slide-in-from-top-2 relative shadow-inner">
                         <div className="absolute -top-3 -left-2 rotate-12">
                            <Sparkles className="w-7 h-7 text-yellow-500 fill-yellow-500/20 drop-shadow-md" />
                         </div>
                         <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                           <Bot className="w-5 h-5" /> AI Match Analysis
                         </h4>
                         <p className="text-sm text-foreground/90 leading-relaxed italic font-medium">"{synergies[match._id]}"</p>
                      </div>
                   ) : (
                      <Button 
                         variant="secondary" 
                         size="sm" 
                         className="w-full text-sm font-bold bg-secondary/30 hover:bg-primary/20 hover:text-primary transition-all py-5 border border-secondary"
                         disabled={analyzingMatch === match._id}
                         onClick={() => analyzeSynergy(match._id, match.name, match.skills_offering, match.skills_learning)}
                      >
                         {analyzingMatch === match._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2"></div>
                              Analyzing compatibility...
                            </>
                         ) : (
                            <>
                              <Bot className="w-4 h-4 mr-2 text-primary group-hover/btn:animate-pulse" />
                              Why are we a match?
                            </>
                         )}
                      </Button>
                   )}
                </div>

                {/* Message Button */}
                <div className="mt-auto">
                  <Button 
                    onClick={() => initiateChatWithMatch(match._id)}
                    disabled={initiatingChat === match._id}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 group/btn py-6 font-semibold"
                  >
                    {initiatingChat === match._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                        Starting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                        Connect & Learn
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </main>
    </>
  )
}
