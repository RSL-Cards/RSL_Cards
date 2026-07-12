import { ShowcaseRepository } from "./showcase.repository.js";

export class ShowcaseService {
  constructor(private readonly repository: ShowcaseRepository) {}

  async getDealerProfile(handleOrId: string) {
    const profile = await this.repository.getDealerProfile(handleOrId);
    if (!profile) {
      throw new Error("Dealer not found or profile is not public");
    }
    return profile;
  }

  async getDealerInventory(userId: string, page: number = 1, limit: number = 20) {
    if (page < 1) page = 1;
    if (limit > 50) limit = 50;

    const items = await this.repository.getDealerInventory(userId, page, limit);
    return {
      data: items,
      page,
      limit,
      hasMore: items.length === limit,
    };
  }
}
