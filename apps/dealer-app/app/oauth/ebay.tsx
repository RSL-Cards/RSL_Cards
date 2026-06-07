import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function EbayOAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // This route acts as a catch-all for the Expo deep link redirect from the backend.
    // WebBrowser.openAuthSessionAsync usually intercepts the link, but if Expo Router
    // catches it first, we gracefully redirect the user back to the More tab!
    const timer = setTimeout(() => {
      router.replace('/(tabs)/more');
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#0057FF" size="large" />
    </View>
  );
}
