import { UserService } from "./user.service.js";

export class UserController {
  constructor(private readonly service: UserService) {}

  private getUserId(request: Request): string {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new Error("User ID not found in request headers");
    }
    return userId;
  }

  onboarding = async ({ request, body }: { request: Request; body: any }) => {
    const userId = this.getUserId(request);
    await this.service.updateOnboarding(userId, body);
    return { success: true };
  };

  getMe = async ({ request }: { request: Request }) => {
    const userId = this.getUserId(request);
    return await this.service.getUsersMe(userId);
  };

  patchMe = async ({ request, body }: { request: Request; body: any }) => {
    const userId = this.getUserId(request);
    return await this.service.patchUsersMe(userId, body);
  };

  getPaymentMethods = async ({ request }: { request: Request }) => {
    const userId = this.getUserId(request);
    return await this.service.getUsersMePaymentMethods(userId);
  };

  postPaymentMethod = async ({ body }: { body: any }) => {
    return { message: "Add new payment method" };
  };

  patchPaymentMethod = async ({ params }: { params: any }) => {
    return { message: `Update payment method ${params.id}` };
  };

  deletePaymentMethod = async ({ params }: { params: any }) => {
    return { message: `Remove payment method ${params.id}` };
  };

  getConnectedPlatforms = async ({ request }: { request: Request }) => {
    const userId = this.getUserId(request);
    return await this.service.getUsersMeConnectedPlatforms(userId);
  };

  postConnectedPlatform = async ({ request, body }: { request: Request; body: any }) => {
    const userId = this.getUserId(request);
    return await this.service.postUsersMeConnectedPlatforms(userId, body);
  };

  deleteConnectedPlatform = async ({ request, params }: { request: Request; params: any }) => {
    const userId = this.getUserId(request);
    const { platform } = params;
    return await this.service.deleteUsersMeConnectedPlatformsPlatform(userId, platform);
  };

  ebayCallback = async ({ query, set }: { query: any; set: any }) => {
    const { code, state } = query;

    if (!code || !state) {
      set.status = 400;
      return { error: "Missing code or state" };
    }

    let userId = state;
    let returnUrl = "rslcards://oauth/ebay";

    if (state && state.includes('___')) {
      const parts = state.split('___');
      userId = parts[0];
      if (parts[1]) {
        returnUrl = parts[1];
      }
    }

    try {
      await this.service.postUsersMeConnectedPlatforms(userId, { platform: "ebay", code });
      return Response.redirect(`${returnUrl}?status=success`);
    } catch (error: any) {
      console.error("eBay callback error:", error);
      return Response.redirect(`${returnUrl}?status=error&message=${encodeURIComponent(error.message)}`);
    }
  };

  getNotificationPreferences = async ({ request }: { request: Request }) => {
    const userId = this.getUserId(request);
    return await this.service.getUsersMeNotificationPreferences(userId);
  };

  patchNotificationPreferences = async ({ request, body }: { request: Request; body: any }) => {
    const userId = this.getUserId(request);
    return await this.service.patchUsersMeNotificationPreferences(userId, body);
  };

  getDealerByUrl = async ({ params }: { params: any }) => {
    return await this.service.getDealerByUrl(params.customUrl);
  };

  listDealers = async () => {
    return await this.service.listDealers();
  };

  getCustomers = async ({ request }: { request: Request }) => {
    const userId = this.getUserId(request);
    return await this.service.getCustomers(userId);
  };

  postCustomer = async ({ request, body }: { request: Request; body: any }) => {
    const userId = this.getUserId(request);
    return await this.service.postCustomer(userId, body);
  };

  patchCustomer = async ({ request, params, body }: { request: Request; params: any; body: any }) => {
    const userId = this.getUserId(request);
    return await this.service.patchCustomer(userId, params.id, body);
  };

  deleteCustomer = async ({ request, params }: { request: Request; params: any }) => {
    const userId = this.getUserId(request);
    return await this.service.deleteCustomer(userId, params.id);
  };

  exportData = async ({ request }: { request: Request }) => {
    const userId = this.getUserId(request);
    return await this.service.postUsersMeExport(userId);
  };

  deleteMe = async ({ request }: { request: Request }) => {
    const userId = this.getUserId(request);
    return await this.service.deleteMe(userId);
  };

  postMeAvatar = async ({ request, body }: { request: Request; body: any }) => {
    const userId = this.getUserId(request);
    const { contentType = "image/jpeg" } = body ?? {};
    return await this.service.presignAvatarUpload(userId, contentType);
  };
}
