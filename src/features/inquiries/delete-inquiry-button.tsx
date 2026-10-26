"use client";

import { AdminDeleteSubmitButton } from "@/components/admin/admin-delete-submit-button";

interface DeleteInquiryButtonProps {
  label: string;
}

export function DeleteInquiryButton({ label }: DeleteInquiryButtonProps) {
  return (
    <AdminDeleteSubmitButton
      confirmMessage="¿Eliminar esta consulta? Se borrarán para siempre los datos de contacto y el mensaje. Esta acción no se puede deshacer."
      confirmTitle="Eliminar consulta"
      label={label}
      loadingMessage="Estamos eliminando la consulta."
      loadingTitle="Eliminando consulta"
    />
  );
}
