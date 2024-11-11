export interface CourseFile {
  id: string;
  path: string;
  type: 'html' | 'pdf';
}

export interface Course {
  id: string;
  title: string;
  filePath: string;
  maxAccess: number;
  expirationDate: string;
  accessCount: number;
}

export interface StoreSchema {
  courses: Course[];
}
