import type { AIRequest, AIResponse } from '../../types/domain';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';
// La key se lee de una variable de entorno de Vite (ver .env.local).
// ADVERTENCIA: Vite incrusta este valor en el JS que se descarga en el navegador.
// Cualquiera que abra devtools puede verlo. Nunca subas .env.local a git ni
// despliegues esto públicamente con una key real puesta así. Para producción,
// mueve esta llamada a un backend propio que guarde la key del lado del servidor
// (ver /server) y configura VITE_AI_PROXY_URL para usarlo en vez de llamar a
// OpenAI directo desde el navegador.
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_URL as string | undefined;
const TIMEOUT_MS = 15_000;
const CACHE_PREFIX = 'ai-cache:';

// ─── Cache key ────────────────────────────────────────────────────────────────
// Hash determinístico del request para deduplicar llamadas idénticas.
// No usamos crypto — string concatenation es suficiente para este caso.

export function buildCacheKey(req: AIRequest): string {
  return [
    req.type,
    req.lessonId,
    req.blockId,
    req.questionId ?? '',
    req.selectedOption ?? '',
    req.userState.state,
  ].join('::');
}

// ─── Prompts reales ────────────────────────────────────────────────────────────

const LESSON_TOPICS: Record<string, string> = {
  'lesson-1': 'funciones y scope en JavaScript',
  'lesson-2': 'closures en JavaScript',
  'lesson-3': 'Promises y async/await en JavaScript',
  'lesson-4': 'métodos de arrays (map, filter, reduce) en JavaScript',
  'lesson-5': 'variables, tipos de datos y operadores en JavaScript',
  'lesson-6': 'estructuras de control (condicionales y bucles) en JavaScript',
  'lesson-7': 'arrays y objetos (fundamentos) en JavaScript',
  'lesson-8': 'destructuring, spread/rest y template literals en JavaScript',
  'lesson-9': 'this, prototipos y clases en JavaScript',
  'lesson-10': 'manejo de errores y patrones asíncronos avanzados en JavaScript',
};

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  struggling: 'tiene dificultades con los conceptos y necesita analogías muy concretas del mundo real',
  normal: 'tiene un nivel intermedio y puede manejar abstracciones simples',
  advanced: 'tiene experiencia previa y prefiere explicaciones técnicas directas sin rodeos',
};

function buildAlternativeExplanationPrompt(req: AIRequest): string {
  const topic = LESSON_TOPICS[req.lessonId] ?? 'JavaScript';
  const level = LEVEL_DESCRIPTIONS[req.userState.state] ?? LEVEL_DESCRIPTIONS['normal'];

  return `Eres un tutor experto en JavaScript con habilidad para explicar conceptos difíciles de formas alternativas. Un estudiante que ${level} acaba de responder incorrectamente una pregunta sobre ${topic}.

Información del error:
- Pregunta: "${req.questionId}"
- Opción que eligió (incorrecta): "${req.selectedOption}"
- Error conceptual específico: "${req.specificError}"

Tu tarea: escribe UNA explicación alternativa de máximo 150 palabras que:
1. Empiece reconociendo POR QUÉ tiene sentido haber elegido esa opción (valida el razonamiento parcialmente correcto sin decir "gran pregunta" ni frases vacías)
2. Señale el punto exacto donde el razonamiento se desvía usando la frase "El momento donde el razonamiento cambia es..."
3. Use UNA analogía concreta del mundo real (no de programación) específica para este concepto
4. Termine con UNA frase que conecte la analogía de vuelta al código

Formato de respuesta: texto plano, sin títulos, sin markdown, sin introducción. Directo al punto.`;
}

function buildContextualHintPrompt(req: AIRequest): string {
  const BLOCK_CONTEXTS: Record<string, string> = {
    explanation: 'está leyendo la explicación teórica y lleva tiempo sin scrollear ni interactuar',
    code: 'está mirando el ejemplo de código interactivo sin haberlo modificado',
    quiz: 'está viendo una pregunta del quiz sin haber seleccionado ninguna opción',
  };

  const topic = LESSON_TOPICS[req.lessonId] ?? 'JavaScript';
  const blockContext = BLOCK_CONTEXTS[req.blockType ?? 'explanation'];
  const idleSeconds = Math.round((req.idleDurationMs ?? 45_000) / 1000);
  const confidencePercent = Math.round((req.userState.confidence ?? 0.5) * 100);

  return `Eres un tutor experto en JavaScript que usa el método socrático. Un estudiante lleva ${idleSeconds} segundos sin interactuar. Está trabajando en el tema de ${topic} y ${blockContext}.

Contexto del estudiante:
- Nivel de confianza actual: ${confidencePercent}% (${req.userState.state})
- Tiempo sin interacción: ${idleSeconds} segundos

Tu tarea: escribe UNA pista de máximo 80 palabras que:
1. NO dé la respuesta directamente ni la insinúe de forma obvia
2. Formule UNA pregunta socrática que el estudiante debería hacerse a sí mismo para desatascarse
3. Si el bloque es de código (blockType: code), mencione qué línea o construcción específica observar con atención
4. Use tono de guía, no de corrección

Formato: texto plano, sin títulos, sin markdown. Una sola pregunta o frase guía.`;
}

// ─── Fallbacks estáticos ──────────────────────────────────────────────────────
// Si la IA falla o supera el timeout, la UI muestra esto en lugar de un spinner infinito.

const STATIC_FALLBACKS: Record<AIRequest['type'], string> = {
  alternative_explanation:
    'Toma un momento para releer la explicación del concepto desde el principio. Intenta identificar exactamente en qué línea del código ejemplo el comportamiento cambia respecto a lo que esperabas. Si puedes, escribe en papel qué valor tiene cada variable paso a paso antes de responder.',
  contextual_hint:
    '¿Puedes seguir la ejecución del código línea por línea y anotar qué valor tendría cada variable en cada paso? Empieza desde la primera línea y no asumas nada — verifica cada valor explícitamente.',
};

// ─── Llamada a la API (directo a OpenAI, o a tu backend propio) ──────────────
// Si VITE_AI_PROXY_URL está configurada, se usa ese endpoint propio (que debería
// guardar la key del lado del servidor) en vez de llamar a OpenAI directo desde
// el navegador. Ver /server para un ejemplo mínimo de ese backend.

async function callAIWithTimeout(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    if (AI_PROXY_URL) {
      // Backend propio: no se envía ninguna key desde el navegador.
      const response = await fetch(AI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error(`AI proxy error: ${response.status}`);
      }
      const data = await response.json();
      return data.content ?? '';
    }

    if (!OPENAI_API_KEY) {
      throw new Error('Falta VITE_OPENAI_API_KEY (defínela en .env.local)');
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // OpenAI (a diferencia de Anthropic en el sandbox de Artifacts) requiere
        // este header explícito con la key.
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    // La respuesta de OpenAI viene en data.choices[0].message.content (string),
    // no en data.content (array de bloques) como en la API de Anthropic.
    return data.choices?.[0]?.message?.content ?? '';
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Cache persistente entre sesiones ─────────────────────────────────────────
// React Query ya cachea en memoria durante la sesión, pero se pierde al
// refrescar la página. Guardamos las respuestas reales (no los fallbacks, para
// poder reintentar la IA la próxima vez) en localStorage para no repetir
// llamadas — y costos — por el mismo contexto.

function readFromLocalCache(cacheKey: string): AIResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + cacheKey);
    if (!raw) return null;
    return JSON.parse(raw) as AIResponse;
  } catch {
    return null;
  }
}

function writeToLocalCache(cacheKey: string, response: AIResponse): void {
  try {
    localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(response));
  } catch {
    // localStorage lleno o no disponible — no es crítico, seguimos sin cache
  }
}

// ─── Función principal ────────────────────────────────────────────────────────

export async function requestAIContent(req: AIRequest): Promise<AIResponse> {
  const cacheKey = buildCacheKey(req);

  const cached = readFromLocalCache(cacheKey);
  if (cached) return cached;

  const prompt =
    req.type === 'alternative_explanation'
      ? buildAlternativeExplanationPrompt(req)
      : buildContextualHintPrompt(req);

  try {
    const content = await callAIWithTimeout(prompt);
    const response: AIResponse = {
      type: req.type,
      content,
      generatedAt: Date.now(),
      cacheKey,
    };
    writeToLocalCache(cacheKey, response);
    return response;
  } catch {
    // AbortError (timeout) o error de red → fallback estático (no se cachea,
    // para poder reintentar la IA real la próxima vez que se dispare)
    return {
      type: req.type,
      content: STATIC_FALLBACKS[req.type],
      generatedAt: Date.now(),
      cacheKey,
      isStaticFallback: true,
    };
  }
}
