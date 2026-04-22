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
        // Filter classes: only keep those belonging to user's establishments
        const userEstabIds = data.establishments.map(e => e.id);
        const filteredClasses = data.classrooms.filter(c => userEstabIds.includes(c.establishmentId));
        
        // Filter students: for now we use establishmentName as a proxy if classroomId is missing in response
        // Better: Backend should only return what belongs to the user
        const userEstabNames = data.establishments.map(e => e.name);
        const filteredStudents = data.students.filter(s => userEstabNames.includes(s.establishmentName || ''));

        this.establishments.set(data.establishments);
        this.classrooms.set(filteredClasses);
        this.students.set(filteredStudents);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données du dashboard', err);
        this.isLoading.set(false);
      }
    });
  }

  globalAverage = computed(() => {
    const studentsList = this.students();
    if (studentsList.length === 0) return '0.00';
    // Logic for real calculation would go here
    return '0.00'; 
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
