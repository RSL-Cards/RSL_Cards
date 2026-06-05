import { Elysia } from "elysia";
import { ListingRepository } from "./listing.repository.ts";
import { ListingService } from "./listing.service.ts";
import { ListingController } from "./listing.controller.ts";
import { requireDealer } from "../../middleware/auth.js";

const repository = new ListingRepository();
const service = new ListingService(repository);
const controller = new ListingController(service);

export const listingModule = new Elysia({ prefix: "/v1/listings" })
  .post("/webhooks/ebay", controller.ebayWebhook)
  .post("/webhooks/whatnot", controller.whatnotWebhook)
  .post("/webhooks/mercari", controller.mercariWebhook)
  .post("/webhooks/tcgplayer", controller.tcgplayerWebhook)
  .post("/webhooks/shopify", controller.shopifyWebhook)
  .use(requireDealer)
  .post("/publish-ebay", controller.publishEbay)
  .get("/", controller.getListings)
  .post("/", controller.createListing)
  .get("/analytics", controller.getAnalytics)
  .get("/fee-calculator", controller.feeCalculator)
  .post("/generate-content", controller.generateContent)
  .get("/price-comparison/:inventoryId", controller.getPriceComparison)
  .get("/ebay/search", controller.ebaySearch)
  .get("/ebay/sold", controller.ebaySold)
  .get("/myslabs/sold", controller.myslabsSold)
  .get("/:id", controller.getListing)
  .patch("/:id/price", controller.updatePrice)
  .post("/:id/relist", controller.relist)
  .delete("/:id", controller.deleteListing);
