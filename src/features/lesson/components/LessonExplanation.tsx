import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface LessonExplanationProps {
  content: string;
  onScroll: (scrollPositionRatio: number) => void;
  isDensityReduced?: boolean;
}

// ─── Minimal Markdown Renderer ────────────────────────────────────────────────
// Sin dependencias externas. Cubre: h2, h3, code blocks, inline code,
// bold, italic, tables, y listas. Suficiente para el contenido de las 3 lecciones.

function renderMarkdown(md: string): string {
  return md
    // Code blocks (antes que inline para no colisionar)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre class="code-block" data-lang="${lang ?? 'js'}"><code>${escaped.trim()}</code></pre>`;
    })
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    // Tables (básico: | col | col |)
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => c.trim());
      const isHeader = cells.some((c: string) => c === '---' || c === ':---:');
      if (isHeader) return '';
      const tag = 'td';
      return `<tr>${cells.map((c: string) => `<${tag} class="md-td">${c}</${tag}>`).join('')}</tr>`;
    })
    // Wrap table rows
    .replace(/((<tr>.*<\/tr>\n?)+)/g, '<table class="md-table"><tbody>$1</tbody></table>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="md-ul">$&</ul>')
    // Paragraphs: líneas vacías entre contenido = nuevo párrafo
    .replace(/\n\n(?!<)/g, '</p><p class="md-p">')
    .replace(/^(?!<)(.+)/gm, (match) =>
      match.startsWith('<') ? match : match
    )
    // Wrap inicial
    .replace(/^/, '<p class="md-p">')
    .replace(/$/, '</p>')
    // Cleanup
    .replace(/<p class="md-p"><\/p>/g, '')
    .replace(/<p class="md-p">(<h[23])/g, '$1')
    .replace(/(<\/h[23]>)<\/p>/g, '$1');
}

export function LessonExplanation({
  content,
  onScroll,
  isDensityReduced = false,
}: LessonExplanationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollRatioRef = useRef(0);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const ratio = el.scrollTop / Math.max(el.scrollHeight - el.clientHeight, 1);
    // Solo emitir si cambió significativamente (>5%) para evitar spam de eventos
    if (Math.abs(ratio - lastScrollRatioRef.current) > 0.05) {
      lastScrollRatioRef.current = ratio;
      onScroll(ratio);
    }
  }, [onScroll]);

  return (
    <motion.div
      layout
      className={`explanation-container ${isDensityReduced ? 'density-reduced' : ''}`}
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="explanation-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </motion.div>
  );
}
