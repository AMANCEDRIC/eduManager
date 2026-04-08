import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SchoolDataService } from '../../services/school-data.service';
import { Student } from '../../models/models';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-student-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './student-manager.component.html',
  styleUrl: './student-manager.component.scss'
})
export class StudentManagerComponent {
  private route = inject(ActivatedRoute);
  dataService = inject(SchoolDataService);

  classId = this.route.snapshot.paramMap.get('id') || '';
  classroom = computed(() => this.dataService.classes().find(c => c.id === this.classId));
  establishment = computed(() => {
    const cls = this.classroom();
    return cls ? this.dataService.establishments().find(e => e.id === cls.establishmentId) : null;
  });

  students = computed(() => this.dataService.students().filter(s => s.classId === this.classId));

  showForm = signal(false);
  editingId = signal<string | null>(null);
  isLoading = signal(true);

  constructor() {
    // Simulate data fetch
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1500);
  }

  // Confirmations
  showDeleteConfirm = signal(false);
  idToDelete = signal<string | null>(null);
  showDiscardConfirm = signal(false);

  // Form fields
  firstName = '';
  lastName = '';
  gender: 'M' | 'F' = 'M';

  toggleForm(student?: Student) {
    if (this.showForm() && (this.firstName.trim() !== '' || this.lastName.trim() !== '') && !student) {
        this.showDiscardConfirm.set(true);
        return;
    }

    if (student) {
      this.editingId.set(student.id);
      this.firstName = student.firstName;
      this.lastName = student.lastName;
      this.gender = student.gender || 'M';
    } else {
      this.editingId.set(null);
      this.firstName = '';
      this.lastName = '';
      this.gender = 'M';
    }
    this.showForm.set(!this.showForm());
  }

  save() {
    if (!this.firstName.trim() || !this.lastName.trim()) return;

    if (this.editingId()) {
      this.dataService.updateStudent(this.editingId()!, this.firstName, this.lastName, this.gender);
    } else {
      this.dataService.addStudent(this.classId, this.firstName, this.lastName, this.gender);
    }
    this.showForm.set(false);
  }

  confirmDelete(id: string) {
    this.idToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  delete() {
    if (this.idToDelete()) {
      this.dataService.deleteStudent(this.idToDelete()!);
      this.showDeleteConfirm.set(false);
      this.idToDelete.set(null);
    }
  }

  discardChanges() {
    this.showDiscardConfirm.set(false);
    this.firstName = '';
    this.lastName = '';
    this.showForm.set(false);
  }

  triggerImport() {
    const input = document.getElementById('csvImport') as HTMLInputElement;
    input?.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const text = e.target.result;
        this.parseCSV(text);
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  }

  private parseCSV(text: string) {
    const lines = text.split(/\r?\n/);
    const studentsData: { firstName: string, lastName: string, gender: 'M' | 'F' }[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      
      const parts = line.includes(';') ? line.split(';') : line.split(',');
      if (parts.length >= 2) {
        const firstName = parts[0].trim();
        const lastName = parts[1].trim();
        let gender: 'M' | 'F' = 'M';
        
        if (parts[2]) {
          const g = parts[2].trim().toUpperCase();
          if (g === 'F' || g === 'FILLE') gender = 'F';
        }

        if (firstName && lastName) {
          studentsData.push({ firstName, lastName, gender });
        }
      }
    }

    if (studentsData.length > 0) {
      this.dataService.importStudents(this.classId, studentsData);
    }
  }
}
