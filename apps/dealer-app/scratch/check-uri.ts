import * as AuthSession from 'expo-auth-session';

console.log('Redirect URI:', AuthSession.makeRedirectUri({
  scheme: 'rslcards',
  path: 'oauth/ebay'
}));
