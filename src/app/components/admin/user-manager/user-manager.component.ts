import { Component, inject, signal } from '@angular/core';
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
export class UserManagerComponent {
  auth = inject(AuthService);
  toast = inject(ToastService);
  
  showForm = signal(false);
  isLoading = signal(true);
  
  // Form fields
  email = '';
  firstName = '';
  lastName = '';
  role: UserRole = 'teacher';

  users = this.auth.users;

  constructor() {
    // Simulate data fetch
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

  toggleForm() {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  resetForm() {
    this.email = '';
    this.firstName = '';
    this.lastName = '';
    this.role = 'teacher';
  }

  saveUser() {
    if (this.email && this.firstName && this.lastName) {
      this.auth.createUser(this.email, this.firstName, this.lastName, this.role);
      this.toast.success('Utilisateur créé avec succès !');
      this.toggleForm();
    } else {
      this.toast.warning('Veuillez remplir tous les champs.');
    }
  }

  toggleBlock(userId: string) {
    this.auth.toggleBlockUser(userId);
  }

  deleteUser(userId: string) {
    if (confirm('Supprimer cet utilisateur définitivement ?')) {
      this.auth.deleteUser(userId);
      this.toast.success('Utilisateur supprimé.');
    }
  }
}
