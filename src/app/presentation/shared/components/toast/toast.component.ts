import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage, ToastType } from '../../../../core/application/services/notification.types';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class]="getToastClasses()"
      class="relative max-w-sm w-full bg-white shadow-xl rounded-xl pointer-events-auto ring-1 ring-gray-200 overflow-hidden transform transition-all duration-300 ease-out hover:shadow-2xl"
    >
      <div class="p-4">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 mt-0.5">
            <div [class]="getIconBackgroundClasses()" class="w-8 h-8 rounded-full flex items-center justify-center">
              <span [class]="getIconClasses()" class="material-icons text-lg">{{ getIcon() }}</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 leading-5">{{ toast.title }}</p>
            <p *ngIf="toast.message" class="mt-1 text-sm text-gray-600 leading-5">{{ toast.message }}</p>
          </div>
          <div class="flex-shrink-0">
            <button
              type="button"
              (click)="onClose()"
              class="inline-flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span class="sr-only">Close</span>
              <span class="material-icons text-lg">close</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Progress bar -->
      <div *ngIf="toast.duration && toast.duration > 0" class="relative h-1 w-full bg-gray-100">
        <div 
           [class]="getProgressBarClasses()"
           class="h-full progress-bar rounded-full"
           [style.animation-duration.ms]="toast.duration">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-bar {
      animation: shrink linear forwards;
      transform-origin: left;
    }
    
    @keyframes shrink {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
  `]
})
export class ToastComponent implements OnInit {
  @Input() toast!: ToastMessage;
  @Output() closeToast = new EventEmitter<string>();

  ngOnInit(): void {
    // Auto-close after duration if specified
    if (this.toast.duration && this.toast.duration > 0) {
      setTimeout(() => {
        this.onClose();
      }, this.toast.duration);
    }
  }

  onClose(): void {
    this.closeToast.emit(this.toast.id);
  }

  getToastClasses(): string {
    const baseClasses = 'border-l-4';
    
    switch (this.toast.type) {
      case ToastType.SUCCESS:
        return `${baseClasses} border-green-500 bg-green-50`;
      case ToastType.ERROR:
        return `${baseClasses} border-red-500 bg-red-50`;
      case ToastType.WARNING:
        return `${baseClasses} border-yellow-500 bg-yellow-50`;
      case ToastType.INFO:
        return `${baseClasses} border-blue-500 bg-blue-50`;
      default:
        return `${baseClasses} border-gray-400 bg-gray-50`;
    }
  }

  getIconBackgroundClasses(): string {
    switch (this.toast.type) {
      case ToastType.SUCCESS:
        return 'bg-green-100 ring-1 ring-green-200';
      case ToastType.ERROR:
        return 'bg-red-100 ring-1 ring-red-200';
      case ToastType.WARNING:
        return 'bg-yellow-100 ring-1 ring-yellow-200';
      case ToastType.INFO:
        return 'bg-blue-100 ring-1 ring-blue-200';
      default:
        return 'bg-gray-100 ring-1 ring-gray-200';
    }
  }

  getIconClasses(): string {
    switch (this.toast.type) {
      case ToastType.SUCCESS:
        return 'text-green-600';
      case ToastType.ERROR:
        return 'text-red-600';
      case ToastType.WARNING:
        return 'text-yellow-600';
      case ToastType.INFO:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  }

  getIcon(): string {
    switch (this.toast.type) {
      case ToastType.SUCCESS:
        return 'check_circle';
      case ToastType.ERROR:
        return 'error';
      case ToastType.WARNING:
        return 'warning';
      case ToastType.INFO:
        return 'info';
      default:
        return 'notifications';
    }
  }

  getProgressBarClasses(): string {
    switch (this.toast.type) {
      case ToastType.SUCCESS:
        return 'bg-gradient-to-r from-green-400 to-green-500';
      case ToastType.ERROR:
        return 'bg-gradient-to-r from-red-400 to-red-500';
      case ToastType.WARNING:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case ToastType.INFO:
        return 'bg-gradient-to-r from-blue-400 to-blue-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  }
}