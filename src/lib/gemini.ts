import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

// ADVERTENCIA DE SEGURIDAD: La clave API se está exponiendo en el lado del cliente.
// En un entorno de producción, esta llamada debería realizarse a través de un backend proxy
// para proteger la clave API. El valor de import.meta.env.VITE_GEMINI_API_KEY se incrusta
// en el bundle del cliente durante el build.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// --- Esquemas de Zod para validación de la respuesta de Gemini ---

/** Define la estructura de un paso en la explicación. */
const StepSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
});

/** Define la estructura de un ítem del glosario. */
const GlossaryItemSchema = z.object({
  termino: z.string(),
  definicion: z.string(),
});

/** Define la estructura de un quiz. */
const QuizSchema = z.object({
  pregunta: z.string(),
  opciones: z.array(z.string()),
  respuesta: z.string(),
});

/** Esquema principal para la respuesta educativa esperada de Gemini. */
const GeminiEducationalResponseSchema = z.object({
  /** La explicación principal del tema. */
  explicacion: z.string(),
  /** Una lista de pasos clave relacionados con el tema. */
  pasos: z.array(StepSchema),
  /** Una lista de ejemplos ilustrativos. */
  ejemplos: z.array(z.string()),
  /** Un glosario de términos importantes con sus definiciones. */
  glosario: z.array(GlossaryItemSchema),
  /** Un quiz simple para evaluar la comprensión. */
  quiz: QuizSchema,
});

/** Tipo inferido del esquema `GeminiEducationalResponseSchema`. Representa la estructura de datos educativos. */
export type GeminiEducationalResponse = z.infer<typeof GeminiEducationalResponseSchema>;

/**
 * Representa el resultado de la llamada a `getGeminiEducationalContent`.
 * Incluye los datos educativos, un posible error, y la respuesta cruda de la API.
 */
export interface GetGeminiContentResult {
  /** Los datos educativos parseados y validados, o `null` si hubo un error. */
  data: GeminiEducationalResponse | null;
  /** Un mensaje de error si la operación falló, o `null` si fue exitosa. */
  error: string | null;
  /** La respuesta cruda (string) de la API de Gemini, útil para depuración. */
  rawResponse: string | null;
}

/**
 * Obtiene contenido educativo sobre un tema específico desde la API de Gemini.
 *
 * Construye un prompt para la API, solicita una respuesta en formato JSON estructurado,
 * limpia la respuesta, la parsea y la valida contra el esquema `GeminiEducationalResponseSchema`.
 *
 * @param topic El tema sobre el cual se desea obtener contenido educativo.
 * @returns Un objeto `GetGeminiContentResult` que contiene los datos, el error (si lo hay), y la respuesta cruda.
 */
export async function getGeminiEducationalContent(topic: string): Promise<GetGeminiContentResult> {
  const prompt = `
Eres un experto en educación. Explica el concepto o tema "${topic}" de forma educativa y estructurada. La explicación debe ser clara y concisa. Pero extensa, con ejemplos y explicaciones detalladas. Devuelve la respuesta en formato JSON válido y estrictamente con los siguientes campos:
{
  "explicacion": "Texto principal de la explicación (máximo 5 líneas)",
  "pasos": [
    { "label": "Título del paso", "description": "Descripción breve" },
    ...
  ],
  "ejemplos": ["Ejemplo 1", "Ejemplo 2"],
  "glosario": [
    { "termino": "Término importante", "definicion": "Definición breve" },
    ...
  ],
  "quiz": {
    "pregunta": "Pregunta de opción múltiple sobre el tema",
    "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "respuesta": "Respuesta correcta"
  }
}
No agregues texto fuera del JSON.`;

  let rawResponseText: string | null = null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001', // Asegúrate que este modelo exista o usa uno disponible
      contents: prompt,
    });

    rawResponseText = response.text || "";

    if (typeof window !== 'undefined') {
      (window as any).lastGeminiRaw = rawResponseText;
    }
    console.log("[Gemini raw response]", rawResponseText);

    let cleanedJson = rawResponseText.trim();

    // Intenta encontrar el JSON dentro del texto, incluso si está rodeado por ```json ... ``` o similar
    const jsonMatch = cleanedJson.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        cleanedJson = jsonMatch[1] || jsonMatch[2] || cleanedJson;
        cleanedJson = cleanedJson.trim();
    }

    // Como último recurso, si no hay ```, busca el primer { y el último }
    if (!cleanedJson.startsWith('{') || !cleanedJson.endsWith('}')) {
        const firstBrace = cleanedJson.indexOf('{');
        const lastBrace = cleanedJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
            console.warn('[Gemini] Se extrajo JSON contenido dentro de texto adicional.');
        } else {
            console.error("[Gemini] No se pudo encontrar un objeto JSON válido en la respuesta:", cleanedJson);
            return { data: null, error: "La respuesta de Gemini no parece ser un JSON válido.", rawResponse: rawResponseText };
        }
    }

    const parsedJson = JSON.parse(cleanedJson);
    const validationResult = GeminiEducationalResponseSchema.safeParse(parsedJson);

    if (validationResult.success) {
      return { data: validationResult.data, error: null, rawResponse: rawResponseText };
    } else {
      console.error("Error de validación Zod:", validationResult.error.errors, "JSON parseado:", parsedJson);
      return { data: null, error: `La respuesta de Gemini no cumple con el esquema esperado: ${validationResult.error.errors.map(e => e.message).join(', ')}`, rawResponse: rawResponseText };
    }

  } catch (e: any) {
    console.error("Error al procesar la respuesta de Gemini:", e);
    let errorMessage = "Error desconocido al procesar la respuesta de Gemini.";
    if (e instanceof Error) {
        errorMessage = e.message;
    }
    // Si el error es de parseo JSON, el cleanedJson podría ser útil
    return { data: null, error: `Error al parsear JSON o contactar la API: ${errorMessage}`, rawResponse: rawResponseText || (e.input ? String(e.input) : null) };
  }
}

