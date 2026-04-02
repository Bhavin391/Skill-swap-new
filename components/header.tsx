

import { useTheme } from '@/components/theme-provider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Sparkles, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  
  // Track previous unread counts using a ref to avoid stale closures in setInterval
  const prevChatsRef = useRef<{ [id: string]: number }>({})

  useEffect(() => {
    setMounted(true)
    
    // Check for new messages periodically
    const checkMessages = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const data = await apiClient.get('/api/chats')
        if (data.chats) {
          data.chats.forEach((chat: any) => {
            const prevUnread = prevChatsRef.current[chat._id] || 0
            const currentUnread = chat.unread_count || 0
            
            // Only popup if the amount of unread messages went up and we are not on the chat screen with them
            // Or if we just generally have more unread messages than yesterday
            if (currentUnread > prevUnread) {
              const isOnTheirChat = pathname.includes(`/chat/${chat._id}`);
              
              if (!isOnTheirChat) {
                toast({
                  title: `New Message from ${chat.name}`,
                  description: chat.last_message ? chat.last_message.substring(0, 60) + (chat.last_message.length > 60 ? '...' : '') : 'Sent you a message',
                })
              }
            }
            
            // Update the tracker
            prevChatsRef.current[chat._id] = currentUnread
          })
        }
      } catch (err) {
        // Silently ignore ping errors
      }
    }

    if (localStorage.getItem('token')) {
      checkMessages();
      const pollInterval = window.setInterval(checkMessages, 5000); // Check every 5s
      return () => window.clearInterval(pollInterval);
    }
  }, [toast, pathname])

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      localStorage.removeItem('token')
      console.log('[v0] User logged out successfully')
      router.push('/')
    } catch (error) {
      console.error('[v0] Logout failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/40 group-hover:shadow-primary/60 transition-all">
            <Sparkles className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-black text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:inline">SkillSwap</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/matches" className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors">
            Matches
          </Link>
          <Link href="/chat" className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors">
            Messages
          </Link>
          <Link href="/profile" className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors">
            Profile
          </Link>
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="group relative"
            title={mounted ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode` : 'Switch theme'}
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-90 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 group-hover:rotate-90 transition-transform" />
            )}
          </Button>

          {/* Logout Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoading}
            className="border-2 border-foreground/20 hover:border-foreground/40"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </>
            )}
          </Button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {mounted && resolvedTheme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-xl flex flex-col p-4 animate-in slide-in-from-top-2">
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-secondary/50 rounded-lg text-sm font-bold text-foreground transition-colors">Dashboard</Link>
          <Link href="/matches" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-secondary/50 rounded-lg text-sm font-bold text-foreground transition-colors">Matches</Link>
          <Link href="/chat" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-secondary/50 rounded-lg text-sm font-bold text-foreground transition-colors">Messages</Link>
          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="py-3 px-4 hover:bg-secondary/50 rounded-lg text-sm font-bold text-foreground transition-colors">Profile</Link>
          <div className="mt-4 pt-4 border-t border-border px-4">
             <Button size="sm" variant="destructive" onClick={handleLogout} className="w-full font-bold">
               <LogOut className="w-4 h-4 mr-2" /> Logout
             </Button>
          </div>
        </div>
      )}
    </header>
  )
}
