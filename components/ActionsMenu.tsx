"use client";

import { useEffect, useRef, useState } from "react";

type Action = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

export default function ActionsMenu({ actions }: { actions: Action[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        aria-label="Ações"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-2xl border border-white/10 bg-brand-deep shadow-2xl">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
              className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-white/10 ${
                action.danger ? "text-red-400" : "text-slate-200"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
