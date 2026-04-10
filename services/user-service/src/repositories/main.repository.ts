// Repository layer

export async function getUsersMe(body: any, params: any, query: any) {
  return { message: `Get current user profile (dealer or consumer)` };
}

export async function patchUsersMe(body: any, params: any, query: any) {
  return { message: `Update profile (name, bio, photo, sports, channels)` };
}

export async function getUsersMePaymentMethods(body: any, params: any, query: any) {
  return { message: `Get all saved payment methods (Venmo, Zelle etc)` };
}

export async function postUsersMePaymentMethods(body: any, params: any, query: any) {
  return { message: `Add new payment method` };
}

export async function patchUsersMePaymentMethodsId(body: any, params: any, query: any) {
  return { message: `Update payment method handle or set as default` };
}

export async function deleteUsersMePaymentMethodsId(body: any, params: any, query: any) {
  return { message: `Remove payment method` };
}

export async function getUsersMeConnectedPlatforms(body: any, params: any, query: any) {
  return { message: `Get all connected selling platforms` };
}

export async function postUsersMeConnectedPlatforms(body: any, params: any, query: any) {
  return { message: `Connect selling platform via OAuth` };
}

export async function deleteUsersMeConnectedPlatformsPlatform(body: any, params: any, query: any) {
  return { message: `Disconnect a selling platform` };
}

export async function getUsersMeNotificationPreferences(body: any, params: any, query: any) {
  return { message: `Get notification preference settings` };
}

export async function patchUsersMeNotificationPreferences(body: any, params: any, query: any) {
  return { message: `Update notification preferences` };
}

export async function getUsersDealersCustomurl(body: any, params: any, query: any) {
  return { message: `Get public dealer profile page` };
}

export async function getUsersDealers(body: any, params: any, query: any) {
  return { message: `List dealers (filter: near, sport, rating)` };
}

export async function getUsersMeCustomers(body: any, params: any, query: any) {
  return { message: `Get dealer's customer list` };
}

export async function postUsersMeCustomers(body: any, params: any, query: any) {
  return { message: `Add new customer contact` };
}

export async function patchUsersMeCustomersId(body: any, params: any, query: any) {
  return { message: `Update customer (name, notes, star)` };
}

export async function deleteUsersMeCustomersId(body: any, params: any, query: any) {
  return { message: `Delete customer contact` };
}

export async function postUsersMeExport(body: any, params: any, query: any) {
  return { message: `Request data export (GDPR)` };
}

export async function deleteUsersMe(body: any, params: any, query: any) {
  return { message: `Delete account (GDPR right to erasure)` };
}

