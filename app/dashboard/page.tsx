'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Plus, X, Sparkles, TrendingUp, Edit2, MessageSquare, Users, Zap, ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { apiClient } from '@/lib/api-client'

interface SkillData {
  skills_offering: string[]
  skills_learning: string[]
  verified_skills?: string[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [skillData, setSkillData] = useState<SkillData>({
    skills_offering: [],
    skills_learning: [],
    verified_skills: [],
  })
  const [newOffering, setNewOffering] = useState('')
  const [newLearning, setNewLearning] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  // AI Verification State
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [verifyingSkill, setVerifyingSkill] = useState('')
  const [quizData, setQuizData] = useState<any>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [quizError, setQuizError] = useState<string | null>(null)
  const [quizResult, setQuizResult] = useState<'pass' | 'fail' | null>(null)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

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
            verified_skills: data.user.verified_skills || [],
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

  const startVerification = async (skill: string) => {
    setVerifyingSkill(skill)
    setQuizModalOpen(true)
    setIsGeneratingQuiz(true)
    setQuizData(null)
    setQuizError(null)
    setQuizResult(null)
    setSelectedAnswers({})

    try {
      const response = await apiClient.post('/api/ai/quiz', { skill }, { timeout: 20000 })
      setQuizData(response)
    } catch (err: any) {
      setQuizError(err.message || 'Failed to generate quiz')
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  const submitQuiz = async () => {
    if (!quizData) return;
    setIsVerifying(true);
    let score = 0;
    quizData.questions.forEach((q: any, i: number) => {
      if (selectedAnswers[i] === q.correctIndex) score++;
    });

    if (score >= 2) {
      setQuizResult('pass');
      try {
         await apiClient.put('/api/users/me/skills/verify', { skill: verifyingSkill });
         setSkillData(prev => ({ ...prev, verified_skills: [...(prev.verified_skills || []), verifyingSkill] }));
      } catch (e) {
         console.error(e);
      }
    } else {
      setQuizResult('fail');
    }
    setIsVerifying(false);
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
                    className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-blue-500/10 px-4 py-3 rounded-lg border border-primary/20 hover:border-primary/50 transition-all duration-200 animate-in fade-in slide-in-from-left"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                       <span className="text-foreground font-medium">{skill}</span>
                       {(skillData.verified_skills || []).includes(skill) ? (
                         <span className="bg-blue-500/20 text-blue-500 text-[10px] px-2 py-0.5 rounded-full flex items-center font-bold" title="AI Verified Expert">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                         </span>
                       ) : (
                         <button onClick={() => startVerification(skill)} className="text-[10px] px-2 py-0.5 bg-secondary/80 text-muted-foreground hover:bg-primary hover:text-primary-foreground rounded-full transition-colors flex items-center">
                            Verify Skill
                         </button>
                       )}
                    </div>
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

      {/* AI Verification Quiz Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl relative">
            <button onClick={() => setQuizModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                 <ShieldCheck className="w-6 h-6 text-primary" />
                 Verify Skill: <span className="text-primary">{verifyingSkill}</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Pass this AI-generated quiz to earn your verified badge and stand out!</p>
            </div>
            
            <div className="p-6">
              {isGeneratingQuiz ? (
                 <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse text-lg">AI is generating a unique 3-question test...</p>
                 </div>
              ) : quizError ? (
                 <div className="py-12 text-center space-y-4">
                    <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
                    <p className="text-destructive font-semibold text-lg">{quizError}</p>
                 </div>
              ) : quizResult === 'pass' ? (
                 <div className="py-12 text-center space-y-4 animate-in zoom-in">
                    <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
                    <h3 className="text-3xl font-bold text-foreground">Verification Passed!</h3>
                    <p className="text-muted-foreground text-lg">You are now a Verified Expert in {verifyingSkill}. Matching rates drastically increase for verified users.</p>
                    <Button onClick={() => setQuizModalOpen(false)} size="lg" className="mt-4 px-10">Awesome!</Button>
                 </div>
              ) : quizResult === 'fail' ? (
                 <div className="py-12 text-center space-y-4 animate-in zoom-in">
                    <XCircle className="w-24 h-24 text-destructive mx-auto" />
                    <h3 className="text-3xl font-bold text-foreground">Not quite there.</h3>
                    <p className="text-muted-foreground text-lg" >You didn't pass this time. Brush up on your {verifyingSkill} skills and try again!</p>
                    <Button onClick={() => setQuizModalOpen(false)} variant="outline" size="lg" className="mt-4 px-10">Close</Button>
                 </div>
              ) : quizData ? (
                 <div className="space-y-8 animate-in slide-in-from-bottom-4 cursor-default">
                    {quizData.questions.map((q: any, i: number) => (
                      <div key={i} className="space-y-4">
                        <p className="text-lg font-semibold text-foreground"><span className="text-primary mr-2 font-black">{i+1}.</span> {q.question}</p>
                        <div className="space-y-3 pl-6">
                           {q.options.map((opt: string, optIdx: number) => (
                             <label key={optIdx} className={`flex items-start gap-3 p-4 rounded-xl border-2 ${selectedAnswers[i] === optIdx ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'} cursor-pointer transition-all`}>
                                <input type="radio" name={`q${i}`} checked={selectedAnswers[i] === optIdx} onChange={() => setSelectedAnswers(prev => ({...prev, [i]: optIdx}))} className="hidden" />
                                <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedAnswers[i] === optIdx ? 'border-primary' : 'border-muted-foreground'}`}>
                                   {selectedAnswers[i] === optIdx && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <span className="text-base text-foreground leading-snug">{opt}</span>
                             </label>
                           ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-6 mt-8 border-t border-border flex justify-end">
                       <Button onClick={submitQuiz} disabled={Object.keys(selectedAnswers).length < 3 || isVerifying} size="lg" className="w-full sm:w-auto px-10 py-6 text-lg">
                         {isVerifying ? 'Evaluating...' : 'Submit Answers'}
                       </Button>
                    </div>
                 </div>
              ) : null}
            </div>
          </Card>
        </div>
      )}

    </>
  )
}