import { NotImplementedError } from "../../errors/index.js";
import { UserService } from "./user.service.js";
import { AuthError } from "../../lib/errors.js";
import { env } from "../../config/index.js";
import { logger } from "../../lib/logger.js";
import { BadRequestError } from "../../errors/index.js";
import {
  DEFAULT_EBAY_RETURN_URL,
  createEbayOauthState,
  isAllowedReturnUrl,
  readEbayOauthState,
} from "./ebay-oauth-state.js";

export class UserController {
  constructor(private readonly service: UserService) {}

  private getUserId(request: Request): string {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw AuthError.unauthorized("User ID not found in request headers");
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
    throw new NotImplementedError("Add new payment method");
  };

  patchPaymentMethod = async ({ params }: { params: any }) => {
    throw new NotImplementedError("Update payment method");
  };

  deletePaymentMethod = async ({ params }: { params: any }) => {
    throw new NotImplementedError("Remove payment method");
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

  createEbayOauthState = async ({ request, body }: { request: Request; body: any }) => {
    const userId = this.getUserId(request);
    const returnUrl = typeof body?.returnUrl === "string" ? body.returnUrl : DEFAULT_EBAY_RETURN_URL;
    if (!isAllowedReturnUrl(returnUrl, env)) throw new BadRequestError("That return URL is not allowed");
    return { state: createEbayOauthState(userId, returnUrl, env) };
  };

  ebayCallback = async ({ query, set }: { query: any; set: any }) => {
    const { code, state } = query;

    if (!code || !state) {
      set.status = 400;
      return { error: "Missing code or state" };
    }

    let resolved = readEbayOauthState(String(state), env);
    if (!resolved && String(state).includes("___")) {
      // Legacy unsigned "userId___returnUrl" state from app builds released before signed states.
      // TODO: remove once every supported mobile build requests a signed state.
      const [userId, legacyReturnUrl] = String(state).split("___");
      const returnUrl = legacyReturnUrl || DEFAULT_EBAY_RETURN_URL;
      if (userId && isAllowedReturnUrl(returnUrl, env)) {
        logger.warn(`[EBAY] Accepted legacy unsigned OAuth state for user ${userId}`);
        resolved = { userId, returnUrl };
      }
    }

    if (!resolved || !isAllowedReturnUrl(resolved.returnUrl, env)) {
      set.status = 400;
      return { error: "Invalid or expired eBay connection request. Please try connecting again." };
    }

    const { userId, returnUrl } = resolved;
    const separator = returnUrl.includes("?") ? "&" : "?";
    try {
      await this.service.postUsersMeConnectedPlatforms(userId, { platform: "ebay", code });
      return Response.redirect(`${returnUrl}${separator}status=success`, 302);
    } catch (error: any) {
      logger.error(`eBay callback error: ${error?.message}`);
      return Response.redirect(`${returnUrl}${separator}status=error&message=${encodeURIComponent(error.message)}`, 302);
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
