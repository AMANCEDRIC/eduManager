import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PeriodType } from '../models/models';

export interface EstablishmentDto {
  id?: number;
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  periodType?: string;       // "TRIMESTRE" | "SEMESTRE"
  academicYear?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EstablishmentService {

  constructor(private api: ApiService) {}

  getAll(): Observable<EstablishmentDto[]> {
    return this.api.get<EstablishmentDto[]>('/establishments').pipe(
      map(res => res.data || [])
    );
  }

  getById(id: number): Observable<EstablishmentDto> {
    return this.api.get<EstablishmentDto>(`/establishments/${id}`).pipe(
      map(res => res.data!)
    );
  }

  create(establishment: Partial<EstablishmentDto>): Observable<EstablishmentDto> {
    return this.api.post<EstablishmentDto>('/establishments', establishment).pipe(
      map(res => res.data!)
    );
  }

  update(id: number, establishment: Partial<EstablishmentDto>): Observable<EstablishmentDto> {
    return this.api.put<EstablishmentDto>(`/establishments/${id}`, establishment).pipe(
      map(res => res.data!)
    );
  }

  delete(id: number): Observable<any> {
    return this.api.delete(`/establishments/${id}`);
  }
}
