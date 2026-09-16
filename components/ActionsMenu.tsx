"use client";

import { useEffect, useRef, useState } from "react";

type Action = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

export default function ActionsMenu({ actions }: { actions: Action[] }) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const estimatedMenuHeight = actions.length * 44 + 16;

      setOpenUpward(window.innerHeight - rect.bottom < estimatedMenuHeight);
    }

    setOpen((value) => !value);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        aria-label="Ações"
      >
        ⋮
      </button>

      {open && (
        <div
          className={`absolute right-0 z-10 w-48 overflow-hidden rounded-2xl border border-white/10 bg-brand-deep shadow-2xl ${
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
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
