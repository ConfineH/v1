"use client"

import type React from "react"

import { useEffect } from "react"

// Analytics tracking for MVP
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // Google Analytics 4
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", event, properties)
    }

    // Mixpanel
    if (typeof window !== "undefined" && (window as any).mixpanel) {
      ;(window as any).mixpanel.track(event, properties)
    }

    // Console log for development
    console.log("Analytics Event:", event, properties)
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).mixpanel) {
      ;(window as any).mixpanel.identify(userId)
      if (traits) {
        ;(window as any).mixpanel.people.set(traits)
      }
    }
  },
}

// Key events to track
export const trackEvents = {
  addPerson: (relationship: string) => {
    analytics.track("Person Added", { relationship })
  },

  saveGiftIdea: (category: string, price?: number) => {
    analytics.track("Gift Idea Saved", { category, price })
  },

  useCalendar: () => {
    analytics.track("Calendar Viewed")
  },

  abandonWithoutData: () => {
    analytics.track("Abandoned Without Adding Data")
  },

  completeOnboarding: () => {
    analytics.track("Onboarding Completed")
  },

  submitSurvey: (nps: number, willingnessToPay: string) => {
    analytics.track("Exit Survey Submitted", { nps, willingness_to_pay: willingnessToPay })
  },
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize analytics
    analytics.track("App Loaded")

    // Track page abandonment
    const handleBeforeUnload = () => {
      const data = JSON.parse(localStorage.getItem("memento_data") || "{}")
      if (!data.people || data.people.length === 0) {
        trackEvents.abandonWithoutData()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  return <>{children}</>
}
