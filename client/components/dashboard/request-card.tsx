export interface Request {
  _id: string;
  userId: string;
  message: string;
  summary?: string;
  category: string;
  urgency: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
interface RequestCardProps {
  request: Request;
  onClick: (request: Request) => void;
}

const URGENCY_STYLES: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

const CATEGORY_STYLES: Record<string, string> = {
  support: "bg-blue-50 text-blue-700 border-blue-200",
  billing: "bg-purple-50 text-purple-700 border-purple-200",
  general: "bg-gray-50 text-gray-700 border-gray-200",
};

export function RequestCard({ request, onClick }: RequestCardProps) {
  const urgencyClass =
    URGENCY_STYLES[request.urgency?.toLowerCase()] ?? URGENCY_STYLES.medium;
  const categoryClass =
    CATEGORY_STYLES[request.category?.toLowerCase()] ?? CATEGORY_STYLES.general;

  return (
    <button
      onClick={() => onClick(request)}
      className="w-full text-left p-3 rounded-xl border hover:bg-muted/40 hover:border-muted-foreground/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <p className="font-medium text-sm leading-snug line-clamp-1">
        {request.summary || request.message}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${categoryClass}`}
        >
          {request.category}
        </span>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${urgencyClass}`}
        >
          {request.urgency}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(request.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </button>
  );
}