'use client';

import { useMailChatStore } from '@/store/useMailChatStore';

export function Toast() {
  const toasts = useMailChatStore((s) => s.toasts);
  const dismissToast = useMailChatStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismissToast(t.id)}
          className="pointer-events-auto rounded-full bg-[#1f2c34] px-4 py-2.5 text-[13px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-opacity hover:opacity-90 focus-visible:outline-none"
        >
          {t.texto}
        </button>
      ))}
    </div>
  );
}
