import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SchoolDataService } from '../../services/school-data.service';
import { AttendanceStatus } from '../../models/models';

@Component({
  selector: 'app-attendance-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-manager.component.html'
})
export class AttendanceManagerComponent {
  private route = inject(ActivatedRoute);
  dataService = inject(SchoolDataService);

  classId = this.route.snapshot.paramMap.get('id') || '';
  classroom = computed(() => this.dataService.classes().find(c => c.id === this.classId));
  establishment = computed(() => {
    const cls = this.classroom();
    return cls ? this.dataService.establishments().find(e => e.id === cls.establishmentId) : null;
  });

  students = computed(() => this.dataService.students().filter(s => s.classId === this.classId));
  
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  isLoading = signal(true);

  constructor() {
    // Simulate data fetch
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1200);
  }

  mark(studentId: string, status: AttendanceStatus) {
    this.dataService.markAttendance(this.classId, studentId, this.selectedDate(), status);
  }

  getStatus(studentId: string): AttendanceStatus | null {
    const record = this.dataService.attendance().find(
      r => r.studentId === studentId && r.date === this.selectedDate()
    );
    return record ? record.status : null;
  }
}
