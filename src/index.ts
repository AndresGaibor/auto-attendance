import puppeteer, { launch } from "puppeteer";
import cron from "node-cron";
import chalk from "chalk";
import ora from "ora";

import { Student } from "./student";
import { Courses } from "./course";

export const spinner = ora({
  text: "Iniciando auto asistencia",
  color: "blue",
  hideCursor: false,
});

// cron.schedule('* * * * *', () => {
//   console.log('running a task every minute');
// });

export const ELEARING_URL = "https://elearning.espoch.edu.ec";
export const EMAILLOGIN_URL =
  "https://login.microsoftonline.com/d7f86710-01e1-461d-8599-758de4542e2b/oauth2/authorize?response_type=code&client_id=3e94ba41-2a62-4580-a931-e304cd23fea3&redirect_uri=https%3A%2F%2Fseguridad.espoch.edu.ec%2Fcas%2FdelegatedAuthn%2Foidc%2FInstitucional&scope=openid&state=5jFCV8oMVCNTqsu_kkC_clJGjSkatR1_-w0-Cb0OS-w";

let browser: puppeteer.Browser;
export let page: puppeteer.Page;
let students: Student;
let courses: Courses;

function onlyUnique<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index;
}

function cronFormat(date: Date) {
  return `0 ${date.getMinutes()} ${date.getHours()} * * ${date.getDay()}`;
}

function cronSchemas() {
  let schemas: { schema: string; course: string }[] = [];

  courses.courses.forEach((course) =>
    course.classes.forEach((classSchema) => {
      const date = new Date(classSchema.time);
      // console.log(`${date.getDay()} ${date.toDateString()} - ${course.id}`);
      const croneFormat = cronFormat(date);
      if (!schemas.find((schema) => schema.schema === croneFormat)) {
        schemas.push({ schema: croneFormat, course: course.id });
      }
    })
  );

  return schemas;
}

function cronJobs() {
  const schemas = cronSchemas();

   console.log(schemas);

  return;

  schemas.forEach((schema) =>
    cron.schedule(schema.schema, async () => {
      await launchBrowser();

      // get the course with the id
      const course = courses.courses.find(
        (course) => course.id === schema.course
      );

      // get the students of the course
      const studentsId = course.students;

      studentsId.forEach(async (studentId) => {
        const student = students
          .get()
          .find((student) => student.id === studentId);

        const logged = await students.login(student);

        await students.attendance(course.attendanceLink);
      });
    })
  );
}

const launchBrowser = async () => {
  spinner.start(chalk.blue("Iniciando navegador"));

  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if(["image", "stylesheet", "font"].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  //TEMPORAL
  // page.on('console', async (msg) => {
  //   const msgArgs = msg.args();
  //   for (let i = 0; i < msgArgs.length; ++i) {
  //     console.log(await msgArgs[i].jsonValue());
  //   }
  // });
};

(async function () {
  console.log(chalk.green("Corriendo auto asistencia"));

  try {
    await launchBrowser();

    students = new Student();
    courses = new Courses();

    for (let student of students.get()) {
      const logged = await students.login(student);

      if (logged) await courses.getCourses(student.id);
    }

    await browser.close();

    cronJobs();
  } catch (error) {
    spinner.fail("Error en el proceso " + error);
    console.log(error);
  }
})();

/**
 * TODO:
 * Agregar un ID a las materias (NOMBRE DE LA MATERIA) y guardarlo en un archivo courses.json
 * El calendario
 */
