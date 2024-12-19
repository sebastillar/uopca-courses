document.addEventListener("DOMContentLoaded", () => {
  const courseList = document.getElementById("courseList")
  const viewer = document.getElementById("viewer")

  if (!courseList || !viewer) {
    console.error("Required elements not found")
    return
  }
  // Cargar lista de cursos
  window.courseAPI.listCourses().then((response) => {
    if (response.success && response.courses) {
      response.courses.forEach((course) => {
        const courseElement = document.createElement("div")

        courseElement.className = "max-w-sm w-full lg:max-w-full lg:flex mb-6"
        courseElement.innerHTML = `
          <div class="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none text-center overflow-hidden border border-gray-300" style="background-image: url('../assets/carretillero.jpg')" title="Retroescavadora"></div>
          <div class="border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b-lg lg:rounded-b-none lg:rounded-r-lg p-4 flex flex-col justify-between leading-normal">
            <div class="mb-8">
              <p class="text-sm text-gray-600 flex items-center">
                ${
                  course.accessCount >= course.maxAccess
                    ? `<svg class="w-4 h-4 mr-2" width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`
                    : `<svg class="w-4 h-4 mr-2" width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`
                }
                
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

        courseList.appendChild(courseElement)

        const btnCourse = document.getElementById(`btnCourse${course.id}`)

        if (!btnCourse) {
          console.error("Button not found")
          return courseElement
        }

        btnCourse.addEventListener("click", async () => {
          const result = await window.courseAPI.getCourseContent(course.id)
          if (result.success && result.content) {
            await window.courseAPI.openCourseContent(result.content)
            window.electronAPI.onCourseWindowCreated()
          } else {
            console.log(result.error || "Error desconocido")
          }
        })
      })
    }
  })
})
