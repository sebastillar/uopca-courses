import { app, BrowserWindow, ipcMain } from "electron"
import * as path from "path"
import { AuthService } from "./services/authService"
import { CourseManager } from "./services/courseManager"

class MainApp {
  private mainWindow: BrowserWindow | null = null
  private authService: AuthService
  private courseManager: CourseManager

  constructor() {
    this.authService = new AuthService()
    this.courseManager = new CourseManager()
  }

  async init() {
    await app.whenReady()
    this.createWindow()
    this.setupIPC()
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "preload.js"),
      },
    })

    const indexPath = path.join(__dirname, "..", "renderer", "index.html")
    console.log("Loading index from:", indexPath)

    this.mainWindow.loadFile(indexPath).catch((err) => {
      console.error("Error loading index.html:", err)
    })

    // Abrir DevTools en desarrollo
    if (process.env.NODE_ENV === "development") {
      this.mainWindow.webContents.openDevTools()
    }
  }

  private setupIPC() {
    // Listar cursos
    ipcMain.handle("course:list", () => {
      try {
        const courses = this.courseManager.getCourses()
        return { success: true, courses }
      } catch (error: unknown) {
        if (error instanceof Error) {
          return { success: false, error: error.message }
        }
        return { success: false, error: "An unknown error occurred" }
      }
    })

    // Obtener contenido del curso
    ipcMain.handle("course:getContent", async (event, courseId) => {
      try {
        const result = await this.courseManager.readCourseContent(courseId)
        return {
          success: !result.error,
          content: result.content,
          error: result.error,
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          return { success: false, error: error.message }
        }
        return { success: false, error: "An unknown error occurred" }
      }
    })
  }
}

new MainApp().init()
