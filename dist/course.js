import chalk from "chalk";
import { ELEARING_URL, page, spinner } from "./index";
import { courses as fm } from "./fileManager";
export class Courses {
    constructor() {
        this.courses = [];
        this.courses = fm.get();
    }
    async getAttendances(course) {
        spinner.text = chalk.blue('Obteniendo las asistencias de ') + chalk.yellow(course);
        if (!course.attendanceLink) {
            spinner.fail('No se encontró el enlace de asistencia');
            return;
        }
        await page.goto(course.attendanceLink, { waitUntil: 'networkidle2' });
        const REGION = '#region-main > div:nth-child(2)';
        await page.$(REGION);
        await page.click(REGION + ' > div.attfiltercontrols > table > tbody > tr > td.cell.c3.lastcol > nobr > span:nth-child(1) > a');
        await page.waitForSelector(' .generaltable > tbody');
        const fnToInject = (trs, courseName, parseData) => trs.map(tr => {
            const tds = tr.querySelectorAll('td');
            const [dateWithPoints, hour12 = "0"] = tds[0].innerText.split(" ", 5);
            let [hour24 = "0", minutes = "0"] = hour12.replace(/[^0-9]/g, '').split(':');
            const [day, month, year] = dateWithPoints.substr(0, dateWithPoints.length - 6).split('.');
            hour24 = hour12.toUpperCase().includes('PM') ? hour24 + 12 : hour24;
            const date = new Date(parseInt(year) + 2000, parseInt(month), parseInt(day), parseInt(hour24), parseInt(minutes) + 5).getTime();
            // const date = parseDate(tds[0].innerText)
            // const date = window.parseDate(tds[0].innerText)
            const pending = tds[2].innerText === '?';
            return { time: date, pending };
        });
        const attendanceCourse = await page.$$eval('.generaltable > tbody > tr', fnToInject, course.id);
        // console.log(attendanceCourse)
        attendanceCourse.forEach(attendance => {
            const index = course.classes.findIndex(cl => cl.time === attendance.time);
            if (index === -1)
                course.classes.push(attendance);
        });
        fm.set(this.courses);
        spinner.succeed('Asistencias de ' + course + ' obtenidas');
    }
    async getAttendanceLink(course) {
        if (course.attendanceLink !== null)
            return; // Si ya tiene un link de asistencia, no hacer nada
        spinner.start('Obteniendo enlaces de asistencia de ' + course.id);
        await page.goto(course.link);
        const SELECTOR = 'li.modtype_attendance';
        const existAttendance = await page.$(SELECTOR);
        if (existAttendance) {
            const attendanceLink = await page.$eval(SELECTOR + ' > div > div > div:nth-child(2) > div > a', a => a ? a.getAttribute('href') : null);
            if (attendanceLink) {
                course.attendanceLink = attendanceLink;
                // await setUpAttendance(course) 
            }
        }
        spinner.succeed('Enlaces de asistencia de ' + course.id + ' obtenidos');
    }
    async getCourses(studentId) {
        spinner.start('Obteniendo cursos');
        await page.goto(ELEARING_URL + '/my');
        const SELECTOR = '#page-container-1 > div > div > div';
        await page.waitForSelector(SELECTOR);
        const coursesOfStudent = await page.$$eval(SELECTOR, (courses, studentId) => courses.map(course => {
            const a = course.querySelector('a.coursename');
            const span = a.querySelector('span.multiline');
            let name = "";
            if (span) {
                name = span.innerHTML.replace(/\n/g, '').trim();
            }
            return { id: name, link: a.getAttribute('href'), attendanceLink: null, students: [studentId], classes: [] };
        }), studentId);
        // GUARDANDO EL CURSO SI NO ESTA REGISTRADO
        for (let course of coursesOfStudent) {
            console.log(" cursos 5");
            const courseInFile = this.courses.find(c => c.id === course.id);
            if (!courseInFile) {
                // GET ATTENDANCE LINK
                await this.getAttendanceLink(course);
                // GET ATTENDANCES
                await this.getAttendances(course);
                fm.push(course);
            }
            else if (courseInFile.students.indexOf(studentId) === -1) {
                courseInFile.students.push(studentId);
                fm.set(this.courses);
            }
        }
        spinner.succeed('Cursos obtenidos');
    }
}
export default { Courses };
//# sourceMappingURL=course.js.map