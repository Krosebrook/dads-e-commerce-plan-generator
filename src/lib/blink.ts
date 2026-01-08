import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'dads-ecommerce-plan-generator-1mshfxvu',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY,
  auth: {
    mode: 'managed' // Required for AI functionality
  }
})

// Analytics helper for tracking phase completions
export const trackPhaseCompletion = (phaseName: string, phaseData?: Record<string, any>) => {
  try {
    blink.analytics.log('phase_completed', {
      phase: phaseName,
      ...phaseData
    })
  } catch (error) {
    console.error('Analytics tracking failed:', error)
  }
}
