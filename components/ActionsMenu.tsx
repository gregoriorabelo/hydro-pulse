"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Action = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

const MENU_WIDTH = 192;

export default function ActionsMenu({ actions }: { actions: Action[] }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    function handleScrollOrResize() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open]);

  function toggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }

    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const estimatedMenuHeight = actions.length * 44 + 16;
    const openUpward = window.innerHeight - rect.bottom < estimatedMenuHeight;
    const left = Math.min(
      rect.right - MENU_WIDTH,
      window.innerWidth - MENU_WIDTH - 8
    );

    setPosition(
      openUpward
        ? { bottom: window.innerHeight - rect.top + 4, left }
        : { top: rect.bottom + 4, left }
    );
    setOpen(true);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        aria-label="Ações"
      >
        ⋮
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: position.top,
              bottom: position.bottom,
              left: position.left,
              width: MENU_WIDTH,
            }}
            className="z-50 overflow-hidden rounded-2xl border border-white/10 bg-brand-deep shadow-2xl"
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
          </div>,
          document.body
        )}
    </>
  );
}
