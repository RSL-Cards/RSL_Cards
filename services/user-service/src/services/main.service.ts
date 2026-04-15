import * as repository from "../repositories/main.repository.js";

export async function getUsersMe(body: any, params: any, query: any) {
  // Get current user profile (dealer or consumer)
  return repository.getUsersMe(body, params, query);
}

export async function patchUsersMe(body: any, params: any, query: any) {
  // Update profile (name, bio, photo, sports, channels)
  return repository.patchUsersMe(body, params, query);
}

export async function getUsersMePaymentMethods(env: any, userId: string) {
  return repository.getUsersMePaymentMethods(env, userId);
}

export async function postUsersMePaymentMethods(
  body: any,
  params: any,
  query: any,
) {
  // Add new payment method
  return repository.postUsersMePaymentMethods(body, params, query);
}

export async function patchUsersMePaymentMethodsId(
  body: any,
  params: any,
  query: any,
) {
  // Update payment method handle or set as default
  return repository.patchUsersMePaymentMethodsId(body, params, query);
}

export async function deleteUsersMePaymentMethodsId(
  body: any,
  params: any,
  query: any,
) {
  // Remove payment method
  return repository.deleteUsersMePaymentMethodsId(body, params, query);
}

export async function getUsersMeConnectedPlatforms(env: any, userId: string) {
  return repository.getUsersMeConnectedPlatforms(env, userId);
}

export async function postUsersMeConnectedPlatforms(
  body: any,
  params: any,
  query: any,
) {
  // Connect selling platform via OAuth
  return repository.postUsersMeConnectedPlatforms(body, params, query);
}

export async function deleteUsersMeConnectedPlatformsPlatform(
  body: any,
  params: any,
  query: any,
) {
  // Disconnect a selling platform
  return repository.deleteUsersMeConnectedPlatformsPlatform(
    body,
    params,
    query,
  );
}

export async function getUsersMeNotificationPreferences(
  body: any,
  params: any,
  query: any,
) {
  // Get notification preference settings
  return repository.getUsersMeNotificationPreferences(body, params, query);
}

export async function patchUsersMeNotificationPreferences(
  body: any,
  params: any,
  query: any,
) {
  // Update notification preferences
  return repository.patchUsersMeNotificationPreferences(body, params, query);
}

export async function getUsersDealersCustomurl(
  body: any,
  params: any,
  query: any,
) {
  // Get public dealer profile page
  return repository.getUsersDealersCustomurl(body, params, query);
}

export async function getUsersDealers(body: any, params: any, query: any) {
  // List dealers (filter: near, sport, rating)
  return repository.getUsersDealers(body, params, query);
}

export async function getUsersMeCustomers(body: any, params: any, query: any) {
  // Get dealer's customer list
  return repository.getUsersMeCustomers(body, params, query);
}

export async function postUsersMeCustomers(body: any, params: any, query: any) {
  // Add new customer contact
  return repository.postUsersMeCustomers(body, params, query);
}

export async function patchUsersMeCustomersId(
  body: any,
  params: any,
  query: any,
) {
  // Update customer (name, notes, star)
  return repository.patchUsersMeCustomersId(body, params, query);
}

export async function deleteUsersMeCustomersId(
  body: any,
  params: any,
  query: any,
) {
  // Delete customer contact
  return repository.deleteUsersMeCustomersId(body, params, query);
}

export async function postUsersMeExport(body: any, params: any, query: any) {
  // Request data export (GDPR)
  return repository.postUsersMeExport(body, params, query);
}

export async function deleteUsersMe(body: any, params: any, query: any) {
  // Delete account (GDPR right to erasure)
  return repository.deleteUsersMe(body, params, query);
}
