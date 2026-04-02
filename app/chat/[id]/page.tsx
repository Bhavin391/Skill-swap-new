'use client'

import { useState, useEffect, useRef, use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, Map, Sparkles, AlertCircle, Lightbulb, Bot } from 'lucide-react'

interface SyllabusWeek {
  week: number;
  theme: string;
  userA_teaching: string;
  userB_teaching: string;
  homework: string;
}

interface Syllabus {
  title: string;
  introduction: string;
  weeks: SyllabusWeek[];
}

interface Message {
  _id: string
  sender_id: string
  text: string
  timestamp: string
  seen?: boolean
  read_at?: string | null
}

interface ChatData {
  other_user: {
    name: string
    email: string
    skills_offering: string[]
    skills_learning: string[]
  }
  messages: Message[]
  current_user?: {
    skills_offering: string[]
    skills_learning: string[]
  }
}

export default function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: chatId } = use(params)
  const [chatData, setChatData] = useState<ChatData | null>(null)
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [userId, setUserId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // AI Syllabus State
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [syllabusError, setSyllabusError] = useState<string | null>(null)

  // AI Icebreaker State
  const [icebreakers, setIcebreakers] = useState<string[]>([])
  const [isGeneratingIcebreakers, setIsGeneratingIcebreakers] = useState(false)
  const [icebreakerError, setIcebreakerError] = useState<string | null>(null)

  // AI Rubber Duck State
  const [isAskingDuck, setIsAskingDuck] = useState(false)
  const [duckResponse, setDuckResponse] = useState<string | null>(null)
  const [duckError, setDuckError] = useState<string | null>(null)

  const askRubberDuck = async () => {
    if (!messageText.trim()) return;
    // They are learning what the other user is offering
    const learningSkill = chatData?.other_user?.skills_offering?.[0] || 'a new skill';
    
    setIsAskingDuck(true);
    setDuckError(null);
    setDuckResponse(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/ai/rubber-duck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: learningSkill, question: messageText }),
      });
      const data = await response.json();
      if (!response.ok) {
        setDuckError(data.details || data.error || 'Failed to ask AI');
        return;
      }
      setDuckResponse(data.reply);
    } catch (err: any) {
      setDuckError(err.message || "Network error asking AI");
    } finally {
      setIsAskingDuck(false);
    }
  }

  useEffect(() => {
    loadChat()
    const interval = setInterval(loadChat, 2000)
    return () => clearInterval(interval)
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatData?.messages?.length])

  const markMessagesAsRead = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await fetch(`http://localhost:5000/api/messages/read/${chatId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      console.error('[v0] Error marking messages as read:', err)
    }
  }

  const loadChat = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('No authentication token found')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setChatData(data)
        if (!userId && data.current_user_id) {
          setUserId(data.current_user_id)
        }
        setIsLoading(false)
        setError(null)
        await markMessagesAsRead()
      } else {
        console.error('[v0] Chat response not ok:', response.status)
        setError(`Failed to load chat: ${response.statusText}`)
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('[v0] Error loading chat:', err)
      setError(`Error connecting to server. Retrying...`)
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!messageText.trim() || !userId) {
      console.log('[v0] Cannot send message - missing text or userId')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
        })
      })

      if (response.ok) {
        setMessageText('')
        setError(null)
        await loadChat()
      } else {
        setError(`Failed to send message: ${response.statusText}`)
      }
    } catch (err: any) {
      console.error('[v0] Error sending message:', err)
      setError(`Error sending message. Please try again.`)
    } finally {
      setIsSending(false)
    }
  }

  const generateSyllabus = async () => {
    if (!chatData || chatData.other_user.skills_offering.length === 0 || chatData.other_user.skills_learning.length === 0) {
      setSyllabusError("Need at least one skill offering and learning to generate syllabus.");
      return;
    }
    
    setIsGenerating(true);
    setSyllabusError(null);
    setSyllabus(null);

    // Assume user is teaching what the other user is learning, and vice versa
    const teachingSkill = chatData.other_user.skills_learning[0];
    const learningSkill = chatData.other_user.skills_offering[0];

    try {
      const response = await fetch('http://localhost:5000/api/ai/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teachingSkill, learningSkill }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setSyllabusError(data.details || data.error || 'Failed to generate syllabus');
        return;
      }

      setSyllabus(data);
    } catch (err: any) {
      setSyllabusError(err.message || "Network error generating syllabus.");
    } finally {
      setIsGenerating(false);
    }
  }

  const generateIcebreakers = async () => {
    if (!chatData || !chatData.current_user) return;
    setIsGeneratingIcebreakers(true);
    setIcebreakerError(null);
    setIcebreakers([]);

    try {
      const response = await fetch('http://localhost:5000/api/ai/icebreaker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          myOffering: chatData.current_user.skills_offering,
          myLearning: chatData.current_user.skills_learning,
          matchName: chatData.other_user.name,
          matchOffering: chatData.other_user.skills_offering,
          matchLearning: chatData.other_user.skills_learning
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setIcebreakerError(data.details || data.error || 'Failed to generate icebreakers');
        return;
      }
      setIcebreakers(data.icebreakers || []);
    } catch (err: any) {
      setIcebreakerError(err.message || 'Network error generating icebreakers');
    } finally {
      setIsGeneratingIcebreakers(false);
    }
  }

  if (error && !chatData) {
    return (
      <main className="px-6 py-12 max-w-2xl mx-auto">
        <Card className="p-8 bg-destructive/10 border-destructive/50">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Chat</h2>
          <p className="text-sm text-foreground mb-6">{error}</p>
          <Button 
            onClick={() => {
              setError(null)
              setIsLoading(true)
              loadChat()
            }}
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      </main>
    )
  }

  if (isLoading || !chatData) {
    return (
      <main className="px-6 py-12 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 md:px-6 py-6 md:py-12 max-w-4xl mx-auto min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-background to-pink-100/40 dark:from-indigo-900/20 dark:via-background dark:to-pink-900/20">
      {error && (
        <Card className="p-4 mb-6 bg-destructive/10 border-destructive/50 backdrop-blur-md shadow-sm">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}
      <Card className="bg-background/60 backdrop-blur-2xl border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.03)] flex flex-col h-[calc(100vh-10rem)] md:h-[650px] overflow-hidden rounded-3xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 pointer-events-none" />
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">
            {chatData.other_user.name}
          </h1>
          <p className="text-sm text-muted-foreground">{chatData.other_user.email}</p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden flex flex-col w-full bg-background relative">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {chatData.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <p className="text-muted-foreground mb-6">
                      No messages yet. Start a conversation!
                    </p>
                    
                    {!icebreakers.length && !isGeneratingIcebreakers && (
                       <Button onClick={generateIcebreakers} variant="outline" className="border-primary/50 hover:bg-primary/10 text-primary transition-all">
                          <Lightbulb className="w-4 h-4 mr-2 text-primary" />
                          Break the Ice with AI
                       </Button>
                    )}
                    
                    {isGeneratingIcebreakers && (
                       <div className="flex items-center gap-2 text-primary text-sm animate-pulse">
                         <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                         Generating conversation starters...
                       </div>
                    )}
                    
                    {icebreakerError && (
                       <p className="text-destructive text-sm mt-4 bg-destructive/10 p-2 rounded border border-destructive/20">{icebreakerError}</p>
                    )}
                    
                    {icebreakers.length > 0 && (
                       <div className="w-full max-w-sm mt-4 animate-in fade-in slide-in-from-bottom-4 space-y-2 text-left">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-3 text-center opacity-80">AI Suggestions (Click to use)</p>
                          {icebreakers.map((msg, idx) => (
                             <button
                                key={idx}
                                onClick={() => setMessageText(msg)}
                                className="w-full text-left p-3 rounded-xl text-sm bg-primary/5 hover:bg-primary/15 border border-primary/20 hover:border-primary/50 transition-all text-foreground/90 shadow-sm"
                             >
                                "{msg}"
                             </button>
                          ))}
                       </div>
                    )}
                  </div>
                ) : (
                  chatData.messages.map(msg => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.sender_id === userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-5 py-3 shadow-md animate-in slide-in-from-bottom-2 fade-in duration-300 ${
                          msg.sender_id === userId
                            ? 'bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground rounded-2xl rounded-br-sm'
                            : 'bg-secondary/80 backdrop-blur-md border border-white/10 dark:border-white/5 text-secondary-foreground rounded-2xl rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-xs opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                          {msg.sender_id === userId && (
                            <span className="text-xs opacity-70" title={msg.seen ? 'Seen' : 'Sent'}>
                              {msg.seen ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 md:p-6 border-t border-border/50 bg-background/50 backdrop-blur-xl relative z-10">
                {duckResponse && (
                   <div className="mb-4 p-4 rounded-lg border border-primary/20 bg-primary/5 relative animate-in fade-in slide-in-from-bottom-2">
                     <button title="Dismiss" onClick={() => setDuckResponse(null)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">✕</button>
                     <div className="flex items-start gap-3">
                       <div className="bg-primary/20 p-2 rounded-full mt-0.5"><Bot className="w-4 h-4 text-primary" /></div>
                       <div>
                         <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">AI Tutor (Rubber Duck)</p>
                         <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{duckResponse}</div>
                       </div>
                     </div>
                   </div>
                )}
                {duckError && (
                   <div className="mb-4 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm relative">
                     <button title="Dismiss" onClick={() => setDuckError(null)} className="absolute top-2 right-2 opacity-70">✕</button>
                     {duckError}
                   </div>
                )}
                <div className="flex gap-2 relative">
                  <Input
                    placeholder="Type a message or ask the AI tutor..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={isSending || isAskingDuck}
                    className="flex-1"
                  />
                  <Button
                    onClick={askRubberDuck}
                    disabled={isAskingDuck || !messageText.trim()}
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10 transition-colors"
                    title="Stuck? Ask AI Tutor"
                  >
                    {isAskingDuck ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Bot className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={sendMessage}
                    disabled={isSending || !messageText.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
        </div>
      </Card>

      {/* User Info */}
      <Card className="mt-8 p-6 bg-card border-border">
        <h3 className="font-semibold text-foreground mb-4 text-center md:text-left">About {chatData.other_user.name}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Can Teach
            </p>
            <div className="flex flex-wrap gap-2">
              {chatData.other_user.skills_offering.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Wants to Learn
            </p>
            <div className="flex flex-wrap gap-2">
              {chatData.other_user.skills_learning.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Syllabus Section */}
      <Card className="mt-8 overflow-hidden border-primary/30 shadow-xl shadow-primary/5 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-50 blur-xl group-hover:opacity-80 transition-opacity duration-1000" />
        <div className="relative p-4 md:p-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-background to-accent/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Learning Syllabus
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Generate a custom 4-week roadmap for this skill swap.</p>
          </div>
          <Button 
            onClick={generateSyllabus} 
            disabled={isGenerating}
            className="relative overflow-hidden bg-gradient-to-r from-primary via-indigo-500 to-accent hover:scale-105 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 font-bold hover:shadow-primary/50"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Generating Magic...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Generate Syllabus
              </span>
            )}
          </Button>
        </div>

        {syllabusError && (
          <div className="p-6 bg-destructive/10 border-b border-destructive/20 text-destructive flex items-start gap-2">
             <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
             <div className="text-sm">
                <strong>AI Error:</strong> {syllabusError}
                {syllabusError.includes('API Key') && (
                  <p className="mt-1 opacity-80">You need to add GEMINI_API_KEY to your backend .env file to use this feature.</p>
                )}
             </div>
          </div>
        )}

        {syllabus && (
          <div className="p-6 space-y-6 animate-fade-scale">
            <div className="text-center space-y-2 mb-8">
              <h4 className="text-2xl font-bold text-foreground">{syllabus.title}</h4>
              <p className="text-muted-foreground italic text-sm max-w-2xl mx-auto">"{syllabus.introduction}"</p>
            </div>
            
            <div className="space-y-4">
              {syllabus.weeks.map((week, idx) => (
                <Card key={idx} className="p-5 border-primary/10 hover:border-primary/30 transition-colors bg-card/50">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {week.week}
                      </div>
                      <h5 className="font-bold text-lg text-foreground">{week.theme}</h5>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <strong className="text-primary block mb-1">You Teach:</strong>
                        <p className="text-muted-foreground leading-relaxed">{week.userA_teaching}</p>
                      </div>
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <strong className="text-accent block mb-1">They Teach:</strong>
                        <p className="text-muted-foreground leading-relaxed">{week.userB_teaching}</p>
                      </div>
                   </div>
                   
                   <div className="mt-4 bg-secondary/30 rounded-lg p-4 text-sm flex gap-3 items-start">
                     <div className="p-1.5 bg-background rounded text-foreground">📝</div>
                     <div>
                       <strong className="block mb-1">Weekly Homework / Goal</strong>
                       <p className="text-muted-foreground">{week.homework}</p>
                     </div>
                   </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </main>
  )
}
