'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { MessageSquare, Users, Sparkles, Send, Search, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { apiClient } from '@/lib/api-client'

interface Conversation {
  _id: string
  user_id: string
  name: string
  email: string
  last_message?: string
  last_message_time?: string
  unread?: number
  unread_count?: number
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadConversations()
    
    // Real-time polling - update every 3 seconds
    const pollInterval = setInterval(() => {
      loadConversations()
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [])

  const loadConversations = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const data = await apiClient.get('/api/chats')
      setConversations(data.chats || [])
    } catch (err) {
      console.error('[v0] Error loading conversations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 py-12">
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
          <div className="relative max-w-4xl mx-auto px-6 flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
              <p className="text-muted-foreground font-medium">Loading conversations...</p>
            </div>
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

        <div className="relative max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12 animate-slide-down">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm mb-6">
              <MessageSquare className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">Active Conversations</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-3">Your Messages</h1>
            <p className="text-lg text-muted-foreground">
              {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'} ongoing
            </p>
          </div>

          {/* Search Bar */}
          {conversations.length > 0 && (
            <div className="mb-8 animate-slide-up">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search conversations by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 py-3 bg-card/50 border border-primary/10 hover:border-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
            </div>
          )}

          {conversations.length === 0 ? (
            <Card className="p-16 text-center bg-gradient-to-br from-card/80 to-card/50 border border-primary/10 backdrop-blur-sm animate-fade-scale overflow-hidden">
              <MessageSquare className="w-20 h-20 text-primary/30 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-foreground mb-3">No Conversations Yet</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">Start chatting with your matches and build meaningful learning connections.</p>
              <Link href="/matches">
                <Button className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all px-8">
                  <Users className="w-4 h-4 mr-2" />
                  Find Learning Partners
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv, idx) => (
                  <Link key={conv._id} href={`/chat/${conv._id}`}>
                    <Card className={`relative p-6 bg-gradient-to-br from-card/80 to-card/50 border transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-primary/20 animate-slide-up overflow-hidden ${conv.unread_count ? 'border-primary/40 hover:border-primary/50' : 'border-primary/10 hover:border-primary/30'}`} style={{ animationDelay: `${0.05 * idx}s` }}>
                      {/* Hover Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                      <div className="relative z-10 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent"></div>
                            <h3 className={`text-lg font-bold text-foreground ${conv.unread_count ? 'text-primary' : ''}`}>{conv.name}</h3>
                            {conv.unread_count && (
                              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-primary-foreground bg-gradient-to-r from-primary to-blue-600 rounded-full animate-pulse">
                                {conv.unread_count > 9 ? '9+' : conv.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{conv.email}</p>
                          {conv.last_message && (
                            <p className={`text-sm truncate max-w-xs ${conv.unread_count ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                              {conv.last_message}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-3">
                          {conv.last_message_time && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(conv.last_message_time).toLocaleDateString()}
                            </p>
                          )}
                          <Send className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No conversations match your search</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
