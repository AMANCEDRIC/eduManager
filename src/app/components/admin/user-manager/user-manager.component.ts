import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { User, UserRole } from '../../../models/models';

@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-manager.component.html'
})
export class UserManagerComponent implements OnInit {
  auth = inject(AuthService);
  toast = inject(ToastService);
  
  showForm = signal(false);
  isLoading = signal(true);
  
  // Form fields
  email = '';
  password = '';
  showPassword = signal(false);
  firstName = '';
  lastName = '';
  role: UserRole = 'teacher';

  users = this.auth.users;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.auth.fetchUsers().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.toast.error('Impossible de charger les utilisateurs');
        this.isLoading.set(false);
      }
    });
  }

  toggleForm() {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  resetForm() {
    this.email = '';
    this.password = '';
    this.showPassword.set(false);
    this.firstName = '';
    this.lastName = '';
    this.role = 'teacher';
  }

  saveUser() {
    if (this.email && this.password && this.firstName && this.lastName) {
      this.auth.createUser(this.email, this.firstName, this.lastName, this.role, this.password);
      this.toast.success('Requête de création envoyée !');
      this.toggleForm();
    } else {
      this.toast.warning('Veuillez remplir tous les champs.');
    }
  }

  toggleBlock(id: string) {
    // We prefer accountId if available (for admin ops)
    const user = this.users().find(u => u.id === id);
    const targetId = user?.accountId?.toString() || id;
    this.auth.toggleBlockUser(targetId);
  }

  deleteUser(id: string) {
    if (confirm('Supprimer cet utilisateur (Soft Delete) ?')) {
      const user = this.users().find(u => u.id === id);
      const targetId = user?.accountId?.toString() || id;
      this.auth.deleteUser(targetId);
    }
  }
}
