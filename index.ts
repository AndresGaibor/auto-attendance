import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'fs';
import cron from 'node-cron';
import chalk from 'chalk';
import ora from 'ora';

//Interfaces
interface ICourse {  name: string, link: string, attendanceLink: string | null }
interface IAttendance { course: string, time: number, pending: boolean }

declare global {

interface Window {
  parseDate: (dateString: string) => number
}
}
// DATA FILES
const user: any = JSON.parse(readFileSync('user.json', 'utf8') || '{usename: @, password: @}');
let courses: ICourse[] = [];//JSON.parse(fs.readFileSync('courses.json', 'utf8') || []);
let attendances: IAttendance[] = JSON.parse(readFileSync(`attendances.json`, 'utf8') || '[]');

const spinner = ora({
  text: 'Iniciando auto asistencia',
  color: 'blue',
  hideCursor: false
})
// cron.schedule('* * * * *', () => {
  //   console.log('running a task every minute');
  // });
  
const ELEARING_URL = 'https://elearning.espoch.edu.ec';
const EMAILLOGIN_URL = 'https://login.microsoftonline.com/d7f86710-01e1-461d-8599-758de4542e2b/oauth2/authorize?response_type=code&client_id=3e94ba41-2a62-4580-a931-e304cd23fea3&redirect_uri=https%3A%2F%2Fseguridad.espoch.edu.ec%2Fcas%2FdelegatedAuthn%2Foidc%2FInstitucional&scope=openid&state=5jFCV8oMVCNTqsu_kkC_clJGjSkatR1_-w0-Cb0OS-w';

let page: puppeteer.Page;


const login = async (email: string, password: string) => {

  spinner.text = 'Iniciando sesion con el correo ' + user.email

  await page.goto(EMAILLOGIN_URL, { waitUntil: 'networkidle0' });
  // await page.waitForNetworkIdle()
  await page.type('input[type="email"]', email)
  await page.click('#idSIButton9')
  // await page.waitForNetworkIdle()
  await page.waitForNetworkIdle()
  await page.type('input[type="password"]', password)
  await page.click('#idSIButton9')
  await page.waitForNavigation()

  const error = await page.$('#passwordError')
  
  if (error) {
    spinner.fail('Error de autenticación, posible contrasenia incorrecta')
    return false
  }
  const signIn = await page.$('#idBtn_Back') //idSIButton9
  if (signIn) {
    await signIn.click() // Quieres mantener la sesión iniciada?, No // idSIButton9
  } else {
    spinner.fail('No se encontró el botón de inicio de sesión')
    return false
  }

  await page.waitForNavigation()

  spinner.succeed('Sesion iniciada')
  
  return true
}

const getCourses = async () => {
  if(courses.length === 0) { // Si los cursos no estan registrado  
   spinner.start('Obteniendo cursos')
  await page.goto(ELEARING_URL + '/my');
  await page.waitForSelector('#page-container-1 > div > div > div')
  
  const coursesT: any = await page.$$eval('#page-container-1 > div > div > div', courses => courses.map(course => {
    const a = (<Element>course).querySelector('a.coursename') as HTMLAnchorElement

    return {
      name: (a.querySelector('span.multiline') as HTMLElement).innerText.replace(/\n/g, '').trim() as string,
      link: a.getAttribute('href') as string,
      attendanceLink: null
    } 
  })) 

  spinner.succeed('Cursos obtenidos')
  courses = coursesT

    writeFileSync('courses.json', JSON.stringify(courses, null, 2))
  }
}

const getAttendanceLink = async () => {
  
 
  for(let course of courses) {
    if(course.attendanceLink === null) {
      spinner.start('Obteniendo enlaces de asistencia de ' + course.name)

      await page.goto(course.link)

      const existAttendance = await page.$('li.modtype_attendance')

      if(existAttendance) {


      const attendanceLink = await page.$eval(`li.modtype_attendance > div > div > div:nth-child(2) > div > a`, a => {
        if(a) {
          return a.getAttribute('href')
        }

        return null
      })

      if(attendanceLink) {
        
        await setUpAttendance(course.name, attendanceLink)

        course.attendanceLink = attendanceLink || null
        writeFileSync('courses.json', JSON.stringify(courses, null, 2))

      }
    }

    spinner.succeed('Enlaces de asistencia de ' + course.name + ' obtenidos')

    }
  }
}

var parseDate = function(dateString: string) {
  const [dateWithPoints, hour12] = dateString.split(" ", 5);
  
  let [hour24 = "0", minutes = "0"] = hour12.replace(/[^0-9]/g, '').split(':');
  
  const [day, month, year] = dateWithPoints.substr(0, dateWithPoints.length - 6).split('.');
  
  hour24 = hour12.toUpperCase().includes('PM') ? hour24 + 12 : hour24;
  const date = new Date(parseInt(year) + 2000, parseInt(month), parseInt(day), parseInt(hour24), parseInt(minutes) + 5);

  //console.log(date.getTime())

  return date.getTime()

}

const setUpAttendance = async (course: string, attendanceLink: string) => {
  
  spinner.text = chalk.blue( 'Obteniendo las asistencias de ') + chalk.yellow(course)
  // await page.exposeFunction('parseDate', parseDate)


  await page.goto(attendanceLink, { waitUntil: 'networkidle2' })

  const REGION = '#region-main > div:nth-child(2)'

  await page.$(REGION)

  await page.click(REGION + ' > div.attfiltercontrols > table > tbody > tr > td.cell.c3.lastcol > nobr > span:nth-child(1) > a')

  await page.waitForSelector(' .generaltable > tbody')
  
  const fnToInject = (trs: Element[], course: unknown) => trs.map(tr => {
      const tds = (tr as HTMLElement).querySelectorAll('td')
      
      // const date = parseDate(tds[0].innerText);
      // console.log(date)

      const [dateWithPoints, hour12] = tds[0].innerText.split(" ", 5);
  
  let [hour24 = "0", minutes = "0"] = hour12.replace(/[^0-9]/g, '').split(':');
  
  const [day, month, year] = dateWithPoints.substr(0, dateWithPoints.length - 6).split('.');
  
  hour24 = hour12.toUpperCase().includes('PM') ? hour24 + 12 : hour24;
  const date = new Date(parseInt(year) + 2000, parseInt(month), parseInt(day), parseInt(hour24), parseInt(minutes) + 5).getTime();


      const pending = tds[2].innerText === '?'

      return { course: course as string, time: date, pending }
  })
  

  const attendanceCourse = await page.$$eval('.generaltable > tbody > tr', fnToInject, course)

  // console.log(attendanceCourse)

  attendances = attendances.concat(attendanceCourse)

  spinner.succeed('Asistencias de ' + course + ' obtenidas')

  writeFileSync(`attendances.json`, JSON.stringify(attendances, null, 2))
}




(async function() {
  console.log(chalk.green("Corriendo auto asistencia"))

  spinner.start()

  try {
    const browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();

  const logged = await login(user.email, user.password)


  if(logged) {
    await getCourses()

    await page.exposeFunction('parseDate', parseDate)

    await getAttendanceLink()

  }
  
  await browser.close();
  } catch (error) {
    spinner.fail('Error en el proceso '+ error)
    console.log(error)
  }
  
  
})();