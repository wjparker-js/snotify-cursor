
import * as React from "react";

// Types for toast related functionality
export interface ToastProps {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
  action?: React.ReactNode;
}

export type Toast = ToastProps & {
  id: string;
};

export type ToastActionElement = React.ReactElement<unknown>;

interface ToastContextType {
  toasts: Toast[];
  addToast: (props: ToastProps) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
  toast: (props: ToastProps) => {
    id: string;
    dismiss: () => void;
  };
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((props: ToastProps) => {
    const id = props.id || Math.random().toString(36).slice(2, 10);
    const newToast = { ...props, id };
    setToasts((prev) => [...prev, newToast]);
    
    if (props.duration !== Infinity) {
      setTimeout(() => {
        dismissToast(id);
      }, props.duration || 5000);
    }

    return {
      id,
      dismiss: () => dismissToast(id),
    };
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  // Define toast function as part of the context
  const toast = React.useCallback((props: ToastProps) => {
    const id = props.id || Math.random().toString(36).slice(2, 10);
    const newToast = { ...props, id };
    setToasts((prev) => [...prev, newToast]);
    
    if (props.duration !== Infinity) {
      setTimeout(() => {
        dismissToast(id);
      }, props.duration || 5000);
    }

    return {
      id,
      dismiss: () => dismissToast(id),
    };
  }, [dismissToast]);

  // Add event listeners for external toast operations
  React.useEffect(() => {
    const handleAddToast = (event: Event) => {
      const toastEvent = event as CustomEvent<Toast>;
      const newToast = toastEvent.detail;
      addToast(newToast);
    };

    const handleDismissToast = (event: Event) => {
      const dismissEvent = event as CustomEvent<{ id: string }>;
      dismissToast(dismissEvent.detail.id);
    };

    window.addEventListener("add-toast", handleAddToast);
    window.addEventListener("dismiss-toast", handleDismissToast);

    return () => {
      window.removeEventListener("add-toast", handleAddToast);
      window.removeEventListener("dismiss-toast", handleDismissToast);
    };
  }, [addToast, dismissToast]);

  const contextValue = React.useMemo(
    () => ({
      toasts,
      addToast,
      dismissToast,
      dismissAll,
      toast,
    }),
    [toasts, addToast, dismissToast, dismissAll, toast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export const toast = (props: ToastProps) => {
  const id = Math.random().toString(36).slice(2, 10);
  
  try {
    window.dispatchEvent(
      new CustomEvent("add-toast", { 
        detail: { ...props, id } 
      })
    );
  } catch (e) {
    console.warn("Error showing toast:", e);
  }

  return {
    id,
    dismiss: () => {
      try {
        window.dispatchEvent(
          new CustomEvent("dismiss-toast", { 
            detail: { id } 
          })
        );
      } catch (e) {
        console.warn("Error dismissing toast:", e);
      }
    },
  };
};
