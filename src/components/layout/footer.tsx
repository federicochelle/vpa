import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import logoVpa from "../../../logovpa.webp";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/15 bg-primary">
      <div className="shell flex flex-col gap-10 py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
        <Link className="flex items-center justify-center lg:justify-start" href="/">
          <Image
            alt="VPA"
            className="h-auto w-72 sm:w-80 lg:w-[22rem]"
            src={logoVpa}
          />
        </Link>

        <div className="grid justify-items-center gap-5 text-center type-body !text-white lg:justify-items-start lg:text-left">
          <Link
            className="inline-flex items-center justify-center gap-4 transition-colors hover:text-white lg:justify-start"
            href="tel:+59899297235"
          >
            <Phone className="h-5 w-5 flex-none" />
            <span>+598 99 297 235</span>
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-4 transition-colors hover:text-white lg:justify-start"
            href="mailto:info@vpa.com.uy"
          >
            <Mail className="h-5 w-5 flex-none" />
            <span>info@vpa.com.uy</span>
          </Link>
          <Link
            className="inline-flex items-start justify-center gap-4 text-center transition-colors hover:text-white lg:justify-start lg:text-left"
            href="https://www.google.com.uy/maps/place/of.+904,+26+de+Marzo+3393,+11300+Montevideo,+Departamento+de+Montevideo/@-34.9061421,-56.1419676,17z/data=!3m1!4b1!4m5!3m4!1s0x959f81145bc7f3fb:0x6a8c1b0d02b70b3a!8m2!3d-34.9061421!4d-56.1397789?hl=es-419"
            rel="noreferrer"
            target="_blank"
          >
            <MapPin className="mt-0.5 h-5 w-5 flex-none" />
            <span>26 de Marzo 3393 of. 904 - Montevideo Uruguay</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 self-center lg:self-auto">
          <Link
            aria-label="Facebook"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white hover:text-primary"
            href="https://www.facebook.com/profile.php?id=100083640788969#"
            rel="noreferrer"
            target="_blank"
            title="Facebook"
          >
            <svg
              aria-hidden="true"
              className="h-7 w-7 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.019 4.388 11.009 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.021 1.792-4.689 4.533-4.689 1.313 0 2.686.235 2.686.235v2.966H15.83c-1.49 0-1.955.931-1.955 1.887v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.082 24 18.092 24 12.073Z" />
            </svg>
          </Link>
          <Link
            aria-label="Instagram"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white hover:text-primary"
            href="https://www.instagram.com/vpa.negocios.inmobiliarios?igsh=MXk4NzFwNWpreWEy"
            rel="noreferrer"
            target="_blank"
            title="Instagram"
          >
            <svg
              aria-hidden="true"
              className="h-7 w-7 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.75A4 4 0 0 0 3.75 7.75v8.5a4 4 0 0 0 4 4h8.5a4 4 0 0 0 4-4v-8.5a4 4 0 0 0-4-4h-8.5Zm8.94 1.31a1.31 1.31 0 1 1 0 2.62 1.31 1.31 0 0 1 0-2.62ZM12 6.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0 1.75A3.75 3.75 0 1 0 15.75 12 3.75 3.75 0 0 0 12 8.25Z" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
