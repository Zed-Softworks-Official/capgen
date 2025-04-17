import Stripe from 'stripe'

export type CapGenTranscript = Record<string, Line[]>

export type Captions = {
    speakers: Speaker[]
    transcript: CapGenTranscript
}

export type Line = {
    text: string
    start: number
    end: number
    speakerId: string
}

export type Speaker = {
    id: string
    name: string
    color: string
}

export type RedisBaseKey = 'stripe:user' | 'stripe:customer'

export type StripeSubData =
    | {
          subscriptionId: string
          status: Stripe.Subscription.Status
          priceId: string | undefined
          currentPeriodStart: number | undefined
          currentPeriodEnd: number | undefined
          cancelAtPeriodEnd: boolean
          paymentMethod: {
              brand: string | null
              last4: string | null
          } | null
      }
    | {
          status: 'none'
      }
