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

| Claim | Description |
|---|---|
| `id` | ID de l'utilisateur |
| `email` | Email |
| `name` | Prénom + Nom |
| `groups` | Liste des rôles (ex: `["TEACHER"]`) |

> 💡 Quarkus utilise le claim standard `groups` pour valider les rôles dans `@RolesAllowed`.

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
  ownerId?: number;          // ID du compte créateur
  ownerName?: string;        // Nom complet du créateur
  createdAt?: string;
  updatedAt?: string;
}
```

### Endpoints

| Méthode | URL | Description | Auth |
|---|---|---|---|
| `GET` | `/api/establishments` | Lister tous | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/establishments/{id}` | Détail par ID | 🔒 `TEACHER`, `ADMIN` |
| `POST` | `/api/establishments` | Créer | 🔒 `TEACHER`, `ADMIN` |
| `PUT` | `/api/establishments/{id}` | Modifier | 🔒 `TEACHER`, `ADMIN` |
| `DELETE` | `/api/establishments/{id}` | Supprimer | 🔒 `TEACHER`, `ADMIN` |

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

### Interface Angular

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

### Endpoints

| Méthode | URL | Description | Auth |
|---|---|---|---|
| `GET` | `/api/periods/establishment/{establishmentId}` | Périodes d'un établissement | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/periods/{id}` | Détail d'une période | 🔒 `TEACHER`, `ADMIN` |
| `POST` | `/api/periods/establishment/{establishmentId}` | Créer une période | 🔒 `TEACHER`, `ADMIN` |
| `PUT` | `/api/periods/{id}` | Modifier | 🔒 `TEACHER`, `ADMIN` |
| `DELETE` | `/api/periods/{id}` | Supprimer | 🔒 `TEACHER`, `ADMIN` |

> 💡 **Création Automatique** : Lors de la création d'un établissement, les périodes par défaut (T1-T3 ou S1-S2) sont créées automatiquement selon le `periodType`.

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

| Méthode | URL | Description | Auth |
|---|---|---|---|
| `GET` | `/api/classrooms` | Lister toutes | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/classrooms/{id}` | Détail d'une classe | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/classrooms/establishment/{establishmentId}` | Classes d'un établissement | 🔒 `TEACHER`, `ADMIN` |
| `POST` | `/api/classrooms` | Créer une classe | 🔒 `TEACHER`, `ADMIN` |
| `PUT` | `/api/classrooms/{id}` | Modifier | 🔒 `TEACHER`, `ADMIN` |
| `DELETE` | `/api/classrooms/{id}` | Supprimer | 🔒 `TEACHER`, `ADMIN` |

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

| Méthode | URL | Description | Auth |
|---|---|---|---|
| `GET` | `/api/students` | Lister tous les élèves | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/students/{id}` | Détail d'un élève | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/students/classroom/{classroomId}` | Élèves d'une classe | 🔒 `TEACHER`, `ADMIN` |
| `POST` | `/api/students` | Créer un élève | 🔒 `TEACHER`, `ADMIN` |
| `PUT` | `/api/students/{id}` | Modifier | 🔒 `TEACHER`, `ADMIN` |
| `DELETE` | `/api/students/{id}` | Supprimer | 🔒 `TEACHER`, `ADMIN` |

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

| Méthode | URL | Description | Auth |
|---|---|---|---|
| `GET` | `/api/evaluations/{id}` | Détail d'une évaluation | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/evaluations/classroom/{classroomId}` | Évaluations d'une classe | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/evaluations/classroom/{classroomId}/period/{periodId}` | Évaluations d'une classe (période) | 🔒 `TEACHER`, `ADMIN` |
| `POST` | `/api/evaluations` | Créer une évaluation | 🔒 `TEACHER`, `ADMIN` |

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

| Méthode | URL | Description | Auth |
|---|---|---|---|
| `GET` | `/api/grades` | Toutes les notes | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/grades/{id}` | Détail d'une note | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/grades/student/{studentId}` | Notes d'un élève | 🔒 `TEACHER`, `ADMIN` |
| `GET` | `/api/grades/evaluation/{evaluationId}` | Notes d'une évaluation | 🔒 `TEACHER`, `ADMIN` |
| `POST` | `/api/grades` | Créer une note | 🔒 `TEACHER`, `ADMIN` |
| `PUT` | `/api/grades/{id}` | Modifier une note | 🔒 `TEACHER`, `ADMIN` |
| `DELETE` | `/api/grades/{id}` | Supprimer une note | 🔒 `TEACHER`, `ADMIN` |

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
Calcul de la moyenne pondérée annuelle d'un élève dans une classe.

#### `GET /api/grades/average/student/{studentId}/classroom/{classroomId}/period/{periodId}`
Calcul de la moyenne pondérée d'un élève pour une période spécifique.

#### `GET /api/grades/average/classroom/{classroomId}`
Calcul de la moyenne générale annuelle d'une classe.

#### `GET /api/grades/average/classroom/{classroomId}/period/{periodId}`
Calcul de la moyenne générale d'une classe pour une période spécifique.

#### `GET /api/grades/average/classroom/{classroomId}/dashboard`
Récupère la liste de tous les élèves de la classe avec leurs moyennes annuelle et périodique.

**Query Params :**
| Param | Default | Description |
|---|---|---|
| `periodId` | - | ID de la période pour la moyenne périodique |
| `rule` | `C` | Règle de calcul |

**Response (200) :**
```json
{
  "status": 200,
  "message": "Dashboard de classe",
  "data": [
    {
      "studentId": 1,
      "firstName": "Jean",
      "lastName": "Dupont",
      "annualAverage": 14.50,
      "periodAverage": 15.20,
      "totalGrades": 12
    },
    ...
  ]
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
5. **PeriodController** : Opérationnel. Gère les trimestres/semestres.
6. **Statuts de notes** : `PRESENT`, `ABSENT_JUSTIFIED`, `ABSENT_UNJUSTIFIED`, `NOT_SUBMITTED`.

---

## 🔒 Sécurité et Multi-tenancy

Le backend utilise une isolation stricte des données pour garantir que chaque enseignant/administrateur n'accède qu'aux données de son propre établissement.

1. **Isolation par JWT** : Chaque requête doit inclure le header `Authorization: Bearer <token>`. Le backend extrait l'utilisateur et son rôle du token.
2. **Vérification de Propriété** : Avant toute opération (Lecture, Création, Modification), les services vérifient que l'entité parente (ex: la classe ou l'école) appartient bien à l'utilisateur connecté ou que celui-ci a les droits appropriés sur l'établissement.
3. **Erreurs standardisées** :
   - `401 Unauthorized` : Token manquant ou invalide.
   - `403 Forbidden` : Tentative d'accès à une ressource appartenant à un autre établissement ou rôle insuffisant.
   - `404 Not Found` : Ressource inexistante.
   - `200/201` : Succès.

---

## 📸 Médias et Profils (Bientôt disponible)

Des endpoints d'upload pour les photos de profil (User et Student) sont en cours d'ajout. Le champ `photoUrl` sera présent dans les DTOs correspondants.
