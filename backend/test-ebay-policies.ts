import { db } from "./src/db/index.js";

import { sql } from "drizzle-orm";

async function run() {
  const result = await db.execute(sql`SELECT access_token FROM user_connected_platforms WHERE platform = 'ebay' AND access_token IS NOT NULL LIMIT 1`);
  const ebayPlatform = result[0];

  if (!ebayPlatform) {
    console.error("No eBay access token found in database.");
    process.exit(1);
  }

  const token = ebayPlatform.accessToken;
  console.log("Found token, testing eBay APIs...");

  const fetchEbay = async (url: string) => {
    const res = await fetch(`https://api.ebay.com${url}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Language": "en-US",
        "Accept": "application/json"
      }
    });
    return res.json();
  };

  try {
    const fulfillment = await fetchEbay("/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_US");
    console.log("Fulfillment Policies:", fulfillment.fulfillmentPolicies?.length || 0);
    if (fulfillment.fulfillmentPolicies) console.log(fulfillment.fulfillmentPolicies[0]);

    const payment = await fetchEbay("/sell/account/v1/payment_policy?marketplace_id=EBAY_US");
    console.log("Payment Policies:", payment.paymentPolicies?.length || 0);
    if (payment.paymentPolicies) console.log(payment.paymentPolicies[0]);

    const returnPol = await fetchEbay("/sell/account/v1/return_policy?marketplace_id=EBAY_US");
    console.log("Return Policies:", returnPol.returnPolicies?.length || 0);
    if (returnPol.returnPolicies) console.log(returnPol.returnPolicies[0]);

    const locs = await fetchEbay("/sell/inventory/v1/location");
    console.log("Inventory Locations:", locs.locations?.length || 0);
    if (locs.locations) console.log(locs.locations[0]);

  } catch (err) {
    console.error("API Error:", err);
  }
  process.exit(0);
}

run();
