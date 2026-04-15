import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface PeriodResponse {
  id: number;
  name: string;
  type: string;       // "TRIMESTRE" | "SEMESTRE"
  number: number;
  startDate: string;  // "YYYY-MM-DD"
  endDate: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodRequest {
  name: string;
  type: string;
  number: number;
  startDate: string;
  endDate: string;
  academicYear: string;
}

@Injectable({ providedIn: 'root' })
export class PeriodService {
  private api = inject(ApiService);

  /** GET /api/periods/establishment/:establishmentId */
  getByEstablishment(establishmentId: number): Observable<PeriodResponse[]> {
    return this.api.get<PeriodResponse[]>(`/periods/establishment/${establishmentId}`)
      .pipe(map(res => res.data || []));
  }

  /** GET /api/periods/:id */
  getById(id: number): Observable<PeriodResponse> {
    return this.api.get<PeriodResponse>(`/periods/${id}`)
      .pipe(map(res => res.data!));
  }

  /** POST /api/periods/establishment/:establishmentId */
  create(establishmentId: number, body: PeriodRequest): Observable<PeriodResponse> {
    return this.api.post<PeriodResponse>(`/periods/establishment/${establishmentId}`, body)
      .pipe(map(res => res.data!));
  }

  /** PUT /api/periods/:id */
  update(id: number, body: PeriodRequest): Observable<PeriodResponse> {
    return this.api.put<PeriodResponse>(`/periods/${id}`, body)
      .pipe(map(res => res.data!));
  }

  /** DELETE /api/periods/:id */
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/periods/${id}`)
      .pipe(map(() => void 0));
  }
}
