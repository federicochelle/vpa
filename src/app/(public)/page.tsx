import { HomeShell } from "@/components/marketing/home-shell";
import { createSeoMetadata, siteDescription, siteName } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
});

export default function HomePage() {
  return <HomeShell />;
}
