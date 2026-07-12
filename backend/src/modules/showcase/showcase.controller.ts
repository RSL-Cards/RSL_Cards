import { ShowcaseService } from "./showcase.service.js";

export class ShowcaseController {
  constructor(private readonly service: ShowcaseService) {}

  getDealerProfile = async ({ params }: { params: any }) => {
    return await this.service.getDealerProfile(params.handle);
  };

  getDealerInventory = async ({ params, query }: { params: any; query: any }) => {
    // First, resolve the handle to a user ID securely
    const profile = await this.service.getDealerProfile(params.handle);
    
    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 20;

    return await this.service.getDealerInventory(profile.userId, page, limit);
  };
}
