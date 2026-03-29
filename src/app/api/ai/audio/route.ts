import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processAudioTranscription } from "@/lib/ai/service";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File;
    if (!file) return NextResponse.json({ error: "No audio file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsedMeal = await processAudioTranscription(buffer, "audio.webm", session.user.id);

    if (parsedMeal) {
      return NextResponse.json({ success: true, parsedMeal });
    } else {
      console.error("No parsed meal returned from processAudioTranscription");
      return NextResponse.json({ error: "Failed to parse meal" }, { status: 500 });
    }
  } catch(e) {
    console.error("API Route Error:", e);
    return NextResponse.json({ error: "Server Error processing payload" }, { status: 500 });
  }
}
