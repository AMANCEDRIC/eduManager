import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClassroomService, ClassroomResponseDto } from '../../services/classroom.service';
import { StudentService, StudentResponse } from '../../services/student.service';
import { AttendanceStatus } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-attendance-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-manager.component.html'
})
export class AttendanceManagerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private classService = inject(ClassroomService);
  private studentService = inject(StudentService);

  classId = Number(this.route.snapshot.paramMap.get('id'));
  classroom = signal<ClassroomResponseDto | null>(null);
  students = signal<StudentResponse[]>([]);
  
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  isLoading = signal(true);

  establishment = computed(() => {
    const cls = this.classroom();
    if (!cls) return null;
    return {
      id: cls.establishmentId,
      name: cls.establishmentName
    };
  });

  // Temp mock for attendance records (since API is missing)
  private attendanceMock = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (!this.classId) return;
    this.isLoading.set(true);
    forkJoin({
      classroom: this.classService.getById(this.classId),
      students: this.studentService.getByClassroom(this.classId)
    }).subscribe({
      next: (data) => {
        this.classroom.set(data.classroom);
        this.students.set(data.students);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  mark(studentId: number, status: AttendanceStatus) {
    // TODO: Implement real API call when backend is ready
    const current = this.attendanceMock();
    const index = current.findIndex(r => r.studentId === studentId && r.date === this.selectedDate());
    
    if (index > -1) {
      current[index].status = status;
      this.attendanceMock.set([...current]);
    } else {
      this.attendanceMock.set([...current, { studentId, date: this.selectedDate(), status }]);
    }
  }

  getStatus(studentId: number): AttendanceStatus | null {
    const record = this.attendanceMock().find(
      r => r.studentId === studentId && r.date === this.selectedDate()
    );
    return record ? record.status : null;
  }
}
