"use client";

import { useRef } from "react";
import type { Inquiry } from "@/types/inquiry";

interface AdminInquiryStatusFormProps {
  action: (formData: FormData) => void | Promise<void>;
  inquiryId: string;
  status: Inquiry["status"];
}

export function AdminInquiryStatusForm({
  action,
  inquiryId,
  status,
}: AdminInquiryStatusFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-3"
      ref={formRef}
    >
      <input name="id" type="hidden" value={inquiryId} />
      <label className="flex min-w-[220px] flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Estado
        </span>
        <select
          className="border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
          defaultValue={status}
          name="status"
          onChange={() => formRef.current?.requestSubmit()}
        >
          <option value="new">Nueva</option>
          <option value="contacted">Contactada</option>
          <option value="closed">Cerrada</option>
        </select>
      </label>
    </form>
  );
}
