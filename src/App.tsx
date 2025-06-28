

import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getGeminiEducationalContent, GeminiEducationalResponse } from "@/lib/gemini";
import { Stepper } from "./components/ui/stepper";
import { Accordion as UiAccordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Componente principal de la aplicación Dynamic Tutor.
 * Permite al usuario buscar un tema, obtener contenido educativo generado por Gemini API,
 * y visualizarlo en diferentes formatos (explicación, pasos, ejemplos, glosario, quiz).
 * Incluye funcionalidades de cambio de tema (claro/oscuro) e internacionalización (inglés/español).
 */
function App() {
  const { t, i18n } = useTranslation();
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<GeminiEducationalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugRaw, setDebugRaw] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Traducir mensajes de error que vienen de gemini.ts
  const translateGeminiError = (errorMessage: string | null): string | null => {
    if (!errorMessage) return null;
    if (errorMessage.startsWith("La respuesta de Gemini no cumple con el esquema esperado:")) {
      return t('responseSchemaError', { details: errorMessage.substring("La respuesta de Gemini no cumple con el esquema esperado:".length).trim() });
    }
    if (errorMessage === "La respuesta de Gemini no parece ser un JSON válido.") {
      return t('invalidResponseError');
    }
    if (errorMessage.startsWith("Error al parsear JSON o contactar la API:")) {
        return t('apiJsonParseError', {details: errorMessage.substring("Error al parsear JSON o contactar la API:".length).trim() });
    }
    // Si no es un error conocido de gemini.ts, devolver el mensaje original o uno genérico
    return errorMessage || t('defaultError');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    setDebugRaw(null);
    setShowRaw(false);
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const response = await getGeminiEducationalContent(topic);

      if (response.rawResponse) {
        setDebugRaw(response.rawResponse);
      }

      if (response.error) {
        setError(response.error); // Store original error first
      } else if (response.data) {
        setResult(response.data);
      } else {
        setError(t("unexpectedResponse"));
      }
    } catch (err: any) {
      setError(err.message || t("defaultError"));
      console.error("Error en handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para traducir el error cuando cambie el idioma o el error mismo
  const [translatedError, setTranslatedError] = useState<string | null>(null);
  useEffect(() => {
    setTranslatedError(translateGeminiError(error));
  }, [error, i18n.language, t]);


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <NavigationMenu className="flex-1">
            <NavigationMenuList className="flex items-center gap-2">
              <NavigationMenuItem>
                <span className="font-bold text-lg tracking-tight select-none">{t('navbarTitle')}</span>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Languages className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('es')} disabled={i18n.language === 'es'}>
                  Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="bg-card bg-opacity-90 rounded-xl shadow-xl p-6 sm:p-8 md:p-10 w-full max-w-3xl mx-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8 text-center tracking-tight">
            {t('mainTitle')}
          </h1>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <label htmlFor="topicInput" className="sr-only">{t('searchPlaceholder')}</label>
            <input
              id="topicInput"
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full px-4 py-3 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary transition text-lg placeholder-muted-foreground bg-background text-foreground"
              aria-label={t('searchPlaceholder')} // Mantenemos por si acaso, pero el label es mejor
              disabled={loading}
            />
            <Button type="submit" className="w-full mt-2 py-3 text-lg" disabled={loading || !topic.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('searchingButton')}
                </>
              ) : (
                t('searchButton')
              )}
            </Button>
          </form>
          <CardContent className="w-full mt-8 px-0">
            {translatedError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>{t('errorAlertTitle')}</AlertTitle>
                <AlertDescription>{translatedError}</AlertDescription>
                {debugRaw && (
                   <Button variant="link" onClick={() => setShowRaw(!showRaw)} className="p-0 h-auto mt-2 text-xs">
                    {showRaw ? t('hideTechDetails') : t('showTechDetails')}
                  </Button>
                )}
              </Alert>
            )}
            {showRaw && debugRaw && (
              <div className="bg-muted text-muted-foreground p-3 rounded mb-4 text-xs whitespace-pre-wrap overflow-x-auto">
                <b>{t('rawResponsePrefix')}</b>
                <br />
                {debugRaw}
              </div>
            )}

            {loading && !result && !error && (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">{t('loadingMessage')}</p>
              </div>
            )}

            {result && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-3 text-primary">{t('explanationHeader')}</h2>
                  <p className="text-base leading-relaxed text-foreground whitespace-pre-line">
                    {result.explicacion}
                  </p>
                </div>

                {result.pasos && result.pasos.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-3 text-primary">{t('stepsHeader')}</h2>
                    <Stepper
                      steps={result.pasos.map(p => ({ label: p.label, description: p.description || "" }))}
                    />
                  </div>
                )}

                {result.ejemplos && result.ejemplos.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-3 text-primary">{t('examplesHeader')}</h2>
                    <div className="flex flex-col gap-3">
                      {result.ejemplos.map((ej, i) => (
                        <div key={i} className="bg-muted rounded-lg p-4 text-muted-foreground text-sm">
                          {ej}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.glosario && result.glosario.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-3 text-primary">{t('glossaryHeader')}</h2>
                    <GlossaryAccordion items={result.glosario} />
                  </div>
                )}

                {result.quiz && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-3 text-primary">{t('quizHeader')}</h2>
                    <QuizComponent quiz={result.quiz} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

/**
 * Componente para renderizar un quiz interactivo de opción múltiple.
 *
 * @param quiz Objeto que contiene la pregunta, opciones y respuesta correcta del quiz.
 * @returns Un elemento Card con el quiz.
 */
function QuizComponent({ quiz }: { quiz: GeminiEducationalResponse["quiz"] }) {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [showResult, setShowResult] = React.useState(false);

  const isCorrect = selected !== null && quiz && selected === quiz.respuesta;

  if (!quiz) return null;

  const handleOptionClick = (op: string) => {
    if (selected !== null) return;
    setSelected(op);
    setShowResult(true);
  };

  return (
    <Card className="p-4 sm:p-6 bg-muted/50 shadow-md">
      <div className="font-semibold text-lg mb-3 text-foreground">{quiz.pregunta}</div>
      <div className="flex flex-col gap-2">
        {quiz.opciones.map((op, i) => (
          <Button
            key={i}
            variant="outline"
            className={`w-full justify-start text-left h-auto py-2 px-3 whitespace-normal
              ${selected === op
                ? (isCorrect ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                             : 'bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800')
                : 'hover:bg-muted/80'}`}
            onClick={() => handleOptionClick(op)}
            disabled={selected !== null}
          >
            {op}
          </Button>
        ))}
      </div>
      {showResult && (
        <div
          className={`mt-4 text-sm font-semibold transition-all duration-300 ease-in-out
                         ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          role="status" // Para que los lectores de pantalla anuncien el cambio
        >
          {isCorrect ? t('correctQuizResult') : t('incorrectQuizResult', { answer: quiz.respuesta })}
        </div>
      )}
    </Card>
  );
}

/**
 * Componente para renderizar un glosario interactivo usando un acordeón.
 * Cada término y su definición se muestran en un panel colapsable.
 *
 * @param items Un array de objetos, donde cada objeto tiene `termino` y `definicion`.
 * @returns Un componente UiAccordion con los ítems del glosario.
 */
function GlossaryAccordion({ items }: { items: { termino: string; definicion: string }[] }) {
  const [open, setOpen] = React.useState<string | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <UiAccordion
      type="single"
      collapsible
      className="w-full space-y-2"
      value={open || undefined}
      onValueChange={setOpen}
    >
      {items.map((g, i) => (
        <UiAccordion.Item value={g.termino} key={g.termino + i} className="border border-border rounded-md bg-muted/30">
          <UiAccordion.Trigger className="w-full px-4 py-3 text-left focus:outline-none">
             <Badge variant={open === g.termino ? "default" : "secondary"} className="text-sm">{g.termino}</Badge>
          </UiAccordion.Trigger>
          <UiAccordion.Content className="px-4 pb-3 pt-1 text-foreground/80 text-sm">
            {g.definicion}
          </UiAccordion.Content>
        </UiAccordion.Item>
      ))}
    </UiAccordion>
  );
}

export default App;

