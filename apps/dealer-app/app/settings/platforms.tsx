import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { ScrollView } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, ConnectedPlatform } from '../../src/services/userService';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../src/stores/authStore';

WebBrowser.maybeCompleteAuthSession();

const PLATFORM_CONFIGS = [
  { key: 'ebay',      label: 'eBay',      icon: 'cart-outline', color: '#0057FF' },
  { key: 'whatnot',   label: 'Whatnot',   icon: 'tv-outline', color: '#9B59B6' },
  { key: 'tcgplayer', label: 'TCGPlayer', icon: 'game-controller-outline', color: '#00C853' },
  { key: 'shopify',   label: 'Shopify',   icon: 'storefront-outline', color: '#96BF48' },
  { key: 'facebook',  label: 'Facebook',  icon: 'logo-facebook', color: '#1877F2' },
  { key: 'mercari',   label: 'Mercari',   icon: 'bag-handle-outline',  color: '#FF4F4F' },
]

const EBAY_AUTH_URL = process.env.EXPO_PUBLIC_EBAY_AUTH_URL || 'https://auth.ebay.com/oauth2/authorize';
const EBAY_CLIENT_ID = process.env.EXPO_PUBLIC_EBAY_CLIENT_ID;
const EBAY_RU_NAME = process.env.EXPO_PUBLIC_EBAY_RU_NAME;

export default function PlatformsScreen() {
  const router = useRouter()
  const queryClient = useQueryClient();

  const user = useAuthStore(s => s.user);

  const { data: connectedPlatforms = [], isLoading } = useQuery({
    queryKey: ['connected-platforms'],
    queryFn: userService.getConnectedPlatforms,
  });

  const connectMutation = useMutation({
    mutationFn: ({ platform, code }: { platform: string; code: string }) => 
      userService.connectPlatform(platform, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-platforms'] });
      Alert.alert('Success', 'Platform connected successfully!');
    },
    onError: (err) => {
      Alert.alert('Error', `Failed to connect platform: ${err.message}`);
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: (platform: string) => userService.disconnectPlatform(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-platforms'] });
    },
  });

  // eBay OAuth (Backend Assisted Flow)
  const handleEbayConnect = async () => {
    if (!EBAY_CLIENT_ID || !EBAY_RU_NAME) {
      Alert.alert('Config Missing', 'eBay Client ID or RU Name not configured.');
      return;
    }

    const userId = user?.id || 'current-user';
    const authUrl = `${EBAY_AUTH_URL}?client_id=${EBAY_CLIENT_ID}&response_type=code&redirect_uri=${EBAY_RU_NAME}&scope=${encodeURIComponent('https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account')}&state=${userId}`;
    
    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, 'rslcards://oauth/ebay');
      
      if (result.type === 'success' && result.url.includes('success')) {
        queryClient.invalidateQueries({ queryKey: ['connected-platforms'] });
        Alert.alert('Success', 'eBay connected successfully!');
      } else if (result.type === 'success' && result.url.includes('error')) {
        const url = new URL(result.url);
        const msg = url.searchParams.get('message') || 'Unknown error';
        Alert.alert('Error', msg);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open eBay login.');
    }
  };

  const handlePress = (p: typeof PLATFORM_CONFIGS[0], isConnected: boolean) => {
    if (isConnected) {
      Alert.alert(
        `Disconnect ${p.label}?`,
        `This will disconnect your ${p.label} account.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disconnect', 
            style: 'destructive',
            onPress: () => disconnectMutation.mutate(p.key)
          },
        ]
      );
    } else {
      if (p.key === 'ebay') {
        handleEbayConnect();
      } else {
        Alert.alert('Coming Soon', `${p.label} connection is not yet implemented.`);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connected Platforms</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}>
        <Text style={styles.description}>
          Connect your selling platforms to sync listings, track fees, and get notified when cards sell.
        </Text>

        {isLoading ? (
          <ActivityIndicator color="white" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.platformList}>
            {PLATFORM_CONFIGS.map((p, i) => {
              const connection = connectedPlatforms.find(c => c.platform === p.key);
              const isConnected = !!connection && connection.isActive;
              
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.platformRow, i < PLATFORM_CONFIGS.length - 1 && styles.rowBorder]}
                  onPress={() => handlePress(p, isConnected)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.platformIcon, { backgroundColor: `${p.color}22` }]}>
                    <Ionicons name={p.icon as any} size={22} color={p.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.platformName}>{p.label}</Text>
                    {isConnected ? (
                      <Text style={styles.platformHandle}>{connection.platformUserId || 'Connected'}</Text>
                    ) : (
                      <Text style={styles.platformNotConnected}>Not connected</Text>
                    )}
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: isConnected ? 'rgba(0,200,83,0.15)' : '#1A1A1A' }]}>
                    <Text style={[styles.statusPillText, { color: isConnected ? '#00C853' : '#555555' }]}>
                      {isConnected ? '● Connected' : 'Connect'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { color: 'white', fontSize: 28 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  description: { color: '#888888', fontSize: 13, lineHeight: 20, paddingHorizontal: 20, marginBottom: 20 },
  platformList: {
    marginHorizontal: 20, backgroundColor: '#111111',
    borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden',
  },
  platformRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  platformIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  platformName: { color: 'white', fontWeight: '700', fontSize: 15 },
  platformHandle: { color: '#888888', fontSize: 13, marginTop: 2 },
  platformNotConnected: { color: '#555555', fontSize: 12, marginTop: 2 },
  statusPill: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  statusPillText: { fontSize: 12, fontWeight: '700' },
})
