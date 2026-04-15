import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface StudentCreate {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  classroomId: number;
}

export interface StudentResponse {
  id: number;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F' | null;
  dateOfBirth: string | null;
  email: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  classroomName: string | null;
  classroomLevel: string | null;
  establishmentName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private api = inject(ApiService);

  getAll(): Observable<StudentResponse[]> {
    return this.api.get<StudentResponse[]>('/students')
      .pipe(map(res => res.data || []));
  }

  getByClassroom(classroomId: number | string): Observable<StudentResponse[]> {
    return this.api.get<StudentResponse[]>(`/students/classroom/${classroomId}`)
      .pipe(map(res => res.data || []));
  }

  create(student: StudentCreate): Observable<StudentResponse> {
    return this.api.post<StudentResponse>('/students', student)
      .pipe(map(res => res.data!));
  }

  update(id: number | string, student: StudentCreate): Observable<StudentResponse> {
    return this.api.put<StudentResponse>(`/students/${id}`, student)
      .pipe(map(res => res.data!));
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(`/students/${id}`)
      .pipe(map(() => void 0));
  }
}
