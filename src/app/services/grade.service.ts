import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export type GradeStatus = 'PRESENT' | 'ABSENT_JUSTIFIED' | 'ABSENT_UNJUSTIFIED' | 'NOT_SUBMITTED';

export interface GradeRequest {
  value?: number | null;
  studentId: number;
  evaluationId: number;
  status: GradeStatus;
  isAbsent?: boolean;
  appreciation?: string | null;
}

export interface GradeResponse {
  id: number;
  value: number | null;
  isAbsent: boolean;
  appreciation: string | null;
  status: GradeStatus;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  evaluationId: number;
}

export interface BulkGradeItem {
  studentId: number;
  value?: number | null;
  status: GradeStatus;
  isAbsent?: boolean;
  appreciation?: string | null;
}

export interface BulkGradesRequest {
  grades: BulkGradeItem[];
}

@Injectable({ providedIn: 'root' })
export class GradeService {
  private api = inject(ApiService);

  /** GET /api/grades/evaluation/:evaluationId */
  getByEvaluation(evaluationId: number): Observable<GradeResponse[]> {
    return this.api.get<GradeResponse[]>(`/grades/evaluation/${evaluationId}`)
      .pipe(map(res => res.data || []));
  }

  /** GET /api/grades/student/:studentId */
  getByStudent(studentId: number): Observable<GradeResponse[]> {
    return this.api.get<GradeResponse[]>(`/grades/student/${studentId}`)
      .pipe(map(res => res.data || []));
  }

  /** GET /api/evaluations/:evaluationId/grades */
  getByEvaluationGrouped(evaluationId: number): Observable<GradeResponse[]> {
    return this.api.get<GradeResponse[]>(`/evaluations/${evaluationId}/grades`)
      .pipe(map(res => res.data || []));
  }

  /**
   * POST /api/evaluations/:evaluationId/grades
   * UPSERT en masse : crée ou met à jour les notes de tous les élèves
   */
  bulkUpsert(evaluationId: number, body: BulkGradesRequest): Observable<GradeResponse[]> {
    return this.api.post<GradeResponse[]>(`/evaluations/${evaluationId}/grades`, body)
      .pipe(map(res => res.data || []));
  }

  /** PUT /api/grades/:id */
  update(id: number, body: GradeRequest): Observable<GradeResponse> {
    return this.api.put<GradeResponse>(`/grades/${id}`, body)
      .pipe(map(res => res.data!));
  }

  /** DELETE /api/grades/:id */
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/grades/${id}`)
      .pipe(map(() => void 0));
  }
}
