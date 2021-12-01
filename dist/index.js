import puppeteer from 'puppeteer';
import cron from 'node-cron';
import chalk from 'chalk';
import ora from 'ora';
import { Student } from './student';
import { Courses } from './course';
// declare global {
//   interface Window {
//     parseDate: (dateString: string) => number
//   }
// }
export const spinner = ora({
    text: 'Iniciando auto asistencia',
    color: 'blue',
    hideCursor: false
});
// cron.schedule('* * * * *', () => {
//   console.log('running a task every minute');
// });
export const ELEARING_URL = 'https://elearning.espoch.edu.ec';
export const EMAILLOGIN_URL = 'https://login.microsoftonline.com/d7f86710-01e1-461d-8599-758de4542e2b/oauth2/authorize?response_type=code&client_id=3e94ba41-2a62-4580-a931-e304cd23fea3&redirect_uri=https%3A%2F%2Fseguridad.espoch.edu.ec%2Fcas%2FdelegatedAuthn%2Foidc%2FInstitucional&scope=openid&state=5jFCV8oMVCNTqsu_kkC_clJGjSkatR1_-w0-Cb0OS-w';
let browser;
export let page;
let students;
let courses;
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function cronFormat(date) {
    return `0 ${date.getMinutes()} ${date.getHours()} ${date.getDate()}`;
}
async function cronSchemas() {
    let schemas = [];
    courses.courses.forEach(course => course.classes.forEach(classSchema => {
        const croneFormat = cronFormat(new Date(classSchema.time));
        if (!schemas.find(schema => schema.schema === croneFormat)) {
            schemas.push({ schema: croneFormat, course: course.id });
        }
    }));
    return schemas;
}
async function cronJobs() {
    const schemas = await cronSchemas();
    schemas.forEach(schema => cron.schedule(schema.schema, async () => {
        await launchBrowser();
        // get the course with the id
        const course = courses.courses.find(course => course.id === schema.course);
        // get the students of the course
        const studentsId = course.students;
        studentsId.forEach(async (studentId) => {
            const student = students.get().find(student => student.id === studentId);
            const logged = await students.login(student);
            await students.attendance(course.attendanceLink);
        });
    }));
}
const launchBrowser = async () => {
    spinner.text = chalk.blue('Iniciando navegador');
    spinner.start();
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
};
(async function () {
    console.log(chalk.green("Corriendo auto asistencia"));
    try {
        await launchBrowser();
        students = new Student();
        courses = new Courses();
        for (let student of students.get()) {
            const logged = await students.login(student);
            if (logged)
                await courses.getCourses(student.id);
        }
        await browser.close();
        await cronJobs();
    }
    catch (error) {
        spinner.fail('Error en el proceso ' + error);
        console.log(error);
    }
})();
/**
 * TODO:
 * Agregar un ID a las materias (NOMBRE DE LA MATERIA) y guardarlo en un archivo courses.json
 * El calendario
 */ 
//# sourceMappingURL=index.js.map