import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// ─── Por qué CSS vars y no colores hardcodeados ──────────────────────────────
// El resto del proyecto define toda su paleta como CSS custom properties en
// :root (ver styles.css), y el toggle de tema claro/oscuro funciona
// simplemente reasignando esas variables en `[data-theme="light"]`. Si aquí
// hardcodeábamos los colores del editor, el CodeMirror se hubiera quedado
// "pegado" en el tema oscuro cuando alguien cambiara a claro. Como CSS
// permite `var(--x)` en cualquier valor de color, EditorView.theme() puede
// usarlas tal cual — el navegador las resuelve en tiempo real, así que el
// editor cambia de tema solo, sin ningún JS adicional.

export const editorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'var(--bg-base)',
      color: 'var(--text-primary)',
      fontSize: '13px',
      height: 'auto',
    },
    '.cm-content': {
      fontFamily: 'var(--font-mono)',
      padding: '16px 20px',
      caretColor: 'var(--accent-primary)',
      lineHeight: '1.7',
    },
    '.cm-line': { padding: '0' },
    '&.cm-focused': { outline: 'none' },
    '.cm-gutters': {
      backgroundColor: 'var(--bg-base)',
      color: 'var(--text-muted)',
      border: 'none',
      paddingLeft: '4px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--bg-overlay)',
      color: 'var(--text-secondary)',
    },
    '.cm-activeLine': { backgroundColor: 'var(--bg-overlay)' },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: 'var(--accent-primary-dim) !important',
    },
    '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--accent-primary)' },
    '.cm-matchingBracket, .cm-nonmatchingBracket': {
      backgroundColor: 'var(--accent-primary-dim)',
      outline: '1px solid var(--accent-primary)',
    },
    '.cm-tooltip': {
      backgroundColor: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
    },
    '.cm-tooltip-autocomplete ul li[aria-selected]': {
      backgroundColor: 'var(--accent-primary-dim)',
      color: 'var(--text-primary)',
    },
    '.cm-scroller': { fontFamily: 'var(--font-mono)', overflow: 'auto' },
  },
  { dark: true }
);

// Paleta de sintaxis: mapea tokens del parser JS a variables --syntax-* (una
// por rol semántico: keyword, string, comment, etc.) definidas en :root y
// redefinidas en [data-theme="light"]. Los valores de fallback (después de
// la coma) son solo por si alguna vez se usa este archivo sin cargar
// styles.css primero — en la app real siempre están las variables reales.
const highlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--syntax-keyword, #ff7edb)' },
  { tag: [t.string, t.special(t.string), t.regexp], color: 'var(--syntax-string, #7ee787)' },
  { tag: [t.comment, t.blockComment, t.lineComment], color: 'var(--syntax-comment, #6e7681)', fontStyle: 'italic' },
  { tag: [t.number, t.bool, t.null], color: 'var(--syntax-number, #79c0ff)' },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: 'var(--syntax-function, #d2a8ff)',
  },
  { tag: t.variableName, color: 'var(--syntax-variable, #e8e8f5)' },
  { tag: t.propertyName, color: 'var(--syntax-property, #79c0ff)' },
  { tag: [t.operator, t.punctuation], color: 'var(--syntax-operator, #ff9f7a)' },
  { tag: [t.bracket], color: 'var(--text-secondary)' },
  { tag: [t.className, t.typeName], color: 'var(--syntax-class, #ffd580)' },
  { tag: t.definition(t.variableName), color: 'var(--syntax-variable, #e8e8f5)', fontWeight: '600' },
  { tag: t.atom, color: 'var(--syntax-number, #79c0ff)' },
]);

export const editorHighlighting = syntaxHighlighting(highlightStyle);
