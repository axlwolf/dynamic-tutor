import { GoogleGenAI } from '@google/genai';

// Variable global para la instancia
let ai: GoogleGenAI | null = null;

// Función para inicializar dinámicamente
export function initializeGemini(apiKey: string) {
  try {
    ai = new GoogleGenAI({ apiKey });
    return true;
  } catch (error) {
    console.error("Error al inicializar Gemini:", error);
    return false;
  }
}

// Función para obtener la instancia AI
function getAI() {
  // Si no está inicializada, usar variable de entorno
  if (!ai && import.meta.env.VITE_GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  }
  return ai;
}

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

interface GetGeminiContentResult {
  data: GeminiEducationalResponse | null;
  error: string | null;
  rawResponse: string | null;
}

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

  try {
    const aiInstance = getAI();
    
    if (!aiInstance) {
      return {
        data: null,
        error: "Gemini no está inicializado. Por favor, configura tu API key.",
        rawResponse: null
      };
    }

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    });

    const rawText = response.text || "";

    // Debug: mostrar respuesta cruda
    if (typeof window !== 'undefined') {
      (window as any).lastGeminiRaw = rawText;
    }
    console.log("[Gemini raw response]", rawText);

    let cleaned = rawText.trim();
    
    // Eliminar bloques ```json, ``` o similares
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
      return {
        data: json,
        error: null,
        rawResponse: rawText
      };
    } catch (parseError: any) {
      console.error("Error al parsear la respuesta de Gemini tras limpiar:", parseError, cleaned);
      return {
        data: null,
        error: `Error al parsear JSON: ${parseError.message}`,
        rawResponse: rawText
      };
    }

  } catch (error: any) {
    console.error("Error en getGeminiEducationalContent:", error);
    return {
      data: null,
      error: error.message || "Error al conectar con Gemini",
      rawResponse: null
    };
  }
}