# RSL Cards Ecosystem — Unified API Documentation 📘

This document serves as the single source of truth for all API endpoints exposed by the consolidated **Bun + Elysia API Monorepo**. 

Under the unified gateway architecture, all requests are proxied via Nginx to the backend container running at Port `3000`. The base path for all endpoints is `/v1`.

---

## 🔑 Authentication (`/v1/auth`)

Handles user sign-up, email validation, session tokens, password resets, and federated identity providers.

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register schema (Email, Password, Name) | Sign up a new user profile on the platform |
| `POST` | `/login` | Login credentials (Email, Password) | Authenticate user credentials and issue Access & Refresh tokens |
| `POST` | `/refresh` | Refresh token schema | Validate refresh token and issue a new short-lived access token |
| `POST` | `/logout` | Access/Refresh tokens | Blacklist active session tokens and clear credentials |
| `POST` | `/forgot-password` | Email | Trigger forgotten password reset email with secure verification link |
| `POST` | `/reset-password` | Token + New Password | Commit new password changes using secure token link |
| `POST` | `/oauth/google` | Google client token | Authenticate/Register a user seamlessly using Google Sign-In |
| `POST` | `/oauth/apple` | Apple identity token | Authenticate/Register a user seamlessly using Sign-In with Apple |
| `GET` | `/admin-demo` | *None* | Utility mock endpoint for role check validation |

---

## 👤 User Profiles & Preferences (`/v1/users`)

Provides read/write profile controls, dealer profile links, platform integrations (Stripe, eBay), and notification preference configurations.

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/me` | *None* | Retrieve current authenticated user session data |
| `PATCH` | `/me` | Profile updates | Modify user fields (Phone, Business Name, Location) |
| `POST` | `/me/avatar` | Multi-part image | Upload and crop profile avatar stored in S3 |
| `POST` | `/me/onboarding` | Business Details | Set up dealer tier and catalog preferences |
| `GET` | `/me/payment-methods` | *None* | Get registered credit cards & billing profiles |
| `POST` | `/me/payment-methods` | Card details | Securely register Stripe payment method token |
| `PATCH` | `/me/payment-methods/:id` | Card modifications | Modify default card or expiration fields |
| `DELETE` | `/me/payment-methods/:id` | Card ID | Remove card profile from Stripe customer profile |
| `GET` | `/me/connected-platforms` | *None* | List connected channels (eBay, Shopify, Mercari, etc.) |
| `POST` | `/me/connected-platforms` | Platform credentials | Store verified OAuth tokens for channel listings sync |
| `DELETE` | `/me/connected-platforms/:platform` | Platform Name | Disconnect OAuth channel integration and revoke tokens |
| `GET` | `/ebay/callback` | OAuth query parameters | Handle eBay seller portal callback redirect to persist store tokens |
| `GET` | `/me/notification-preferences` | *None* | Retrieve personalized push, email, and alert thresholds |
| `PATCH` | `/me/notification-preferences` | Preference flags | Toggle mobile push, email newsletters, and pricing alerts |
| `GET` | `/dealers` | *None* | List all public dealers registered on RSL platform |
| `GET` | `/dealers/:customUrl` | Dealer URL | Fetch public shop storefront profile for specific custom URL |
| `GET` | `/me/customers` | *None* | Get CRM list of buyers/sellers linked to dealer store |
| `POST` | `/me/customers` | Customer details | Add a new customer contact profile |
| `PATCH` | `/me/customers/:id` | Customer updates | Update customer contact metrics or notes |
| `DELETE` | `/me/customers/:id` | Customer ID | Delete customer contact card |
| `POST` | `/me/export` | *None* | Request full zip of catalog data under CCPA/GDPR compliance |
| `DELETE` | `/me` | *None* | Delete user account and cascade delete inventory records |

---

## 🗃️ Inventory Management (`/v1/inventory`)

Manages stock holdings, cost bases, grade metrics, photo hosting, bulk actions, and exports.

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Query filters (Sport, Grade, Status, Page) | Paginated list of inventory cards held by authenticated user |
| `GET` | `/summary` | *None* | Total portfolio value, cost basis, and unrealized gains |
| `GET` | `/aging-alerts` | *None* | List of stock items held for >60 days without listing |
| `GET` | `/:id` | Inventory Item ID | Retrieve detailed record of specific catalog card |
| `POST` | `/` | Card metadata | Add scanned card to inventory. Auto-resolves missing catalog items |
| `PATCH` | `/:id` | Details updates | Modify inventory entry details (Quantity, Grade, Cost) |
| `DELETE` | `/:id` | Inventory Item ID | Delete inventory record and clear active listings |
| `POST` | `/:id/photos` | Multi-part photos | Request presigned S3 upload URLs for catalog photos |
| `POST` | `/:id/photos/confirm` | Photo filenames array | Verify S3 uploads succeeded and link URLs to card entry |
| `DELETE` | `/:id/photos/:photoIndex` | Photo index | Delete a photo attachment from inventory card |
| `POST` | `/revalue` | *None* | Manually trigger inventory-wide pricing refresh against eBay sold comps |
| `POST` | `/bulk-import` | CSV/Excel file | Parse card listing lists in background. Returns task `jobId` |
| `GET` | `/bulk-import/:jobId` | Job ID | Query processing status of active Excel/CSV imports |
| `GET` | `/export` | Format (`csv` \| `xlsx`) | Generate download link containing full stock collection export |
| `GET` | `/public/:dealerId` | Dealer ID | Fetch public card showcase of specific dealer shop |

---

## 📈 Price comps & Master Catalog (`/v1/cards`)

Handles computerized scanning, slab barcodes, card searches, price alerts, and want lists.

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/scan` | Image bytes | Submit cropped card image to Ximilar API to resolve base card ID |
| `POST` | `/scan-barcode` | Barcode string | Parse PSA/BGS slab certification barcode number to fetch specs |
| `GET` | `/search` | Query `q` + filters | Unified catalog search across all sports, years, and sets |
| `GET` | `/offline-db` | *None* | Fetch base sqlite database file for offline search cache on device |
| `GET` | `/deal-rating` | Market vs Cost | Calculate index rating score for listing prices |
| `GET` | `/price-alerts` | *None* | Retrieve want list alert thresholds set by user |
| `POST` | `/price-alerts` | Target price alert specs | Create target alert on specific variant & grade (PSA 10, PSA 9, etc.) |
| `DELETE` | `/price-alerts/:id` | Alert ID | Delete pricing alert |
| `GET` | `/want-list` | *None* | Retrieve dealer's desired purchase want list |
| `POST` | `/want-list` | Want details | Add base card target to want list catalog |
| `DELETE` | `/want-list/:id` | Want Item ID | Remove card target from want list |
| `GET` | `/:id` | Card ID | Get master catalog card metadata, attributes, and variants |
| `GET` | `/:id/comps` | Grade + Platform filters | List recent completed eBay & WhatNot sold listings matching card specs |
| `GET` | `/:id/price-history` | Timeframe filters | Fetch sparkline dataset representing historical average valuations |

---

## 🤝 Buy, Sell & Trade Ledger (`/v1/transactions`)

Records transaction ledgers and customer invoicing, and triggers automated inventory updates.

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/buy` | Card specs + Cost + Seller | Record purchase. Creates inventory row automatically |
| `POST` | `/sell` | Inventory ID + Price + Buyer | Record sale. Mark inventory item as listed/sold automatically |
| `POST` | `/trade` | Give cards + Take cards + Customer | Record multi-card trade. Automates stock deductions & additions |
| `POST` | `/sync` | *None* | Resync transactions logs from external platforms (e.g. eBay sales) |
| `GET` | `/` | Query filters | Retrieve paginated ledger of historical transactions |
| `GET` | `/today` | *None* | Today's aggregate transaction statistics (Sales, Buys, Profit) |
| `GET` | `/customers/:customerId` | Customer ID | Get full transactional trade history with a specific customer contact |
| `GET` | `/export` | *None* | Generate bookkeeping PDF/CSV transaction statements |
| `GET` | `/:id` | Transaction ID | Retrieve detailed transaction receipt audit log |
| `DELETE` | `/:id` | Transaction ID | Roll back transaction logs and restore inventory stock states |

---

## 🛍️ Multi-Channel Listings (`/v1/listings`)

Syncs inventory stock to active marketplaces, calculates vendor fees, and handles incoming webhooks.

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Status, Platform filters | Retrieve list of active shop listings across connected platforms |
| `POST` | `/` | Inventory ID + Platforms | Publish inventory card as listings on chosen channels (eBay, WhatNot) |
| `GET` | `/analytics` | Timeframe filters | Get channel performance breakdown (Ebay fees vs WhatNot margins) |
| `GET` | `/fee-calculator` | Platform + Price | Calculate projected net payout after platform fees & commissions |
| `POST` | `/generate-content` | Card specs | Generate high-converting eBay listing title & description using AI |
| `GET` | `/price-comparison/:inventoryId` | Inventory ID | Compare listing price with current lowest active listings across web |
| `GET` | `/ebay/search` | Query keywords | Query current active eBay listings |
| `GET` | `/ebay/sold` | Query keywords | Query completed eBay sold sales comps |
| `GET` | `/:id` | Listing ID | Get status, platform item IDs, and active price of listing |
| `PATCH` | `/:id/price` | New Price | Update listing price simultaneously across all published channels |
| `POST` | `/:id/relist` | Relist rules | Relist ended or unsold platform item listings |
| `DELETE` | `/:id` | Listing ID | End active listings and remove from external marketplaces |
| `POST` | `/webhooks/ebay` | eBay Event XML/JSON | Listen to eBay sold events to mark inventory sold in real-time |
| `POST` | `/webhooks/whatnot` | WhatNot sold hooks | Process WhatNot bidding room sold alerts |
| `POST` | `/webhooks/mercari` | Mercari sold hooks | Process Mercari store purchase alerts |
| `POST` | `/webhooks/tcgplayer` | TCGPlayer sold hooks | Process TCGPlayer store sales notifications |
| `POST` | `/webhooks/shopify` | Shopify checkout hook | Listen to Shopify cart checkout events for stock sync |

---

## 🤖 AI Vision & Narratives (`/v1/narratives`)

Triggers vision models and handles curated pricing highlights.

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/scan-card` | Image URL / bytes | Call Gemini Vision model to extract card properties (Year, Set, Rookie flag) |
| `GET` | `/trigger-ingestion` | *None* | Ingest latest daily sport index cards catalog |
| `GET` | `/feed` | Page filters | Get high-engagement public feed cards (scans, major sales, portfolio jumps) |
| `GET` | `/inventory` | *None* | Get generated descriptive copywriting cards in stock |
| `GET` | `/daily-insight` | *None* | Get curated daily narrative portfolio analysis (market drops, top gainers) |
| `GET` | `/weekly-recap` | *None* | Get portfolio recap digest generated for active collectors |
| `GET` | `/player/:playerName` | Player Name | Fetch AI narrative profile detailing player cards market performance |
| `GET` | `/card/:cardId` | Card ID | Fetch specific card AI narrative card report |
| `GET` | `/:id` | Narrative ID | Get detailed view of specific generated card text insight |
| `POST` | `/admin/generate` | Admin override prompt | Trigger manual bulk narrative regeneration for target cards |
| `PATCH` | `/admin/:id/approve` | Narrative ID | Approve generated narrative to appear on public feed |
| `PATCH` | `/admin/:id/reject` | Narrative ID | Reject generated narrative and queue for deletion |
| `PATCH` | `/admin/:id` | Edits payload | Manually edit generated narrative description text |

---

## 🔔 Regional Shows & Push Alerts (`/v1/notifications`)

Manages firebase notifications, alert feeds, card shows, and RSVP tables.

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Page / Type filters | Fetch in-app notifications inbox feed |
| `GET` | `/unread-count` | *None* | Get unread notification counts for mobile badge |
| `PATCH` | `/read-all` | *None* | Mark all notifications in inbox as read |
| `PATCH` | `/:id/read` | Notification ID | Mark a specific notification as read |
| `GET` | `/shows` | Date/Location filters | List upcoming regional sports card shows & conventions |
| `GET` | `/shows/:id` | Show ID | Get detailed schedule, location map, and attending dealers for show |
| `POST` | `/shows/:id/attend` | *None* | Register dealer attendance RSVP for a specific show |
| `DELETE` | `/shows/:id/attend` | *None* | Cancel RSVP attendance registration for card show |
| `GET` | `/shows/:id/dealers` | Show ID | List all dealers attending or setting up tables at card show |
| `POST` | `/shows/admin` | Show specs | Add an upcoming card show event to regional database catalog |
| `PATCH` | `/shows/admin/:id` | Edits payload | Edit card show location, dates, or contact links |
| `DELETE` | `/shows/admin/:id` | Show ID | Remove card show event from index listings |

---

## 📈 Portfolio Analytics (`/v1/analytics`)

Specialized read-replica data reporting for collections, tax audits, and monthly trends.

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/daily` | *None* | Portfolio snapshot containing daily profits and holds values |
| `GET` | `/today-activity` | *None* | Summary count of cards scanned, listed, sold, and traded today |
| `GET` | `/report` | Period (`week` \| `month` \| `year`) | Generate detailed portfolio value chart coordinates |
| `GET` | `/profit/channel` | Period | Retrieve net income comparison per platform (eBay vs WhatNot) |
| `GET` | `/profit/sport` | Period | Retrieve net profit comparison per sport type (baseball vs football) |
| `GET` | `/top-cards` | *None* | Get list of highest-value cards currently in stock portfolio |
| `GET` | `/inventory-trend` | *None* | Historical trend coords mapping stock valuation changes over time |
| `GET` | `/platforms` | *None* | Detailed channel analytics showing sales speed, listing fees, and volume |
| `GET` | `/tax/:year` | Tax Year | Generate taxable transactions ledger for filing schedule C forms |
| `GET` | `/expenses` | *None* | Retrieve business expense transactions (booth rentals, supplies) |
| `POST` | `/expenses` | Expense details | Log a new business operating expense |
| `PATCH` | `/expenses/:id` | Expense modifications | Edit logged business operating expense |
| `DELETE` | `/expenses/:id` | Expense ID | Delete business operating expense |
| `GET` | `/collection` | *None* | Long-term hold collections portfolio statistics |
| `GET` | `/collection/recap` | *None* | Weekly summary recap comparing long-term holds vs short-term inventory flips |

---

## 🛡️ Admin Controls (`/v1/admin`)

Privileged endpoints for system monitoring, roles verification, audit logs, and toggle flags.

| Method | Endpoint | Payload / Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | Pagination / Roles filters | List all platform users and dealer subscription tiers |
| `GET` | `/users/:id` | User ID | Fetch comprehensive user profile, metrics, and security limits |
| `PATCH` | `/users/:id/role` | New Role | Update user system permissions (Dealer, Admin, Moderator) |
| `PATCH` | `/users/:id/suspend` | Suspend duration / reason | Temporarily or permanently suspend user access for terms violations |
| `PATCH` | `/users/:id/unsuspend` | *None* | Restore suspended user profile and reactivate session tokens |
| `DELETE` | `/users/:id` | User ID | Hard delete user profile, catalog data, and Stripe tokens |
| `GET` | `/narratives/pending` | *None* | Moderate AI narrative feed drafts awaiting publication approval |
| `GET` | `/reviews/pending` | *None* | Moderate customer dealer store feedback reviews |
| `PATCH` | `/reviews/:id/approve` | Review ID | Approve review rating to display on public dealer profile |
| `DELETE` | `/reviews/:id` | Review ID | Flag and reject customer dealer review |
| `GET` | `/feature-flags` | *None* | View active platform feature flags (e.g. Google auth enabled, scan limits) |
| `PATCH` | `/feature-flags/:key` | Flag values | Enable, disable, or adjust values of global feature flags |
| `GET` | `/audit-logs` | User / Event type filters | Retrieve secure system-wide logs tracking critical user actions |
| `GET` | `/stats` | *None* | Get system metrics (CPU utilization, database pool load, active websocket conns) |
