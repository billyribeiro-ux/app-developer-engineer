export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

class ToastState {
  toasts = $state<Toast[]>([]);

  add(type: ToastType, message: string, duration = 4000) {
    const id = crypto.randomUUID();
    this.toasts = [...this.toasts, { id, type, message, duration }];
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  success(message: string, duration?: number) {
    this.add('success', message, duration);
  }

  error(message: string, duration?: number) {
    this.add('error', message, duration ?? 6000);
  }

  warning(message: string, duration?: number) {
    this.add('warning', message, duration);
  }

  info(message: string, duration?: number) {
    this.add('info', message, duration);
  }
}

export const toastState = new ToastState();
