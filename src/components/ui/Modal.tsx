'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-3xl border-t border-white/[0.08] bg-[#12121a] overflow-y-auto"
          >
            <div className="sticky top-0 bg-[#12121a] px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
