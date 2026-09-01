"use client";

import { AdminDeleteSubmitButton } from "@/components/admin/admin-delete-submit-button";

interface DeleteProjectButtonProps {
  label: string;
}

export function DeleteProjectButton({ label }: DeleteProjectButtonProps) {
  return (
    <AdminDeleteSubmitButton
      confirmMessage="Esta acción eliminará el proyecto y no se puede deshacer."
      confirmTitle="Eliminar proyecto"
      label={label}
      loadingMessage="Estamos eliminando el proyecto."
      loadingTitle="Eliminando proyecto"
    />
  );
}
