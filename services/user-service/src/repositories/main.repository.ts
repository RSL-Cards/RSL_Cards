// Repository layer

export async function getUsersMe(_body: any, _params: any, _query: any) {
  return { message: `Get current user profile (dealer or consumer)` };
}

export async function patchUsersMe(_body: any, _params: any, _query: any) {
  return { message: `Update profile (name, bio, photo, sports, channels)` };
}

export async function getUsersMePaymentMethods(_body: any, _params: any, _query: any) {
  return { message: `Get all saved payment methods (Venmo, Zelle etc)` };
}

export async function postUsersMePaymentMethods(_body: any, _params: any, _query: any) {
  return { message: `Add new payment method` };
}

export async function patchUsersMePaymentMethodsId(_body: any, _params: any, _query: any) {
  return { message: `Update payment method handle or set as default` };
}

export async function deleteUsersMePaymentMethodsId(_body: any, _params: any, _query: any) {
  return { message: `Remove payment method` };
}

export async function getUsersMeConnectedPlatforms(_body: any, _params: any, _query: any) {
  return { message: `Get all connected selling platforms` };
}

export async function postUsersMeConnectedPlatforms(_body: any, _params: any, _query: any) {
  return { message: `Connect selling platform via OAuth` };
}

export async function deleteUsersMeConnectedPlatformsPlatform(_body: any, _params: any, _query: any) {
  return { message: `Disconnect a selling platform` };
}

export async function getUsersMeNotificationPreferences(_body: any, _params: any, _query: any) {
  return { message: `Get notification preference settings` };
}

export async function patchUsersMeNotificationPreferences(_body: any, _params: any, _query: any) {
  return { message: `Update notification preferences` };
}

export async function getUsersDealersCustomurl(_body: any, _params: any, _query: any) {
  return { message: `Get public dealer profile page` };
}

export async function getUsersDealers(_body: any, _params: any, _query: any) {
  return { message: `List dealers (filter: near, sport, rating)` };
}

export async function getUsersMeCustomers(_body: any, _params: any, _query: any) {
  return { message: `Get dealer's customer list` };
}

export async function postUsersMeCustomers(_body: any, _params: any, _query: any) {
  return { message: `Add new customer contact` };
}

export async function patchUsersMeCustomersId(_body: any, _params: any, _query: any) {
  return { message: `Update customer (name, notes, star)` };
}

export async function deleteUsersMeCustomersId(_body: any, _params: any, _query: any) {
  return { message: `Delete customer contact` };
}

export async function postUsersMeExport(_body: any, _params: any, _query: any) {
  return { message: `Request data export (GDPR)` };
}

export async function deleteUsersMe(_body: any, _params: any, _query: any) {
  return { message: `Delete account (GDPR right to erasure)` };
}

