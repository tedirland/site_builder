import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSiteById } from "@/lib/db/queries";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(
  _request: NextRequest,
  { params }: Params,
): Promise<NextResponse> {
  const { siteId } = await params;
  const db = getDb();
  const site = getSiteById(db, siteId);
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }
  return NextResponse.json(site);
}
