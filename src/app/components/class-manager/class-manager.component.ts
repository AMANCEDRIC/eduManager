import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClassroomService, ClassroomResponseDto, ClassroomCreateDto } from '../../services/classroom.service';
import { EstablishmentService, EstablishmentDto } from '../../services/establishment.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-class-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './class-manager.component.html',
  styleUrl: './class-manager.component.scss'
})
export class ClassManagerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  classService = inject(ClassroomService);
  estabService = inject(EstablishmentService);
  toast = inject(ToastService);

  establishmentId = Number(this.route.snapshot.paramMap.get('id')) || 0;
  establishment = signal<EstablishmentDto | null>(null);
  classes = signal<ClassroomResponseDto[]>([]);

  showForm = signal(false);
  editingId = signal<number | null>(null);
  isLoading = signal(true);

  // Confirmations
  showDeleteConfirm = signal(false);
  idToDelete = signal<number | null>(null);
  showDiscardConfirm = signal(false);

  // Form fields
  name = '';
  subject = '';
  level = '';
  academicYear = '2024-2025';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    if (this.establishmentId) {
      this.estabService.getById(this.establishmentId).subscribe({
        next: (estab) => this.establishment.set(estab),
        error: () => this.toast.error('Impossible de charger l\'établissement')
      });

      this.classService.getByEstablishment(this.establishmentId).subscribe({
        next: (data) => {
          this.classes.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.toast.error('Erreur lors du chargement des classes.');
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  toggleForm(cls?: ClassroomResponseDto) {
    if (this.showForm() && (this.name.trim() !== '' || this.subject.trim() !== '') && !cls) {
        this.showDiscardConfirm.set(true);
        return;
    }

    if (cls) {
      this.editingId.set(cls.id);
      this.name = cls.name;
      this.subject = cls.subject || '';
      this.level = cls.level || '';
      this.academicYear = cls.academicYear || '2024-2025';
    } else {
      this.editingId.set(null);
      this.name = '';
      this.subject = '';
      this.level = '';
    }
    this.showForm.set(!this.showForm());
  }

  save() {
    if (!this.name.trim() || !this.subject.trim() || !this.level.trim()) {
      this.toast.warning('Veuillez remplir le nom, niveau et discipline.');
      return;
    }
    
    this.isLoading.set(true);
    const payload: ClassroomCreateDto = {
      name: this.name,
      level: this.level,
      subject: this.subject,
      academicYear: this.academicYear,
      establishmentId: this.establishmentId
    };

    if (this.editingId()) {
      this.classService.update(this.editingId()!, payload).subscribe({
        next: () => {
          this.toast.success('Classe mise à jour.');
          this.loadData();
          this.showForm.set(false);
        },
        error: () => {
          this.toast.error('Erreur de mise à jour.');
          this.isLoading.set(false);
        }
      });
    } else {
      this.classService.create(payload).subscribe({
        next: () => {
          this.toast.success('Classe créée.');
          this.loadData();
          this.showForm.set(false);
        },
        error: () => {
          this.toast.error('Erreur de création.');
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
      this.classService.delete(this.idToDelete()!).subscribe({
        next: () => {
          this.toast.success('Classe supprimée.');
          this.showDeleteConfirm.set(false);
          this.idToDelete.set(null);
          this.loadData();
        },
        error: () => {
          this.toast.error('Impossible de supprimer.');
          this.isLoading.set(false);
        }
      });
    }
  }

  discardChanges() {
    this.showDiscardConfirm.set(false);
    this.name = '';
    this.subject = '';
    this.level = '';
    this.showForm.set(false);
  }
}
