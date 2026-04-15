import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface EvaluationRequest {
  classroomId: number;
  periodId?: number | null;
  gradeType: string;        // "TEST" | "EXAM" | "HOMEWORK" | "QUIZ"
  maxValue: number;
  coefficient: number;
  evaluationDate: string;   // "YYYY-MM-DD"
  description?: string | null;
}

export interface EvaluationResponse {
  id: number;
  classroomId: number;
  periodId: number | null;
  gradeType: string;
  maxValue: number;
  coefficient: number;
  evaluationDate: string;
  description: string | null;
}

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private api = inject(ApiService);

  /** GET /api/evaluations/:id */
  getById(id: number): Observable<EvaluationResponse> {
    return this.api.get<EvaluationResponse>(`/evaluations/${id}`)
      .pipe(map(res => res.data!));
  }

  /** GET /api/evaluations/classroom/:classroomId */
  getByClassroom(classroomId: number): Observable<EvaluationResponse[]> {
    return this.api.get<EvaluationResponse[]>(`/evaluations/classroom/${classroomId}`)
      .pipe(map(res => res.data || []));
  }

  /** GET /api/evaluations/classroom/:classroomId/period/:periodId */
  getByClassroomAndPeriod(classroomId: number, periodId: number): Observable<EvaluationResponse[]> {
    return this.api.get<EvaluationResponse[]>(
      `/evaluations/classroom/${classroomId}/period/${periodId}`
    ).pipe(map(res => res.data || []));
  }

  /** POST /api/evaluations */
  create(body: EvaluationRequest): Observable<EvaluationResponse> {
    return this.api.post<EvaluationResponse>('/evaluations', body)
      .pipe(map(res => res.data!));
  }
}
