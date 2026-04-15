import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AverageResponse {
  rule: string;
  weightedAverage: number;
  totalWeighted: number;
  totalCoefficient: number;
}

export interface StudentAverageResponse {
  studentId: number;
  firstName: string;
  lastName: string;
  annualAverage: number;
  periodAverage: number | null;
  totalGrades: number;
}

@Injectable({ providedIn: 'root' })
export class GradeAverageService {
  private api = inject(ApiService);

  /** Moyenne annuelle d'un élève dans une classe */
  getStudentAnnualAverage(studentId: number, classroomId: number, rule = 'C'): Observable<AverageResponse> {
    return this.api.get<AverageResponse>(
      `/grades/average/student/${studentId}/classroom/${classroomId}?rule=${rule}`
    ).pipe(map(res => res.data!));
  }

  /** Moyenne d'une période pour un élève */
  getStudentPeriodAverage(studentId: number, classroomId: number, periodId: number, rule = 'C'): Observable<AverageResponse> {
    return this.api.get<AverageResponse>(
      `/grades/average/student/${studentId}/classroom/${classroomId}/period/${periodId}?rule=${rule}`
    ).pipe(map(res => res.data!));
  }

  /** Moyenne générale de toute la classe */
  getClassAnnualAverage(classroomId: number, rule = 'C'): Observable<AverageResponse> {
    return this.api.get<AverageResponse>(
      `/grades/average/classroom/${classroomId}?rule=${rule}`
    ).pipe(map(res => res.data!));
  }

  /** Moyenne de la classe pour une période */
  getClassPeriodAverage(classroomId: number, periodId: number, rule = 'C'): Observable<AverageResponse> {
    return this.api.get<AverageResponse>(
      `/grades/average/classroom/${classroomId}/period/${periodId}?rule=${rule}`
    ).pipe(map(res => res.data!));
  }

  /**
   * Dashboard classe : tous les élèves + leur moyenne annuelle et de période
   * @param periodId optionnel - pour avoir aussi periodAverage
   */
  getClassDashboard(classroomId: number, periodId?: number, rule = 'C'): Observable<StudentAverageResponse[]> {
    let url = `/grades/average/classroom/${classroomId}/dashboard?rule=${rule}`;
    if (periodId) url += `&periodId=${periodId}`;
    return this.api.get<StudentAverageResponse[]>(url)
      .pipe(map(res => res.data || []));
  }
}
