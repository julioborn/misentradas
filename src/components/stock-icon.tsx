type StockIconType = "bottle" | "can" | "champagne" | "cup";

const PATHS: Record<StockIconType, string> = {
  bottle:
    "M10 2h4v3.2c0 .5.2 1 .55 1.35L15.5 7.5c.32.32.5.75.5 1.2V20a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8.7c0-.45.18-.88.5-1.2l.95-.95c.35-.35.55-.8.55-1.35V2Z",
  can: "M6 8h12l-.8 12.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 8Zm.5-4h11l.4 3h-11.8l.4-3Z",
  champagne:
    "M9 2h6l-1 8.5A4 4 0 0 1 13 14v6h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-6a4 4 0 0 1-1-3.5L9 2Z",
  cup: "M6 6h12l-1.2 12.8A2 2 0 0 1 14.8 20H9.2a2 2 0 0 1-2-1.8L6 6Zm1.2 3h9.6",
};

export function StockIcon({
  type,
  color,
  className = "size-6",
}: {
  type: StockIconType;
  color: string;
  className?: string;
}) {
  return (
    <div
      className="size-11 shrink-0 rounded-full flex items-center justify-center"
      style={{ backgroundColor: `${color}26` }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d={PATHS[type]} />
      </svg>
    </div>
  );
}
