export interface CompsCardContext {
  player_name: string;
  year?: number | string | null;
  set_name?: string | null;
  variant_name?: string | null;
  variation?: string | null;
  card_number?: string | null;
  grade_key?: string | null;
  grade_company?: string | null;
  grade_value?: number | string | null;
  grading?: { company?: string; grade?: string | number } | null;
  search_string?: string | null;
}

export function parseGradeParts(input: {
  grade_key?: string | null;
  grade_company?: string | null;
  grade_value?: number | string | null;
  grading?: { company?: string; grade?: string | number } | null;
}): { selectedGrade: string; company: string } {
  const rawKey = input.grade_key?.trim();
  const companyFromFields =
    input.grade_company?.trim() ||
    input.grading?.company?.trim() ||
    "PSA";
  const valueFromFields =
    input.grade_value != null && input.grade_value !== ""
      ? String(input.grade_value)
      : input.grading?.grade != null
        ? String(input.grading.grade)
        : null;

  if (!rawKey || rawKey === "RAW") {
    if (valueFromFields) {
      return { selectedGrade: valueFromFields, company: companyFromFields };
    }
    return { selectedGrade: "RAW", company: companyFromFields };
  }

  const companyGradeMatch = rawKey.match(/^([A-Z]+)[_\s]([\d.]+)$/i);
  if (companyGradeMatch) {
    return {
      selectedGrade: companyGradeMatch[2],
      company: companyGradeMatch[1].toUpperCase(),
    };
  }

  if (/^\d+(?:\.\d+)?$/.test(rawKey)) {
    return { selectedGrade: rawKey, company: companyFromFields };
  }

  if (valueFromFields) {
    return { selectedGrade: valueFromFields, company: companyFromFields };
  }

  return { selectedGrade: "RAW", company: companyFromFields };
}

/** Numeric grade key for comps cache (matches dealer-app API + Gemini classifications). */
export function normalizeCompsGradeKey(
  grade_key?: string | null,
  grade_company?: string | null,
  grade_value?: number | string | null,
): string {
  return parseGradeParts({ grade_key, grade_company, grade_value }).selectedGrade;
}

export function buildCompsSearchQuery(card: CompsCardContext): string {
  const { selectedGrade, company } = parseGradeParts(card);

  if (card.search_string?.trim()) {
    const base = card.search_string.trim().replace(/\s+/g, " ");
    if (selectedGrade === "RAW") return base;
    return `${base} ${company} ${selectedGrade}`;
  }

  const base = [
    card.player_name,
    card.year,
    card.set_name,
    (card.variant_name || card.variation) &&
    (card.variant_name || card.variation) !== "Base"
      ? card.variant_name || card.variation
      : "",
    card.card_number ? `#${card.card_number}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (selectedGrade === "RAW") return base;
  return `${base} ${company} ${selectedGrade}`.trim();
}

export function buildCompsFetchParams(
  card: CompsCardContext & { variant_id?: string | null },
  limit = 20,
) {
  const gradeKey = normalizeCompsGradeKey(
    card.grade_key,
    card.grade_company,
    card.grade_value,
  );
  return {
    q: buildCompsSearchQuery(card),
    grade_key: gradeKey,
    variant_id: card.variant_id?.trim() || undefined,
    limit,
  };
}
