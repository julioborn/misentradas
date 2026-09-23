import type { ReactNode } from "react";

export function TicketStub({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex rounded-3xl bg-surface overflow-hidden shadow-xl shadow-black/30 ring-1 ring-white/5 ${className}`}
    >
      <div className="ticket-notches w-7 shrink-0 py-4">
        <span className="ticket-notch" />
        <span className="ticket-notch" />
        <span className="ticket-notch" />
        <span className="ticket-notch" />
        <span className="ticket-notch" />
      </div>
      <div className="flex-1 min-w-0 border-l border-dashed border-white/15 px-5 py-5">
        {children}
      </div>
    </div>
  );
}
