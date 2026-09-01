"use client";

import { AdminDeleteSubmitButton } from "@/components/admin/admin-delete-submit-button";

interface DeletePropertyButtonProps {
  label: string;
}

export function DeletePropertyButton({ label }: DeletePropertyButtonProps) {
  return (
    <AdminDeleteSubmitButton
      confirmMessage="Esta acción eliminará la propiedad y no se puede deshacer."
      confirmTitle="Eliminar propiedad"
      label={label}
      loadingMessage="Estamos eliminando la propiedad."
      loadingTitle="Eliminando propiedad"
      size="md"
    />
  );
}
