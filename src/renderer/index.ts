document.addEventListener('DOMContentLoaded', () => {
  const courseList = document.getElementById('courseList');
  const viewer = document.getElementById('viewer');

  if (!courseList || !viewer) {
    console.error('Required elements not found');
    return;
  }

  // Cargar lista de cursos
  window.courseAPI.listCourses().then((response) => {
    if (response.success && response.courses) {
      response.courses.forEach((course) => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-item';
        courseElement.innerHTML = `
                    <h3>${course.title}</h3>
                    <p>Visualizaciones: ${course.accessCount}/${
          course.maxAccess
        }</p>
                    <p>Expira: ${new Date(
                      course.expirationDate
                    ).toLocaleDateString()}</p>
                `;

        courseElement.addEventListener('click', async () => {
          const result = await window.courseAPI.getCourseContent(course.id);
          if (result.success && result.content) {
            viewer.innerHTML = result.content;
          } else {
            viewer.innerHTML = `<div class="error">${
              result.error || 'Error desconocido'
            }</div>`;
          }
        });

        courseList.appendChild(courseElement);
      });
    }
  });
});
