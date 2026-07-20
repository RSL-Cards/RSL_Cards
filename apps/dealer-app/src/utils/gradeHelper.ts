export function isGraded(title: string, condition?: string): boolean {
  const combined = `${title} ${condition || ""}`.toLowerCase();
  
  // Exclude fake/clickbait graded descriptors commonly used to hijack graded search traffic
  const isFakeGraded = /\b(ready|candidate|potential|prob|raw|ungraded|not graded|look|lky|range)\b|\?/i.test(combined);
  if (isFakeGraded) return false;

  return /\b(psa|bgs|sgc|cgc|csg|slab)\b|graded/i.test(combined);
}
