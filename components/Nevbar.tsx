'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    if (!mounted) return
    const html = document.documentElement
    if (isDark) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
    setIsDark(!isDark)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const isAuth = pathname?.includes('/dashboard') || pathname?.includes('/chat') || pathname?.includes('/matches')

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/matches', label: 'Matches' },
    { href: '/chat', label: 'Messages' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuth ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">SkillSwap</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuth && navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={pathname === link.href ? 'default' : 'ghost'}
                  className="transition-all duration-200"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="transition-transform duration-200 hover:scale-110"
            >
              {mounted && (isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
            </Button>

            {isAuth && (
              <>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="hidden sm:inline-flex transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
                >
                  Logout
                </Button>
              </>
            )}

            {!isAuth && (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="transition-all duration-200">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in fade-in duration-200">
            {isAuth && navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                <Button
                  variant={pathname === link.href ? 'default' : 'ghost'}
                  className="w-full justify-start transition-all duration-200"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {isAuth && (
              <Button
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
                variant="outline"
                className="w-full transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
              >
                Logout
              </Button>
            )}
            {!isAuth && (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
