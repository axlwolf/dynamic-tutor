import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { getGeminiEducationalContent } from './lib/gemini'; // Para mockear
import i18n from './i18n'; // Importar la instancia real para espiar
import { I18nextProvider } from 'react-i18next';

// Mockear el módulo gemini
jest.mock('./lib/gemini');
const mockGetGeminiEducationalContent = getGeminiEducationalContent as jest.Mock;

// Mockear IntersectionObserver (usado por shadcn/ui o sus dependencias)
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
global.IntersectionObserver = mockIntersectionObserver;

// Mockear matchMedia (usado por ThemeToggle o dependencias)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


// Componente wrapper para proveer i18n
const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
};


describe('<App />', () => {
  beforeEach(() => {
    mockGetGeminiEducationalContent.mockClear();
    // Asegurarse de que el idioma sea 'es' para consistencia en snapshots/textos
    i18n.changeLanguage('es');
  });

  it('debería renderizar el título principal y el campo de búsqueda', () => {
    renderWithI18n(<App />);
    expect(screen.getByText('Explora y Aprende')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('¿Qué te gustaría aprender hoy?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('debería mostrar "Buscando..." al hacer clic en buscar y estar deshabilitado', async () => {
    mockGetGeminiEducationalContent.mockReturnValue(new Promise(() => {})); // Promesa que nunca se resuelve para mantener el estado de carga

    renderWithI18n(<App />);
    const input = screen.getByPlaceholderText('¿Qué te gustaría aprender hoy?');
    const searchButton = screen.getByRole('button', { name: 'Buscar' });

    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.click(searchButton);

    expect(await screen.findByText('Buscando...')).toBeVisible();
    expect(searchButton).toBeDisabled();
    expect(input).toBeDisabled();
  });

  it('debería mostrar contenido educativo después de una búsqueda exitosa', async () => {
    const mockResponse = {
      data: {
        explicacion: "React es una librería de UI.",
        pasos: [{ label: "Paso 1", description: "Aprender JSX" }],
        ejemplos: ["<Contador />"],
        glosario: [{ termino: "Componente", definicion: "Bloque de UI" }],
        quiz: { pregunta: "¿Es React una librería?", opciones: ["Sí", "No"], respuesta: "Sí" },
      },
      error: null,
      rawResponse: "raw data",
    };
    mockGetGeminiEducationalContent.mockResolvedValue(mockResponse);

    renderWithI18n(<App />);
    fireEvent.change(screen.getByPlaceholderText('¿Qué te gustaría aprender hoy?'), { target: { value: 'React' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(screen.getByText('Explicación')).toBeVisible());
    expect(screen.getByText(mockResponse.data.explicacion)).toBeVisible();
    expect(screen.getByText('Pasos Clave')).toBeVisible();
    // Podríamos añadir más aserciones para pasos, ejemplos, etc.
  });

  it('debería mostrar un mensaje de error si la búsqueda falla', async () => {
    const errorMessage = "Hubo un error terrible";
    mockGetGeminiEducationalContent.mockResolvedValue({
      data: null,
      error: errorMessage,
      rawResponse: "raw error data",
    });

    renderWithI18n(<App />);
    fireEvent.change(screen.getByPlaceholderText('¿Qué te gustaría aprender hoy?'), { target: { value: 'Algo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    // Esperar a que el error (traducido o no) aparezca
    // Usamos una función dentro de waitFor para que se reintente hasta que el elemento aparezca o haya timeout
    await waitFor(() => {
        // La función translateGeminiError podría devolver el mismo mensaje si no hay traducción específica
        // o una versión traducida. Buscamos el texto original del error para ser más robustos.
        const errorElement = screen.queryByText(errorMessage, { exact: false });
        expect(errorElement).toBeVisible();
    });
    expect(screen.getByText('Error')).toBeVisible(); // El título de la alerta
  });

  it('debería permitir cambiar el idioma', async () => {
    renderWithI18n(<App />);

    // Verificar idioma inicial (Español por defecto en beforeEach)
    expect(screen.getByText('Explora y Aprende')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Buscar'})).toBeInTheDocument();

    // Abrir el menú de idiomas
    const langButton = screen.getByRole('button', { name: 'Change language' }); // sr-only text
    fireEvent.click(langButton);

    // Cambiar a Inglés
    const englishOption = await screen.findByText('English');
    fireEvent.click(englishOption);

    // Verificar que el texto cambió a Inglés
    await waitFor(() => {
      expect(screen.getByText('Explore and Learn')).toBeVisible();
    });
    expect(screen.getByRole('button', {name: 'Search'})).toBeVisible();

    // Volver a abrir y cambiar a Español
    fireEvent.click(langButton);
    const spanishOption = await screen.findByText('Español');
    fireEvent.click(spanishOption);

    await waitFor(() => {
      expect(screen.getByText('Explora y Aprende')).toBeVisible();
    });
  });

});
