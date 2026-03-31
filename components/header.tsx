

import { useTheme } from '@/components/theme-provider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Sparkles, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

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

        {/* Right Actions */}
        <div className="flex items-center gap-3">
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
                <span className="hidden sm:inline">Logout</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
