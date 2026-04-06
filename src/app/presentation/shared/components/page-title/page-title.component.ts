import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white border-b border-slate-200 sticky z-40 shadow-sm">
      <div class="max-w-7xl mx-auto py-4">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-slate-900 mb-2">{{ title }}</h1>
            <p *ngIf="subtitle" class="text-sm text-slate-600 leading-relaxed">
              {{ subtitle }}
            </p>
          </div>
          <div class="flex-shrink-0 ml-6">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PageTitleComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
}