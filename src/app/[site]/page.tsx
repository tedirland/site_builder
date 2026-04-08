import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getSiteBySlug } from "@/lib/db/queries";

type Params = { params: Promise<{ site: string }> };

export default async function SitePage({ params }: Params) {
  const { site: slug } = await params;
  const db = getDb();
  const site = getSiteBySlug(db, slug);

  if (!site) {
    notFound();
  }

  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: site.css }} />
      </head>
      <body dangerouslySetInnerHTML={{ __html: site.html }} />
    </html>
  );
}
