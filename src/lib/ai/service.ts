import OpenAI, { toFile } from 'openai';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

let openaiInstance: OpenAI | null = null;

const getOpenAI = () => {
  if (openaiInstance) return openaiInstance;
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn("⚠️ [NutrIA] OPENAI_API_KEY not found. AI features will be disabled.");
    }
    return null;
  }
  
  openaiInstance = new OpenAI({ apiKey });
  return openaiInstance;
};

export const MealResponseSchema = z.object({
  title_summary: z.string().describe("Un resumen corto de la comida, ej. 'Desayuno con tostadas'"),
  total_calories: z.number().describe("Total de calorías estimadas en kcal"),
  total_protein: z.number().describe("Total gramos de proteína"),
  total_carbs: z.number().describe("Total gramos de carbohidratos"),
  total_fats: z.number().describe("Total gramos de grasas"),
  items: z.array(z.object({
    food_name: z.string().describe("Nombre descriptivo del alimento"),
    quantity_value: z.number().describe("Ej. 1, 100, 2"),
    quantity_unit: z.string().describe("Ej. 'unidad', 'g', 'ml', 'rebanada'"),
    estimated_grams: z.number().describe("Estimación en gramos si aplica, o 0"),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fats: z.number(),
  })).describe("Desglose detallado de todos los alimentos reconocidos en la petición")
});

export type ParsedMeal = z.infer<typeof MealResponseSchema>;

async function logAiUsage(userId: string, requestType: string, model: string, status: string, promptTokens: number, completionTokens: number, latency: number, errorMsg?: string) {
  try {
    const estCost = (promptTokens / 1000000) * 5.0 + (completionTokens / 1000000) * 15.0; // Approximate gpt-4o pricing
    await prisma.aiUsageLog.create({
      data: {
        user_id: userId,
        request_type: requestType,
        provider: 'OPENAI',
        model_used: model,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        estimated_cost_usd: estCost,
        latency_ms: latency,
        status,
        error_message: errorMsg,
      }
    });
  } catch (e) {
    console.error("AI Usage Log Failed:", e);
  }
}

export async function processTextMeal(text: string, userId: string): Promise<ParsedMeal | null> {
  const start = Date.now();
  const model = "gpt-4o-mini"; // Using structured miniature for speed and reasonable accuracy
  try {
    const client = getOpenAI();
    if (!client) throw new Error("OpenAI client not initialized");

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Eres un analista experto en nutrición inteligente. El usuario te describirá lo que acaba de comer. Analízalo.\nDevuelve ÚNICAMENTE un JSON estructurado con: title_summary (string), total_calories (numero), total_protein (numero), total_carbs (numero), total_fats (numero), items (array de objetos con food_name, quantity_value, quantity_unit, estimated_grams (numero o null), calories, protein, carbs, fats). No escribas markdown, solo un JSON estricto. TODO EL CONTENIDO DEL JSON DEBE ESTAR EN ESPAÑOL." },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const usage = response.usage;
    
    if (content && usage) {
      const parsedData = JSON.parse(content) as ParsedMeal;
      await logAiUsage(userId, 'TEXT_COACH', model, 'SUCCESS', usage.prompt_tokens, usage.completion_tokens, Date.now() - start);
      return parsedData;
    }
    throw new Error('No parsed data');
  } catch (e: any) {
    await logAiUsage(userId, 'TEXT_COACH', model, 'API_ERROR', 0, 0, Date.now() - start, e.message);
    return null;
  }
}

export async function processAudioTranscription(fileBuffer: Buffer, fileName: string, userId: string): Promise<ParsedMeal | null> {
  const start = Date.now();
  try {
    const client = getOpenAI();
    if (!client) throw new Error("OpenAI client not initialized");

    const file = await toFile(fileBuffer, fileName, { type: 'audio/webm' });

    // Step 1: Transcribe via Whisper
    const transcription = await client.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'es'
    });
    
    // Log whisper usage roughly (costs $0.006 per minute, latency is tracked)
    await logAiUsage(userId, 'TRANSCRIPTION', 'whisper-1', 'SUCCESS', 0, 0, Date.now() - start, transcription.text);

    // Step 2: Extract text to structured meal
    return await processTextMeal(transcription.text, userId);
  } catch (e: any) {
    console.error("Audio Transcription error:", e);
    await logAiUsage(userId, 'TRANSCRIPTION', 'whisper-1', 'API_ERROR', 0, 0, Date.now() - start, e.message);
    return null;
  }
}

export async function processImageMeal(imageBase64: string, userId: string): Promise<ParsedMeal | null> {
  const start = Date.now();
  const model = "gpt-4o"; // Requires full vision capability
  try {
    const client = getOpenAI();
    if (!client) throw new Error("OpenAI client not initialized");

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Eres un nutricionista experto. Analiza la imagen y estima porciones, alimentos, macros y calorías.\nDevuelve ÚNICAMENTE un JSON estructurado con: title_summary (string), total_calories (numero), total_protein (numero), total_carbs (numero), total_fats (numero), items (array de objetos con food_name, quantity_value, quantity_unit, estimated_grams (numero o null), calories, protein, carbs, fats). No uses markdown. TODO EL CONTENIDO DEL JSON DEBE ESTAR EN ESPAÑOL." },
        { role: "user", content: [
            { type: "text", text: "Analiza esta comida" },
            { type: "image_url", image_url: { url: imageBase64, detail: "auto" } }
        ]}
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const usage = response.usage;
    
    if (content && usage) {
      const parsedData = JSON.parse(content) as ParsedMeal;
      await logAiUsage(userId, 'VISION', model, 'SUCCESS', usage.prompt_tokens, usage.completion_tokens, Date.now() - start);
      return parsedData;
    }
    throw new Error('No parsed data');
  } catch (e: unknown) {
    await logAiUsage(userId, 'VISION', model, 'API_ERROR', 0, 0, Date.now() - start, (e as Error).message);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateCoachTip(userId: string, profile: any, metrics: any): Promise<string | null> {
  const start = Date.now();
  const model = "gpt-4o-mini";
  try {
    const prompt = `Actúa como un coach nutricional motivador y experto. 
    Datos del usuario:
    - Nombre: ${profile.name}
    - Objetivo de calorías: ${profile.daily_calorie_target}
    - Calorías consumidas hoy: ${metrics.total_calories_consumed}
    - Agua consumida hoy: ${metrics.water_ml}ml (Meta: ${profile.daily_water_target_ml}ml)
    - Peso actual: ${profile.current_weight_kg}kg (Meta: ${profile.goal_weight_kg}kg)
    
    Genera UN SOLO CONSEJO corto (máximo 20 palabras) y potente para hoy en español. Sé específico y motivador.`;

    const client = getOpenAI();
    if (!client) throw new Error("OpenAI client not initialized");

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "Eres NutrIA, una nutria experta en nutrición inteligente. Hablas en español, de forma cercana, un poco juguetona pero muy profesional y motivadora." },
        { role: "user", content: prompt }
      ],
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;
    const usage = response.usage;
    
    if (content && usage) {
      await logAiUsage(userId, 'TEXT_COACH', model, 'SUCCESS', usage.prompt_tokens, usage.completion_tokens, Date.now() - start);
      return content.trim();
    }
    return null;
  } catch (e: any) {
    await logAiUsage(userId, 'TEXT_COACH', model, 'API_ERROR', 0, 0, Date.now() - start, e.message);
    return null;
  }
}

