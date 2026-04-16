import { create } from 'zustand'

interface PaymentMethod {
  type: 'venmo' | 'cashapp' | 'zelle' | 'paypal'
  handle: string
}

interface OnboardingStore {
  sports:         string[]
  sellChannels:   string[]
  paymentMethods: PaymentMethod[]
  setSports:         (sports: string[]) => void
  setSellChannels:   (channels: string[]) => void
  setPaymentMethods: (methods: PaymentMethod[]) => void
  reset:             () => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  sports:         [],
  sellChannels:   [],
  paymentMethods: [],
  setSports:         (sports)   => set({ sports }),
  setSellChannels:   (channels) => set({ sellChannels: channels }),
  setPaymentMethods: (methods)  => set({ paymentMethods: methods }),
  reset: () => set({ sports: [], sellChannels: [], paymentMethods: [] }),
}))
