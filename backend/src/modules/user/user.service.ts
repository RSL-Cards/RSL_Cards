import {
  UserRepository,
  OnboardingPayload,
} from "./user.repository.js";
import { EbayOauthService } from "./ebay.oauth.service.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/index.js";
import { db } from "../../db/index.js";
import { inventory } from "../../db/schema/index.js";

export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly ebayOauthService: EbayOauthService
  ) {}

  async updateOnboarding(
    userId: string,
    data: OnboardingPayload,
  ): Promise<void> {
    return this.repository.updateOnboarding(userId, data);
  }

  async getUsersMe(userId: string) {
    return this.repository.getUsersMe(userId);
  }

  async patchUsersMe(userId: string, body: any) {
    return this.repository.patchUsersMe(userId, body);
  }

  async getUsersMePaymentMethods(userId: string) {
    return this.repository.getUsersMePaymentMethods(userId);
  }

  async getUsersMeConnectedPlatforms(userId: string) {
    return this.repository.getUsersMeConnectedPlatforms(userId);
  }

  async postUsersMeConnectedPlatforms(userId: string, body: any) {
    const { platform, code } = body;

    if (platform === "ebay" && code) {
      const tokens = await this.ebayOauthService.exchangeCodeForTokens(code);
      const res = await this.repository.postUsersMeConnectedPlatforms({
        userId,
        platform: "ebay",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        platformUserId: "", // We can fetch this from eBay API later if needed
      });

      try {
        const listings = await this.ebayOauthService.fetchEbayActiveListings(tokens.access_token);
        if (listings && listings.length > 0) {
          const inventoryData = listings.map((l: any) => {
            return {
              userId,
              costBasis: "0", 
              quantity: l.availability?.shipToLocationAvailability?.quantity ?? 1,
              listedPlatforms: ["ebay"],
              listingStatus: "listed" as any,
              notes: `eBay SKU: ${l.sku || "Unknown"}`,
              ebayActiveListings: JSON.stringify([l]),
            };
          });
          
          await db.insert(inventory).values(inventoryData);
        }
      } catch (err) {
        console.error("Failed to sync eBay listings:", err);
      }

      return res;
    }

    return this.repository.postUsersMeConnectedPlatforms({ ...body, userId });
  }

  async deleteUsersMeConnectedPlatformsPlatform(userId: string, platform: string) {
    return this.repository.deleteUsersMeConnectedPlatformsPlatform(userId, platform);
  }

  async getUsersMeNotificationPreferences(userId: string) {
    return this.repository.getUsersMeNotificationPreferences(userId);
  }

  async patchUsersMeNotificationPreferences(userId: string, body: any) {
    return this.repository.patchUsersMeNotificationPreferences(userId, body);
  }

  async listDealers() {
    return this.repository.listDealers();
  }

  async getDealerByUrl(customUrl: string) {
    return this.repository.getDealerByUrl(customUrl);
  }

  async getCustomers(userId: string) {
    return this.repository.getCustomers(userId);
  }

  async postCustomer(userId: string, body: any) {
    return this.repository.postCustomer(userId, body);
  }

  async patchCustomer(userId: string, id: string, body: any) {
    return this.repository.patchCustomer(userId, id, body);
  }

  async deleteCustomer(userId: string, id: string) {
    return this.repository.deleteCustomer(userId, id);
  }

  async postUsersMeExport(userId: string) {
    return this.repository.postUsersMeExport(userId);
  }

  async deleteMe(userId: string) {
    return this.repository.deleteMe(userId);
  }

  async presignAvatarUpload(userId: string, contentType: string) {
    if (!env.S3_BUCKET_NAME) {
      throw new Error("S3 not configured");
    }

    const ext = contentType === "image/png" ? "png" : "jpg";
    const key = `avatars/${userId}/profile.${ext}`;

    const client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const cmd = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 300 });
    const publicUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, publicUrl, key };
  }
}
