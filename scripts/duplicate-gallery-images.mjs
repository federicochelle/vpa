import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TARGET_IMAGES_PER_ENTITY = 6;

function buildDuplicates(rows, foreignKey) {
  if (rows.length === 0 || rows.length >= TARGET_IMAGES_PER_ENTITY) {
    return [];
  }

  const sortedRows = [...rows].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  const sourceRows = sortedRows.filter((row) => !row.is_cover);
  const duplicateSources = sourceRows.length > 0 ? sourceRows : sortedRows;
  const duplicatesNeeded = TARGET_IMAGES_PER_ENTITY - rows.length;
  const highestSortOrder = sortedRows.reduce(
    (max, row) => Math.max(max, row.sort_order ?? 0),
    0,
  );

  return Array.from({ length: duplicatesNeeded }, (_, index) => {
    const source = duplicateSources[index % duplicateSources.length];

    return {
      [foreignKey]: source[foreignKey],
      alt_text: source.alt_text ?? null,
      is_cover: false,
      public_id: source.public_id ?? null,
      sort_order: highestSortOrder + index + 1,
      url: source.url,
    };
  });
}

function groupRows(rows, foreignKey) {
  const groups = new Map();

  for (const row of rows) {
    const key = row[foreignKey];
    const current = groups.get(key) ?? [];
    current.push(row);
    groups.set(key, current);
  }

  return groups;
}

async function duplicateTable({
  table,
  foreignKey,
}) {
  const { data, error } = await supabase
    .from(table)
    .select(`id, ${foreignKey}, url, public_id, alt_text, sort_order, is_cover, created_at`)
    .order(foreignKey, { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const groupedRows = groupRows(data, foreignKey);
  const inserts = [];
  let skipped = 0;

  for (const rows of groupedRows.values()) {
    const duplicates = buildDuplicates(rows, foreignKey);

    if (duplicates.length === 0) {
      skipped += 1;
      continue;
    }

    inserts.push(...duplicates);
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from(table).insert(inserts);

    if (insertError) {
      throw insertError;
    }
  }

  return {
    inserted: inserts.length,
    skipped,
    touched: groupedRows.size - skipped,
    totalEntities: groupedRows.size,
  };
}

const propertyResult = await duplicateTable({
  table: "property_images",
  foreignKey: "property_id",
});

const projectResult = await duplicateTable({
  table: "project_images",
  foreignKey: "project_id",
});

console.log(
  JSON.stringify(
    {
      project_images: projectResult,
      property_images: propertyResult,
    },
    null,
    2,
  ),
);
