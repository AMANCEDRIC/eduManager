import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SchoolDataService } from '../../services/school-data.service';
import { Class } from '../../models/models';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-class-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './class-manager.component.html',
  styleUrl: './class-manager.component.scss'
})
export class ClassManagerComponent {
  private route = inject(ActivatedRoute);
  dataService = inject(SchoolDataService);

  establishmentId = this.route.snapshot.paramMap.get('id') || '';
  establishment = computed(() => this.dataService.establishments().find(e => e.id === this.establishmentId));
  
  classes = computed(() => this.dataService.classes().filter(c => c.establishmentId === this.establishmentId));

  showForm = signal(false);
  editingId = signal<string | null>(null);
  isLoading = signal(true);

  constructor() {
    // Simulate data fetch
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

  // Confirmations
  showDeleteConfirm = signal(false);
  idToDelete = signal<string | null>(null);
  showDiscardConfirm = signal(false);

  // Form fields
  name = '';
  subject = '';

  toggleForm(cls?: Class) {
    if (this.showForm() && (this.name.trim() !== '' || this.subject.trim() !== '') && !cls) {
        this.showDiscardConfirm.set(true);
        return;
    }

    if (cls) {
      this.editingId.set(cls.id);
      this.name = cls.name;
      this.subject = cls.subject || '';
    } else {
      this.editingId.set(null);
      this.name = '';
      this.subject = '';
    }
    this.showForm.set(!this.showForm());
  }

  save() {
    if (!this.name.trim() || !this.subject.trim()) return;

    if (this.editingId()) {
      this.dataService.updateClass(this.editingId()!, this.name, this.subject);
    } else {
      this.dataService.addClass(this.establishmentId, this.name, this.subject);
    }
    this.showForm.set(false);
  }

  confirmDelete(id: string) {
    this.idToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  delete() {
    if (this.idToDelete()) {
      this.dataService.deleteClass(this.idToDelete()!);
      this.showDeleteConfirm.set(false);
      this.idToDelete.set(null);
    }
  }

  discardChanges() {
    this.showDiscardConfirm.set(false);
    this.name = '';
    this.subject = '';
    this.showForm.set(false);
  }
}
