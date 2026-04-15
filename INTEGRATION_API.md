# 📘 Klaso Backend — Documentation d'intégration Angular

> **Base URL** : `http://localhost:8081`
> **Framework backend** : Quarkus (JAX-RS / Jakarta EE)
> **Auth** : JWT Bearer Token — header `Authorization: Bearer <token>`
> **Format** : Toutes les réponses sont enveloppées dans `ApiResponse<T>`

---

## Table des matières

1. [Format de réponse global](#1-format-de-réponse-global)
2. [Configuration Angular initiale](#2-configuration-angular-initiale)
3. [Module Auth — `/api/auth`](#3-module-auth--apiauth)
4. [Module Établissements — `/api/establishments`](#4-module-établissements--apiestablishments)
5. [Module Périodes — `/api/periods`](#5-module-périodes--apiperiods)
6. [Module Classes — `/api/classrooms`](#6-module-classes--apiclassrooms)
7. [Module Élèves — `/api/students`](#7-module-élèves--apistudents)
8. [Module Évaluations — `/api/evaluations`](#8-module-évaluations--apievaluations)
9. [Module Notes — `/api/grades`](#9-module-notes--apigrades)
10. [Module Moyennes — `/api/grades/average`](#10-module-moyennes--apigradesaverage)
11. [Gestion des erreurs](#11-gestion-des-erreurs)
12. [Hiérarchie des données](#12-hiérarchie-des-données)
13. [Points d'attention importants](#13-points-dattention-importants)

---

## 1. Format de réponse global

Toutes les réponses du backend sont enveloppées dans ce wrapper :

```json
{
  "status": 200,
  "message": "Description du résultat",
  "data": { ... }
}
```

### Interface TypeScript

```typescript
// src/app/models/api-response.model.ts
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
```

---

## 2. Configuration Angular initiale

### 2.1 `app.config.ts` — Fournir HttpClient

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

### 2.2 Intercepteur JWT

L'intercepteur ajoute automatiquement le token JWT à chaque requête.

```typescript
// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('klaso_token');
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  return next(req);
};
```

### 2.3 Service HTTP de base

```typescript
// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  get<T>(path: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`);
  }

  post<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body);
  }

  put<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${path}`, body);
  }

  delete<T>(path: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}`);
  }
}
```

---

## 3. Module Auth — `/api/auth`

### 3.1 Interfaces TypeScript

```typescript
// src/app/models/auth.model.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: 'TEACHER' | 'ADMIN'; // défaut: TEACHER
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string; // 'TEACHER' | 'ADMIN'
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

### 3.2 Service Angular

```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  LoginRequest, RegisterRequest,
  UserResponse, ForgotPasswordRequest, ResetPasswordRequest
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private api: ApiService, private router: Router) {}

  /** POST /api/auth/register — Crée un compte */
  register(body: RegisterRequest): Observable<UserResponse> {
    return this.api.post<UserResponse>('/auth/register', body)
      .pipe(map(res => res.data));
  }

  /** POST /api/auth/login — Retourne un JWT string dans data */
  login(body: LoginRequest): Observable<string> {
    return this.api.post<string>('/auth/login', body).pipe(
      tap(res => {
        localStorage.setItem('klaso_token', res.data);
      }),
      map(res => res.data)
    );
  }

  /** GET /api/auth/me 🔒 — Profil utilisateur connecté */
  getMe(): Observable<UserResponse> {
    return this.api.get<UserResponse>('/auth/me')
      .pipe(map(res => res.data));
  }

  /** POST /api/auth/forgot-password */
  forgotPassword(body: ForgotPasswordRequest): Observable<void> {
    return this.api.post<void>('/auth/forgot-password', body)
      .pipe(map(() => undefined));
  }

  /** POST /api/auth/reset-password */
  resetPassword(body: ResetPasswordRequest): Observable<void> {
    return this.api.post<void>('/auth/reset-password', body)
      .pipe(map(() => undefined));
  }

  logout(): void {
    localStorage.removeItem('klaso_token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('klaso_token');
  }
}
```

### 3.3 Endpoints

| Méthode | URL | Auth | Description |
|---------|-----|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Créer un compte |
| `POST` | `/api/auth/login` | ❌ | Login → JWT string |
| `GET` | `/api/auth/me` | 🔒 | Profil connecté |
| `POST` | `/api/auth/forgot-password` | ❌ | Envoie email reset |
| `POST` | `/api/auth/reset-password` | ❌ | Reset mot de passe |

> ⚠️ **Important** : Sur `POST /api/auth/login`, le champ `data` est directement un **string** (le JWT), pas un objet.
> Stocker dans `localStorage.setItem('klaso_token', res.data)`.

#### Claims du JWT

| Claim | Valeur |
|-------|--------|
| `id` | ID utilisateur |
| `email` | Email |
| `name` | Prénom + Nom |
| `groups` | Liste des rôles (ex. `["TEACHER"]`) |

---

## 4. Module Établissements — `/api/establishments`

### 4.1 Interfaces TypeScript

```typescript
// src/app/models/establishment.model.ts

/** Corps de création/mise à jour */
export interface EstablishmentRequest {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  periodType: 'TRIMESTRE' | 'SEMESTRE';
  academicYear: string; // ex: "2024-2025"
}

/** Réponse du backend (EstablishmentDto.java) */
export interface EstablishmentResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  periodType: 'TRIMESTRE' | 'SEMESTRE';
  academicYear: string;
  ownerId: number | null;
  ownerName: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string;
}
```

### 4.2 Service Angular

```typescript
// src/app/services/establishment.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { EstablishmentRequest, EstablishmentResponse } from '../models/establishment.model';

@Injectable({ providedIn: 'root' })
export class EstablishmentService {
  constructor(private api: ApiService) {}

  /** GET /api/establishments */
  getAll(): Observable<EstablishmentResponse[]> {
    return this.api.get<EstablishmentResponse[]>('/establishments')
      .pipe(map(res => res.data));
  }

  /** GET /api/establishments/:id */
  getById(id: number): Observable<EstablishmentResponse> {
    return this.api.get<EstablishmentResponse>(`/establishments/${id}`)
      .pipe(map(res => res.data));
  }

  /** POST /api/establishments */
  create(body: EstablishmentRequest): Observable<EstablishmentResponse> {
    return this.api.post<EstablishmentResponse>('/establishments', body)
      .pipe(map(res => res.data));
  }

  /** PUT /api/establishments/:id */
  update(id: number, body: EstablishmentRequest): Observable<EstablishmentResponse> {
    return this.api.put<EstablishmentResponse>(`/establishments/${id}`, body)
      .pipe(map(res => res.data));
  }

  /** DELETE /api/establishments/:id */
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/establishments/${id}`)
      .pipe(map(() => undefined));
  }
}
```

### 4.3 Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/establishments` | Lister tous |
| `GET` | `/api/establishments/{id}` | Détail |
| `POST` | `/api/establishments` | Créer |
| `PUT` | `/api/establishments/{id}` | Modifier |
| `DELETE` | `/api/establishments/{id}` | Supprimer |

> 💡 **Création automatique de périodes** : Quand un établissement est créé avec `periodType = "TRIMESTRE"`, les 3 trimestres sont automatiquement créés. Avec `"SEMESTRE"`, les 2 semestres sont créés.

---

## 5. Module Périodes — `/api/periods`

### 5.1 Interfaces TypeScript

```typescript
// src/app/models/period.model.ts

/** Corps de création — mappé directement sur Period.java (entité) */
export interface PeriodRequest {
  name: string;        // "Trimestre 1"
  type: string;        // "TRIMESTRE" | "SEMESTRE"
  number: number;      // 1, 2, 3
  startDate: string;   // "2024-09-01" (YYYY-MM-DD)
  endDate: string;     // "2024-12-20"
  academicYear: string; // "2024-2025"
}

/** Réponse — mêmes champs + id et establishment */
export interface PeriodResponse {
  id: number;
  name: string;
  type: string;
  number: number;
  startDate: string;   // LocalDate sérialisé en "YYYY-MM-DD"
  endDate: string;
  academicYear: string;
  createdAt: string;   // ISO 8601
  updatedAt: string;
  // Note: establishment est lazy-loaded, non inclus dans la réponse
}
```

### 5.2 Service Angular

```typescript
// src/app/services/period.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { PeriodRequest, PeriodResponse } from '../models/period.model';

@Injectable({ providedIn: 'root' })
export class PeriodService {
  constructor(private api: ApiService) {}

  /** GET /api/periods/establishment/:establishmentId */
  getByEstablishment(establishmentId: number): Observable<PeriodResponse[]> {
    return this.api.get<PeriodResponse[]>(`/periods/establishment/${establishmentId}`)
      .pipe(map(res => res.data));
  }

  /** GET /api/periods/:id */
  getById(id: number): Observable<PeriodResponse> {
    return this.api.get<PeriodResponse>(`/periods/${id}`)
      .pipe(map(res => res.data));
  }

  /** POST /api/periods/establishment/:establishmentId */
  create(establishmentId: number, body: PeriodRequest): Observable<PeriodResponse> {
    return this.api.post<PeriodResponse>(`/periods/establishment/${establishmentId}`, body)
      .pipe(map(res => res.data));
  }

  /** PUT /api/periods/:id */
  update(id: number, body: PeriodRequest): Observable<PeriodResponse> {
    return this.api.put<PeriodResponse>(`/periods/${id}`, body)
      .pipe(map(res => res.data));
  }

  /** DELETE /api/periods/:id */
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/periods/${id}`)
      .pipe(map(() => undefined));
  }
}
```

### 5.3 Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/periods/establishment/{establishmentId}` | Périodes d'un établissement |
| `GET` | `/api/periods/{id}` | Détail d'une période |
| `POST` | `/api/periods/establishment/{establishmentId}` | Créer une période |
| `PUT` | `/api/periods/{id}` | Modifier |
| `DELETE` | `/api/periods/{id}` | Supprimer |

---

## 6. Module Classes — `/api/classrooms`

### 6.1 Interfaces TypeScript

```typescript
// src/app/models/classroom.model.ts

/** Corps de création (ClassroomDto.java) */
export interface ClassroomRequest {
  name: string;           // "6ème A"
  level: string;          // "6ème"
  subject: string;        // "Mathématiques"
  academicYear: string;   // "2024-2025"
  establishmentId: number;
}

/** Réponse (ClassroomResponseDto.java) */
export interface ClassroomResponse {
  id: number;
  name: string;
  level: string;
  subject: string;
  academicYear: string;
  establishmentId: number;
  establishmentName: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
}
```

### 6.2 Service Angular

```typescript
// src/app/services/classroom.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ClassroomRequest, ClassroomResponse } from '../models/classroom.model';

@Injectable({ providedIn: 'root' })
export class ClassroomService {
  constructor(private api: ApiService) {}

  /** GET /api/classrooms */
  getAll(): Observable<ClassroomResponse[]> {
    return this.api.get<ClassroomResponse[]>('/classrooms')
      .pipe(map(res => res.data));
  }

  /** GET /api/classrooms/:id */
  getById(id: number): Observable<ClassroomResponse> {
    return this.api.get<ClassroomResponse>(`/classrooms/${id}`)
      .pipe(map(res => res.data));
  }

  /** GET /api/classrooms/establishment/:establishmentId */
  getByEstablishment(establishmentId: number): Observable<ClassroomResponse[]> {
    return this.api.get<ClassroomResponse[]>(`/classrooms/establishment/${establishmentId}`)
      .pipe(map(res => res.data));
  }

  /** POST /api/classrooms */
  create(body: ClassroomRequest): Observable<ClassroomResponse> {
    return this.api.post<ClassroomResponse>('/classrooms', body)
      .pipe(map(res => res.data));
  }

  /** PUT /api/classrooms/:id — body: Classroom entity (même structure que ClassroomRequest) */
  update(id: number, body: ClassroomRequest): Observable<ClassroomResponse> {
    return this.api.put<ClassroomResponse>(`/classrooms/${id}`, body)
      .pipe(map(res => res.data));
  }

  /** DELETE /api/classrooms/:id */
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/classrooms/${id}`)
      .pipe(map(() => undefined));
  }
}
```

### 6.3 Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/classrooms` | Toutes les classes |
| `GET` | `/api/classrooms/{id}` | Détail |
| `GET` | `/api/classrooms/establishment/{establishmentId}` | Classes d'un établissement |
| `POST` | `/api/classrooms` | Créer |
| `PUT` | `/api/classrooms/{id}` | Modifier |
| `DELETE` | `/api/classrooms/{id}` | Supprimer |

---

## 7. Module Élèves — `/api/students`

### 7.1 Interfaces TypeScript

```typescript
// src/app/models/student.model.ts

/** Corps de création/mise à jour (StudentCreateDto.java) */
export interface StudentRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;   // "2012-03-15" (YYYY-MM-DD)
  email?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  classroomId: number;
}

/** Réponse (StudentResponseDto.java) */
export interface StudentResponse {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;      // "YYYY-MM-DD"
  email: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  classroomName: string;
  classroomLevel: string;
  establishmentName: string;
}
```

### 7.2 Service Angular

```typescript
// src/app/services/student.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StudentRequest, StudentResponse } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(private api: ApiService) {}

  /** GET /api/students */
  getAll(): Observable<StudentResponse[]> {
    return this.api.get<StudentResponse[]>('/students')
      .pipe(map(res => res.data));
  }

  /** GET /api/students/:id */
  getById(id: number): Observable<StudentResponse> {
    return this.api.get<StudentResponse>(`/students/${id}`)
      .pipe(map(res => res.data));
  }

  /** GET /api/students/classroom/:classroomId */
  getByClassroom(classroomId: number): Observable<StudentResponse[]> {
    return this.api.get<StudentResponse[]>(`/students/classroom/${classroomId}`)
      .pipe(map(res => res.data));
  }

  /** POST /api/students */
  create(body: StudentRequest): Observable<StudentResponse> {
    return this.api.post<StudentResponse>('/students', body)
      .pipe(map(res => res.data));
  }

  /** PUT /api/students/:id */
  update(id: number, body: StudentRequest): Observable<StudentResponse> {
    return this.api.put<StudentResponse>(`/students/${id}`, body)
      .pipe(map(res => res.data));
  }

  /** DELETE /api/students/:id */
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/students/${id}`)
      .pipe(map(() => undefined));
  }
}
```

### 7.3 Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/students` | Tous les élèves |
| `GET` | `/api/students/{id}` | Détail |
| `GET` | `/api/students/classroom/{classroomId}` | Élèves d'une classe |
| `POST` | `/api/students` | Créer |
| `PUT` | `/api/students/{id}` | Modifier |
| `DELETE` | `/api/students/{id}` | Supprimer |

---

## 8. Module Évaluations — `/api/evaluations`

### 8.1 Interfaces TypeScript

```typescript
// src/app/models/evaluation.model.ts

/** Corps de création (EvaluationDto.java) */
export interface EvaluationRequest {
  classroomId: number;
  periodId?: number | null;     // Optionnel
  gradeType: string;            // "TEST" | "EXAM" | "HOMEWORK" | "QUIZ" | ...
  maxValue: number;             // Ex: 20, 10, 100
  coefficient: number;          // Ex: 1, 2, 3
  evaluationDate: string;       // "2024-10-15" (YYYY-MM-DD)
  description?: string | null;
}

/** Réponse (EvaluationDto.java) */
export interface EvaluationResponse {
  id: number;
  classroomId: number;
  periodId: number | null;
  gradeType: string;
  maxValue: number;
  coefficient: number;
  evaluationDate: string; // "YYYY-MM-DD"
  description: string | null;
}
```

### 8.2 Service Angular

```typescript
// src/app/services/evaluation.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { EvaluationRequest, EvaluationResponse } from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  constructor(private api: ApiService) {}

  /** GET /api/evaluations/:id */
  getById(id: number): Observable<EvaluationResponse> {
    return this.api.get<EvaluationResponse>(`/evaluations/${id}`)
      .pipe(map(res => res.data));
  }

  /** GET /api/evaluations/classroom/:classroomId */
  getByClassroom(classroomId: number): Observable<EvaluationResponse[]> {
    return this.api.get<EvaluationResponse[]>(`/evaluations/classroom/${classroomId}`)
      .pipe(map(res => res.data));
  }

  /** GET /api/evaluations/classroom/:classroomId/period/:periodId */
  getByClassroomAndPeriod(classroomId: number, periodId: number): Observable<EvaluationResponse[]> {
    return this.api.get<EvaluationResponse[]>(
      `/evaluations/classroom/${classroomId}/period/${periodId}`
    ).pipe(map(res => res.data));
  }

  /** POST /api/evaluations */
  create(body: EvaluationRequest): Observable<EvaluationResponse> {
    return this.api.post<EvaluationResponse>('/evaluations', body)
      .pipe(map(res => res.data));
  }
}
```

### 8.3 Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/evaluations/{id}` | Détail d'une évaluation |
| `GET` | `/api/evaluations/classroom/{classroomId}` | Évaluations d'une classe |
| `GET` | `/api/evaluations/classroom/{classroomId}/period/{periodId}` | Par classe et période |
| `POST` | `/api/evaluations` | Créer |

> ⚠️ Il n'y a pas de `PUT` ou `DELETE` sur `/api/evaluations` pour l'instant.

---

## 9. Module Notes — `/api/grades` et `/api/evaluations/{id}/grades`

### 9.1 Interfaces TypeScript

```typescript
// src/app/models/grade.model.ts

export type GradeStatus = 'PRESENT' | 'ABSENT_JUSTIFIED' | 'ABSENT_UNJUSTIFIED' | 'NOT_SUBMITTED';

/** Corps de création individuelle (GradeDto.java) */
export interface GradeRequest {
  value?: number | null;
  studentId: number;
  evaluationId: number;
  status: GradeStatus;
  isAbsent?: boolean;
  appreciation?: string | null;
}

/** Réponse note individuelle (GradeDto.java) */
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

// ── Saisie groupée ──────────────────────────────
/** Item dans la saisie en masse (BulkGradesRequest.Item) */
export interface BulkGradeItem {
  studentId: number;
  value?: number | null;
  status: GradeStatus;
  isAbsent?: boolean;
  appreciation?: string | null;
}

/** Corps de la saisie en masse */
export interface BulkGradesRequest {
  grades: BulkGradeItem[];
}
```

### 9.2 Service Angular

```typescript
// src/app/services/grade.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  GradeRequest, GradeResponse,
  BulkGradesRequest
} from '../models/grade.model';

@Injectable({ providedIn: 'root' })
export class GradeService {
  constructor(private api: ApiService) {}

  // ── CRUD individuel ──────────────────────────

  /** GET /api/grades */
  getAll(): Observable<GradeResponse[]> {
    return this.api.get<GradeResponse[]>('/grades')
      .pipe(map(res => res.data));
  }

  /** GET /api/grades/:id */
  getById(id: number): Observable<GradeResponse> {
    return this.api.get<GradeResponse>(`/grades/${id}`)
      .pipe(map(res => res.data));
  }

  /** GET /api/grades/student/:studentId */
  getByStudent(studentId: number): Observable<GradeResponse[]> {
    return this.api.get<GradeResponse[]>(`/grades/student/${studentId}`)
      .pipe(map(res => res.data));
  }

  /** GET /api/grades/evaluation/:evaluationId */
  getByEvaluation(evaluationId: number): Observable<GradeResponse[]> {
    return this.api.get<GradeResponse[]>(`/grades/evaluation/${evaluationId}`)
      .pipe(map(res => res.data));
  }

  /** POST /api/grades */
  create(body: GradeRequest): Observable<GradeResponse> {
    return this.api.post<GradeResponse>('/grades', body)
      .pipe(map(res => res.data));
  }

  /** PUT /api/grades/:id */
  update(id: number, body: GradeRequest): Observable<GradeResponse> {
    return this.api.put<GradeResponse>(`/grades/${id}`, body)
      .pipe(map(res => res.data));
  }

  /** DELETE /api/grades/:id */
  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/grades/${id}`)
      .pipe(map(() => undefined));
  }

  // ── Saisie groupée par évaluation ────────────

  /** GET /api/evaluations/:evaluationId/grades */
  getByEvaluationGrouped(evaluationId: number): Observable<GradeResponse[]> {
    return this.api.get<GradeResponse[]>(`/evaluations/${evaluationId}/grades`)
      .pipe(map(res => res.data));
  }

  /**
   * POST /api/evaluations/:evaluationId/grades
   * Saisie en masse avec UPSERT automatique.
   * Si un élève a déjà une note → elle est mise à jour.
   * Sinon → nouvelle note créée.
   */
  bulkUpsert(evaluationId: number, body: BulkGradesRequest): Observable<GradeResponse[]> {
    return this.api.post<GradeResponse[]>(`/evaluations/${evaluationId}/grades`, body)
      .pipe(map(res => res.data));
  }
}
```

### 9.3 Endpoints

#### Notes individuelles `/api/grades`

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/grades` | Toutes les notes |
| `GET` | `/api/grades/{id}` | Détail |
| `GET` | `/api/grades/student/{studentId}` | Notes d'un élève |
| `GET` | `/api/grades/evaluation/{evaluationId}` | Notes d'une évaluation |
| `POST` | `/api/grades` | Créer une note |
| `PUT` | `/api/grades/{id}` | Modifier |
| `DELETE` | `/api/grades/{id}` | Supprimer |

#### Saisie groupée `/api/evaluations/{id}/grades`

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/evaluations/{evaluationId}/grades` | Lister les notes |
| `POST` | `/api/evaluations/{evaluationId}/grades` | **Upsert en masse** ⭐ |

> 💡 **L'endpoint `POST /api/evaluations/{id}/grades` est le plus important** pour la saisie de notes. Il fait un upsert : crée ou met à jour automatiquement selon si l'élève a déjà été noté.

#### Règles métier sur les statuts

| Statut | Comportement dans les moyennes |
|--------|-------------------------------|
| `PRESENT` | Note prise en compte normalement |
| `ABSENT_JUSTIFIED` | **Exclu** du calcul de la moyenne |
| `ABSENT_UNJUSTIFIED` | Compté comme **0** |
| `NOT_SUBMITTED` | Compté comme **0** |

---

## 10. Module Moyennes — `/api/grades/average`

### 10.1 Interfaces TypeScript

```typescript
// src/app/models/average.model.ts

/** Réponse calcul de moyenne (AverageResponse interne) */
export interface AverageResponse {
  rule: string;               // "C" (Coefficient)
  weightedAverage: number;    // Moyenne pondérée sur 20
  totalWeighted: number;      // Somme pondérée
  totalCoefficient: number;   // Somme des coefficients
}

/** Réponse dashboard classe (StudentAverageDto.java) */
export interface StudentAverageResponse {
  studentId: number;
  firstName: string;
  lastName: string;
  annualAverage: number;        // Moyenne annuelle sur 20
  periodAverage: number | null; // Moyenne de la période (null si non demandée)
  totalGrades: number;          // Nombre de notes
}
```

### 10.2 Service Angular

```typescript
// src/app/services/grade-average.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { AverageResponse, StudentAverageResponse } from '../models/average.model';

@Injectable({ providedIn: 'root' })
export class GradeAverageService {
  constructor(private api: ApiService) {}

  /** GET /api/grades/average/student/:studentId/classroom/:classroomId
   *  Moyenne annuelle pondérée d'un élève dans une classe */
  getStudentAnnualAverage(studentId: number, classroomId: number, rule = 'C'): Observable<AverageResponse> {
    return this.api.get<AverageResponse>(
      `/grades/average/student/${studentId}/classroom/${classroomId}?rule=${rule}`
    ).pipe(map(res => res.data));
  }

  /** GET /api/grades/average/student/:studentId/classroom/:classroomId/period/:periodId
   *  Moyenne d'une période pour un élève */
  getStudentPeriodAverage(studentId: number, classroomId: number, periodId: number, rule = 'C'): Observable<AverageResponse> {
    return this.api.get<AverageResponse>(
      `/grades/average/student/${studentId}/classroom/${classroomId}/period/${periodId}?rule=${rule}`
    ).pipe(map(res => res.data));
  }

  /** GET /api/grades/average/classroom/:classroomId
   *  Moyenne générale annuelle de toute la classe */
  getClassAnnualAverage(classroomId: number, rule = 'C'): Observable<AverageResponse> {
    return this.api.get<AverageResponse>(
      `/grades/average/classroom/${classroomId}?rule=${rule}`
    ).pipe(map(res => res.data));
  }

  /** GET /api/grades/average/classroom/:classroomId/period/:periodId */
  getClassPeriodAverage(classroomId: number, periodId: number, rule = 'C'): Observable<AverageResponse> {
    return this.api.get<AverageResponse>(
      `/grades/average/classroom/${classroomId}/period/${periodId}?rule=${rule}`
    ).pipe(map(res => res.data));
  }

  /**
   * GET /api/grades/average/classroom/:classroomId/dashboard
   * Dashboard : liste tous les élèves + leurs moyennes annuelle et périodique.
   * @param periodId  Optionnel — ID de la période pour `periodAverage`
   * @param rule      Règle de calcul, défaut "C"
   */
  getClassDashboard(classroomId: number, periodId?: number, rule = 'C'): Observable<StudentAverageResponse[]> {
    let url = `/grades/average/classroom/${classroomId}/dashboard?rule=${rule}`;
    if (periodId) url += `&periodId=${periodId}`;
    return this.api.get<StudentAverageResponse[]>(url)
      .pipe(map(res => res.data));
  }
}
```

### 10.3 Endpoints

| Méthode | URL | Query params | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/grades/average/student/{studentId}/classroom/{classroomId}` | `rule=C` | Moyenne annuelle élève |
| `GET` | `/api/grades/average/student/{studentId}/classroom/{classroomId}/period/{periodId}` | `rule=C` | Moyenne période élève |
| `GET` | `/api/grades/average/classroom/{classroomId}` | `rule=C` | Moyenne annuelle classe |
| `GET` | `/api/grades/average/classroom/{classroomId}/period/{periodId}` | `rule=C` | Moyenne période classe |
| `GET` | `/api/grades/average/classroom/{classroomId}/dashboard` | `periodId`, `rule=C` | Dashboard élèves |

> 💡 La moyenne est toujours **normalisée sur 20**, peu importe le `maxValue` de l'évaluation.

---

## 11. Gestion des erreurs

### 11.1 Intercepteur d'erreurs global

```typescript
// src/app/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          localStorage.removeItem('klaso_token');
          router.navigate(['/login']);
          break;
        case 403:
          console.error('Accès refusé');
          break;
        case 404:
          console.error('Ressource non trouvée:', error.error?.message);
          break;
        case 500:
          console.error('Erreur serveur');
          break;
      }
      return throwError(() => error);
    })
  );
};
```

#### Enregistrer les deux intercepteurs

```typescript
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

### 11.2 Codes d'erreur retournés par le backend

| Code | Signification |
|------|--------------|
| `200` | Succès GET/PUT/DELETE |
| `201` | Ressource créée (POST) |
| `400` | Données invalides |
| `401` | Token manquant ou expiré |
| `403` | Rôle insuffisant |
| `404` | Ressource non trouvée |
| `500` | Erreur serveur interne |

---

## 12. Hiérarchie des données

```
Utilisateur (JWT)
  │
  └── Establishment (établissement)
       ├── Period (trimestre T1/T2/T3 ou semestre S1/S2)
       │     └── [lié aux évaluations]
       │
       └── Classroom (1 classe = 1 matière + 1 niveau)
             ├── Student (élève) [isActive = true pour les actifs]
             └── Evaluation (devoir) [lié à classroom + period]
                   └── Grade (1 grade = 1 élève × 1 évaluation)
```

### Flux typique d'intégration

```
1. POST /api/auth/login            → JWT
2. POST /api/establishments        → établissement (+ périodes auto-créées)
3. GET  /api/periods/establishment/:id → récupérer les périodes créées
4. POST /api/classrooms            → créer une classe
5. POST /api/students              → inscrire des élèves dans la classe
6. POST /api/evaluations           → créer un devoir (lié période + classe)
7. GET  /api/students/classroom/:id → récupérer la liste des élèves
8. POST /api/evaluations/:id/grades → saisir les notes en masse (upsert)
9. GET  /api/grades/average/classroom/:id/dashboard → voir le bulletin de classe
```

---

## 13. Points d'attention importants

| # | Point | Détail |
|---|-------|--------|
| 1 | **Port backend** | `8081` (pas 8080) |
| 2 | **CORS** | Configuré pour accepter `*` — aucune config Angular nécessaire |
| 3 | **Format dates** | Envoyer en `YYYY-MM-DD` (ex: `"2024-10-15"`) |
| 4 | **Format timestamps** | Reçus en ISO 8601 (ex: `"2024-10-15T10:30:00Z"`) |
| 5 | **JWT dans `data`** | Sur `/api/auth/login`, `data` est un **string** (pas un objet) |
| 6 | **Upsert notes** | `POST /api/evaluations/{id}/grades` crée ou met à jour — parfait pour un formulaire de saisie |
| 7 | **Périodes auto** | Créées automatiquement à la création de l'établissement — ne pas recréer manuellement |
| 8 | **Absent justifié** | `ABSENT_JUSTIFIED` **exclut** l'élève du calcul (ne compte pas comme 0) |
| 9 | **StudentController** | Pas de `@RolesAllowed` global — les routes sont accessibles sans rôle (le JWT suffit via l'intercepteur) |
| 10 | **`isActive`** | Le dashboard (`/dashboard`) ne retourne que les élèves avec `isActive = true` |
