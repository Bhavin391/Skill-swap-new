'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-foreground">SkillSwap</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
              Dashboard
            </Link>
            <Link href="/matches" className="text-sm text-muted-foreground hover:text-foreground transition">
              Matches
            </Link>
            <Link href="/chat" className="text-sm text-muted-foreground hover:text-foreground transition">
              Messages
            </Link>
            <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition">
              Profile
            </Link>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-foreground hover:bg-secondary"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20">
        {children}
      </div>
    </div>
  )
}
