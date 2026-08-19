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
      className={`flex rounded-2xl bg-surface overflow-hidden ${className}`}
    >
      <div className="ticket-notches w-5 shrink-0 py-3">
        <span className="ticket-notch" />
        <span className="ticket-notch" />
        <span className="ticket-notch" />
        <span className="ticket-notch" />
        <span className="ticket-notch" />
      </div>
      <div className="flex-1 min-w-0 border-l border-dashed border-white/15 px-4 py-4">
        {children}
      </div>
    </div>
  );
}
