import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolDataService } from '../../../services/school-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  dataService = inject(SchoolDataService);
  auth = inject(AuthService);

  stats = computed(() => {
    const users = this.auth.users();
    const students = this.dataService.students();
    const classes = this.dataService.classes();
    const establishments = this.dataService.establishments();

    return {
      totalUsers: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      teachers: users.filter(u => u.role === 'teacher').length,
      parents: users.filter(u => u.role === 'parent').length,
      blockedUsers: users.filter(u => u.isBlocked).length,
      
      totalStudents: students.length,
      boys: students.filter(s => s.gender === 'M').length,
      girls: students.filter(s => s.gender === 'F').length,
      
      totalClasses: classes.length,
      totalEstablishments: establishments.length
    };
  });
}
