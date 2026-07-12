"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore, NotificationEvent } from "../../stores/useNotificationStore";
import { CheckCircle2, XCircle, Info, Loader2, X } from "lucide-react";
import { useEffect } from "react";

const getIcon = (type: string, status?: string) => {
  if (status === "processing" || status === "progress") return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
  if (status === "completed" || type === "success") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "failed" || type === "error") return <XCircle className="h-5 w-5 text-red-500" />;
  return <Info className="h-5 w-5 text-blue-500" />;
};

const NotificationItem = ({ notification }: { notification: NotificationEvent }) => {
  const { dismissToast } = useNotificationStore();

  useEffect(() => {
    // Auto dismiss after 6 seconds for completed/failed/info
    // Keep processing ones alive until updated
    if (notification.status !== "processing" && notification.status !== "progress") {
      const timer = setTimeout(() => {
        dismissToast(notification.id);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification, dismissToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      layout
      className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg ring-1 ring-black/5 dark:ring-white/10"
    >
      <div className="p-4 relative">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {getIcon(notification.type, notification.status)}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-transparent text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => dismissToast(notification.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function NotificationToaster() {
  const { notifications } = useNotificationStore();

  // Optionally, group notifications by batchId so we only show the latest status per batch
  // But for now we just show them dynamically, the store will append them.
  // Wait, if it's a progress update, it might spam. We should probably update the existing notification if batchId matches.
  // Let's rely on the user to see the stream. If they want it grouped, we can tweak the store.

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-3 sm:items-end h-full justify-end">
        <AnimatePresence mode="popLayout">
          {notifications.filter(n => !n.dismissedToast).map((notif) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
