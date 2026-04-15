import { Redirect } from 'expo-router'
import { useAuthStore } from '../src/stores/authStore'

export default function Index() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/welcome'} />
}
