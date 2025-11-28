'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'For testing the waters',
    priceId: null,
    features: [
      '1 ad account',
      'Manual CSV upload',
      'Full hierarchy view',
      'Custom thresholds',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'For serious advertisers',
    priceId: 'price_1SYOWOLvvY2iVbuYa0ovAR0G',
    featured: true,
    features: [
      '3 ad accounts',
      'Meta API connection',
      'Daily auto-refresh',
      'Date range comparisons',
      'Email alerts',
    ],
  },
  {
    name: 'Agency',
    price: '$99',
    period: '/mo',
    description: 'For teams & clients',
    priceId: 'price_1SYOWlLvvY2iVbuYgxcY88pk',
    features: [
      '10 ad accounts',
      'Hourly refresh',
      'White-label reports',
      'Team access',
      'Priority support',
    ],
  },
]

export default function PricingPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (priceId: string, planName: string) => {
    if (!user) {
      window.location.href = '/signup'
      return
    }

    setLoading(planName)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-lg flex items-center justify-center text-lg">
              ⚖️
            </div>
            <span className="font-mono font-bold text-lg">ScaleOrCut</span>
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">
              ← Back to Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white">
              Sign in
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, honest pricing</h1>
          <p className="text-zinc-500 text-lg">No enterprise sales calls. No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-bg-card border rounded-2xl p-8 relative ${
                plan.featured 
                  ? 'border-accent bg-gradient-to-b from-accent/10 to-bg-card' 
                  : 'border-border'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">
                  POPULAR
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm text-zinc-500 uppercase tracking-wide mb-1">
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-zinc-500">{plan.period}</span>
                </div>
                <p className="text-zinc-500 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.priceId ? (
                <button
                  onClick={() => handleCheckout(plan.priceId!, plan.name)}
                  disabled={loading !== null}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.featured
                      ? 'bg-accent hover:bg-accent-hover text-white'
                      : 'bg-bg-dark border border-border hover:border-accent text-white'
                  } disabled:opacity-50`}
                >
                  {loading === plan.name ? 'Loading...' : `Get ${plan.name}`}
                </button>
              ) : (
                <Link
                  href={user ? '/dashboard' : '/signup'}
                  className="block w-full py-3 rounded-lg font-semibold text-center bg-bg-dark border border-border hover:border-accent text-white transition-colors"
                >
                  {user ? 'Current Plan' : 'Get Started'}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
