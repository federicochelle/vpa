"use client";

import { startTransition, useState } from "react";
import { CalendarClock, ExternalLink, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";
import {
  cancelInquiryMeetingAction,
  saveInquiryMeetingAction,
} from "@/features/inquiries/inquiries.actions";
import type { Inquiry } from "@/types/inquiry";

interface AdminInquiryMeetingPanelProps {
  inquiry: Pick<
    Inquiry,
    "email" | "id" | "meetUrl" | "meetingEnd" | "meetingStart" | "meetingStatus" | "name"
  >;
}

const TIME_ZONE = "America/Montevideo";
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

function getDateTimeParts(value: string | null) {
  const date = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function formatMeetingDate(value: string) {
  return new Intl.DateTimeFormat("es-UY", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

function getInitialDuration(start: string | null, end: string | null) {
  if (!start || !end) {
    return 30;
  }

  const duration = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
  return DURATION_OPTIONS.includes(duration) ? duration : 30;
}

export function AdminInquiryMeetingPanel({ inquiry }: AdminInquiryMeetingPanelProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; variant: "error" | "success" } | null>(null);
  const initialDateTime = getDateTimeParts(inquiry.meetingStart);
  const initialDuration = getInitialDuration(inquiry.meetingStart, inquiry.meetingEnd);
  const isScheduled = inquiry.meetingStatus === "scheduled" && Boolean(inquiry.meetingStart);

  function handleSubmit(formData: FormData) {
    const date = String(formData.get("date") ?? "");
    const time = String(formData.get("time") ?? "");
    const durationMinutes = Number(formData.get("durationMinutes"));

    setIsSaving(true);
    startTransition(async () => {
      try {
        const result = await saveInquiryMeetingAction({
          date,
          durationMinutes,
          inquiryId: inquiry.id,
          time,
        });

        if (!result.ok) {
          setFeedback({ message: result.message, variant: "error" });
          return;
        }

        setIsModalOpen(false);
        setFeedback({ message: result.message, variant: "success" });
        router.refresh();
      } catch {
        setFeedback({ message: "No se pudo actualizar la reunión.", variant: "error" });
      } finally {
        setIsSaving(false);
      }
    });
  }

  function handleCancel() {
    if (isCancelling) {
      return;
    }

    setIsCancelling(true);
    startTransition(async () => {
      try {
        const result = await cancelInquiryMeetingAction(inquiry.id);
        setShowCancelConfirmation(false);

        if (!result.ok) {
          setFeedback({ message: result.message, variant: "error" });
          return;
        }

        setFeedback({ message: result.message, variant: "success" });
        router.refresh();
      } catch {
        setFeedback({ message: "No se pudo cancelar la reunión.", variant: "error" });
      } finally {
        setIsCancelling(false);
      }
    });
  }

  return (
    <section className="space-y-5 border-t border-border pt-5">
      <h2 className="text-2xl font-display text-primary-strong">Reunión</h2>
      {isScheduled && inquiry.meetingStart ? (
        <div className="space-y-4 type-body-compact text-foreground">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 flex-none text-primary" />
            <div>
              <p className="font-semibold">{formatMeetingDate(inquiry.meetingStart)}</p>
              {inquiry.meetingEnd ? <p className="text-muted">Hasta {formatMeetingDate(inquiry.meetingEnd)}</p> : null}
            </div>
          </div>
          {inquiry.meetUrl ? (
            <a
              className="admin-button-secondary w-full"
              href={inquiry.meetUrl}
              rel="noreferrer"
              target="_blank"
            >
              Abrir Google Meet
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      ) : inquiry.meetingStatus === "cancelled" ? (
        <p className="type-body-compact text-muted">La reunión anterior fue cancelada.</p>
      ) : (
        <p className="type-body-compact text-muted">Todavía no hay una reunión coordinada.</p>
      )}
      <button
        className="admin-button-primary w-full"
        onClick={() => setIsModalOpen(true)}
        type="button"
      >
        {isScheduled ? "Reprogramar reunión" : "Coordinar reunión"}
      </button>
      {isScheduled ? (
        <button
          className="admin-button-secondary w-full text-primary-strong"
          onClick={() => setShowCancelConfirmation(true)}
          type="button"
        >
          Cancelar reunión
        </button>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-4">
          <form
            className="w-full max-w-sm rounded-[28px] border border-border bg-white p-6 shadow-[0_24px_60px_rgba(39,39,39,0.18)]"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit(new FormData(event.currentTarget));
            }}
          >
            <h2 className="font-display text-2xl text-foreground">
              {isScheduled ? "Reprogramar reunión" : "Coordinar reunión"}
            </h2>
            <p className="type-body-compact mt-2 text-muted">
              La invitación se enviará a {inquiry.name} ({inquiry.email}).
            </p>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="admin-label">Fecha</span>
                <input className="admin-input-base" defaultValue={initialDateTime.date} name="date" required type="date" />
              </label>
              <label className="grid gap-2">
                <span className="admin-label">Hora</span>
                <input className="admin-input-base" defaultValue={initialDateTime.time} name="time" required type="time" />
              </label>
              <label className="grid gap-2">
                <span className="admin-label">Duración</span>
                <select className="admin-input-base" defaultValue={initialDuration} name="durationMinutes">
                  {DURATION_OPTIONS.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} minutos
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="admin-button-secondary flex-1 justify-center" disabled={isSaving} onClick={() => setIsModalOpen(false)} type="button">
                Cancelar
              </button>
              <button className="admin-button-primary flex-1 justify-center" disabled={isSaving} type="submit">
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Confirmar
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {showCancelConfirmation ? (
        <AdminFeedbackModal
          cancelLabel="Volver"
          confirmLabel={isCancelling ? "Cancelando..." : "Cancelar reunión"}
          message="Se cancelará el evento de Google Calendar y se notificará al invitado."
          onClose={() => setShowCancelConfirmation(false)}
          onConfirm={handleCancel}
          title="¿Cancelar la reunión?"
          variant="confirm"
        />
      ) : null}
      {feedback ? (
        <AdminFeedbackModal
          autoCloseMs={feedback.variant === "success" ? 1800 : undefined}
          message={feedback.message}
          onClose={() => setFeedback(null)}
          title={feedback.variant === "success" ? "Reunión actualizada" : "No pudimos actualizar la reunión"}
          variant={feedback.variant}
        />
      ) : null}
    </section>
  );
}
