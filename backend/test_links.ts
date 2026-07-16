import { db } from "./src/db";
import { inventory } from "./src/db/schema";

async function main() {
  const item = await db.query.inventory.findFirst({
    where: (i, { isNotNull }) => isNotNull(i.ebay_sales_completed)
  });
  if (item) {
    const parsed = JSON.parse(item.ebay_sales_completed!);
    console.log("eBay sold item:", parsed[0]);
  }

  const item2 = await db.query.inventory.findFirst({
    where: (i, { isNotNull }) => isNotNull(i.myslabs_sales_completed)
  });
  if (item2) {
    const parsed = JSON.parse(item2.myslabs_sales_completed!);
    console.log("MySlabs sold item:", parsed[0]);
  }
}
main();
