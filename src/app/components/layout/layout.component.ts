import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  auth = inject(AuthService);
  isSidebarOpen = signal(false);
  isSidebarCollapsed = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleCollapse() {
    this.isSidebarCollapsed.update(v => !v);
  }

  logout() {
    this.auth.logout();
  }
}
