# Dynamic Tutor

Dynamic Tutor es una aplicación web interactiva que utiliza la API de Gemini para generar contenido educativo sobre el tema que elijas. Presenta la información de manera estructurada, incluyendo explicaciones, pasos clave, ejemplos, un glosario y un quiz rápido.

## Características

*   **Generación de Contenido Dinámico:** Ingresa cualquier tema y obtén material de aprendizaje al instante.
*   **Presentación Estructurada:** El contenido se divide en:
    *   Explicación principal
    *   Pasos clave (con descripciones)
    *   Ejemplos prácticos
    *   Glosario de términos importantes
    *   Quiz interactivo de opción múltiple
*   **Internacionalización (i18n):** Soporte para Inglés y Español. El idioma se detecta automáticamente o se puede cambiar manualmente.
*   **Tema Oscuro/Claro:** Cambia entre temas visuales para una mejor experiencia de usuario.
*   **Interfaz Moderna:** Construido con React, TypeScript, Vite y TailwindCSS.

## Tecnologías Utilizadas

*   **Frontend:**
    *   React
    *   TypeScript
    *   Vite (para el entorno de desarrollo y build)
    *   TailwindCSS (para estilos)
    *   shadcn/ui (para componentes de UI preconstruidos y accesibles)
    *   i18next & react-i18next (para internacionalización)
    *   lucide-react (para iconos)
*   **API:**
    *   Google Gemini API (a través de `@google/genai`)
*   **Validación de Datos:**
    *   Zod (para validar la estructura de la respuesta de la API)

## Configuración y Ejecución

### Prerrequisitos

*   Node.js (v18 o superior recomendado)
*   npm o pnpm (este proyecto usa npm en los ejemplos, pero pnpm está configurado via `pnpm-lock.yaml`)

### Pasos de Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/dynamic-tutor.git # Reemplaza con la URL real del repo
    cd dynamic-tutor
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    # o si prefieres pnpm
    # pnpm install
    ```

3.  **Configura la API Key de Gemini:**
    *   Crea un archivo `.env` en la raíz del proyecto.
    *   Añade tu API Key de Google Gemini al archivo `.env` de la siguiente manera:
        ```
        VITE_GEMINI_API_KEY=TU_API_KEY_AQUI
        ```
    *   Puedes obtener una API Key desde [Google AI Studio](https://aistudio.google.com/app/apikey).

    **ADVERTENCIA DE SEGURIDAD IMPORTANTE:**
    Tal como está implementado actualmente, la `VITE_GEMINI_API_KEY` se incrusta directamente en el bundle del cliente. **Esto no es seguro para producción.** Para un despliegue en producción, debes implementar un backend proxy que maneje las llamadas a la API de Gemini, manteniendo tu clave API segura en el servidor.

### Ejecutar la Aplicación en Desarrollo

```bash
npm run dev
# o
# pnpm dev
```
Esto iniciará el servidor de desarrollo de Vite, generalmente en `http://localhost:5173`.

### Build para Producción

```bash
npm run build
# o
# pnpm build
```
Esto generará los archivos estáticos para producción en la carpeta `dist/`.

## Pruebas

La configuración de pruebas con Jest se inició pero encontró problemas persistentes con la transpilación de TypeScript (JSX e `import.meta.env`). Los archivos de prueba (`*.test.ts` y `*.test.tsx`) existen en el código y pueden servir como base si se desea continuar con Jest o migrar a una herramienta como Vitest, que generalmente ofrece mejor integración con Vite.

Para ejecutar las pruebas (si se resuelve la configuración):
```bash
npm test
```

## Mejoras Futuras (Plan Original)

*   **Gestión de Estado Avanzada:** Si la aplicación crece, considerar Zustand o Redux Toolkit.
*   **Pruebas Completas:** Resolver la configuración de Jest o implementar Vitest para pruebas unitarias y de componentes.
*   **Backend Proxy para API Key:** Implementar un backend para proteger la API Key de Gemini (CRUCIAL para producción).
*   **Más Opciones de Personalización:** Permitir al usuario elegir el nivel de detalle, tipo de ejemplos, etc.
*   **Historial de Búsquedas:** Guardar temas buscados anteriormente.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request.
