import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processImageMeal } from "@/lib/ai/service";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "No image" }, { status: 400 });

    const parsedMeal = await processImageMeal(imageBase64, session.user.id);

    if (parsedMeal) {
      return NextResponse.json({ success: true, parsedMeal });
    } else {
      console.error("No parsed meal returned from processImageMeal");
      return NextResponse.json({ error: "Failed to parse meal" }, { status: 500 });
    }
  } catch(e) {
    console.error("Vision API Route Error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
