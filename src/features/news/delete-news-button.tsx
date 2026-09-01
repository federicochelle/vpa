"use client";

import { AdminDeleteSubmitButton } from "@/components/admin/admin-delete-submit-button";

interface DeleteNewsButtonProps {
  label: string;
}

export function DeleteNewsButton({ label }: DeleteNewsButtonProps) {
  return (
    <AdminDeleteSubmitButton
      confirmMessage="Esta acción eliminará la noticia y no se puede deshacer."
      confirmTitle="Eliminar noticia"
      label={label}
      loadingMessage="Estamos eliminando la noticia."
      loadingTitle="Eliminando noticia"
    />
  );
}
