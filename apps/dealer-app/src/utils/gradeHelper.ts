export function isGraded(title: string, condition?: string): boolean {
  let combined = `${title} ${condition || ""}`.toLowerCase();
  // Remove "ungraded" and "not graded" so they don't trigger the "graded" keyword
  combined = combined.replace(/ungraded/g, "");
  combined = combined.replace(/not graded/g, "");
  return /\b(psa|bgs|sgc|cgc|csg|slab)\b|graded/i.test(combined);
}
