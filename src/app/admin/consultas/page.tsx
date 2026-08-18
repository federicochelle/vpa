import { AdminInquiriesTable } from "@/features/inquiries/admin-inquiries-table";
import { listAdminInquiries } from "@/features/inquiries/inquiries.data";

export default async function AdminInquiriesPage() {
  const result = await listAdminInquiries();

  return <AdminInquiriesTable inquiries={result.ok ? result.data : []} />;
}
