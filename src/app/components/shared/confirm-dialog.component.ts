import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div class="glass-card w-full max-w-[360px] p-6 lg:p-8 shadow-2xl animate-in zoom-in-95 duration-500 border-none">
        <div class="flex items-start gap-4 mb-6">
          <div [class]="'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ' + (isDanger() ? 'bg-red-50 text-red-500' : 'bg-surface-low text-primary')">
            @if (isDanger()) {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 9-6 6"/><path d="m9 9 6 6"/><circle cx="12" cy="12" r="10"/></svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            }
          </div>
          <div class="flex flex-col gap-1 pt-0.5">
            <h3 class="headline-xs font-manrope font-extrabold text-on-surface leading-tight text-[15px]">{{ title() }}</h3>
            <p class="body-sm text-[11px] text-on-surface-variant/40 leading-relaxed font-inter font-medium italic">{{ message() }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-surface-low">
          <button class="px-5 py-2 rounded-md headline-xs text-[10px] tracking-widest uppercase text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-low soft-transition" (click)="onCancel.emit()">Annuler</button>
          <button [class]="'btn-premium px-6 py-2 rounded-md headline-xs text-[10px] tracking-widest uppercase transition-all shadow-lg ' + (isDanger() ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/10' : 'btn-premium-primary')" (click)="onConfirm.emit()">
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  title = input<string>('Confirmation');
  message = input<string>('Êtes-vous sûr de vouloir effectuer cette action ?');
  confirmLabel = input<string>('Confirmer');
  isDanger = input<boolean>(false);

  onConfirm = output<void>();
  onCancel = output<void>();
}
