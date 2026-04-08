import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-xs">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="glass-card p-4 pointer-events-auto flex items-start gap-4 shadow-2xl animate-in slide-in-from-right-full duration-300 border-l-4"
          [ngClass]="{
            'border-l-green-500 bg-white/90': toast.type === 'success',
            'border-l-red-500 bg-white/90': toast.type === 'error',
            'border-l-amber-500 bg-white/90': toast.type === 'warning',
            'border-l-blue-500 bg-white/90': toast.type === 'info'
          }">
          
          <div class="mt-0.5">
            @if (toast.type === 'success') {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            } @else if (toast.type === 'error') {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-600"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            } @else if (toast.type === 'warning') {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            }
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-bold text-slate-900 leading-tight">{{ toast.message }}</p>
          </div>

          <button (click)="toastService.remove(toast.id)" class="text-slate-400 hover:text-slate-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
