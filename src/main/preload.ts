import { contextBridge, ipcRenderer } from 'electron';
import { Course } from '../shared/types';

interface CourseAPI {
  listCourses: () => Promise<{
    success: boolean;
    courses?: Course[];
    error?: string;
  }>;
  getCourseContent: (courseId: string) => Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }>;
}

// Exponer el API
contextBridge.exposeInMainWorld('courseAPI', {
  listCourses: () => ipcRenderer.invoke('course:list'),
  getCourseContent: (courseId: string) =>
    ipcRenderer.invoke('course:getContent', courseId),
} as CourseAPI);

// Declaración global para TypeScript
declare global {
  interface Window {
    courseAPI: CourseAPI;
  }
}
