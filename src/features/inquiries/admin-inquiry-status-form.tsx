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
        <span className="admin-label">
          Estado
        </span>
        <select
          className="admin-input-base rounded-none"
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
