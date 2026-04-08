import { Injectable, signal, computed } from '@angular/core';
import { Establishment, Class, Student, Period, Evaluation, Grade, AttendanceRecord, AttendanceStatus } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SchoolDataService {
  private readonly STORAGE_KEY = 'school_manager_data';

  // Signals for state management
  establishments = signal<Establishment[]>([]);
  classes = signal<Class[]>([]);
  students = signal<Student[]>([]);
  periods = signal<Period[]>([]);
  evaluations = signal<Evaluation[]>([]);
  grades = signal<Grade[]>([]);
  attendance = signal<AttendanceRecord[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  // --- Persistence ---
  private loadFromStorage() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      this.establishments.set(parsed.establishments || []);
      this.classes.set(parsed.classes || []);
      this.students.set(parsed.students || []);
      this.periods.set(parsed.periods || []);
      this.evaluations.set(parsed.evaluations || []);
      this.grades.set(parsed.grades || []);
      this.attendance.set(parsed.attendance || []);
    }
  }

  private saveToStorage() {
    const data = {
      establishments: this.establishments(),
      classes: this.classes(),
      students: this.students(),
      periods: this.periods(),
      evaluations: this.evaluations(),
      grades: this.grades(),
      attendance: this.attendance()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // --- Establishments ---
  addEstablishment(name: string, periodType: 'trimester' | 'semester') {
    const newEstab: Establishment = {
      id: crypto.randomUUID(),
      name,
      periodType
    };
    this.establishments.update(e => [...e, newEstab]);
    
    // Create default periods
    const count = periodType === 'trimester' ? 3 : 2;
    const now = new Date();
    for (let i = 1; i <= count; i++) {
        const periodName = periodType === 'trimester' ? `Trimestre ${i}` : `Semestre ${i}`;
        // Simple default dates (should be configurable later)
        const start = new Date(now.getFullYear(), (i-1) * (12/count), 1);
        const end = new Date(now.getFullYear(), i * (12/count), 0);
        this.addPeriod(newEstab.id, periodName, start, end);
    }

    this.saveToStorage();
    return newEstab;
  }

  updateEstablishment(id: string, name: string, periodType: 'trimester' | 'semester') {
    this.establishments.update(es => es.map(e => e.id === id ? { ...e, name, periodType } : e));
    this.saveToStorage();
  }

  deleteEstablishment(id: string) {
    this.establishments.update(es => es.filter(e => e.id !== id));
    // Cascade delete classes
    const classesToDelete = this.classes().filter(c => c.establishmentId === id);
    classesToDelete.forEach(c => this.deleteClass(c.id));
    this.saveToStorage();
  }

  // --- Classes ---
  addClass(establishmentId: string, name: string, subject: string) {
    const newClass: Class = {
      id: crypto.randomUUID(),
      establishmentId,
      name,
      subject
    };
    this.classes.update(cs => [...cs, newClass]);
    this.saveToStorage();
    return newClass;
  }

  updateClass(id: string, name: string, subject: string) {
    this.classes.update(cs => cs.map(c => c.id === id ? { ...c, name, subject } : c));
    this.saveToStorage();
  }

  deleteClass(id: string) {
    this.classes.update(cs => cs.filter(c => c.id !== id));
    // Cascade delete students
    this.students.update(ss => ss.filter(s => s.classId !== id));
    this.saveToStorage();
  }

  // --- Students ---
  addStudent(classId: string, firstName: string, lastName: string, gender: 'M' | 'F') {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      classId,
      firstName,
      lastName,
      gender
    };
    this.students.update(ss => [...ss, newStudent]);
    this.saveToStorage();
    return newStudent;
  }

  importStudents(classId: string, studentsData: { firstName: string, lastName: string, gender: 'M' | 'F' }[]) {
    const newStudents: Student[] = studentsData.map(s => ({
      ...s,
      id: crypto.randomUUID(),
      classId
    }));
    
    this.students.update(ss => [...ss, ...newStudents]);
    this.saveToStorage();
    return newStudents;
  }

  updateStudent(id: string, firstName: string, lastName: string, gender: 'M' | 'F') {
    this.students.update(ss => ss.map(s => s.id === id ? { ...s, firstName, lastName, gender } : s));
    this.saveToStorage();
  }

  deleteStudent(id: string) {
    this.students.update(ss => ss.filter(s => s.id !== id));
    // Cascade delete grades
    this.grades.update(gs => gs.filter(g => g.studentId !== id));
    this.saveToStorage();
  }

  // --- Periods ---
  addPeriod(establishmentId: string, name: string, startDate: Date, endDate: Date) {
    const newPeriod: Period = {
      id: crypto.randomUUID(),
      establishmentId,
      name,
      startDate,
      endDate
    };
    this.periods.update(ps => [...ps, newPeriod]);
    this.saveToStorage();
    return newPeriod;
  }

  // --- Evaluations ---
  addEvaluation(classId: string, periodId: string, name: string, type: string, maxGrade: number, date: Date, coefficient: number = 1) {
    const newEval: Evaluation = {
        id: crypto.randomUUID(),
        classId,
        periodId,
        name,
        type,
        maxGrade,
        date,
        coefficient
    };
    this.evaluations.update(evs => [...evs, newEval]);
    this.saveToStorage();
    return newEval;
  }

  // --- Grades ---
  setGrade(evaluationId: string, studentId: string, value: number) {
    this.grades.update(gs => {
      const existingIdx = gs.findIndex(g => g.evaluationId === evaluationId && g.studentId === studentId);
      if (existingIdx >= 0) {
        const newGrades = [...gs];
        newGrades[existingIdx] = { ...newGrades[existingIdx], value };
        return newGrades;
      }
      return [...gs, { id: crypto.randomUUID(), evaluationId, studentId, value }];
    });
    this.saveToStorage();
  }

  // --- Derived Data (Calculations) ---
  
  getStudentAverageForPeriod(studentId: string, periodId: string) {
    const studentGrades = this.grades().filter(g => g.studentId === studentId);
    const periodEvals = this.evaluations().filter(e => e.periodId === periodId);
    
    let totalScore = 0;
    let totalCoef = 0;

    periodEvals.forEach(evalu => {
      const grade = studentGrades.find(g => g.evaluationId === evalu.id);
      if (grade) {
          // Normalize to 20 for calculation consistency if needed, or keep as is.
          // Let's assume user wants weighted average.
          const normalizedValue = (grade.value / evalu.maxGrade) * 20;
          totalScore += normalizedValue * evalu.coefficient;
          totalCoef += evalu.coefficient;
      }
    });

    return totalCoef === 0 ? null : totalScore / totalCoef;
  }

  getStudentAnnualAverage(studentId: string) {
    // Average of period averages? Or weighted average of all grades?
    // Let's do average of periods.
    const student = this.students().find(s => s.id === studentId);
    if (!student) return null;

    const classroom = this.classes().find(c => c.id === student.classId);
    if (!classroom) return null;

    const periods = this.periods().filter(p => p.establishmentId === classroom.establishmentId);
    
    let totalAverage = 0;
    let count = 0;

    periods.forEach(p => {
      const avg = this.getStudentAverageForPeriod(studentId, p.id);
      if (avg !== null) {
        totalAverage += avg;
        count++;
      }
    });

    return count === 0 ? null : totalAverage / count;
  }

  getClassAverageForEvaluation(evaluationId: string) {
    const evalGrades = this.grades().filter(g => g.evaluationId === evaluationId);
    if (evalGrades.length === 0) return null;
    
    const evalu = this.evaluations().find(e => e.id === evaluationId);
    if (!evalu) return null;

    const total = evalGrades.reduce((acc, g) => acc + (g.value / evalu.maxGrade) * 20, 0);
    return total / evalGrades.length;
  }

  // --- Attendance ---
  markAttendance(classId: string, studentId: string, date: string, status: AttendanceStatus, comment?: string) {
    this.attendance.update(records => {
      // Remove existing record for same day/student if any
      const filtered = records.filter(r => !(r.studentId === studentId && r.date === date));
      
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        studentId,
        classId,
        date,
        status,
        comment
      };
      
      return [...filtered, newRecord];
    });
    this.saveToStorage();
  }

  getStudentAttendance(studentId: string) {
    return this.attendance().filter(r => r.studentId === studentId);
  }
}
