import type { Metadata } from "next";
import { InvitePasswordForm } from "@/features/auth/invite-password-form";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function InvitePage() {
  return <InvitePasswordForm />;
}
