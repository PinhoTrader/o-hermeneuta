import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { fade, fadeZoom } from '../../lib/motionVariants';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <motion.div
      {...fade(0.2)}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        {...fadeZoom(0.3)}
        className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-serif text-slate-900">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600" title="Fechar">
              <X size={24} />
            </button>
          </div>
        )}
        {children}
        {footer && <div className="flex gap-4 pt-2">{footer}</div>}
      </motion.div>
    </motion.div>
  );
}
