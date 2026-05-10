import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-utils";
import { getEssayWithGrading, updateEssayBody } from "@/lib/repositories/essays";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const data = await getEssayWithGrading(id);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  });
}

const UpdateBodySchema = z.object({
  body: z.string(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const { body } = UpdateBodySchema.parse(await req.json());
    await updateEssayBody(id, body);
    return NextResponse.json({ ok: true });
  });
}
