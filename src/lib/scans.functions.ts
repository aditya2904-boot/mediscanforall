import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AnalyzeInput = z.object({
  imageBase64: z.string().min(50),
  mimeType: z.string().default("image/jpeg"),
  language: z.string().default("en"),
});

const SYSTEM = `You are a clinical assistant that reads handwritten or printed prescriptions.
Given a prescription photo, extract the primary medication and produce a patient-friendly summary.

Respond with ONLY a JSON object matching this schema (no markdown, no code fences):
{
  "medication_name": string,     // main medicine identified (generic or brand)
  "extracted_text": string,      // raw text you read from the prescription
  "dosage": string,              // e.g. "1 tablet twice a day for 5 days"
  "purpose": string,             // one-sentence, plain language
  "warnings": string,            // 1-3 short bullet-style warnings joined with " • "
  "confidence": "high"|"medium"|"low"
}

If the image is unreadable or not a prescription, set medication_name to "Unreadable"
and explain in purpose. Always answer in the language code: {LANG}.`;

export const analyzeScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM.replace("{LANG}", data.language) },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this prescription image." },
              {
                type: "image_url",
                image_url: { url: `data:${data.mimeType};base64,${data.imageBase64}` },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      if (resp.status === 429) throw new Error("Too many requests — try again in a moment.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Please add credits.");
      throw new Error(`AI error: ${txt.slice(0, 200)}`);
    }

    const json = await resp.json();
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: {
      medication_name?: string;
      extracted_text?: string;
      dosage?: string;
      purpose?: string;
      warnings?: string;
      confidence?: string;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { medication_name: "Unreadable", purpose: raw };
    }

    const { data: inserted, error } = await context.supabase
      .from("scans")
      .insert({
        user_id: context.userId,
        medication_name: parsed.medication_name ?? "Unknown",
        extracted_text: parsed.extracted_text ?? null,
        dosage: parsed.dosage ?? null,
        purpose: parsed.purpose ?? null,
        warnings: parsed.warnings ?? null,
        language: data.language,
        raw_analysis: parsed,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return inserted;
  });

export const listScans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("scans").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
