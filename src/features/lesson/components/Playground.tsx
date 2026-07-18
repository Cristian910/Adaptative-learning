import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { editorTheme, editorHighlighting } from '../utils/codeMirrorTheme';
import { runUserCode } from '../utils/runInWorker';
import { useModalA11y } from '../../../app/useModalA11y';

interface PlaygroundProps {
  open: boolean;
  onClose: () => void;
}

const STARTER = `// Practica lo que quieras aquí — no hay corrección automática,
// es un espacio libre para experimentar. Soporta JS y TS (los
// tipos se sacan antes de ejecutar, igual que en las lecciones).

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 8; i++) {
  console.log(fibonacci(i));
}`;

const SNIPPETS: { label: string; code: string }[] = [
  { label: 'En blanco', code: '// Escribe aquí\n' },
  {
    label: 'Array methods',
    code: `const numeros = [1, 2, 3, 4, 5, 6, 7, 8];

const pares = numeros.filter((n) => n % 2 === 0);
const cuadrados = pares.map((n) => n * n);
const suma = cuadrados.reduce((acc, n) => acc + n, 0);

console.log('Pares:', pares);
console.log('Cuadrados:', cuadrados);
console.log('Suma:', suma);`,
  },
  {
    label: 'Async/await',
    code: `function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Arrancó');
  await esperar(500);
  console.log('Pasaron 500ms');
  await esperar(500);
  console.log('Pasaron otros 500ms');
}

main();`,
  },
  {
    label: 'TypeScript',
    code: `interface Tarea {
  titulo: string;
  completada: boolean;
}

function resumen(tareas: Tarea[]): string {
  const completadas = tareas.filter((t) => t.completada).length;
  return \`\${completadas}/\${tareas.length} completadas\`;
}

const tareas: Tarea[] = [
  { titulo: 'Aprender TS', completada: true },
  { titulo: 'Practicar', completada: false },
];

console.log(resumen(tareas));`,
  },
];

// ─── Playground ───────────────────────────────────────────────────────────────
// Todas las demás secciones del proyecto están atadas a una lección o a un
// ejercicio con expectedOutput. Esta es la única pantalla sin ningún
// objetivo que cumplir — un lugar para simplemente escribir y correr código,
// como una consola de JS/TS suelta. Reutiliza runUserCode (el mismo Web
// Worker con timeout que usan los ejercicios de lección), así que el
// aislamiento y la protección contra loops infinitos son exactamente los
// mismos.

export function Playground({ open, onClose }: PlaygroundProps) {
  const [code, setCode] = useState(STARTER);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const containerRef = useModalA11y<HTMLDivElement>(open, onClose);

  const handleRun = useCallback(async () => {
    setRunning(true);
    const result = await runUserCode(code);
    setOutput(result.output);
    setError(result.error);
    setRunning(false);
  }, [code]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="welcome-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={containerRef}
            className="dashboard-card playground-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="playground-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="badges-panel-header">
              <h2 id="playground-title" className="welcome-modal-title">🧪 Práctica libre</h2>
              <button onClick={onClose} className="badges-panel-close" aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div className="playground-snippets">
              {SNIPPETS.map((s) => (
                <button
                  key={s.label}
                  className="playground-snippet-btn"
                  onClick={() => {
                    setCode(s.code);
                    setOutput(null);
                    setError(null);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="code-editor-wrapper playground-editor">
              <CodeMirror
                value={code}
                height="auto"
                minHeight="220px"
                maxHeight="360px"
                theme={editorTheme}
                extensions={[
                  javascript({ jsx: false, typescript: true }),
                  editorHighlighting,
                  EditorView.lineWrapping,
                  keymap.of([indentWithTab]),
                ]}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: false,
                  highlightActiveLine: true,
                  autocompletion: true,
                  closeBrackets: true,
                  bracketMatching: true,
                }}
                onChange={setCode}
                aria-label="Editor de práctica libre"
              />
            </div>

            <div className="playground-actions">
              <button onClick={handleRun} disabled={running} className="btn-primary btn-lg">
                {running ? 'Ejecutando…' : '▶ Ejecutar'}
              </button>
            </div>

            {(output !== null || error) && (
              <div
                role="status"
                aria-live="polite"
                className={`code-output ${error ? 'code-output--error' : 'code-output--success'}`}
              >
                <div className="code-output-label">{error ? '✕ Error' : '✓ Output'}</div>
                {output && <pre className="code-output-text">{output}</pre>}
                {error && <pre className="code-output-error">{error}</pre>}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
