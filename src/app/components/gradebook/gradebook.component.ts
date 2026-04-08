import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SchoolDataService } from '../../services/school-data.service';
import { Evaluation, Student, Period } from '../../models/models';

@Component({
  selector: 'app-gradebook',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gradebook.component.html',
  styleUrl: './gradebook.component.scss'
})
export class GradebookComponent {
  private route = inject(ActivatedRoute);
  dataService = inject(SchoolDataService);

  classId = this.route.snapshot.paramMap.get('id') || '';
  classroom = computed(() => this.dataService.classes().find(c => c.id === this.classId));
  establishment = computed(() => {
    const cls = this.classroom();
    return cls ? this.dataService.establishments().find(e => e.id === cls.establishmentId) : null;
  });

  periods = computed(() => {
    const est = this.establishment();
    return est ? this.dataService.periods().filter(p => p.establishmentId === est.id) : [];
  });

  selectedPeriodId = signal<string>('');

  selectedPeriod = computed(() => this.periods().find(p => p.id === this.selectedPeriodId()));

  evaluations = computed(() => {
    const pid = this.selectedPeriodId();
    return this.dataService.evaluations().filter(e => e.classId === this.classId && e.periodId === pid);
  });

  students = computed(() => this.dataService.students().filter(s => s.classId === this.classId));

  // Form for new Evaluation
  showEvalForm = signal(false);
  newEvalName = '';
  newEvalType = 'Devoir';
  newEvalMaxGrade = 20;
  newEvalCoef = 1;

  cellErrors = signal<Record<string, string>>({});

  validateInput(studentId: string, evaluationId: string, maxGrade: number, event: any) {
    const val = parseFloat(event.target.value);
    const key = `${studentId}_${evaluationId}`;

    if (!isNaN(val) && (val < 0 || val > maxGrade)) {
      this.cellErrors.update(prev => ({ ...prev, [key]: `La note doit être entre 0 et ${maxGrade}` }));
    } else {
      this.cellErrors.update(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  isLoading = signal(true);

  constructor() {
    // Auto select first period
    const stop = setInterval(() => {
      const ps = this.periods();
      if (ps.length > 0) {
        this.selectedPeriodId.set(ps[0].id);
        clearInterval(stop);
      }
    }, 100);

    // Simulate data fetch
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1500);
  }

  addEvaluation() {
    if (!this.newEvalName.trim() || !this.selectedPeriodId()) return;

    this.dataService.addEvaluation(
      this.classId,
      this.selectedPeriodId(),
      this.newEvalName,
      this.newEvalType,
      this.newEvalMaxGrade,
      new Date(),
      this.newEvalCoef
    );
    this.showEvalForm.set(false);
    this.newEvalName = '';
  }

  getGrade(studentId: string, evaluationId: string): number | null {
    const g = this.dataService.grades().find(g => g.studentId === studentId && g.evaluationId === evaluationId);
    return g ? g.value : null;
  }

  updateGrade(studentId: string, evaluationId: string, event: any) {
    const evaluation = this.evaluations().find(e => e.id === evaluationId);
    if (!evaluation) return;

    let val = parseFloat(event.target.value);

    if (isNaN(val)) return;

    // Constraint validation
    if (val > evaluation.maxGrade) {
      val = evaluation.maxGrade;
      event.target.value = val; // Reflect correction in UI
    } else if (val < 0) {
      val = 0;
      event.target.value = val; // Reflect correction in UI
    }

    this.dataService.setGrade(evaluationId, studentId, val);

    // Clear error
    const key = `${studentId}_${evaluationId}`;
    this.cellErrors.update(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  getPerformanceLevel(average: number | string): 'high' | 'mid' | 'low' {
    const val = typeof average === 'string' ? parseFloat(average) : average;
    if (isNaN(val)) return 'low';
    if (val >= 14) return 'high';
    if (val >= 10) return 'mid';
    return 'low';
  }

  getStudentInitials(student: Student): string {
    return `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  }
}
