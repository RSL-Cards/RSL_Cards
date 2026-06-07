export const CARD_SCAN_PROMPT = `You are an expert sports card identifier. Analyze this card image and extract the following details in strict JSON format with NO markdown, NO extra text.

Return ONLY this JSON:
{
  "player_name": "Full Player Name",
  "year": 2017,
  "set_name": "Panini Prizm",
  "variation": "Silver Prizm",
  "sport": "football",
  "card_number": "269",
  "manufacturer": "Panini",
  "is_rookie": false,
  "is_autograph": false,
  "is_relic": false,
  "grading": {
    "company": "PSA",
    "grade": "10",
    "cert_number": "12345678"
  },
  "confidence": 0.95
}

Rules:
- "year" must be a number
- "confidence" 0.0-1.0 based on image clarity
- "sport": "football" | "basketball" | "baseball" | "hockey" | "soccer" | "other"
- "variation": the parallel/refractor name exactly as it appears on the card or is commonly known on eBay (e.g. "Silver Prizm", "Gold Refractor", "Holo", "Base", "Blue Wave", "Red /299"). Include the print run if visible (e.g. "Orange /49"). If base/no variation, use "Base"
- "card_number": the number printed on the card (e.g. "269", "RC-15"). Omit the # symbol. Use null if not visible
- "set_name": the brand+product name as used on eBay (e.g. "Panini Prizm", "Topps Chrome", "Bowman Draft"). Do NOT include the year in set_name
- "manufacturer": the card company (e.g. "Panini", "Topps", "Upper Deck", "Bowman")
- "is_rookie": true if card has RC logo, "Rookie" text, or is player's first-year card
- "is_autograph": true if card has a visible on-card or sticker autograph
- "is_relic": true if card contains embedded patch/jersey/memorabilia window
- If grading label (PSA/BGS/SGC/CSG slab) not visible, omit "grading" field entirely
- If a field is not visible or not determinable, use null
- Return ONLY the JSON object, nothing else`;
