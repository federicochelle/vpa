import Link from "next/link";

const INSTAGRAM_URL = "https://www.instagram.com/vpa.negocios.inmobiliarios?igsh=MXk4NzFwNWpreWEy";
const WHATSAPP_URL = "https://wa.me/59899297235";

export function PublicWhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-0 z-50 flex flex-col items-end gap-1">
      <Link
        aria-label="Abrir Instagram"
        className="inline-flex h-12 w-12 items-center justify-center rounded-l-[22px] bg-[linear-gradient(180deg,#fd5949_0%,#d6249f_55%,#285aeb_100%)] text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary md:h-14 md:w-14"
        href={INSTAGRAM_URL}
        rel="noreferrer"
        target="_blank"
        title="Instagram"
      >
        <svg
          aria-hidden="true"
          className="h-6 w-6 text-white md:h-7 md:w-7"
          fill="none"
          viewBox="0 0 24 24"
        >
          <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.25" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
        </svg>
      </Link>

      <Link
        aria-label="Escribir por WhatsApp"
        className="inline-flex h-14 w-14 items-center justify-center rounded-l-[22px] bg-[#25D366] text-white shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:scale-105 hover:bg-[#1ebe5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary md:h-18 md:w-18"
        href={WHATSAPP_URL}
        rel="noreferrer"
        target="_blank"
        title="WhatsApp"
      >
        <svg
          aria-hidden="true"
          className="h-7 w-7 text-white md:h-9 md:w-9"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.54 0 .22 5.32.22 11.86c0 2.1.55 4.14 1.6 5.94L0 24l6.4-1.68a11.84 11.84 0 0 0 5.68 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.14-3.43-8.42Zm-8.44 18.28h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.8 1 .99-3.7-.23-.38a9.88 9.88 0 0 1-1.52-5.23c0-5.45 4.43-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.89a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.9-9.88 9.9Zm5.42-7.4c-.3-.15-1.77-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.28.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.13 4.54.72.31 1.29.5 1.73.64.73.23 1.39.2 1.91.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      </Link>
    </div>
  );
}
