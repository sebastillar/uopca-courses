import Store from "electron-store"
import { app } from "electron"
import * as path from "path"
import * as fs from "fs"
import { Course, StoreSchema } from "../../shared/types"

export class CourseManager {
  private store: Store<StoreSchema>
  private readonly coursesPath: string

  constructor() {
    this.store = new Store<StoreSchema>({
      name: "courses-db",
      defaults: {
        courses: [] as Course[],
      },
    })

    // Obtener la ruta base de la aplicación
    const appPath = app.getAppPath()
    this.coursesPath = path.join(appPath, "courses")

    console.log("Courses path:", this.coursesPath)

    this.initializeConfig()
  }

  private initializeConfig() {
    const configPath = path.join(this.coursesPath, "config.json")
    console.log("Loading config from:", configPath)

    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, "utf8")
        const config = JSON.parse(configContent) as { courses: Course[] }
        this.store.set("courses", config.courses)
        console.log("Loaded courses:", config.courses)
      } catch (error) {
        console.error("Error loading config:", error)
      }
    } else {
      console.log("Config file not found at:", configPath)
    }
  }

  getCourses(): Course[] {
    const courses = this.store.get("courses")
    console.log("Retrieved courses:", courses)
    return courses
  }

  async canAccessCourse(courseId: string): Promise<{
    canAccess: boolean
    reason?: string
  }> {
    const courses = this.getCourses()
    const course = courses.find((c) => c.id === courseId)

    if (!course) {
      return { canAccess: false, reason: "Curso no encontrado" }
    }

    if (new Date() > new Date(course.expirationDate)) {
      return { canAccess: false, reason: "El curso ha expirado" }
    }

    if (course.accessCount >= course.maxAccess) {
      return {
        canAccess: false,
        reason: "Has alcanzado el límite de visualizaciones",
      }
    }

    return { canAccess: true }
  }

  async readCourseContent(courseId: string): Promise<{
    course?: Course
    error?: string
  }> {
    try {
      const accessCheck = await this.canAccessCourse(courseId)
      if (!accessCheck.canAccess) {
        return { error: accessCheck.reason }
      }

      const course = this.getCourses().find((c) => c.id === courseId)
      if (!course) {
        return { error: "Curso no encontrado" }
      }

      const filePath = path.join(this.coursesPath, course.filePath)
      console.log("Reading course file from:", filePath)

      if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath)
        return { error: "Archivo del curso no encontrado" }
      }

      // Incrementar contador de accesos
      course.accessCount++
      const courses = this.getCourses()
      const courseIndex = courses.findIndex((c) => c.id === courseId)
      courses[courseIndex] = course
      this.store.set("courses", courses)

      // Leer y devolver contenido
      return { course }
      // const content = fs.readFileSync(filePath, 'utf8');
      // return { content };
    } catch (error) {
      console.error("Error reading course:", error)
      return { error: "Error al leer el curso" }
    }
  }

  async changeStatus(courseId: string): Promise<void> {
    const courses = this.getCourses()
    const courseIndex = courses.findIndex((c) => c.id === courseId)
    courses[courseIndex].open = !courses[courseIndex].open
    this.store.set("courses", courses)
  }

  async setWindowId(courseId: string, windowId: number): Promise<void> {
    const courses = this.getCourses()
    const courseIndex = courses.findIndex((c) => c.id === courseId)
    courses[courseIndex].windowId = windowId
    this.store.set("courses", courses)
  }
}
