import type { Project } from "@/types/project";
import type { Property, PropertyType } from "@/types/property";

export const MIN_EXACT_RESULTS_FOR_FALLBACK = 3;
export const MAX_SUGGESTIONS = 6;

export function normalizeSearchFilterValue(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("es-UY") ?? "";
}

export function parseZoneFilter(value: string | undefined) {
  const normalizedValue = normalizeSearchFilterValue(value?.split("/").at(-1));
  return normalizedValue || null;
}

function addUniqueResults<T extends { id: string }>(
  results: T[],
  candidates: T[],
  seenIds: Set<string>,
) {
  for (const candidate of candidates) {
    if (results.length >= MAX_SUGGESTIONS) {
      return;
    }

    if (seenIds.has(candidate.id)) {
      continue;
    }

    seenIds.add(candidate.id);
    results.push(candidate);
  }
}

export function buildRelatedPropertyResults({
  properties,
  selectedType,
  selectedZone,
}: {
  properties: Property[];
  selectedType: PropertyType | null;
  selectedZone: string | null;
}) {
  const hasFilters = Boolean(selectedType || selectedZone);
  const exactResults = properties.filter((property) => {
    const matchesType = selectedType ? property.propertyType === selectedType : true;
    const matchesZone = selectedZone
      ? normalizeSearchFilterValue(property.neighborhood) === selectedZone
      : true;

    return matchesType && matchesZone;
  });

  if (!hasFilters || exactResults.length >= MIN_EXACT_RESULTS_FOR_FALLBACK) {
    return { exactResults, suggestedResults: [] };
  }

  const seenIds = new Set(exactResults.map((property) => property.id));
  const suggestedResults: Property[] = [];

  if (selectedType && selectedZone) {
    addUniqueResults(
      suggestedResults,
      properties.filter((property) => property.propertyType === selectedType),
      seenIds,
    );
    addUniqueResults(
      suggestedResults,
      properties.filter(
        (property) => normalizeSearchFilterValue(property.neighborhood) === selectedZone,
      ),
      seenIds,
    );
  }

  addUniqueResults(suggestedResults, properties, seenIds);

  return { exactResults, suggestedResults };
}

export function buildRelatedProjectResults({
  projects,
  selectedZone,
}: {
  projects: Project[];
  selectedZone: string | null;
}) {
  const exactResults = selectedZone
    ? projects.filter(
        (project) => normalizeSearchFilterValue(project.neighborhood) === selectedZone,
      )
    : projects;

  if (!selectedZone || exactResults.length >= MIN_EXACT_RESULTS_FOR_FALLBACK) {
    return { exactResults, suggestedResults: [] };
  }

  const seenIds = new Set(exactResults.map((project) => project.id));
  const suggestedResults: Project[] = [];

  addUniqueResults(suggestedResults, projects, seenIds);

  return { exactResults, suggestedResults };
}
