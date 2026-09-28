import { getPublicLocale } from "@/i18n/public/locale.server";
import { getPublicMessage } from "@/i18n/public/messages";

export async function DecisionMethodSection() {
  const locale = await getPublicLocale();
  const t = (key: Parameters<typeof getPublicMessage>[1]) => getPublicMessage(locale, key);

  return (
    <section className="bg-white pb-16 pt-80 sm:pb-20 md:pt-28 lg:pb-24">
      <div className="shell">
        <div className="grid gap-10 text-center lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.72fr)] lg:gap-16 lg:text-left">
          <h2 className="mx-auto font-display text-[clamp(2rem,7.5vw,3rem)] leading-[1] text-foreground sm:text-[3.15rem] lg:mx-0 lg:max-w-[12ch] lg:text-[4.1rem]">
            {t("home.decisionTitleLineOne")}
            <span className="mt-2 block text-primary-strong">
              {t("home.decisionTitleLineTwo")}
            </span>
          </h2>

          <div className="mx-auto max-w-2xl space-y-6 lg:mx-0 lg:pt-2">
            <p className="type-body text-foreground">
              {t("home.decisionParagraphOne")}
            </p>
            <p className="type-body font-semibold text-foreground">
              {t("home.decisionParagraphTwo")}
            </p>
            <p className="type-body text-muted">
              {t("home.decisionParagraphThree")}
            </p>
            <p className="type-body-compact text-muted">
              {t("home.decisionParagraphFour")}
            </p>
            <p className="type-body pt-1 font-semibold text-primary-strong">
              {t("home.decisionClosing")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
