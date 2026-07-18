import { motion } from 'framer-motion';
import type { LessonBlock } from '../../../types/domain';

interface BlockProgressProps {
  blocks: LessonBlock[];
  currentIndex: number;
}

const BLOCK_ICONS: Record<string, string> = {
  explanation: '📖',
  code: '💻',
  quiz: '✏️',
};

export function BlockProgress({ blocks, currentIndex }: BlockProgressProps) {
  return (
    <div className="block-progress">
      {blocks.map((block, idx) => {
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={block.id} className="block-progress-item">
            <div
              className={`block-progress-dot ${
                isDone
                  ? 'block-progress-dot--done'
                  : isCurrent
                  ? 'block-progress-dot--current'
                  : 'block-progress-dot--upcoming'
              }`}
            >
              {isDone ? (
                <span>✓</span>
              ) : (
                <span>{BLOCK_ICONS[block.type]}</span>
              )}
              {isCurrent && (
                <motion.div
                  className="block-progress-pulse"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            {idx < blocks.length - 1 && (
              <div
                className={`block-progress-line ${isDone ? 'block-progress-line--done' : ''}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
