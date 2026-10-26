import { Notice } from "@/components/ui/notice";
import { AdminInquiriesTable } from "@/features/inquiries/admin-inquiries-table";
import { listAdminInquiries } from "@/features/inquiries/inquiries.data";

interface AdminInquiriesPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function AdminInquiriesPage({
  searchParams,
}: AdminInquiriesPageProps) {
  const query = await searchParams;
  const result = await listAdminInquiries();

  return (
    <div className="space-y-6">
      {query.error ? <Notice message={query.error} tone="error" /> : null}
      {query.success ? <Notice message={query.success} tone="success" /> : null}
      <AdminInquiriesTable inquiries={result.ok ? result.data : []} />
    </div>
  );
}
