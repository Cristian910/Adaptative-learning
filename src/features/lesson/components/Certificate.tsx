import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '../../../app/useModalA11y';

interface CertificateProps {
  open: boolean;
  onClose: () => void;
  userName: string | null;
  trackLabel: string;
  totalLessons: number;
  points: number;
  completedAt: Date;
}

// ─── Certificate ──────────────────────────────────────────────────────────────
// El certificado se dibuja como SVG (texto dinámico interpolado por React,
// nada de imágenes externas) y se descarga como PNG dibujándolo en un
// <canvas> — sin agregar ninguna librería nueva al bundle (nada de
// html2canvas). A propósito usa tipografías de sistema universales (Georgia,
// Arial) en vez de las webfonts de la app: al rasterizar un SVG a través de
// un <Image>, las webfonts no siempre llegan a estar cargadas a tiempo, y un
// certificado con el texto en la fuente de fallback equivocada se ve roto.
// Fuentes de sistema garantizan que el PNG descargado se vea siempre bien.

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function buildCertificateSvg(params: {
  name: string;
  trackLabel: string;
  totalLessons: number;
  points: number;
  dateLabel: string;
}): string {
  const { name, trackLabel, totalLessons, points, dateLabel } = params;
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0d0d1a"/>
        <stop offset="100%" stop-color="#171730"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)"/>
    <rect x="36" y="36" width="1128" height="728" fill="none" stroke="#6366f1" stroke-width="2"/>
    <rect x="48" y="48" width="1104" height="704" fill="none" stroke="#6366f1" stroke-width="1" opacity="0.5"/>

    <rect x="562" y="90" width="76" height="76" rx="16" fill="#6366f1"/>
    <text x="600" y="140" font-family="Arial, sans-serif" font-weight="800" font-size="32" text-anchor="middle" fill="#ffffff">JS</text>

    <text x="600" y="230" font-family="Arial, sans-serif" font-size="16" letter-spacing="6" text-anchor="middle" fill="#9898bb">CERTIFICADO DE FINALIZACIÓN</text>

    <text x="600" y="290" font-family="Georgia, 'Times New Roman', serif" font-size="22" text-anchor="middle" fill="#c9c9de">Se certifica que</text>

    <text x="600" y="380" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="64" text-anchor="middle" fill="#ffffff">${esc(name)}</text>

    <line x1="360" y1="410" x2="840" y2="410" stroke="#6366f1" stroke-width="1" opacity="0.6"/>

    <text x="600" y="460" font-family="Georgia, 'Times New Roman', serif" font-size="22" text-anchor="middle" fill="#c9c9de">completó exitosamente el curso de</text>
    <text x="600" y="500" font-family="Arial, sans-serif" font-weight="700" font-size="30" text-anchor="middle" fill="#8385f5">${esc(trackLabel)}</text>

    <g font-family="Arial, sans-serif" text-anchor="middle">
      <text x="420" y="590" font-size="34" font-weight="700" fill="#ffffff">${totalLessons}</text>
      <text x="420" y="616" font-size="14" fill="#9898bb">LECCIONES COMPLETADAS</text>

      <text x="600" y="590" font-size="34" font-weight="700" fill="#ffffff">${points}</text>
      <text x="600" y="616" font-size="14" fill="#9898bb">PUNTOS TOTALES</text>

      <text x="780" y="590" font-size="18" font-weight="700" fill="#ffffff">${esc(dateLabel)}</text>
      <text x="780" y="616" font-size="14" fill="#9898bb">FECHA</text>
    </g>

    <text x="600" y="700" font-family="Arial, sans-serif" font-size="13" text-anchor="middle" fill="#6e6e8a">JS Adaptive Learning — Plataforma de aprendizaje adaptativo</text>
    <text x="600" y="722" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" fill="#4a4a63">Certificado personal de finalización de curso — no constituye una acreditación institucional</text>
  </svg>`;
}

export function Certificate({
  open,
  onClose,
  userName,
  trackLabel,
  totalLessons,
  points,
  completedAt,
}: CertificateProps) {
  const svgPreviewRef = useRef<HTMLDivElement>(null);
  const modalRef = useModalA11y<HTMLDivElement>(open, onClose);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const name = userName?.trim() || 'Estudiante Adaptive';
  const dateLabel = formatDate(completedAt);
  const svgMarkup = buildCertificateSvg({ name, trackLabel, totalLessons, points, dateLabel });

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(false);
    try {
      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('No se pudo cargar el SVG del certificado'));
      });
      img.src = url;
      await loaded;

      // 2x para que el PNG descargado se vea nítido en pantallas de alta
      // densidad de píxeles, no pixelado.
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = 1200 * scale;
      canvas.height = 800 * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo obtener el contexto 2D del canvas');
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, 1200, 800);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) {
          setDownloadError(true);
          setDownloading(false);
          return;
        }
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `certificado-${trackLabel.toLowerCase()}-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
        setDownloading(false);
      }, 'image/png');
    } catch {
      setDownloadError(true);
      setDownloading(false);
    }
  };

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
            ref={modalRef}
            className="certificate-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="badges-panel-header">
              <h2 id="certificate-title" className="welcome-modal-title">Tu certificado</h2>
              <button onClick={onClose} className="badges-panel-close" aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div
              ref={svgPreviewRef}
              className="certificate-preview"
              role="img"
              aria-label={`Certificado de finalización del curso de ${trackLabel}`}
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />

            {downloadError && (
              <p className="certificate-error">
                No se pudo generar la descarga. Prueba de nuevo, o haz clic derecho sobre el
                certificado y "Guardar imagen como…".
              </p>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary btn-lg"
            >
              {downloading ? 'Generando…' : '⬇ Descargar como PNG'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
