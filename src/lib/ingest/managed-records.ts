export type ExistingIngestedArticle = {
  article_kind: string | null;
  author_id: string | null;
  status: string | null;
};

export type ExistingIngestedCommunityRecord = {
  created_by: string | null;
  status: string | null;
};

export function isIngestionManagedArticle(record: ExistingIngestedArticle) {
  return (
    record.article_kind === "curated_external" &&
    record.author_id === null &&
    record.status === "published"
  );
}

export function isIngestionManagedCommunityRecord(
  record: ExistingIngestedCommunityRecord,
) {
  return record.created_by === null && record.status === "published";
}
