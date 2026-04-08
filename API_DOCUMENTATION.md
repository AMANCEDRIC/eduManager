# 📘 Klaso Backend — Documentation API pour intégration Angular

> **Base URL** : `http://localhost:8081`
> **Format** : Toutes les réponses suivent le wrapper `ApiResponse<T>`
> **Auth** : JWT Bearer Token (header `Authorization: Bearer <token>`)

---

## Format de réponse global

Toutes les réponses sont enveloppées dans un `ApiResponse<T>` :

```json
{
  "status": 200,
  "message": "Description du résultat",
  "data": { ... }
}
```

### Interface Angular correspondante

```typescript
// models/api-response.model.ts
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
```

---

## 1. 🔐 Authentification (`/api/auth`)

### Interface Angular

```typescript
// models/auth.model.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: string;           // "TEACHER" (défaut) | "ADMIN"
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;            // "TEACHER" par défaut
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

### Endpoints

#### `POST /api/auth/register`
Créer un compte utilisateur + account.

**Request Body :**
```json
{
  "email": "prof@klaso.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "password": "motdepasse123",
  "role": "TEACHER"
}
```

**Response (201) :**
```json
{
  "status": 201,
  "message": "Utilisateur créé",
  "data": {
    "id": 1,
    "email": "prof@klaso.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "TEACHER"
  }
}
```

---

#### `POST /api/auth/login`
Authentifier et recevoir un JWT.

**Request Body :**
```json
{
  "email": "prof@klaso.com",
  "password": "motdepasse123"
}
```

**Response (200) :**
```json
{
  "status": 200,
  "message": "Connexion réussie",
  "data": "eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJrbGFzbyIsInVwbiI6InByb2..."
}
```

> ⚠️ Le `data` est directement le **token JWT** (string). Stocker dans `localStorage` et envoyer dans le header `Authorization: Bearer <token>`.

**JWT Claims :**
| Claim | Description |
|---|---|
| `id` | ID de l'utilisateur |
| `email` | Email |
| `name` | Prénom + Nom |
| `role` | Code du profil (ex: `TEACHER`) |

---

#### `GET /api/auth/me` 🔒
Récupérer le profil de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Response (200) :**
```json
{
  "status": 200,
  "message": "Infos utilisateur",
  "data": {
    "id": 1,
    "email": "prof@klaso.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

---

#### `POST /api/auth/forgot-password`
Envoyer un email de réinitialisation.

**Request Body :**
```json
{ "email": "prof@klaso.com" }
```

**Response (200) :**
```json
{
  "status": 200,
  "message": "Email de réinitialisation envoyé",
  "data": null
}
```

---

#### `POST /api/auth/reset-password`
Réinitialiser le mot de passe avec le token reçu par email.

**Request Body :**
```json
{
  "token": "uuid-du-token",
  "newPassword": "nouveauMotDePasse"
}
```

**Response (200) :**
```json
{
  "status": 200,
  "message": "Mot de passe réinitialisé avec succès",
  "data": null
}
```

---

## 2. 🏫 Établissements (`/api/establishments`)

### Interface Angular

```typescript
// models/establishment.model.ts
export interface Establishment {
  id?: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  periodType?: string;       // "TRIMESTRE" | "SEMESTRE"
  academicYear?: string;     // "2024-2025"
  createdAt?: string;
  updatedAt?: string;
}
```

### Endpoints

| Méthode | URL | Description | Auth |
|---|---|---|---|
| `GET` | `/api/establishments` | Lister tous | Non |
| `GET` | `/api/establishments/{id}` | Détail par ID | Non |
| `POST` | `/api/establishments` | Créer | Non |
| `PUT` | `/api/establishments/{id}` | Modifier | Non |
| `DELETE` | `/api/establishments/{id}` | Supprimer | Non |

#### `POST /api/establishments`

**Request Body :**
```json
{
  "name": "Collège Victor Hugo",
  "address": "123 rue de la République",
  "city": "Abidjan",
  "postalCode": "75001",
  "country": "Côte d'Ivoire",
  "periodType": "TRIMESTRE",
  "academicYear": "2024-2025"
}
```

**Response (201) :**
```json
{
  "status": 201,
  "message": "Établissement créé avec succès",
  "data": {
    "id": 1,
    "name": "Collège Victor Hugo",
    "address": "123 rue de la République",
    "city": "Abidjan",
    "postalCode": "75001",
    "country": "Côte d'Ivoire",
    "periodType": "TRIMESTRE",
    "academicYear": "2024-2025",
    "createdAt": "2024-10-15T10:30:00Z",
    "updatedAt": "2024-10-15T10:30:00Z"
  }
}
```

---

## 3. 📅 Périodes (`/api/periods`)

> ⚠️ **Note** : Le PeriodController n'existe pas encore côté backend. Il faudra le créer pour exposer ces endpoints. Les modèles et la base de données sont prêts.

### Interface Angular (à préparer)

```typescript
// models/period.model.ts
export interface Period {
  id?: number;
  establishmentId: number;
  name: string;              // "Trimestre 1", "Semestre 2"
  type: string;              // "TRIMESTRE" | "SEMESTRE"
  number: number;            // 1, 2, 3
  startDate: string;         // "2024-09-01"
  endDate: string;           // "2024-12-20"
  academicYear: string;      // "2024-2025"
  createdAt?: string;
  updatedAt?: string;
}
```

### Endpoints à venir

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/periods/establishment/{establishmentId}` | Périodes d'un établissement |
| `POST` | `/api/periods` | Créer une période |
| `PUT` | `/api/periods/{id}` | Modifier |
| `DELETE` | `/api/periods/{id}` | Supprimer |

---

## 4. 🏛️ Classes (`/api/classrooms`)

### Interface Angular

```typescript
// models/classroom.model.ts
export interface ClassroomCreate {
  name: string;
  level: string;
  subject: string;
  academicYear: string;
  establishmentId: number;
}

export interface ClassroomResponse {
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
```

### Endpoints

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/classrooms` | Lister toutes les classes |
| `GET` | `/api/classrooms/{id}` | Détail d'une classe |
| `GET` | `/api/classrooms/establishment/{establishmentId}` | Classes d'un établissement |
| `POST` | `/api/classrooms` | Créer une classe |
| `PUT` | `/api/classrooms/{id}` | Modifier |
| `DELETE` | `/api/classrooms/{id}` | Supprimer |

#### `POST /api/classrooms`

**Request Body :**
```json
{
  "name": "6ème A",
  "level": "6ème",
  "subject": "Mathématiques",
  "academicYear": "2024-2025",
  "establishmentId": 1
}
```

**Response (201) :**
```json
{
  "status": 201,
  "message": "Classe créée",
  "data": {
    "id": 1,
    "name": "6ème A",
    "level": "6ème",
    "subject": "Mathématiques",
    "academicYear": "2024-2025",
    "establishmentId": 1,
    "establishmentName": "Collège Victor Hugo",
    "createdAt": "2024-10-15T10:30:00Z",
    "updatedAt": "2024-10-15T10:30:00Z"
  }
}
```

---

## 5. 👩‍🎓 Élèves (`/api/students`)

### Interface Angular

```typescript
// models/student.model.ts
export interface StudentCreate {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;      // "2012-03-15"
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
  dateOfBirth: string;
  email: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  classroomName: string;
  classroomLevel: string;
  establishmentName: string;
}
```

### Endpoints

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/students` | Lister tous les élèves |
| `GET` | `/api/students/{id}` | Détail d'un élève |
| `GET` | `/api/students/classroom/{classroomId}` | Élèves d'une classe |
| `POST` | `/api/students` | Créer un élève |
| `PUT` | `/api/students/{id}` | Modifier |
| `DELETE` | `/api/students/{id}` | Supprimer |

#### `POST /api/students`

**Request Body :**
```json
{
  "firstName": "Marie",
  "lastName": "Martin",
  "dateOfBirth": "2012-03-15",
  "email": "marie.martin@email.com",
  "parentName": "Pierre Martin",
  "parentEmail": "pierre.martin@email.com",
  "parentPhone": "0123456789",
  "classroomId": 1
}
```

**Response (201) :**
```json
{
  "status": 201,
  "message": "Élève créé avec succès",
  "data": {
    "id": 1,
    "firstName": "Marie",
    "lastName": "Martin",
    "dateOfBirth": "2012-03-15",
    "email": "marie.martin@email.com",
    "parentName": "Pierre Martin",
    "parentEmail": "pierre.martin@email.com",
    "parentPhone": "0123456789",
    "classroomName": "6ème A",
    "classroomLevel": "6ème",
    "establishmentName": "Collège Victor Hugo"
  }
}
```

---

## 6. 📝 Évaluations (`/api/evaluations`)

### Interface Angular

```typescript
// models/evaluation.model.ts
export interface EvaluationCreate {
  classroomId: number;
  periodId?: number;          // Lien vers la période
  gradeType: string;          // "TEST", "EXAM", "HOMEWORK", etc.
  maxValue: number;           // 20, 10, 100...
  coefficient: number;        // 1, 2, 3...
  evaluationDate: string;     // "2024-10-15"
  description?: string;
}

export interface EvaluationResponse {
  id: number;
  classroomId: number;
  periodId: number | null;
  gradeType: string;
  maxValue: number;
  coefficient: number;
  evaluationDate: string;
  description: string;
}
```

### Endpoints

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/evaluations/{id}` | Détail d'une évaluation |
| `GET` | `/api/evaluations/classroom/{classroomId}` | Évaluations d'une classe |
| `POST` | `/api/evaluations` | Créer une évaluation |

#### `POST /api/evaluations`

**Request Body :**
```json
{
  "classroomId": 1,
  "periodId": 1,
  "gradeType": "TEST",
  "maxValue": 20,
  "coefficient": 1,
  "evaluationDate": "2024-10-15",
  "description": "Contrôle sur les fractions"
}
```

**Response (201) :**
```json
{
  "status": 201,
  "message": "Évaluation créée",
  "data": {
    "id": 1,
    "classroomId": 1,
    "periodId": 1,
    "gradeType": "TEST",
    "maxValue": 20,
    "coefficient": 1,
    "evaluationDate": "2024-10-15",
    "description": "Contrôle sur les fractions"
  }
}
```

---

## 7. 📊 Notes (`/api/grades` et `/api/evaluations/{id}/grades`)

### Interface Angular

```typescript
// models/grade.model.ts
export interface GradeCreate {
  value?: number;
  studentId: number;
  evaluationId: number;
  status?: string;           // "PRESENT" | "ABSENT_JUSTIFIED" | "ABSENT_UNJUSTIFIED" | "NOT_SUBMITTED"
  isAbsent?: boolean;
  appreciation?: string;
}

export interface GradeResponse {
  id: number;
  value: number | null;
  isAbsent: boolean;
  appreciation: string | null;
  status: string;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  evaluationId: number;
}

// Pour la saisie groupée
export interface BulkGradesRequest {
  grades: BulkGradeItem[];
}

export interface BulkGradeItem {
  studentId: number;
  value?: number;
  status: string;
  isAbsent?: boolean;
  appreciation?: string;
}
```

### Endpoints — CRUD notes individuelles

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/grades` | Toutes les notes |
| `GET` | `/api/grades/{id}` | Détail d'une note |
| `GET` | `/api/grades/student/{studentId}` | Notes d'un élève |
| `GET` | `/api/grades/evaluation/{evaluationId}` | Notes d'une évaluation |
| `POST` | `/api/grades` | Créer une note |
| `PUT` | `/api/grades/{id}` | Modifier une note |
| `DELETE` | `/api/grades/{id}` | Supprimer une note |

#### `POST /api/grades`

**Request Body :**
```json
{
  "value": 15.5,
  "studentId": 1,
  "evaluationId": 1,
  "status": "PRESENT",
  "isAbsent": false,
  "appreciation": "Bon travail"
}
```

### Endpoints — Saisie groupée par évaluation

#### `GET /api/evaluations/{evaluationId}/grades`
Lister toutes les notes d'une évaluation.

#### `POST /api/evaluations/{evaluationId}/grades`
**Saisie/mise à jour en masse** — L'endpoint le plus important pour la saisie de notes.

**Request Body :**
```json
{
  "grades": [
    {
      "studentId": 1,
      "value": 15.5,
      "status": "PRESENT",
      "isAbsent": false,
      "appreciation": "Bon travail"
    },
    {
      "studentId": 2,
      "value": null,
      "status": "ABSENT_JUSTIFIED",
      "isAbsent": true,
      "appreciation": null
    },
    {
      "studentId": 3,
      "value": 12.0,
      "status": "PRESENT",
      "isAbsent": false,
      "appreciation": "Peut mieux faire"
    }
  ]
}
```

**Response (200) :**
```json
{
  "status": 200,
  "message": "Notes enregistrées",
  "data": [
    {
      "id": 1,
      "value": 15.5,
      "isAbsent": false,
      "appreciation": "Bon travail",
      "status": "PRESENT",
      "studentId": 1,
      "studentFirstName": "Marie",
      "studentLastName": "Martin",
      "evaluationId": 1
    },
    ...
  ]
}
```

> 💡 **Upsert** : Si l'élève a déjà une note pour cette évaluation, elle est mise à jour. Sinon, une nouvelle est créée.

---

## 8. 📈 Moyennes (`/api/grades/average`)

### Interface Angular

```typescript
// models/average.model.ts
export interface AverageResponse {
  rule: string;
  weightedAverage: number;
  totalWeighted: number;
  totalCoefficient: number;
}
```

### Endpoint

#### `GET /api/grades/average/student/{studentId}/classroom/{classroomId}`
Calcul de la moyenne pondérée d'un élève dans une classe.

**Query Params :**
| Param | Default | Description |
|---|---|---|
| `rule` | `C` | Règle de calcul (réservé pour évolution) |

**Response (200) :**
```json
{
  "status": 200,
  "message": "Moyenne calculée",
  "data": {
    "rule": "C",
    "weightedAverage": 14.25,
    "totalWeighted": 42.75,
    "totalCoefficient": 3
  }
}
```

> 💡 La moyenne est normalisée sur 20. Les `ABSENT_JUSTIFIED` sont exclus, les `ABSENT_UNJUSTIFIED` comptent comme 0.

---

## 🔧 Configuration Angular

### Service HTTP de base

```typescript
// services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('klaso_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  get<T>(path: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(
      `${this.baseUrl}${path}`, 
      { headers: this.getHeaders() }
    );
  }

  post<T>(path: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(
      `${this.baseUrl}${path}`, 
      body, 
      { headers: this.getHeaders() }
    );
  }

  put<T>(path: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(
      `${this.baseUrl}${path}`, 
      body, 
      { headers: this.getHeaders() }
    );
  }

  delete<T>(path: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(
      `${this.baseUrl}${path}`, 
      { headers: this.getHeaders() }
    );
  }
}
```

### Interceptor JWT

```typescript
// interceptors/auth.interceptor.ts
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

### Exemple de service spécialisé

```typescript
// services/evaluation.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { EvaluationResponse, EvaluationCreate } from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationService {

  constructor(private api: ApiService) {}

  getByClassroom(classroomId: number): Observable<EvaluationResponse[]> {
    return this.api.get<EvaluationResponse[]>(
      `/evaluations/classroom/${classroomId}`
    ).pipe(map(res => res.data));
  }

  getById(id: number): Observable<EvaluationResponse> {
    return this.api.get<EvaluationResponse>(
      `/evaluations/${id}`
    ).pipe(map(res => res.data));
  }

  create(evaluation: EvaluationCreate): Observable<EvaluationResponse> {
    return this.api.post<EvaluationResponse>(
      '/evaluations', evaluation
    ).pipe(map(res => res.data));
  }
}
```

---

## 🗺️ Hiérarchie des données (rappel)

```
Authentification
  POST /api/auth/register → Créer user + account
  POST /api/auth/login    → Obtenir JWT

Données métier (avec JWT)
  └── Establishment (établissement)
      ├── Period (trimestre/semestre)
      └── Classroom (classe = 1 matière)
          ├── Student (élève)
          └── Evaluation (lié à classroom + period)
              └── Grade (note = 1 par élève par évaluation)
```

---

## ⚠️ Points d'attention pour le front

1. **CORS** : Déjà configuré côté backend pour accepter `*`. Aucune config nécessaire.
2. **Port** : Le backend tourne sur `8081` (pas 8080).
3. **Dates** : Envoyer au format `YYYY-MM-DD` (ex: `2024-10-15`).
4. **Timestamps** : Retournés au format ISO 8601 (ex: `2024-10-15T10:30:00Z`).
5. **PeriodController** : Pas encore créé côté backend. À implémenter quand le front en aura besoin.
6. **Statuts de notes** : `PRESENT`, `ABSENT_JUSTIFIED`, `ABSENT_UNJUSTIFIED`, `NOT_SUBMITTED`.
