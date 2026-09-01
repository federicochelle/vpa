import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import { listAllFeatures } from "@/features/features/features.data";
import { PropertyForm } from "@/features/properties/property-form";

interface AdminNewPropertyPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AdminNewPropertyPage({
  searchParams,
}: AdminNewPropertyPageProps) {
  const params = await searchParams;
  const featuresResult = await listAllFeatures();

  return (
    <>
      {params.error ? (
        <AdminFeedbackModal message={params.error} title="No pudimos crear la propiedad" variant="error" />
      ) : null}
      <div>
        <div className="panel admin-form-panel overflow-hidden">
          <div className="border-b border-border brand-panel-header px-6 py-10 sm:px-8 lg:px-12">
            <div className="space-y-4">
                <h4 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                  Nueva propiedad
                </h4>
            </div>
          </div>
          <div className="space-y-6 p-6 sm:p-8">
            <PropertyForm
              allFeatures={featuresResult.data}
              className="space-y-0"
              submitLabel="Crear propiedad"
            />
          </div>
        </div>
      </div>
    </>
  );
}
