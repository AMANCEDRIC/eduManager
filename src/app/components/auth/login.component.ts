import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,var(--surface-container-low),transparent)]">
      <div class="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-700">
        <!-- Logo & Header -->
        <div class="flex flex-col items-center mb-8">
          <div class="w-12 h-12 btn-premium-primary rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary/10 mb-4 group transition-transform hover:rotate-3 duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <h1 class="display-md text-on-surface text-center text-[28px] tracking-tight">EduManager</h1>
          <p class="body-md text-on-surface-variant/40 text-center mt-1 text-[13px] font-medium tracking-tight">Système de gestion académique</p>
        </div>

        <!-- Login Card -->
        <div class="glass-card p-10 shadow-2xl shadow-on-surface/5">
          <div class="mb-8">
            <h2 class="headline-sm text-on-surface text-[20px]">Authentification</h2>
            <p class="text-[12px] text-on-surface-variant/40 mt-1 font-inter">Veuillez renseigner vos identifiants.</p>
          </div>
          
          <div class="space-y-6">
            <div class="flex flex-col gap-1.5">
              <label class="label-sm text-[10px] tracking-widest uppercase font-extrabold text-on-surface-variant/30">Email</label>
              <input type="email" [(ngModel)]="email" placeholder="professeur@ecole.edu" 
                class="input-premium py-3 font-inter text-[14px]">
            </div>
            
            <div class="flex flex-col gap-1.5">
              <label class="label-sm text-[10px] tracking-widest uppercase font-extrabold text-on-surface-variant/30">Mot de passe</label>
              <input type="password" [(ngModel)]="password" placeholder="••••••••" 
                class="input-premium py-3 font-inter text-[14px]">
            </div>

            <div class="pt-2">
              <button 
                class="btn-premium btn-premium-primary w-full py-3.5 text-[13px] tracking-widest uppercase font-extrabold shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3" 
                (click)="login()"
                [disabled]="isLoading()">
                @if (isLoading()) {
                  <div class="spinner"></div>
                  <span>Authentification...</span>
                } @else {
                  <span>S'authentifier</span>
                }
              </button>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-surface-low text-center">
            <p class="text-[12px] text-on-surface-variant/40 font-inter">
              Nouveau curateur ? 
              <a routerLink="/register" class="text-primary font-bold hover:underline ml-1">Inscription</a>
            </p>
          </div>
        </div>

        <!-- Footer Info -->
        <p class="text-center text-[9px] text-on-surface-variant/20 mt-10 font-inter uppercase tracking-[0.3em]">
          &copy; 2024 Editorial Management System
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = signal(false);

  constructor(
    private authService: AuthService, 
    private toast: ToastService,
    private router: Router
  ) { }

  login() {
    if (this.email && this.password) {
      this.isLoading.set(true);
      
      // Simulate network latency for editorial feel
      setTimeout(() => {
        this.authService.login(this.email, this.password).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            if (response.status === 200 && response.data) {
              const user = this.authService.currentUser();
              this.toast.success(`Bienvenue, ${user?.firstName || 'Utilisateur'} !`);
              this.router.navigate(['/dashboard']);
            } else {
              this.toast.error(response.message || 'Identifiants incorrects.');
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Login error:', err);
            this.toast.error('Erreur de connexion au serveur.');
          }
        });
      }, 800);
    } else {
      this.toast.warning('Veuillez saisir votre email et votre mot de passe.');
    }
  }
}
