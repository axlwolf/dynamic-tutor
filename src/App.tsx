

import React, { useState } from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getGeminiEducationalContent } from "@/lib/gemini";

function App() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<import("@/lib/gemini").GeminiEducationalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugRaw, setDebugRaw] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError("");
    setDebugRaw("");
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const ai = await import("@/lib/gemini");
      // Forzar debugging en la función
      const resp = await ai.getGeminiEducationalContent(topic);
      if (!resp) {
        setError("Error: No se pudo obtener una respuesta estructurada de Gemini. Consulta la consola para más detalles.");
        // Mostrar la respuesta cruda si existe
        if (window && (window as any).lastGeminiRaw) {
          setDebugRaw((window as any).lastGeminiRaw);
        }
      } else {
        setResult(resp);
      }
    } catch (err) {
      setError("Ocurrió un error inesperado al consultar Gemini. Revisa la consola.");
      console.error("Error en handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <NavigationMenu className="flex-1">
            <NavigationMenuList className="flex items-center gap-2">
              <NavigationMenuItem>
                <span className="font-bold text-lg tracking-tight select-none">Dynamic Tutor</span>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center">
        <Card className="bg-card bg-opacity-90 rounded-xl shadow-xl px-8 py-12 w-full max-w-8xl flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-foreground mb-8 text-center tracking-tight">
            Dynamic Tutor
          </h1>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="¿Qué te gustaría aprender hoy?"
              className="w-full px-4 py-3 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary transition text-lg placeholder-muted-foreground bg-background text-foreground"
              aria-label="Buscar tema o pregunta"
              disabled={loading}
            />
            <Button type="submit" className="w-full mt-2" disabled={loading || !topic.trim()}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </form>
          <CardContent className="w-full mt-6">
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            {debugRaw && (
              <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-xs whitespace-pre-wrap">
                <b>Respuesta cruda de Gemini:</b>
                <br />
                {debugRaw}
              </div>
            )}
            {result && (
              <div className="flex flex-col gap-6">
                {/* Explicación principal */}
                <div>
                  <h2 className="text-xl font-bold mb-2">Explicación</h2>
                  <p className="text-base leading-relaxed text-foreground whitespace-pre-line">
                    {result.explicacion}
                  </p>
                </div>
                {/* Stepper: pasos */}
                {result.pasos && result.pasos.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-2">Pasos clave</h2>
                    <Stepper
                      steps={result.pasos}
                      currentStep={0}
                    />
                  </div>
                )}
                {/* Ejemplos */}
                {result.ejemplos && result.ejemplos.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-2">Ejemplos</h2>
                    <div className="flex flex-col gap-2">
                      {result.ejemplos.map((ej, i) => (
                        <div key={i} className="bg-muted rounded-lg px-4 py-2 text-muted-foreground">
                          {ej}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Glosario */}
                {result.glosario && result.glosario.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-2">Glosario</h2>
                    <GlossaryAccordion items={result.glosario} />
                  </div>
                )}
                {/* Quiz interactivo */}
                {result.quiz && (
                  <div>
                    <h2 className="text-xl font-bold mb-2">Quiz</h2>
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

// QuizComponent para opción múltiple
import { Stepper } from "./components/ui/stepper";

function QuizComponent({ quiz }: { quiz: import("@/lib/gemini").GeminiEducationalResponse["quiz"] }) {
  const [selected, setSelected] = React.useState<string>("");
  const [showResult, setShowResult] = React.useState(false);
  const isCorrect = selected && selected === quiz.respuesta;
  return (
    <Card className="p-4 bg-muted">
      <div className="font-semibold mb-2">{quiz.pregunta}</div>
      <div className="flex flex-col gap-2">
        {quiz.opciones.map((op, i) => (
          <button
            key={i}
            className={`px-3 py-2 rounded text-left border transition font-medium ${selected === op ? (isCorrect ? 'bg-green-200 border-green-600' : 'bg-red-200 border-red-600') : 'bg-background border-input hover:bg-muted'}`}
            onClick={() => {
              setSelected(op);
              setShowResult(true);
            }}
            disabled={!!selected}
          >
            {op}
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-3 text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? '¡Correcto!' : `Incorrecto. Respuesta: ${quiz.respuesta}`}
        </div>
      )}
    </Card>
  );
}

// Glosario interactivo usando Accordion y Badge
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

function GlossaryAccordion({ items }: { items: { termino: string; definicion: string }[] }) {
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <Accordion
      items={items.map((g, i) => ({
        title: (
          <button
            type="button"
            className={`focus:outline-none`}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <Badge variant={open === i ? "default" : "secondary"}>{g.termino}</Badge>
          </button>
        ),
        content: (
          <div className="py-2 text-foreground">{g.definicion}</div>
        ),
      }))}
      className="w-full"
      // Controlar qué panel está abierto
      {...{ openIndex: open, setOpenIndex: setOpen }}
    />
  );
}

export default App

