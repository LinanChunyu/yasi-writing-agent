import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { submitEssayService } from "@/lib/services/submit-essay";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const result = await submitEssayService(id);
    return NextResponse.json(result);
  });
}
