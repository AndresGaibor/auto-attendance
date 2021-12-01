"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var puppeteer_1 = require("puppeteer");
var fs_1 = require("fs");
var chalk = require('chalk');
var ora_1 = require("ora");
// DATA FILES
var user = JSON.parse((0, fs_1.readFileSync)('user.json', 'utf8') || '{usename: @, password: @}');
var courses = []; //JSON.parse(fs.readFileSync('courses.json', 'utf8') || []);
var attendances = JSON.parse((0, fs_1.readFileSync)("attendances.json", 'utf8') || '[]');
var spinner = (0, ora_1["default"])({
    text: 'Iniciando auto asistencia',
    color: 'blue',
    hideCursor: false
});
// cron.schedule('* * * * *', () => {
//   console.log('running a task every minute');
// });
var ELEARING_URL = 'https://elearning.espoch.edu.ec';
var EMAILLOGIN_URL = 'https://login.microsoftonline.com/d7f86710-01e1-461d-8599-758de4542e2b/oauth2/authorize?response_type=code&client_id=3e94ba41-2a62-4580-a931-e304cd23fea3&redirect_uri=https%3A%2F%2Fseguridad.espoch.edu.ec%2Fcas%2FdelegatedAuthn%2Foidc%2FInstitucional&scope=openid&state=5jFCV8oMVCNTqsu_kkC_clJGjSkatR1_-w0-Cb0OS-w';
var page;
var login = function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
    var error, signIn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                spinner.text = 'Iniciando sesion con el correo ' + user.email;
                return [4 /*yield*/, page.goto(EMAILLOGIN_URL, { waitUntil: 'networkidle0' })];
            case 1:
                _a.sent();
                // await page.waitForNetworkIdle()
                return [4 /*yield*/, page.type('input[type="email"]', email)];
            case 2:
                // await page.waitForNetworkIdle()
                _a.sent();
                return [4 /*yield*/, page.click('#idSIButton9')
                    // await page.waitForNetworkIdle()
                ];
            case 3:
                _a.sent();
                // await page.waitForNetworkIdle()
                return [4 /*yield*/, page.waitForNetworkIdle()];
            case 4:
                // await page.waitForNetworkIdle()
                _a.sent();
                return [4 /*yield*/, page.type('input[type="password"]', password)];
            case 5:
                _a.sent();
                return [4 /*yield*/, page.click('#idSIButton9')];
            case 6:
                _a.sent();
                return [4 /*yield*/, page.waitForNavigation()];
            case 7:
                _a.sent();
                return [4 /*yield*/, page.$('#passwordError')];
            case 8:
                error = _a.sent();
                if (error) {
                    spinner.fail('Error de autenticación, posible contrasenia incorrecta');
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, page.$('#idBtn_Back')]; //idSIButton9
            case 9:
                signIn = _a.sent() //idSIButton9
                ;
                if (!signIn) return [3 /*break*/, 11];
                return [4 /*yield*/, signIn.click()]; // Quieres mantener la sesión iniciada?, No // idSIButton9
            case 10:
                _a.sent(); // Quieres mantener la sesión iniciada?, No // idSIButton9
                return [3 /*break*/, 12];
            case 11:
                spinner.fail('No se encontró el botón de inicio de sesión');
                return [2 /*return*/, false];
            case 12: return [4 /*yield*/, page.waitForNavigation()];
            case 13:
                _a.sent();
                spinner.succeed('Sesion iniciada');
                return [2 /*return*/, true];
        }
    });
}); };
var getCourses = function () { return __awaiter(void 0, void 0, void 0, function () {
    var coursesT;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(courses.length === 0)) return [3 /*break*/, 4];
                spinner.start('Obteniendo cursos');
                return [4 /*yield*/, page.goto(ELEARING_URL + '/my')];
            case 1:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector('#page-container-1 > div > div > div')];
            case 2:
                _a.sent();
                return [4 /*yield*/, page.$$eval('#page-container-1 > div > div > div', function (courses) { return courses.map(function (course) {
                        var a = course.querySelector('a.coursename');
                        return {
                            name: a.querySelector('span.multiline').innerText.replace(/\n/g, '').trim(),
                            link: a.getAttribute('href'),
                            attendanceLink: null
                        };
                    }); })];
            case 3:
                coursesT = _a.sent();
                spinner.succeed('Cursos obtenidos');
                courses = coursesT;
                (0, fs_1.writeFileSync)('courses.json', JSON.stringify(courses, null, 2));
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
var getAttendanceLink = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, courses_1, course, existAttendance, attendanceLink;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, courses_1 = courses;
                _a.label = 1;
            case 1:
                if (!(_i < courses_1.length)) return [3 /*break*/, 8];
                course = courses_1[_i];
                if (!(course.attendanceLink === null)) return [3 /*break*/, 7];
                spinner.start('Obteniendo enlaces de asistencia de ' + course.name);
                return [4 /*yield*/, page.goto(course.link)];
            case 2:
                _a.sent();
                return [4 /*yield*/, page.$('li.modtype_attendance')];
            case 3:
                existAttendance = _a.sent();
                if (!existAttendance) return [3 /*break*/, 6];
                return [4 /*yield*/, page.$eval("li.modtype_attendance > div > div > div:nth-child(2) > div > a", function (a) {
                        if (a) {
                            return a.getAttribute('href');
                        }
                        return null;
                    })];
            case 4:
                attendanceLink = _a.sent();
                if (!attendanceLink) return [3 /*break*/, 6];
                return [4 /*yield*/, setUpAttendance(course.name, attendanceLink)];
            case 5:
                _a.sent();
                course.attendanceLink = attendanceLink || null;
                (0, fs_1.writeFileSync)('courses.json', JSON.stringify(courses, null, 2));
                _a.label = 6;
            case 6:
                spinner.succeed('Enlaces de asistencia de ' + course.name + ' obtenidos');
                _a.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 1];
            case 8: return [2 /*return*/];
        }
    });
}); };
var parseDate = function (dateString) {
    var _a = dateString.split(" ", 5), dateWithPoints = _a[0], hour12 = _a[1];
    var _b = hour12.replace(/[^0-9]/g, '').split(':'), _c = _b[0], hour24 = _c === void 0 ? "0" : _c, _d = _b[1], minutes = _d === void 0 ? "0" : _d;
    var _e = dateWithPoints.substr(0, dateWithPoints.length - 6).split('.'), day = _e[0], month = _e[1], year = _e[2];
    hour24 = hour12.toUpperCase().includes('PM') ? hour24 + 12 : hour24;
    var date = new Date(parseInt(year) + 2000, parseInt(month), parseInt(day), parseInt(hour24), parseInt(minutes) + 5);
    //console.log(date.getTime())
    return date.getTime();
};
var setUpAttendance = function (course, attendanceLink) { return __awaiter(void 0, void 0, void 0, function () {
    var REGION, fnToInject, attendanceCourse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                spinner.text = chalk.blue('Obteniendo las asistencias de ') + chalk.yellow(course);
                // await page.exposeFunction('parseDate', parseDate)
                return [4 /*yield*/, page.goto(attendanceLink, { waitUntil: 'networkidle2' })];
            case 1:
                // await page.exposeFunction('parseDate', parseDate)
                _a.sent();
                REGION = '#region-main > div:nth-child(2)';
                return [4 /*yield*/, page.$(REGION)];
            case 2:
                _a.sent();
                return [4 /*yield*/, page.click(REGION + ' > div.attfiltercontrols > table > tbody > tr > td.cell.c3.lastcol > nobr > span:nth-child(1) > a')];
            case 3:
                _a.sent();
                return [4 /*yield*/, page.waitForSelector(' .generaltable > tbody')];
            case 4:
                _a.sent();
                fnToInject = function (trs, course) { return trs.map(function (tr) {
                    var tds = tr.querySelectorAll('td');
                    // const date = parseDate(tds[0].innerText);
                    // console.log(date)
                    var _a = tds[0].innerText.split(" ", 5), dateWithPoints = _a[0], hour12 = _a[1];
                    var _b = hour12.replace(/[^0-9]/g, '').split(':'), _c = _b[0], hour24 = _c === void 0 ? "0" : _c, _d = _b[1], minutes = _d === void 0 ? "0" : _d;
                    var _e = dateWithPoints.substr(0, dateWithPoints.length - 6).split('.'), day = _e[0], month = _e[1], year = _e[2];
                    hour24 = hour12.toUpperCase().includes('PM') ? hour24 + 12 : hour24;
                    var date = new Date(parseInt(year) + 2000, parseInt(month), parseInt(day), parseInt(hour24), parseInt(minutes) + 5).getTime();
                    var pending = tds[2].innerText === '?';
                    return { course: course, time: date, pending: pending };
                }); };
                return [4 /*yield*/, page.$$eval('.generaltable > tbody > tr', fnToInject, course)
                    // console.log(attendanceCourse)
                ];
            case 5:
                attendanceCourse = _a.sent();
                // console.log(attendanceCourse)
                attendances = attendances.concat(attendanceCourse);
                spinner.succeed('Asistencias de ' + course + ' obtenidas');
                (0, fs_1.writeFileSync)("attendances.json", JSON.stringify(attendances, null, 2));
                return [2 /*return*/];
        }
    });
}); };
(function () {
    return __awaiter(this, void 0, void 0, function () {
        var browser, logged, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(chalk.green("Corriendo auto asistencia"));
                    spinner.start();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, (0, puppeteer_1.launch)({ headless: false })];
                case 2:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 3:
                    page = _a.sent();
                    return [4 /*yield*/, login(user.email, user.password)];
                case 4:
                    logged = _a.sent();
                    if (!logged) return [3 /*break*/, 8];
                    return [4 /*yield*/, getCourses()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, page.exposeFunction('parseDate', parseDate)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, getAttendanceLink()];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [4 /*yield*/, browser.close()];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _a.sent();
                    spinner.fail('Error en el proceso ' + error_1);
                    console.log(error_1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
})();
