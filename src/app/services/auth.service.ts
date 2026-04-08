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
  isAdmin = computed(() => this._currentUser()?.role === 'admin');
  isTeacher = computed(() => this._currentUser()?.role === 'teacher');
  isParent = computed(() => this._currentUser()?.role === 'parent');

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
      
      // Role mapping: TEACHER -> teacher, ADMIN -> admin, PARENT -> parent
      const rawRole = (payload.role || '').toLowerCase();
      const role: UserRole = ['admin', 'teacher', 'parent'].includes(rawRole) ? rawRole as UserRole : 'teacher';

      // Name splitting (France Liliane Naounou -> France / Liliane Naounou)
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
    // Note: data might be a string or an object { token: string }
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

  // --- Temp Mocks (will be replaced by real API later) ---
  private _users = signal<User[]>(this.loadUsers());
  users = computed(() => this._users());

  private loadUsers(): User[] {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : [];
  }

  private saveUsers() {
    localStorage.setItem('users', JSON.stringify(this._users()));
  }

  register(email: string, firstName: string, lastName: string, password?: string, role: string = 'TEACHER'): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/register`, {
      email,
      firstName,
      lastName,
      password: password || '12345678', // Provide default if needed, though UI should pass it
      role
    });
  }

  getAllUsers(): User[] {
    return this._users();
  }

  updateUser(user: User) {
    this._users.update(users => users.map(u => u.id === user.id ? user : u));
    this.saveUsers();
  }

  toggleBlockUser(userId: string) {
    this._users.update(users => users.map(u => {
      if (u.id === userId) {
        return { ...u, isBlocked: !u.isBlocked };
      }
      return u;
    }));
    this.saveUsers();
  }

  deleteUser(userId: string) {
    this._users.update(users => users.filter(u => u.id !== userId));
    this.saveUsers();
  }

  createUser(email: string, firstName: string, lastName: string, role: UserRole) {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      role,
      isBlocked: false,
      createdAt: new Date().toISOString()
    };
    this._users.update(users => [...users, newUser]);
    this.saveUsers();
  }
}
