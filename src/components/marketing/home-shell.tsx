import { ContactCtaSection } from "@/components/marketing/home/contact-cta-section";
import { FeaturedProjectsSection } from "@/components/marketing/home/featured-projects-section";
import { FeaturedPropertiesSection } from "@/components/marketing/home/featured-properties-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HomeAdvisorySection } from "@/components/marketing/home/home-advisory-section";
import { HomeInvestmentsSection } from "@/components/marketing/home/home-investments-section";
import { SearchSection } from "@/components/marketing/home/search-section";

export function HomeShell() {
  return (
    <>
      <HeroSection />
      <SearchSection />
      <FeaturedPropertiesSection />
      <FeaturedProjectsSection />
      <HomeInvestmentsSection />
      <HomeAdvisorySection />
      <ContactCtaSection />
    </>
  );
}
