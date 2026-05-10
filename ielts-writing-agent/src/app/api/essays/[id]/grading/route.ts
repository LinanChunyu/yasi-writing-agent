import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getEssayWithGrading } from "@/lib/repositories/essays";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const data = await getEssayWithGrading(id);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!data.grading) return NextResponse.json({ error: "Not graded yet" }, { status: 404 });
    return NextResponse.json(data);
  });
}
