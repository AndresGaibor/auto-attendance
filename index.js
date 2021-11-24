var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
// DATA FILES
const user = JSON.parse(readFileSync('user.json', 'utf8') || '{usename: @, password: @}');
let courses = []; //JSON.parse(fs.readFileSync('courses.json', 'utf8') || []);
let attendances = JSON.parse(readFileSync(`attendances.json`, 'utf8') || '[]');
const spinner = ora({
    text: 'Iniciando auto asistencia',
    color: 'blue',
    hideCursor: false
});
// cron.schedule('* * * * *', () => {
//   console.log('running a task every minute');
// });
const ELEARING_URL = 'https://elearning.espoch.edu.ec';
const EMAILLOGIN_URL = 'https://login.microsoftonline.com/d7f86710-01e1-461d-8599-758de4542e2b/oauth2/authorize?response_type=code&client_id=3e94ba41-2a62-4580-a931-e304cd23fea3&redirect_uri=https%3A%2F%2Fseguridad.espoch.edu.ec%2Fcas%2FdelegatedAuthn%2Foidc%2FInstitucional&scope=openid&state=5jFCV8oMVCNTqsu_kkC_clJGjSkatR1_-w0-Cb0OS-w';
let page;
const login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    spinner.text = 'Iniciando sesion con el correo ' + user.email;
    yield page.goto(EMAILLOGIN_URL, { waitUntil: 'networkidle0' });
    // await page.waitForNetworkIdle()
    yield page.type('input[type="email"]', email);
    yield page.click('#idSIButton9');
    // await page.waitForNetworkIdle()
    yield page.waitForNetworkIdle();
    yield page.type('input[type="password"]', password);
    yield page.click('#idSIButton9');
    yield page.waitForNavigation();
    const error = yield page.$('#passwordError');
    if (error) {
        spinner.fail('Error de autenticación, posible contrasenia incorrecta');
        return false;
    }
    const signIn = yield page.$('#idBtn_Back'); //idSIButton9
    if (signIn) {
        yield signIn.click(); // Quieres mantener la sesión iniciada?, No // idSIButton9
    }
    else {
        spinner.fail('No se encontró el botón de inicio de sesión');
        return false;
    }
    yield page.waitForNavigation();
    spinner.succeed('Sesion iniciada');
    return true;
});
const getCourses = () => __awaiter(void 0, void 0, void 0, function* () {
    if (courses.length === 0) { // Si los cursos no estan registrado  
        spinner.start('Obteniendo cursos');
        yield page.goto(ELEARING_URL + '/my');
        yield page.waitForSelector('#page-container-1 > div > div > div');
        const coursesT = yield page.$$eval('#page-container-1 > div > div > div', courses => courses.map(course => {
            const a = course.querySelector('a.coursename');
            return {
                name: a.querySelector('span.multiline').innerText.replace(/\n/g, '').trim(),
                link: a.getAttribute('href'),
                attendanceLink: null
            };
        }));
        spinner.succeed('Cursos obtenidos');
        courses = coursesT;
        writeFileSync('courses.json', JSON.stringify(courses, null, 2));
    }
});
const getAttendanceLink = () => __awaiter(void 0, void 0, void 0, function* () {
    for (let course of courses) {
        if (course.attendanceLink === null) {
            spinner.start('Obteniendo enlaces de asistencia de ' + course.name);
            yield page.goto(course.link);
            const existAttendance = yield page.$('li.modtype_attendance');
            if (existAttendance) {
                const attendanceLink = yield page.$eval(`li.modtype_attendance > div > div > div:nth-child(2) > div > a`, a => {
                    if (a) {
                        return a.getAttribute('href');
                    }
                    return null;
                });
                if (attendanceLink) {
                    yield setUpAttendance(course.name, attendanceLink);
                    course.attendanceLink = attendanceLink || null;
                    writeFileSync('courses.json', JSON.stringify(courses, null, 2));
                }
            }
            spinner.succeed('Enlaces de asistencia de ' + course.name + ' obtenidos');
        }
    }
});
var parseDate = function (dateString) {
    const [dateWithPoints, hour12] = dateString.split(" ", 5);
    let [hour24 = "0", minutes = "0"] = hour12.replace(/[^0-9]/g, '').split(':');
    const [day, month, year] = dateWithPoints.substr(0, dateWithPoints.length - 6).split('.');
    hour24 = hour12.toUpperCase().includes('PM') ? hour24 + 12 : hour24;
    const date = new Date(parseInt(year) + 2000, parseInt(month), parseInt(day), parseInt(hour24), parseInt(minutes) + 5);
    //console.log(date.getTime())
    return date.getTime();
};
const setUpAttendance = (course, attendanceLink) => __awaiter(void 0, void 0, void 0, function* () {
    spinner.text = chalk.blue('Obteniendo las asistencias de ') + chalk.yellow(course);
    // await page.exposeFunction('parseDate', parseDate)
    yield page.goto(attendanceLink, { waitUntil: 'networkidle2' });
    const REGION = '#region-main > div:nth-child(2)';
    yield page.$(REGION);
    yield page.click(REGION + ' > div.attfiltercontrols > table > tbody > tr > td.cell.c3.lastcol > nobr > span:nth-child(1) > a');
    yield page.waitForSelector(' .generaltable > tbody');
    const fnToInject = (trs, course) => trs.map(tr => {
        const tds = tr.querySelectorAll('td');
        // const date = parseDate(tds[0].innerText);
        // console.log(date)
        const [dateWithPoints, hour12] = tds[0].innerText.split(" ", 5);
        let [hour24 = "0", minutes = "0"] = hour12.replace(/[^0-9]/g, '').split(':');
        const [day, month, year] = dateWithPoints.substr(0, dateWithPoints.length - 6).split('.');
        hour24 = hour12.toUpperCase().includes('PM') ? hour24 + 12 : hour24;
        const date = new Date(parseInt(year) + 2000, parseInt(month), parseInt(day), parseInt(hour24), parseInt(minutes) + 5).getTime();
        const pending = tds[2].innerText === '?';
        return { course: course, time: date, pending };
    });
    const attendanceCourse = yield page.$$eval('.generaltable > tbody > tr', fnToInject, course);
    // console.log(attendanceCourse)
    attendances = attendances.concat(attendanceCourse);
    spinner.succeed('Asistencias de ' + course + ' obtenidas');
    writeFileSync(`attendances.json`, JSON.stringify(attendances, null, 2));
});
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk.green("Corriendo auto asistencia"));
        spinner.start();
        try {
            const browser = yield puppeteer.launch({ headless: false });
            page = yield browser.newPage();
            const logged = yield login(user.email, user.password);
            if (logged) {
                yield getCourses();
                yield page.exposeFunction('parseDate', parseDate);
                yield getAttendanceLink();
            }
            yield browser.close();
        }
        catch (error) {
            spinner.fail('Error en el proceso ' + error);
            console.log(error);
        }
    });
})();
