import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ClassroomCreateDto {
  name: string;
  level: string;
  subject: string;
  academicYear: string;
  establishmentId: number;
}

export interface ClassroomResponseDto {
  id: number;
  name: string;
  level: string;
  subject: string;
  academicYear: string;
  establishmentId: number;
  establishmentName: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ClassroomService {

  constructor(private api: ApiService) {}

  getAll(): Observable<ClassroomResponseDto[]> {
    return this.api.get<ClassroomResponseDto[]>('/classrooms').pipe(
      map(res => res.data || [])
    );
  }

  getById(id: number): Observable<ClassroomResponseDto> {
    return this.api.get<ClassroomResponseDto>(`/classrooms/${id}`).pipe(
      map(res => res.data!)
    );
  }

  getByEstablishment(establishmentId: number): Observable<ClassroomResponseDto[]> {
    return this.api.get<ClassroomResponseDto[]>(`/classrooms/establishment/${establishmentId}`).pipe(
      map(res => res.data || [])
    );
  }

  create(classroom: ClassroomCreateDto): Observable<ClassroomResponseDto> {
    return this.api.post<ClassroomResponseDto>('/classrooms', classroom).pipe(
      map(res => res.data!)
    );
  }

  update(id: number, classroom: Partial<ClassroomCreateDto>): Observable<ClassroomResponseDto> {
    return this.api.put<ClassroomResponseDto>(`/classrooms/${id}`, classroom).pipe(
      map(res => res.data!)
    );
  }

  delete(id: number): Observable<any> {
    return this.api.delete(`/classrooms/${id}`);
  }
}
