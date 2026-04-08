import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StudentService, StudentResponse, StudentCreate } from '../../services/student.service';
import { ClassroomService, ClassroomResponseDto } from '../../services/classroom.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-student-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './student-manager.component.html',
  styleUrl: './student-manager.component.scss'
})
export class StudentManagerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private classroomService = inject(ClassroomService);
  private toast = inject(ToastService);

  classId = Number(this.route.snapshot.paramMap.get('id') || '0');

  classroom = signal<ClassroomResponseDto | null>(null);
  students = signal<StudentResponse[]>([]);

  showForm = signal(false);
  editingId = signal<number | null>(null);
  isLoading = signal(true);

  // Confirmations
  showDeleteConfirm = signal(false);
  idToDelete = signal<number | null>(null);
  showDiscardConfirm = signal(false);

  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  dateOfBirth = '';
  parentName = '';
  parentEmail = '';
  parentPhone = '';
  gender: 'M' | 'F' = 'M'; // Note: backend might not have gender, storing it for UI logic if needed, but not sent

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    // First fetch classroom to get its details
    this.classroomService.getById(this.classId).subscribe({
      next: (cls) => {
        this.classroom.set(cls);
        this.fetchStudents();
      },
      error: () => {
        this.toast.error('Erreur lors du chargement de la classe');
        this.isLoading.set(false);
      }
    });
  }

  fetchStudents() {
    this.studentService.getByClassroom(this.classId).subscribe({
      next: (data) => {
        this.students.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors du chargement des élèves');
        this.isLoading.set(false);
      }
    });
  }

  toggleForm(student?: StudentResponse) {
    if (this.showForm() && (this.firstName.trim() !== '' || this.lastName.trim() !== '') && !student) {
      this.showDiscardConfirm.set(true);
      return;
    }

    if (student) {
      this.editingId.set(student.id);
      this.firstName = student.firstName;
      this.lastName = student.lastName;
      this.email = student.email || '';
      this.dateOfBirth = student.dateOfBirth || '';
      this.parentName = student.parentName || '';
      this.parentEmail = student.parentEmail || '';
      this.parentPhone = student.parentPhone || '';
    } else {
      this.editingId.set(null);
      this.firstName = '';
      this.lastName = '';
      this.email = '';
      this.dateOfBirth = '';
      this.parentName = '';
      this.parentEmail = '';
      this.parentPhone = '';
      this.gender = 'M';
    }
    this.showForm.set(!this.showForm());
  }

  save() {
    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.toast.warning('Veuillez renseigner le prénom et le nom');
      return;
    }

    this.isLoading.set(true);

    const payload: StudentCreate = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email || undefined,
      dateOfBirth: this.dateOfBirth || undefined,
      parentName: this.parentName || undefined,
      parentEmail: this.parentEmail || undefined,
      parentPhone: this.parentPhone || undefined,
      classroomId: this.classId
    };

    if (this.editingId()) {
      this.studentService.update(this.editingId()!, payload).subscribe({
        next: (res) => {
          this.toast.success('Élève mis à jour');
          this.fetchStudents();
          this.showForm.set(false);
        },
        error: () => {
          this.toast.error('Erreur lors de la mise à jour');
          this.isLoading.set(false);
        }
      });
    } else {
      this.studentService.create(payload).subscribe({
        next: (res) => {
          this.toast.success('Élève ajouté avec succès');
          this.fetchStudents();
          this.showForm.set(false);
        },
        error: () => {
          this.toast.error('Erreur lors de l\'ajout');
          this.isLoading.set(false);
        }
      });
    }
  }

  confirmDelete(id: number) {
    this.idToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  delete() {
    if (this.idToDelete()) {
      this.isLoading.set(true);
      this.studentService.delete(this.idToDelete()!).subscribe({
        next: () => {
          this.toast.success('Élève supprimé');
          this.fetchStudents();
          this.showDeleteConfirm.set(false);
          this.idToDelete.set(null);
        },
        error: () => {
          this.toast.error('Erreur lors de la suppression');
          this.isLoading.set(false);
        }
      });
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
    let successfullyParsed = 0;

    // We can't import asynchronously with a simple loop reliably without combining observables
    // Here we will do sequential or parallel requests using RxJS, but for simplicity, we mock alert for now or implement parallel creation
    // Best practice for bulk import is a backend bulk endpoint. Let's just create sequentially logic for demo.

    if (lines.length > 0) {
      this.toast.info('Début de l\'importation en masse...');
    }

    lines.forEach(line => {
      if (!line.trim()) return;

      const parts = line.includes(';') ? line.split(';') : line.split(',');
      if (parts.length >= 2) {
        const firstName = parts[0].trim();
        const lastName = parts[1].trim();
        let email = parts[2] ? parts[2].trim() : undefined;

        if (firstName && lastName) {
          const payload: StudentCreate = {
            firstName,
            lastName,
            email,
            classroomId: this.classId
          };
          this.studentService.create(payload).subscribe({
            next: () => successfullyParsed++,
            complete: () => {
              // When last one finishes maybe fetch students.
              this.fetchStudents();
            }
          });
        }
      }
    });
  }
}

