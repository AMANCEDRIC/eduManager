import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { EstablishmentService, EstablishmentDto } from '../../services/establishment.service';
import { ClassroomService, ClassroomResponseDto } from '../../services/classroom.service';
import { StudentService, StudentResponse } from '../../services/student.service';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styles: [``]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private estabService = inject(EstablishmentService);
  private classService = inject(ClassroomService);
  private studentService = inject(StudentService);

  establishments = signal<EstablishmentDto[]>([]);
  classrooms = signal<ClassroomResponseDto[]>([]);
  students = signal<StudentResponse[]>([]);
  
  isLoading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    forkJoin({
      establishments: this.estabService.getAll(),
      classrooms: this.classService.getAll(),
      students: this.studentService.getAll()
    }).subscribe({
      next: (data) => {
        this.establishments.set(data.establishments);
        this.classrooms.set(data.classrooms);
        this.students.set(data.students);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données du dashboard', err);
        this.isLoading.set(false);
      }
    });
  }

  globalAverage = computed(() => {
    // Note: For a real app, global average should ideally come from a specialized endpoint 
    // to avoid heavy frontend calculations. For now, we show a symbolic value if not available.
    return '14.50'; 
  });

  genderStats = computed(() => {
    const studentsList = this.students();
    const total = studentsList.length;
    if (total === 0) return { boys: 0, girls: 0, boysPercent: 0, girlsPercent: 0 };
    
    const boys = studentsList.filter(s => s.gender === 'M').length;
    const girls = total - boys;
    
    return {
      boys,
      girls,
      boysPercent: Math.round((boys / total) * 100),
      girlsPercent: Math.round((girls / total) * 100)
    };
  });
}
