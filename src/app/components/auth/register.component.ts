import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,var(--surface-container-low),transparent)]">
      <div class="w-full max-w-[440px] animate-in fade-in duration-700">
        <!-- Brand / Identity -->
        <div class="flex flex-col items-center mb-8">
          <div class="w-12 h-12 bg-on-surface rounded-xl flex items-center justify-center text-white shadow-xl shadow-on-surface/10 mb-4 soft-transition hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <h1 class="display-md text-on-surface text-center text-[26px] tracking-tight">Rejoindre l'Institution</h1>
          <p class="body-md text-on-surface-variant/40 mt-1 text-center text-[13px] font-medium tracking-tight">Initialisation de votre accès académique</p>
        </div>

        <!-- Registration Card -->
        <div class="glass-card p-10 shadow-2xl shadow-on-surface/5 border-none">
          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                    <label class="label-sm text-[10px] tracking-widest uppercase font-extrabold text-on-surface-variant/30">Prénom</label>
                    <input type="text" [(ngModel)]="firstName" placeholder="Jean" 
                      class="input-premium py-2.5 font-inter text-[14px]">
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="label-sm text-[10px] tracking-widest uppercase font-extrabold text-on-surface-variant/30">Nom</label>
                    <input type="text" [(ngModel)]="lastName" placeholder="Dupont" 
                      class="input-premium py-2.5 font-inter text-[14px]">
                </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="label-sm text-[10px] tracking-widest uppercase font-extrabold text-on-surface-variant/30">Email</label>
              <input type="email" [(ngModel)]="email" placeholder="archive@institution.edu" 
                class="input-premium py-2.5 font-inter text-[14px]">
            </div>
            
            <div class="flex flex-col gap-1.5">
              <label class="label-sm text-[10px] tracking-widest uppercase font-extrabold text-on-surface-variant/30">Code Accès</label>
              <input type="password" [(ngModel)]="password" placeholder="••••••••" 
                class="input-premium py-2.5 font-inter text-[14px]">
              <p class="text-[9px] text-on-surface-variant/20 font-inter mt-1 leading-relaxed italic">Utilisez un code robuste pour l'intégrité de vos registres.</p>
            </div>

            <div class="pt-2">
              <button 
                class="btn-premium btn-premium-primary w-full py-3.5 mt-2 shadow-lg shadow-primary/20 headline-xs tracking-widest text-[10px] uppercase group font-extrabold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3" 
                (click)="register()"
                [disabled]="isLoading()">
                @if (isLoading()) {
                  <div class="spinner"></div>
                  <span>Initialisation...</span>
                } @else {
                  <span class="flex items-center justify-center gap-2">
                    Initier l'Inscription
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="soft-transition group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </span>
                }
              </button>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-surface-low text-center">
            <p class="body-sm text-[12px] text-on-surface-variant/40 font-inter">
              Déjà titulaire ? 
              <a routerLink="/login" class="text-on-surface font-extrabold hover:text-primary soft-transition ml-1">Connectez-vous</a>
            </p>
          </div>
        </div>
        
        <!-- Footer Info -->
        <p class="text-center text-[9px] text-on-surface-variant/20 mt-10 font-inter uppercase tracking-[0.3em]">
          Academic Management System — &copy; 2024
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  isLoading = signal(false);

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  register() {
    if (this.email && this.firstName && this.lastName) {
      this.isLoading.set(true);
      
      // Simulate registration delay
      setTimeout(() => {
        this.auth.register(this.email, this.firstName, this.lastName);
        this.toast.success('Compte créé avec succès !');
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      }, 1000);
    } else {
      this.toast.warning('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
