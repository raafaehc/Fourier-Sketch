import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastPayload = {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
};

type ToastContextValue = {
  toast: (payload: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<(ToastPayload & { id: number })[]>([]);

  const toast = useCallback((payload: ToastPayload) => {
    setMessages((prev) => [...prev, { ...payload, id: Date.now() }]);
    const timer = typeof window !== 'undefined' && window.setTimeout ? window.setTimeout : setTimeout;
    timer(() => {
      setMessages((prev) => prev.slice(1));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="glass-card pointer-events-auto w-64 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm"
            >
              <p className="font-medium text-white">{message.title}</p>
              {message.description ? (
                <p className="text-xs text-muted">{message.description}</p>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('Toast hooks used outside provider');
  return ctx;
}
