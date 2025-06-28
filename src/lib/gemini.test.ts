import { getGeminiEducationalContent, GeminiEducationalResponse } from './gemini';
import { mockGenerateContent } from './__mocks__/@google/genai'; // Import the mock

// Mock the entire @google/genai module
jest.mock('@google/genai');

describe('getGeminiEducationalContent', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    mockGenerateContent.mockClear();
    // Limpiar cualquier estado global si es necesario, por ejemplo:
    if (typeof window !== 'undefined') {
      delete (window as any).lastGeminiRaw;
    }
  });

  const validJsonResponse: GeminiEducationalResponse = {
    explicacion: "Una explicación detallada.",
    pasos: [{ label: "Paso 1", description: "Hacer algo." }],
    ejemplos: ["Ejemplo A"],
    glosario: [{ termino: "Término", definicion: "Def." }],
    quiz: {
      pregunta: "¿Pregunta?",
      opciones: ["A", "B"],
      respuesta: "A",
    },
  };

  it('debería devolver datos parseados y validados correctamente para una respuesta JSON válida', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify(validJsonResponse) });

    const result = await getGeminiEducationalContent("un tema");
    expect(result.data).toEqual(validJsonResponse);
    expect(result.error).toBeNull();
    expect(result.rawResponse).toEqual(JSON.stringify(validJsonResponse));
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('debería limpiar y parsear JSON envuelto en bloques de código', async () => {
    const responseText = "```json\n" + JSON.stringify(validJsonResponse) + "\n```";
    mockGenerateContent.mockResolvedValueOnce({ text: responseText });

    const result = await getGeminiEducationalContent("un tema");
    expect(result.data).toEqual(validJsonResponse);
    expect(result.error).toBeNull();
    expect(result.rawResponse).toEqual(responseText);
  });

  it('debería limpiar y parsear JSON envuelto en bloques de código sin la palabra json', async () => {
    const responseText = "```\n" + JSON.stringify(validJsonResponse) + "\n```";
    mockGenerateContent.mockResolvedValueOnce({ text: responseText });

    const result = await getGeminiEducationalContent("un tema");
    expect(result.data).toEqual(validJsonResponse);
    expect(result.error).toBeNull();
  });

  it('debería extraer JSON cuando está rodeado de texto adicional', async () => {
    const responseText = "Aquí hay algo de texto antes. " + JSON.stringify(validJsonResponse) + " Y algo de texto después.";
    mockGenerateContent.mockResolvedValueOnce({ text: responseText });

    const result = await getGeminiEducationalContent("un tema");
    expect(result.data).toEqual(validJsonResponse);
    expect(result.error).toBeNull();
    expect(result.rawResponse).toEqual(responseText);
  });


  it('debería devolver un error si el JSON está incompleto (falta un campo requerido)', async () => {
    const incompleteResponse = { ...validJsonResponse };
    delete (incompleteResponse as any).explicacion; // Eliminar un campo requerido
    mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify(incompleteResponse) });

    const result = await getGeminiEducationalContent("un tema");
    expect(result.data).toBeNull();
    expect(result.error).toContain("La respuesta de Gemini no cumple con el esquema esperado");
    expect(result.error).toContain("explicacion"); // Zod debería mencionar el campo faltante
    expect(result.rawResponse).toEqual(JSON.stringify(incompleteResponse));
  });

  it('debería devolver un error si el JSON tiene tipos incorrectos', async () => {
    const malformedResponse = { ...validJsonResponse, explicacion: 123 }; // 'explicacion' debería ser string
    mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify(malformedResponse) });

    const result = await getGeminiEducationalContent("un tema");
    expect(result.data).toBeNull();
    expect(result.error).toContain("La respuesta de Gemini no cumple con el esquema esperado");
    expect(result.error).toContain("Expected string, received number")
    expect(result.rawResponse).toEqual(JSON.stringify(malformedResponse));
  });

  it('debería devolver un error si la respuesta no es JSON', async () => {
    const nonJsonResponse = "Esto no es JSON.";
    mockGenerateContent.mockResolvedValueOnce({ text: nonJsonResponse });

    const result = await getGeminiEducationalContent("un tema");
    expect(result.data).toBeNull();
    expect(result.error).toEqual("La respuesta de Gemini no parece ser un JSON válido.");
    expect(result.rawResponse).toEqual(nonJsonResponse);
  });

  it('debería devolver un error si la respuesta JSON está malformada (error de sintaxis)', async () => {
    const malformedJsonSyntax = "{ \"explicacion\": \"texto\", ..."; // JSON inválido
    mockGenerateContent.mockResolvedValueOnce({ text: malformedJsonSyntax });

    const result = await getGeminiEducationalContent("un tema");
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/Error al parsear JSON o contactar la API:.*?JSON/i);
    expect(result.rawResponse).toEqual(malformedJsonSyntax);
  });

  it('debería devolver un error si la respuesta de la API es vacía o nula', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: null });
    let result = await getGeminiEducationalContent("un tema");
    expect(result.data).toBeNull();
    expect(result.error).toEqual("La respuesta de Gemini no parece ser un JSON válido.");
    expect(result.rawResponse).toEqual("");

    mockGenerateContent.mockResolvedValueOnce({ text: "" });
    result = await getGeminiEducationalContent("un tema");
    expect(result.data).toBeNull();
    expect(result.error).toEqual("La respuesta de Gemini no parece ser un JSON válido.");
    expect(result.rawResponse).toEqual("");
  });

  it('debería manejar errores de la llamada a generateContent', async () => {
    const apiError = new Error("Error de red");
    mockGenerateContent.mockRejectedValueOnce(apiError);

    const result = await getGeminiEducationalContent("un tema");
    expect(result.data).toBeNull();
    expect(result.error).toEqual(`Error al parsear JSON o contactar la API: ${apiError.message}`);
    expect(result.rawResponse).toBeNull();
  });

  it('debería almacenar la respuesta cruda en window.lastGeminiRaw si window está definido', async () => {
    // Simular entorno de navegador
    global.window = {} as any;
    const responseText = JSON.stringify(validJsonResponse);
    mockGenerateContent.mockResolvedValueOnce({ text: responseText });

    await getGeminiEducationalContent("un tema");
    expect((window as any).lastGeminiRaw).toEqual(responseText);

    // Limpiar para otras pruebas
    delete (global as any).window;
  });

  it('no debería intentar acceder a window si no está definido (entorno no-navegador)', async () => {
    expect(typeof window).toBe('undefined'); // Asegurarse de que window no está definido

    const responseText = JSON.stringify(validJsonResponse);
    mockGenerateContent.mockResolvedValueOnce({ text: responseText });

    // No debería lanzar un error al intentar acceder a window
    await expect(getGeminiEducationalContent("un tema")).resolves.not.toThrow();
  });
});
