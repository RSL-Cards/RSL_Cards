import {
  UserRepository,
  OnboardingPayload,
} from "../repositories/user.repository.js";

export class UserService {
  constructor(
    private readonly repository: UserRepository
  ) {}

  async updateOnboarding(
    userId: string,
    data: OnboardingPayload,
  ): Promise<void> {
    return this.repository.updateOnboarding(userId, data);
  }

  async getUsersMe(body: any, params: any, query: any) {
    return this.repository.getUsersMe(body, params, query);
  }

  async patchUsersMe(body: any, params: any, query: any) {
    return this.repository.patchUsersMe(body, params, query);
  }

  async getUsersMePaymentMethods(userId: string) {
    return this.repository.getUsersMePaymentMethods(userId);
  }

  async postUsersMePaymentMethods(body: any, params: any, query: any) {
    return this.repository.postUsersMePaymentMethods(body, params, query);
  }

  async patchUsersMePaymentMethodsId(body: any, params: any, query: any) {
    return this.repository.patchUsersMePaymentMethodsId(body, params, query);
  }

  async deleteUsersMePaymentMethodsId(body: any, params: any, query: any) {
    return this.repository.deleteUsersMePaymentMethodsId(body, params, query);
  }

  async getUsersMeConnectedPlatforms(userId: string) {
    return this.repository.getUsersMeConnectedPlatforms(userId);
  }

  async postUsersMeConnectedPlatforms(body: any, params: any, query: any) {
    return this.repository.postUsersMeConnectedPlatforms(body, params, query);
  }

  async deleteUsersMeConnectedPlatformsPlatform(
    body: any,
    params: any,
    query: any,
  ) {
    return this.repository.deleteUsersMeConnectedPlatformsPlatform(
      body,
      params,
      query,
    );
  }

  async getUsersMeNotificationPreferences(body: any, params: any, query: any) {
    return this.repository.getUsersMeNotificationPreferences(
      body,
      params,
      query,
    );
  }

  async patchUsersMeNotificationPreferences(
    body: any,
    params: any,
    query: any,
  ) {
    return this.repository.patchUsersMeNotificationPreferences(
      body,
      params,
      query,
    );
  }

  async getUsersDealersCustomurl(body: any, params: any, query: any) {
    return this.repository.getUsersDealersCustomurl(body, params, query);
  }

  async getUsersDealers(body: any, params: any, query: any) {
    return this.repository.getUsersDealers(body, params, query);
  }

  async getUsersMeCustomers(body: any, params: any, query: any) {
    return this.repository.getUsersMeCustomers(body, params, query);
  }

  async postUsersMeCustomers(body: any, params: any, query: any) {
    return this.repository.postUsersMeCustomers(body, params, query);
  }

  async patchUsersMeCustomersId(body: any, params: any, query: any) {
    return this.repository.patchUsersMeCustomersId(body, params, query);
  }

  async deleteUsersMeCustomersId(body: any, params: any, query: any) {
    return this.repository.deleteUsersMeCustomersId(body, params, query);
  }

  async postUsersMeExport(body: any, params: any, query: any) {
    return this.repository.postUsersMeExport(body, params, query);
  }

  async deleteUsersMe(body: any, params: any, query: any) {
    return this.repository.deleteUsersMe(body, params, query);
  }
}
