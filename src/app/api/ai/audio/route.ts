import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processAudioTranscription } from "@/lib/ai/service";

const extensionByMimeType: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/aac": "aac",
  "audio/m4a": "m4a",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File;
    if (!file) return NextResponse.json({ error: "No audio file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "audio/webm";
    const extension = extensionByMimeType[mimeType] || "webm";
    const normalizedName = file.name?.includes(".") ? file.name : `audio.${extension}`;

    const parsedMeal = await processAudioTranscription(buffer, normalizedName, mimeType, session.user.id);

    if (parsedMeal) {
      return NextResponse.json({ success: true, parsedMeal });
    } else {
      console.error("No parsed meal returned from processAudioTranscription", {
        mimeType,
        fileName: normalizedName,
        size: file.size,
      });
      return NextResponse.json({ error: "Failed to parse meal", mimeType }, { status: 500 });
    }
  } catch(e) {
    console.error("API Route Error:", e);
    return NextResponse.json({ error: "Server Error processing payload" }, { status: 500 });
  }
}
