import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getDerivedView } from "@/lib/derived-views";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ viewName: string }> }
) {
  return withErrorHandling(async () => {
    const { viewName } = await params;
    const { searchParams } = new URL(req.url);
    const queryParams: Record<string, unknown> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    const result = await getDerivedView(viewName, queryParams);
    return NextResponse.json(result);
  });
}
