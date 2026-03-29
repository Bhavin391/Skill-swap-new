'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { User, Mail, Lock, Sparkles, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      console.log('[v0] Signup attempt:', { name: formData.name, email: formData.email })

      const data = await apiClient.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      console.log('[v0] Signup successful, redirecting...')
      localStorage.setItem('token', data.token)
      router.push('/dashboard')
    } catch (err: any) {
      const errorMsg = err.message || 'Connection error. Make sure backend is running.'
      setError(errorMsg)
      console.error('[v0] Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12 animate-slide-down">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/40">
            <Sparkles className="text-primary-foreground font-bold text-lg w-5 h-5" />
          </div>
          <span className="font-black text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SkillSwap</span>
        </div>

        {/* Form Card */}
        <Card className="relative p-10 bg-gradient-to-br from-card/90 to-card/50 border border-primary/20 backdrop-blur-sm shadow-2xl animate-fade-scale overflow-hidden">
          {/* Card Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">Join SkillSwap</h1>
              <p className="text-muted-foreground">
                Start learning and teaching from the community
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-4 rounded-lg mb-8 text-sm font-medium backdrop-blur-sm animate-slide-up">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 py-3 bg-background/50 border border-primary/10 hover:border-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 py-3 bg-background/50 border border-primary/10 hover:border-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 bg-background/50 border border-primary/10 hover:border-primary/30 focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">At least 6 characters</p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground">
                  Confirm Password
                </label>
                <div className="relative group">
                  <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 bg-background/50 border border-primary/10 hover:border-primary/30 focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-blue-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 py-3 text-base font-semibold disabled:opacity-70 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-3">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-muted-foreground text-sm">Already a member?</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Sign In Link */}
            <Link href="/login">
              <Button 
                type="button"
                variant="outline"
                className="w-full border-2 border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 py-3 text-base font-semibold transition-all"
              >
                Sign In Instead
              </Button>
            </Link>

            {/* Footer */}
            <p className="text-center text-muted-foreground text-xs mt-8">
              By signing up, you agree to our{' '}
              <Link href="#" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="#" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
