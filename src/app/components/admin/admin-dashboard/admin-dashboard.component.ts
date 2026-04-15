import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { EstablishmentService } from '../../../services/establishment.service';
import { ClassroomService } from '../../../services/classroom.service';
import { StudentService } from '../../../services/student.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private estabService = inject(EstablishmentService);
  private classService = inject(ClassroomService);
  private studentService = inject(StudentService);
  auth = inject(AuthService);

  establishmentsCount = signal(0);
  classroomsCount = signal(0);
  studentsCount = signal(0);
  boysCount = signal(0);
  girlsCount = signal(0);
  
  isLoading = signal(true);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);
    forkJoin({
      establishments: this.estabService.getAll(),
      classrooms: this.classService.getAll(),
      students: this.studentService.getAll()
    }).subscribe({
      next: (data) => {
        this.establishmentsCount.set(data.establishments.length);
        this.classroomsCount.set(data.classrooms.length);
        this.studentsCount.set(data.students.length);
        
        const boys = data.students.filter(s => s.gender === 'M').length;
        this.boysCount.set(boys);
        this.girlsCount.set(data.students.length - boys);
        
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  stats = computed(() => {
    const users = this.auth.users();

    return {
      totalUsers: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      teachers: users.filter(u => u.role === 'teacher').length,
      parents: users.filter(u => u.role === 'parent').length,
      blockedUsers: users.filter(u => u.isBlocked).length,
      
      totalStudents: this.studentsCount(),
      boys: this.boysCount(),
      girls: this.girlsCount(),
      
      totalClasses: this.classroomsCount(),
      totalEstablishments: this.establishmentsCount()
    };
  });
}
