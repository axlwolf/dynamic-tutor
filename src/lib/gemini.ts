import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface GeminiEducationalResponse {
  explicacion: string;
  pasos: { label: string; description?: string }[];
  ejemplos: string[];
  glosario: { termino: string; definicion: string }[];
  quiz: {
    pregunta: string;
    opciones: string[];
    respuesta: string;
  };
}

export async function getGeminiEducationalContent(topic: string): Promise<GeminiEducationalResponse | null> {
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

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: prompt,
  });
  // Debug: mostrar respuesta cruda
  if (typeof window !== 'undefined') {
    (window as any).lastGeminiRaw = response.text;
  }
  console.log("[Gemini raw response]", response.text);
  let cleaned = response.text || "";
  // Eliminar bloques ```json, ``` o similares
  cleaned = cleaned.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').trim();
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').trim();
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```$/, '').trim();
  }
  // Buscar el primer y último { ... } para intentar parsear solo el JSON
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace > 0 || lastBrace < cleaned.length - 1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    console.warn('[Gemini] Se detectó texto fuera del JSON, se intentó limpiar automáticamente.');
  }
  try {
    const json = JSON.parse(cleaned);
    return json;
  } catch (e) {
    console.error("Error al parsear la respuesta de Gemini tras limpiar:", e, cleaned);
    return null;
  }
}

