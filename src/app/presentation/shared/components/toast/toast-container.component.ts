import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { ToastComponent } from './toast.component';
import { ToastMessage, AlertService } from '../../../../core/application/services';


@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col items-end space-y-2 pointer-events-none">
      <app-toast
        *ngFor="let toast of toasts$ | async; trackBy: trackByToastId"
        [toast]="toast"
        (closeToast)="onCloseToast($event)"
        class="animate-slide-in pointer-events-auto"
      ></app-toast>
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(calc(100% + 1rem));
        opacity: 0;
        scale: 0.95;
      }
      to {
        transform: translateX(0);
        opacity: 1;
        scale: 1;
      }
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  public toasts$!: Observable<ToastMessage[]>;
  private subscription?: Subscription;
  private alertService = inject(AlertService);

  constructor() {}

  ngOnInit(): void {
    this.toasts$ = this.alertService.toasts$;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onCloseToast(toastId: string): void {
    this.alertService.removeToast(toastId);
  }

  trackByToastId = (index: number, toast: ToastMessage): string => {
    return toast?.id || index.toString();
  }
}