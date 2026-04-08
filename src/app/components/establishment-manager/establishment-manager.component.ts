import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstablishmentService, EstablishmentDto } from '../../services/establishment.service';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-establishment-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './establishment-manager.component.html',
  styleUrl: './establishment-manager.component.scss'
})
export class EstablishmentManagerComponent implements OnInit {
  estabService = inject(EstablishmentService);
  toast = inject(ToastService);

  establishments = signal<EstablishmentDto[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  isLoading = signal(true);
  
  // Confirmations
  showDeleteConfirm = signal(false);
  idToDelete = signal<number | null>(null);
  showDiscardConfirm = signal(false);

  // Form fields
  name = '';
  periodType = 'trimester';
  address = '';
  city = '';
  academicYear = '2024-2025';

  ngOnInit() {
    this.loadEstablishments();
  }

  loadEstablishments() {
    this.isLoading.set(true);
    this.estabService.getAll().subscribe({
      next: (data) => {
        this.establishments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Erreur lors du chargement des établissements.');
        this.isLoading.set(false);
      }
    });
  }

  toggleForm(estab?: EstablishmentDto) {
    if (this.showForm() && this.name.trim() !== '' && !estab) {
        this.showDiscardConfirm.set(true);
        return;
    }

    if (estab) {
      this.editingId.set(estab.id!);
      this.name = estab.name || '';
      this.periodType = estab.periodType || 'trimester';
      // In real scenario, handle address, city etc. if they exist
    } else {
      this.editingId.set(null);
      this.name = '';
      this.periodType = 'trimester';
    }
    this.showForm.set(!this.showForm());
  }

  save() {
    if (!this.name.trim()) return;
    this.isLoading.set(true);

    const payload: Partial<EstablishmentDto> = {
      name: this.name,
      periodType: this.periodType === 'trimester' ? 'TRIMESTRE' : 'SEMESTRE',
      academicYear: this.academicYear,
      address: this.address,
      city: this.city
    };

    if (this.editingId()) {
      this.estabService.update(this.editingId()!, payload).subscribe({
        next: () => {
          this.toast.success('Établissement mis à jour.');
          this.loadEstablishments();
          this.showForm.set(false);
        },
        error: () => {
          this.toast.error('Erreur lors de la mise à jour.');
          this.isLoading.set(false);
        }
      });
    } else {
      this.estabService.create(payload).subscribe({
        next: () => {
          this.toast.success('Établissement créé.');
          this.loadEstablishments();
          this.showForm.set(false);
        },
        error: () => {
          this.toast.error('Erreur lors de la création.');
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
      this.estabService.delete(this.idToDelete()!).subscribe({
        next: () => {
          this.toast.success('Établissement supprimé.');
          this.showDeleteConfirm.set(false);
          this.idToDelete.set(null);
          this.loadEstablishments();
        },
        error: () => {
          this.toast.error('Impossible de supprimer l\'établissement.');
          this.isLoading.set(false);
        }
      });
    }
  }

  discardChanges() {
    this.showDiscardConfirm.set(false);
    this.name = '';
    this.showForm.set(false);
  }
}
