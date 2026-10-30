"use client";

import { memo, useCallback, useState } from "react";
import type { ErrorCode } from "@/types/notion";
import 
  {
    XCircleIcon,
    BoltSlashIcon,
    ServerIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    HomeIcon
 } from "@heroicons/react/24/outline";

interface ErrorBannerProps {
  code: ErrorCode;
  message: string;
  retryable?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ERROR_CONFIG: Record<ErrorCode, { bg: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = {
  reconnection_required: {
    bg: "bg-neutral-800 border-neutral-600",
    icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500"/> 
  },
  notion_unavailable: {
    bg: "bg-neutral-900 border-neutral-700",
    icon: <BoltSlashIcon className="h-6 w-6 text-red-500"/>
  },
  rate_limited: {
    bg: "bg-neutral-900 border-neutral-700",
    icon: <ClockIcon className="h-6 w-6 text-red-500"/>  
  },
  internal_error: {
    bg: "bg-neutral-900 border-neutral-600",
    icon: <ServerIcon className="h-6 w-6 text-red-500"/>
  },
};

function ErrorBannerComponent({
  code,
  message,
  retryable,
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (dismissed) return null;

  const config = ERROR_CONFIG[code] ?? ERROR_CONFIG.internal_error;

  return (
    <div
      className={`${config.bg} h-10 border rounded-full px-4 py-3 flex items-center justify-between gap-3 transition-all duration-300`}
      role="alert"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg shrink-0">{config.icon}</span>
        <p className="text-sm text-neutral-300 truncate">{message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {retryable && onRetry && (
          <button
            onClick={onRetry}
            className="w-25 h-6 rounded-full text-xs font-medium text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 transition-colors"
          >
            Retry
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
          aria-label="Dismiss"
        >
          <XCircleIcon className="h-6 w-6 text-neutral-500 hover:text-neutral-300 transition-colors" />
        </button>
      </div>
    </div>
  );
}

export const ErrorBanner = memo(ErrorBannerComponent);
