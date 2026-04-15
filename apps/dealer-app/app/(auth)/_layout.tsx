import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding/sports" />
      <Stack.Screen name="onboarding/sell-methods" />
      <Stack.Screen name="onboarding/payment-setup" />
      <Stack.Screen name="onboarding/tutorial" />
    </Stack>
  )
}
