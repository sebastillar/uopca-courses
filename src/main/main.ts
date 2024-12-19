require("dotenv").config()
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
    this.createMainWindow()
    this.setupIPC()
  }

  private createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1600,
      height: 900,
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

  private createCourseWindow(viewFilePath: string) {
    if (!this.mainWindow) {
      throw new Error("Main window is not initialized")
    }
    const choice = require("electron").dialog.showMessageBoxSync(
      this.mainWindow,
      {
        type: "question",
        buttons: ["Continuar", "Cancelar"],
        defaultId: 0,
        title: "Abrir curso",
        message: "Consumir una visualización",
        detail: "Al abrir un curso se consumirá una visualización",
      }
    )

    if (choice === 1) {
      return
    }

    const courseWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      parent: this.mainWindow ?? undefined,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "preload.js"),
      },
    })

    this.mainWindow?.webContents.send("navigation:courseOpened", {
      windowId: courseWindow.id,
    })

    const indexPath = path.join(__dirname, "..", viewFilePath)
    console.log("Loading index from:", indexPath)

    courseWindow.loadFile(indexPath).catch((err) => {
      console.error("Error loading index.html:", err)
    })

    courseWindow.on("close", (e) => {
      const choice = require("electron").dialog.showMessageBoxSync(
        courseWindow,
        {
          type: "question",
          buttons: ["Mantenerse en el curso", "Salir del curso"],
          defaultId: 0,
          title: "Salir del curso",
          message: "¿Deseas salir del curso actual?",
          detail: "Si sales del curso se terminará esta visualización",
        }
      )
      if (choice === 0) {
        e.preventDefault()
      } else {
        this.changeMainWindow("renderer/index.html")
      }
    })
  }

  private changeMainWindow(viewPath: string): void {
    const viewFilePath = path.join(__dirname, "..", viewPath)
    console.log("Loading template from:", viewFilePath)

    this.mainWindow?.loadFile(viewFilePath).catch((err) => {
      console.error(`Error loading ${viewPath}`, err)
    })
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

    // Escuchar mensajes desde el render process
    ipcMain.handle("course:openContent", (event, courseFilePath) => {
      try {
        this.createCourseWindow(path.join("courses", courseFilePath))
      } catch (error: unknown) {
        if (error instanceof Error) {
          return { success: false, error: error.message }
        }
        return { success: false, error: "An unknown error occurred" }
      }
    })

    // Ir a la vista
    ipcMain.handle("navigation:goToView", (event, viewPath) => {
      try {
        this.changeMainWindow(viewPath)
      } catch (error: unknown) {
        if (error instanceof Error) {
          return { success: false, error: error.message }
        }
        return { success: false, error: "An unknown error occurred" }
      }
    })

    ipcMain.handle("navigation:courseOpened", (event, data) => {
      this.changeMainWindow("renderer/courseOpen.html")
    })
  }
}

new MainApp().init()
