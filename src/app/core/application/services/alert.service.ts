import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastMessage, ToastType, ToastConfig } from './notification.types';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  private readonly defaultConfig: ToastConfig = {
    duration: 5000,
    position: 'top-right',
    maxToasts: 3
  };

  public readonly toasts$: Observable<ToastMessage[]> = this.toastsSubject.asObservable();

  constructor() {}

  showSuccess(title: string, message?: string, duration?: number): string {
    return this.addToast({
      type: ToastType.SUCCESS,
      title,
      message,
      duration
    });
  }

  showError(title: string, message?: string, duration?: number): string {
    return this.addToast({
      type: ToastType.ERROR,
      title,
      message,
      duration
    });
  }

  showWarning(title: string, message?: string, duration?: number): string {
    return this.addToast({
      type: ToastType.WARNING,
      title,
      message,
      duration
    });
  }

  showInfo(title: string, message?: string, duration?: number): string {
    return this.addToast({
      type: ToastType.INFO,
      title,
      message,
      duration
    });
  }

  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }

  private addToast(options: {
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }): string {
    const id = this.generateId();
    const duration = options.duration ?? this.defaultConfig.duration!;
    
    const toast: ToastMessage = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      duration,
      timestamp: new Date()
    };

    const currentToasts = this.toastsSubject.value;
    let updatedToasts = [...currentToasts, toast];

    // Limit the number of toasts
    if (updatedToasts.length > this.defaultConfig.maxToasts!) {
      updatedToasts = updatedToasts.slice(-this.defaultConfig.maxToasts!);
    }

    this.toastsSubject.next(updatedToasts);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }

    return id;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}