import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolDataService } from '../../services/school-data.service';
import { Establishment, PeriodType } from '../../models/models';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-establishment-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './establishment-manager.component.html',
  styleUrl: './establishment-manager.component.scss'
})
export class EstablishmentManagerComponent {
  dataService = inject(SchoolDataService);

  showForm = signal(false);
  editingId = signal<string | null>(null);
  isLoading = signal(true);
  
  // Confirmations
  showDeleteConfirm = signal(false);
  idToDelete = signal<string | null>(null);
  showDiscardConfirm = signal(false);

  constructor() {
    // Simulate initial data fetch
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1200);
  }

  // Form fields
  name = '';
  periodType: PeriodType = 'trimester';

  toggleForm(estab?: Establishment) {
    if (this.showForm() && this.name.trim() !== '' && !estab) {
        this.showDiscardConfirm.set(true);
        return;
    }

    if (estab) {
      this.editingId.set(estab.id);
      this.name = estab.name;
      this.periodType = estab.periodType;
    } else {
      this.editingId.set(null);
      this.name = '';
      this.periodType = 'trimester';
    }
    this.showForm.set(!this.showForm());
  }

  save() {
    if (!this.name.trim()) return;

    if (this.editingId()) {
      this.dataService.updateEstablishment(this.editingId()!, this.name, this.periodType);
    } else {
      this.dataService.addEstablishment(this.name, this.periodType);
    }
    this.showForm.set(false);
  }

  confirmDelete(id: string) {
    this.idToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  delete() {
    if (this.idToDelete()) {
      this.dataService.deleteEstablishment(this.idToDelete()!);
      this.showDeleteConfirm.set(false);
      this.idToDelete.set(null);
    }
  }

  discardChanges() {
    this.showDiscardConfirm.set(false);
    this.name = '';
    this.showForm.set(false);
  }
}
