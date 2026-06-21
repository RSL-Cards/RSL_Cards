# eBay Search API Investigation: Keyword Specificity and Missing Listings

## Overview
During the development and testing of the RSL Cards AI scanning and comping system, we encountered an issue where highly specific search strings (e.g., those including card numbers and grades) resulted in extremely poor or empty search results from the eBay Browse API, even when exact matching items were currently active on the eBay platform. 

This document outlines the testing performed, the behaviors observed from the eBay Developer API, and the architectural decisions made to bypass these limitations.

---

## 1. The Problem
When the AI Card Scanner generated a highly precise search string, such as:
\`"2007 Bowman Chrome Patrick Willis Refractor #BC93 PSA 10"\`

The eBay API would return a fraction of the actual listings available. For example, a raw `curl` directly to the eBay `buy/browse/v1/item_summary/search` endpoint using the above string yielded **only 2 active listings**, completely missing a highly relevant active auction listing (`Item ID: 257569754593` titled `"2007 Bowman Chrome Patrick Willis RC Refractor Rookie 49ers PSA 10"`).

## 2. Testing Methodology & Observations

To diagnose why the eBay API was dropping perfectly valid listings, we performed a series of raw API queries using varying levels of keyword specificity.

### Test A: The Hyper-Specific Query
* **Query:** `"2007 Bowman Chrome Patrick Willis Refractor PSA 10"`
* **Result:** `2 total listings`
* **Observation:** The API behaves like a strict `AND` operator. Because the seller of the missing item stuffed keywords like "RC", "Rookie", and "49ers", and omitted the "#BC93", the strict eBay search algorithm excluded it. Furthermore, formatting differences in how a seller types "PSA 10" (e.g., "PSA-10", "PSA 10 GEM MINT") causes severe truncation of search results.

### Test B: The Broad Query
* **Query:** `"Patrick Willis 2007 Bowman Chrome Refractor"` (Dropped the grade and card number)
* **Result:** `24 total listings`
* **Observation:** By dropping the highly specific modifiers, the API returned significantly more valid matches. This proves that eBay's internal search algorithm heavily penalizes overly specific queries. 

### Test C: The Ultra-Broad Query & Missing Item Phenomenon
* **Query:** `"Patrick Willis 2007 Bowman Chrome"` (Dropped the parallel name)
* **Result:** `104 total listings`
* **Observation:** Even with 104 results, the specific auction listing from our test (`Item ID: 257569754593`) was **still missing** from the search endpoint.
* **Direct Item Query:** We queried the eBay Item API directly for `v1|257569754593|0` and it successfully returned the full payload. This confirms the listing is active and valid, but is actively being suppressed from the `search` endpoint.

## 3. Why eBay Suppresses Active Listings in Search
Based on the tests and eBay Developer documentation, the eBay Browse API actively suppresses certain items from the `/search` endpoint due to:

1. **Indexing Delays:** Newly created listings are visible on the consumer website immediately, but the Developer API search index can take up to 12-24 hours to sync.
2. **Shipping/Regional Restrictions:** If a listing has strict cross-border shipping restrictions (e.g., "May not ship to India"), the API will often drop it from search results entirely if the endpoint's default geographic context triggers a conflict.
3. **Algorithmic Protection:** The Search API filters out listings from sellers with specific internal flags, or places items in obscured sub-categories to protect consumer experience on third-party apps.

## 4. The Solution: Two-Tier Comping Strategy

Because we cannot force the eBay API to return suppressed listings, and because strict queries destroy our result pool, we implemented a **Two-Tier System**:

### Tier 1: Broad API Net (The Initial AI Scanner)
We instructed the first Vertex AI model (the visual scanner) to generate intentionally **broad** search strings. It is strictly forbidden from including the Card Number, Grade, or Print Run in the search query. 
* *Example Generated String:* `"Patrick Willis 2007 Bowman Chrome Refractor"`
* *Outcome:* We force the eBay API to return maximum data density (e.g., 20+ listings instead of 2).

### Tier 2: Strict AI Filtering (The Gemini Modal)
Once we receive the massive list of broad comps from eBay, we pass all the item titles to a secondary strict Gemini model (`filterWithGemini`). 
* *Outcome:* This model is instructed to ignore "seller keyword fluff" (like "RC", "Rookie", team names) but is highly strict on core attributes (Player, Year, Set, Parallel). It perfectly filters out the noise, leaving only exact matches, regardless of grade or grading company.

### Conclusion
By relying on the eBay API purely for raw data aggregation, and offloading the exact-matching logic to a custom LLM prompt, we successfully bypass eBay's flawed search algorithm and maximize the accuracy of the returned market comps.
