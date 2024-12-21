import path from "path"

export const exitCourseModal = {
  type: "question",
  buttons: ["Mantenerse en el curso", "Salir del curso"],
  defaultId: 0,
  title: "Salir del curso",
  message: "¿Deseas salir del curso actual?",
  detail: "Si sales del curso se terminará esta visualización",
  icon: path.join(__dirname, "../..", "assets", "uopca-logo.png"),
}

export const openCourseModal = {
  type: "question",
  buttons: ["Continuar", "Cancelar"],
  defaultId: 0,
  title: "Abrir curso",
  message: "Consumir una visualización",
  detail: "Al abrir un curso se consumirá una visualización",
  icon: path.join(__dirname, "../..", "assets", "uopca-logo.png"),
}
