'use client'

import { useState, useEffect, useRef, use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, Map, Sparkles, AlertCircle } from 'lucide-react'

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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      await fetch(`http://localhost:5000/api/messages/read/${chatId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
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
      console.log('[v0] Loading chat:', chatId)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Chat loaded successfully:', data)
        setChatData(data)
        if (!userId && data.current_user_id) {
          setUserId(data.current_user_id)
        }
        setIsLoading(false)
        setError(null)
        // Mark messages as read when chat is loaded
        await markMessagesAsRead()
      } else {
        console.error('[v0] Chat response not ok:', response.status)
        setError(`Failed to load chat: ${response.statusText}`)
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('[v0] Error loading chat:', err)
      const errorMsg = err.name === 'AbortError' 
        ? 'Request timeout - Backend server not responding'
        : `Error: ${err.message}`
      setError(errorMsg)
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
      console.log('[v0] Sending message:', messageText)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        console.log('[v0] Message sent successfully')
        setMessageText('')
        setError(null)
        await loadChat()
      } else {
        console.error('[v0] Send message response not ok:', response.status)
        setError(`Failed to send message: ${response.statusText}`)
      }
    } catch (err: any) {
      console.error('[v0] Error sending message:', err)
      const errorMsg = err.name === 'AbortError'
        ? 'Request timeout - Failed to send message'
        : `Error sending message: ${err.message}`
      setError(errorMsg)
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
    <main className="px-6 py-12 max-w-2xl mx-auto">
      {error && (
        <Card className="p-4 mb-6 bg-destructive/10 border-destructive/50">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}
      <Card className="bg-card border-border flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">
            {chatData.other_user.name}
          </h1>
          <p className="text-sm text-muted-foreground">{chatData.other_user.email}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
        <div className="p-6 border-t border-border">
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
      </Card>

      {/* User Info */}
      <Card className="mt-8 p-6 bg-card border-border">
        <h3 className="font-semibold text-foreground mb-4">About {chatData.other_user.name}</h3>
        <div className="grid md:grid-cols-2 gap-6">
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
        <div className="p-6 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-background to-accent/10 flex flex-col md:flex-row justify-between items-center gap-4">
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
                   
                   <div className="grid md:grid-cols-2 gap-4 text-sm mt-4">
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
