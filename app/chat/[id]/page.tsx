'use client'

import { useState, useEffect, useRef, use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, Map, Sparkles, AlertCircle, Calendar, CheckCircle2, XCircle, Video } from 'lucide-react'

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
  chat?: {
    session?: {
      proposed_by: string;
      time: string;
      status: 'pending' | 'accepted';
    }
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

  // Session Scheduling State
  const [proposedTime, setProposedTime] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)
  const [isVideoActive, setIsVideoActive] = useState(false)
  
  // AI Syllabus State
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [syllabusError, setSyllabusError] = useState<string | null>(null)

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

  const proposeSession = async () => {
    setIsScheduling(true);
    try {
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ time: proposedTime }),
      });
      if (response.ok) {
        setProposedTime('');
        await loadChat();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScheduling(false);
    }
  }

  const acceptSession = async () => {
    setIsScheduling(true);
    try {
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}/session/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) await loadChat();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScheduling(false);
    }
  }

  const cancelSession = async () => {
    setIsScheduling(true);
    try {
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}/session`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) await loadChat();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScheduling(false);
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
    <main className="px-4 md:px-6 py-6 md:py-12 max-w-3xl mx-auto">
      {error && (
        <Card className="p-4 mb-6 bg-destructive/10 border-destructive/50">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}
      <Card className="bg-card border-border flex flex-col h-[calc(100vh-10rem)] md:h-[600px]">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">
            {chatData.other_user.name}
          </h1>
          <p className="text-sm text-muted-foreground">{chatData.other_user.email}</p>
        </div>

        {/* Session Scheduler */}
        <div className="p-4 border-b border-border bg-secondary/5 flex items-center justify-between">
          {chatData.chat?.session ? (
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${chatData.chat.session.status === 'accepted' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {chatData.chat.session.status === 'accepted' ? 'Session Scheduled' : 'Session Proposed'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(chatData.chat.session.time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {chatData.chat.session.status === 'pending' && chatData.chat.session.proposed_by !== userId ? (
                  <>
                    <Button size="sm" onClick={acceptSession} disabled={isScheduling} className="bg-primary text-primary-foreground hover:bg-primary/90"><CheckCircle2 className="w-4 h-4 mr-1" /> Accept</Button>
                    <Button size="sm" variant="destructive" onClick={cancelSession} disabled={isScheduling}><XCircle className="w-4 h-4 mr-1" /> Decline</Button>
                  </>
                ) : chatData.chat.session.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-muted-foreground italic mr-2 hidden sm:inline">Waiting for response...</span>
                     <Button size="sm" variant="outline" onClick={cancelSession} disabled={isScheduling}>Cancel</Button>
                  </div>
                ) : (
                   <div className="flex items-center gap-2">
                     <Button size="sm" onClick={() => setIsVideoActive(!isVideoActive)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all font-bold group">
                        <Video className={`w-4 h-4 mr-2 ${!isVideoActive && 'group-hover:animate-pulse'}`} />
                        {isVideoActive ? 'Close Video' : 'Join Video Call'}
                     </Button>
                     <Button size="sm" variant="ghost" onClick={cancelSession} disabled={isScheduling} className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex">End</Button>
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-wrap items-center gap-3">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                 <Calendar className="w-4 h-4" />
                 Schedule Session
               </div>
               <Input 
                 type="datetime-local" 
                 value={proposedTime} 
                 onChange={e => setProposedTime(e.target.value)}
                 className="w-auto h-9 text-sm"
               />
               <Button size="sm" variant="secondary" onClick={proposeSession} disabled={!proposedTime || isScheduling} className="h-9">
                 Propose
               </Button>
            </div>
          )}
        </div>

        {/* Messages or Video Container */}
        <div className="flex-1 overflow-hidden flex flex-col w-full bg-background relative">
          {isVideoActive ? (
            <div className="flex-1 w-full h-full bg-black">
              <iframe 
                src={`https://meet.jit.si/SkillSwapRoom_${chatId}`}
                allow="camera; microphone; fullscreen; display-capture"
                className="w-full h-full border-0"
                title="SkillSwap Secure Video Room"
              />
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {chatData.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-center">
                      No messages yet. Start a conversation!
                    </p>
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
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender_id === userId
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
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
              <div className="p-4 md:p-6 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isSending || !messageText.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
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
      <Card className="mt-8 overflow-hidden border-primary/20 bg-gradient-to-br from-background to-secondary/10">
        <div className="p-4 md:p-6 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-background to-accent/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 transition-all font-bold"
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
