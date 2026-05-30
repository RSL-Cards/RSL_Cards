import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'
import { useGoogleAuth, useAppleAuth } from "../../src/hooks/useAuth";
export default function WelcomeScreen() {
  const router = useRouter()
  const { promptGoogleSignIn, request } = useGoogleAuth();
  const { signInWithApple } = useAppleAuth();
  return (
    <SafeAreaView style={styles.container}>
      {/* Logo Card */}
      <View style={styles.centerContent}>
        <Image
          source={require('../../assets/rslicon.jpeg')}
          style={{ width: 160, height: 160, borderRadius: 24 }}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Run. Sell. Log.</Text>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.createBtnText}>Create Account</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.signInBtnText}>Sign In</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={{ height: 16 }} />

        <TouchableOpacity
          style={styles.socialBtn}
          activeOpacity={0.85}
          disabled={!request}
          onPress={() => promptGoogleSignIn()}
        >
          <View style={styles.socialInner}>
            <View style={styles.socialIconWrap}>
              <AntDesign name="google" size={22} color="#FFFFFF" style={{ marginBottom: 2 }} />
            </View>
            <Text style={styles.socialBtnText}>
              Continue with Google
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 10 }} />

        <TouchableOpacity
          style={styles.socialBtn}
          activeOpacity={0.85}
          onPress={signInWithApple}
        >
          <View style={styles.socialInner}>
            <View style={styles.socialIconWrap}>
              <AntDesign name="apple" size={22} color="#FFFFFF" style={{ marginBottom: 2 }} />
            </View>
            <Text style={styles.socialBtnText}>
              Continue with Apple
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFrame: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 12,
    width: 200,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopLine: {
    height: 2,
    width: '70%',
    backgroundColor: 'white',
    marginBottom: 20,
    position: 'absolute',
    top: 30,
  },
  rslText: {
    fontSize: 72,
    fontWeight: '900',
    fontStyle: 'italic',
    color: 'white',
    lineHeight: 76,
  },
  cardsText: {
    fontSize: 16,
    letterSpacing: 10,
    color: '#E8001C',
    fontWeight: '700',
    marginTop: 4,
  },
  tagline: {
    fontSize: 13,
    color: '#888888',
    letterSpacing: 3,
    marginTop: 16,
  },
  bottomSection: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  createBtn: {
    backgroundColor: '#E8001C',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  signInBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'white',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    color: '#555555',
    marginHorizontal: 12,
    fontSize: 13,
  },
  socialBtn: {
    backgroundColor: '#1A1A1A',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialInner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
  },
  socialIconWrap: {
    width: 32,
    alignItems: 'center',
    marginRight: 8,
  },
  appleIcon: {
    color: 'white',
    fontSize: 18,
  },
  socialBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
})
