import { Stack } from 'expo-router'

export default function BuyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="scan" />
      <Stack.Screen name="comps" />
      <Stack.Screen name="price" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="confirm" />
    </Stack>
  )
}
