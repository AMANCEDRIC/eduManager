import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClassroomService, ClassroomResponseDto } from '../../services/classroom.service';
import { PeriodService, PeriodResponse } from '../../services/period.service';
import { EvaluationService, EvaluationResponse, EvaluationRequest } from '../../services/evaluation.service';
import { StudentService, StudentResponse } from '../../services/student.service';
import { GradeService, GradeResponse, BulkGradeItem } from '../../services/grade.service';
import { GradeAverageService } from '../../services/grade-average.service';
import { ToastService } from '../../services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-gradebook',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gradebook.component.html',
  styleUrl: './gradebook.component.scss'
})
export class GradebookComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private classroomService = inject(ClassroomService);
  private periodService = inject(PeriodService);
  private evaluationService = inject(EvaluationService);
  private studentService = inject(StudentService);
  private gradeService = inject(GradeService);
  private gradeAverageService = inject(GradeAverageService);
  private toast = inject(ToastService);

  classId = Number(this.route.snapshot.paramMap.get('id') || '0');

  // Data signals
  classroom = signal<ClassroomResponseDto | null>(null);
  periods = signal<PeriodResponse[]>([]);
  selectedPeriodId = signal<number | null>(null);
  evaluations = signal<EvaluationResponse[]>([]);
  students = signal<StudentResponse[]>([]);

  // Grade cache: gradeMap[studentId][evaluationId] = GradeResponse
  gradeMap = signal<Record<number, Record<number, GradeResponse>>>({});

  // Average cache: averageMap[studentId] = periodAverage
  averageMap = signal<Record<number, number | null>>({});

  // Loading & UI states
  isLoading = signal(true);
  isSaving = signal(false);
  showEvalForm = signal(false);
  cellErrors = signal<Record<string, string>>({});

  // Form fields — new evaluation
  newEvalDescription = '';
  newEvalType = 'TEST';
  newEvalMaxGrade = 20;
  newEvalCoef = 1;
  newEvalDate = new Date().toISOString().split('T')[0];

  ngOnInit() {
    this.loadClassroom();
  }

  // ── Data Loading ─────────────────────────────────────────────

  loadClassroom() {
    this.isLoading.set(true);
    this.classroomService.getById(this.classId).subscribe({
      next: (cls) => {
        this.classroom.set(cls);
        this.loadPeriods(cls.establishmentId);
        this.loadStudents();
      },
      error: () => {
        this.toast.error('Impossible de charger la classe');
        this.isLoading.set(false);
      }
    });
  }

  loadPeriods(establishmentId: number) {
    this.periodService.getByEstablishment(establishmentId).subscribe({
      next: (periods) => {
        this.periods.set(periods);
        if (periods.length > 0) {
          this.selectPeriod(periods[0].id);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.toast.error('Impossible de charger les périodes');
        this.isLoading.set(false);
      }
    });
  }

  loadStudents() {
    this.studentService.getByClassroom(this.classId).subscribe({
      next: (students) => this.students.set(students),
      error: () => this.toast.error('Impossible de charger les élèves')
    });
  }

  selectPeriod(periodId: number) {
    this.selectedPeriodId.set(periodId);
    this.isLoading.set(true);
    this.gradeMap.set({});
    this.averageMap.set({});

    this.evaluationService.getByClassroomAndPeriod(this.classId, periodId).subscribe({
      next: (evals) => {
        this.evaluations.set(evals);
        if (evals.length > 0) {
          this.loadAllGrades(evals);
        } else {
          this.isLoading.set(false);
        }
        this.loadAveragesDashboard(periodId);
      },
      error: () => {
        this.toast.error('Impossible de charger les évaluations');
        this.isLoading.set(false);
      }
    });
  }

  loadAllGrades(evals: EvaluationResponse[]) {
    // Load grades for each evaluation in parallel
    const requests = evals.map(e =>
      this.gradeService.getByEvaluationGrouped(e.id)
    );

    forkJoin(requests).subscribe({
      next: (allGrades) => {
        const map: Record<number, Record<number, GradeResponse>> = {};
        allGrades.forEach((grades, i) => {
          grades.forEach(g => {
            if (!map[g.studentId]) map[g.studentId] = {};
            map[g.studentId][g.evaluationId] = g;
          });
        });
        this.gradeMap.set(map);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Impossible de charger les notes');
        this.isLoading.set(false);
      }
    });
  }

  loadAveragesDashboard(periodId: number) {
    this.gradeAverageService.getClassDashboard(this.classId, periodId).subscribe({
      next: (data) => {
        const avg: Record<number, number | null> = {};
        data.forEach(d => {
          avg[d.studentId] = d.periodAverage;
        });
        this.averageMap.set(avg);
      },
      error: () => {} // Silently fail — averages are secondary
    });
  }

  // ── Grade Helpers ─────────────────────────────────────────────

  getGradeValue(studentId: number, evaluationId: number): number | string {
    const g = this.gradeMap()[studentId]?.[evaluationId];
    return g?.value ?? '';
  }

  getGradeStatus(studentId: number, evaluationId: number): string {
    return this.gradeMap()[studentId]?.[evaluationId]?.status ?? 'PRESENT';
  }

  getStudentAverage(studentId: number): number | null {
    return this.averageMap()[studentId] ?? null;
  }

  validateInput(studentId: number, evaluationId: number, maxGrade: number, event: any) {
    const val = parseFloat(event.target.value);
    const key = `${studentId}_${evaluationId}`;
    if (!isNaN(val) && (val < 0 || val > maxGrade)) {
      this.cellErrors.update(prev => ({ ...prev, [key]: `0 – ${maxGrade}` }));
    } else {
      this.cellErrors.update(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  }

  /**
   * Called on blur: save the grade for ONE student/evaluation via bulk upsert.
   * Using bulk upsert even for single grade because the endpoint handles upsert automatically.
   */
  updateGrade(studentId: number, evaluationId: number, evalMaxValue: number, event: any) {
    let val: number | null = parseFloat(event.target.value);
    if (isNaN(val)) val = null;

    if (val !== null) {
      if (val > evalMaxValue) { val = evalMaxValue; event.target.value = val; }
      if (val < 0) { val = 0; event.target.value = val; }
    }

    // Clear cell error
    const key = `${studentId}_${evaluationId}`;
    this.cellErrors.update(prev => { const n = { ...prev }; delete n[key]; return n; });

    this.isSaving.set(true);
    const body: { grades: BulkGradeItem[] } = {
      grades: [{
        studentId,
        value: val,
        status: 'PRESENT',
        isAbsent: false
      }]
    };

    this.gradeService.bulkUpsert(evaluationId, body).subscribe({
      next: (saved) => {
        // Update local gradeMap cache
        const currentMap = { ...this.gradeMap() };
        if (!currentMap[studentId]) currentMap[studentId] = {};
        if (saved.length > 0) currentMap[studentId][evaluationId] = saved[0];
        this.gradeMap.set(currentMap);

        // Refresh averages
        const pid = this.selectedPeriodId();
        if (pid) this.loadAveragesDashboard(pid);

        this.isSaving.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors de la sauvegarde de la note');
        this.isSaving.set(false);
      }
    });
  }

  // ── Evaluation Form ───────────────────────────────────────────

  addEvaluation() {
    const periodId = this.selectedPeriodId();
    if (!periodId) {
      this.toast.warning('Sélectionnez d\'abord une période');
      return;
    }

    const payload: EvaluationRequest = {
      classroomId: this.classId,
      periodId,
      gradeType: this.newEvalType,
      maxValue: this.newEvalMaxGrade,
      coefficient: this.newEvalCoef,
      evaluationDate: this.newEvalDate,
      description: this.newEvalDescription || null
    };

    this.evaluationService.create(payload).subscribe({
      next: (created) => {
        this.evaluations.update(prev => [...prev, created]);
        this.toast.success('Évaluation créée');
        this.showEvalForm.set(false);
        this.newEvalDescription = '';
        this.newEvalType = 'TEST';
        this.newEvalMaxGrade = 20;
        this.newEvalCoef = 1;
      },
      error: () => this.toast.error('Erreur lors de la création de l\'évaluation')
    });
  }

  // ── UI Helpers ────────────────────────────────────────────────

  getPerformanceLevel(average: number | null): 'high' | 'mid' | 'low' {
    if (average === null) return 'low';
    if (average >= 14) return 'high';
    if (average >= 10) return 'mid';
    return 'low';
  }

  getStudentInitials(student: StudentResponse): string {
    return `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  }

  selectedPeriod(): PeriodResponse | undefined {
    return this.periods().find(p => p.id === this.selectedPeriodId());
  }
}
