export const mockGenerateContent = jest.fn();

export class GoogleGenAI {
  public models = {
    generateContent: mockGenerateContent,
  };
  constructor(public params?: { apiKey: string }) {}
}
