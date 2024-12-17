import { Course } from "../../shared/types"

export function createCourseItem(course: Course): HTMLElement {
  const courseElement = document.createElement("div")

  courseElement.className = "max-w-sm w-full lg:max-w-full lg:flex mb-6"
  courseElement.innerHTML = `
          <div class="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none text-center overflow-hidden border border-gray-300" style="background-image: url('../assets/carretillero.jpg')" title="Retroescavadora"></div>
          <div class="border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b-lg lg:rounded-b-none lg:rounded-r-lg p-4 flex flex-col justify-between leading-normal">
            <div class="mb-8">
              <p class="text-sm text-gray-600 flex items-center">
                <svg class="fill-current text-gray-500 w-3 h-3 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M4 8V6a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm5 6.73V17h2v-2.27a2 2 0 1 0-2 0zM7 6v2h6V6a3 3 0 0 0-6 0z" />
                </svg>
                Visualizaciones: ${course.accessCount}/${course.maxAccess}
              </p>
              <div class="text-gray-900 font-bold text-xl mb-2">${
                course.title
              }</div>
              <p class="text-gray-700 text-base">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.</p>
            </div>
            <div class="flex items-center">
              <div class="text-sm">
                <p class="text-gray-900 leading-none">Expira:</p>
                <p class="text-gray-600">${new Date(
                  course.expirationDate
                ).toLocaleDateString()}</p>
              </div>
              <button id="btnCourse${
                course.id
              }" class="open-course-btn bg-orange-600 text-white py-1 px-3 rounded mt-2 ml-auto">Abrir curso</button>
            </div>
          </div>
        `

  const btnCourse = document.getElementById(`btnCourse${course.id}`)

  if (!btnCourse) {
    console.error("Button not found")
    return courseElement
  }

  btnCourse.addEventListener("click", async () => {
    const result = await window.courseAPI.getCourseContent(course.id)
    if (result.success && result.content) {
      // viewer.innerHTML = result.content
      console.log(result.content)
    } else {
      // viewer.innerHTML = `<div class="error">${
      //   result.error || "Error desconocido"
      // }</div>`
      console.log(result.error || "Error desconocido")
    }
  })

  return courseElement
}
