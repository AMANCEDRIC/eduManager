import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserRole, ApiResponse } from '../models/models';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = signal<User | null>(this.loadCurrentUser());

  currentUser = computed(() => this._currentUser());
  isLoggedIn = computed(() => !!this._currentUser());
  isAdmin = computed(() => this._currentUser()?.role.toLowerCase() === 'admin');
  isTeacher = computed(() => this._currentUser()?.role.toLowerCase() === 'teacher');
  isParent = computed(() => this._currentUser()?.role.toLowerCase() === 'parent');

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor(private router: Router, private toast: ToastService) {}

  private loadCurrentUser(): User | null {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  }

  private decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      let rawRole = (payload.role || '').toLowerCase();
      
      // If role is missing, check in 'groups' array (common in some token structures)
      if (!rawRole && Array.isArray(payload.groups) && payload.groups.length > 0) {
        // Find the first role in groups that matches our known roles
        const foundRole = payload.groups.find((g: string) => 
          ['admin', 'teacher', 'parent'].includes(g.toLowerCase())
        );
        if (foundRole) {
          rawRole = foundRole.toLowerCase();
        }
      }

      const role: UserRole = ['admin', 'teacher', 'parent'].includes(rawRole) ? rawRole as UserRole : 'teacher';

      const fullName = payload.name || 'Utilisateur';
      const parts = fullName.split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || '';

      return {
        id: payload.id.toString(),
        email: payload.email || payload.upn,
        firstName,
        lastName,
        role,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        token
      };
    } catch (e) {
      console.error('JWT Decode Error:', e);
      return null;
    }
  }

  login(email: string, password?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.status === 200 && response.data) {
            const token = typeof response.data === 'string' ? response.data : response.data.token;
            if (token) {
              const user = this.decodeToken(token);
              if (user) {
                this._currentUser.set(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('token', token);
              }
            }
          }
        })
      );
  }

  logout() {
    this._currentUser.set(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // --- Admin & User Management ---
  private _users = signal<User[]>([]);
  users = computed(() => this._users());

  fetchUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/admin/users`).pipe(
      tap(response => {
        if (response.status === 200 && response.data) {
          this._users.set(response.data);
        }
      })
    );
  }

  createUser(email: string, firstName: string, lastName: string, role: UserRole, password?: string) {
    this.register(email, firstName, lastName, password || '12345678', role.toUpperCase()).subscribe({
      next: () => this.fetchUsers().subscribe(),
      error: () => this.toast.error('Erreur lors de la création')
    });
  }

  toggleBlockUser(accountId: string) {
    this.http.put<ApiResponse<any>>(`${this.apiUrl}/admin/users/${accountId}/toggle-block`, {}).subscribe({
      next: () => {
        this.fetchUsers().subscribe();
        this.toast.success('Statut mis à jour');
      },
      error: () => this.toast.error('Erreur lors du blocage/déblocage')
    });
  }

  deleteUser(accountId: string) {
    this.http.delete<ApiResponse<any>>(`${this.apiUrl}/admin/users/${accountId}`).subscribe({
      next: () => {
        this.fetchUsers().subscribe();
        this.toast.success('Utilisateur supprimé');
      },
      error: () => this.toast.error('Erreur lors de la suppression')
    });
  }

  register(email: string, firstName: string, lastName: string, password?: string, role: string = 'TEACHER'): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/register`, {
      email,
      firstName,
      lastName,
      password: password || '12345678',
      role
    });
  }
}
