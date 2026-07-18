import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import type { CodeExample as CodeExampleType } from '../../../types/domain';
import { useAppStore } from '../../../store/useAppStore';
import { editorTheme, editorHighlighting } from '../utils/codeMirrorTheme';
import { runUserCode } from '../utils/runInWorker';
import { useLanguage } from '../../../app/LanguageContext';

interface CodeExampleProps {
  example: CodeExampleType;
  onRun: (success: boolean, errorType?: string) => void;
  onInteract: () => void;
}

// ─── Editor con CodeMirror ─────────────────────────────────────────────────
// Versión anterior de este archivo: un <textarea> plano sin resaltado de
// sintaxis. Antes de eso hubo un intento más viejo de "resaltado casero" con
// dos capas superpuestas (un <div> coloreado detrás de un <textarea> con
// texto invisible encima) que se rompía con código largo porque las dos
// capas no siempre medían exactamente lo mismo carácter por carácter. En vez
// de seguir parchando ese enfoque, ahora se usa CodeMirror 6
// (@uiw/react-codemirror), que resuelve resaltado, autocompletado, bracket
// matching e indentado con una sola fuente de verdad del texto — sin la
// necesidad de sincronizar capas a mano. El tema (colores, tipografía) vive
// en codeMirrorTheme.ts y reutiliza las mismas CSS vars que el resto de la
// app, así que respeta el tema claro/oscuro automáticamente.

export function CodeExample({ example, onRun, onInteract }: CodeExampleProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState(example.code);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHintIndex, setShowHintIndex] = useState(-1);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const hasInteracted = useRef(false);
  const incrementCodeRuns = useAppStore((s) => s.incrementCodeRuns);

  // ¿El resultado de la última ejecución es el correcto? Si el ejercicio no
  // define expectedOutput (no debería pasar, pero por las dudas), cualquier
  // ejecución sin error cuenta como resuelta para no bloquear el avance por un
  // error de contenido.
  const isSolved =
    output !== null &&
    !error &&
    (!example.expectedOutput || output.trim() === example.expectedOutput.trim());

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      if (!hasInteracted.current) {
        hasInteracted.current = true;
        onInteract();
      }
    },
    [onInteract]
  );

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setOutput(null);
    setError(null);
    incrementCodeRuns();

    // Pequeño delay visual + soporte async: runUserCode devuelve Promise
    setTimeout(async () => {
      const result = await runUserCode(code);
      const matchesExpected =
        !result.error &&
        (!example.expectedOutput || result.output.trim() === example.expectedOutput.trim());

      setOutput(result.output || '(sin output)');
      setError(result.error);
      setIsRunning(false);

      if (matchesExpected) {
        // "success" ahora significa "resolvió el ejercicio de verdad", no solo
        // "corrió sin explotar" — antes un programa que corría bien pero daba
        // el resultado incorrecto contaba como éxito para el motor adaptativo,
        // lo cual era incorrecto.
        onRun(true, undefined);
      } else {
        setWrongAttempts((n) => n + 1);
        onRun(false, result.error?.split(':')[0] ?? 'wrong_output');
      }
    }, 150);
  }, [code, example.expectedOutput, onRun, incrementCodeRuns]);

  // Pistas progresivas automáticas: no hace falta que el usuario las pida —
  // aparecen solas a medida que se acumulan intentos fallidos, y como último
  // recurso (después de muchos intentos) se ofrece ver la solución para que
  // nadie quede trabado para siempre en el mismo ejercicio.
  useEffect(() => {
    if (!example.hints || example.hints.length === 0) return;
    if (wrongAttempts === 2) setShowHintIndex(0);
    if (wrongAttempts === 4 && example.hints.length > 1) setShowHintIndex(1);
    if (wrongAttempts === 6 && example.hints.length > 2) setShowHintIndex(2);
  }, [wrongAttempts, example.hints]);

  const handleShowHint = useCallback(() => {
    if (example.hints && showHintIndex < example.hints.length - 1) {
      setShowHintIndex((i) => i + 1);
    }
  }, [example.hints, showHintIndex]);

  const handleReset = useCallback(() => {
    setCode(example.code);
    setOutput(null);
    setError(null);
    setShowHintIndex(-1);
    setWrongAttempts(0);
    setShowSolution(false);
    hasInteracted.current = false;
  }, [example.code]);

  // Reset completo al cambiar de ejercicio (nueva variante adaptativa)
  useEffect(() => {
    setCode(example.code);
    setOutput(null);
    setError(null);
    setShowHintIndex(-1);
    setWrongAttempts(0);
    setShowSolution(false);
    hasInteracted.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [example.id]);

  return (
    <motion.div layout className="code-example-card">
      <div className="code-example-header">
        <div>
          <h3 className="code-example-title">{example.title}</h3>
          <p className="code-example-description">{example.description}</p>
        </div>
        <button onClick={handleReset} className="btn-ghost btn-sm" title={t.codeResetButton}>
          {t.codeResetButton}
        </button>
      </div>

      {/* Editor */}
      <div className="code-editor-wrapper">
        <CodeMirror
          value={code}
          height="auto"
          minHeight="140px"
          maxHeight="480px"
          theme={editorTheme}
          extensions={[
            javascript({ jsx: false, typescript: false }),
            editorHighlighting,
            EditorView.lineWrapping,
            keymap.of([indentWithTab]),
          ]}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            autocompletion: true,
            closeBrackets: true,
            bracketMatching: true,
            indentOnInput: true,
          }}
          onChange={handleCodeChange}
          aria-label="Editor de código"
        />
      </div>

      {/* Botones de acción */}
      <div className="code-actions">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="btn-primary"
        >
          {isRunning ? `▶ ${t.codeRunningLabel}` : t.codeRunButton}
        </button>

        {example.hints && example.hints.length > 0 && showHintIndex < example.hints.length - 1 && (
          <button onClick={handleShowHint} className="btn-ghost btn-sm">
            💡 Pista {showHintIndex + 2}/{example.hints.length}
          </button>
        )}

        {wrongAttempts > 0 && !isSolved && (
          <span className="code-attempts-counter">
            Intento{wrongAttempts === 1 ? '' : 's'}: {wrongAttempts}
          </span>
        )}
      </div>

      {/* Hints progresivos */}
      <AnimatePresence>
        {showHintIndex >= 0 && example.hints && (
          <motion.div
            key={showHintIndex}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="code-hint"
          >
            💡 {example.hints[showHintIndex]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output */}
      <AnimatePresence>
        {output !== null && (
          <motion.div
            key="output"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
            className={`code-output ${error ? 'code-output--error' : 'code-output--success'}`}
          >
            <div className="code-output-label">
              {error ? t.codeErrorLabel : t.codeOutputLabel}
            </div>
            {output && <pre className="code-output-text">{output}</pre>}
            {error && <pre className="code-output-error">{error}</pre>}

            {/* Comparación con expected output */}
            {!error && example.expectedOutput && (
              <div
                className={`code-output-check ${
                  isSolved ? 'code-output-check--pass' : 'code-output-check--fail'
                }`}
              >
                {isSolved
                  ? '✓ Resuelto correctamente — ya puedes continuar'
                  : `Todavía no coincide con lo esperado: ${example.expectedOutput}`}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Válvula de escape: si falló muchas veces, ofrecemos ver la solución
          en vez de dejarlo trabado para siempre en el mismo ejercicio. */}
      {!isSolved && wrongAttempts >= 5 && example.solution && (
        <div className="code-solution-box">
          {!showSolution ? (
            <button onClick={() => setShowSolution(true)} className="btn-ghost btn-sm">
              🔓 Ya intenté varias veces — mostrar la solución
            </button>
          ) : (
            <>
              <p className="code-solution-label">Solución de referencia:</p>
              <pre className="code-solution-code">{example.solution}</pre>
              <p className="code-solution-note">
                Pégala en el editor de arriba y ejecútala para poder continuar —
                así queda registrado que tú corriste el código, no solo que lo
                leíste.
              </p>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
