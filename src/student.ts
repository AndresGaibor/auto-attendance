import chalk from "chalk";
import { EMAILLOGIN_URL, page, spinner } from ".";
import { students } from "./fileManager";

export interface IStudent {
    id: number,
    name: string,
    email: string,
    password: string,
}

export class Student {
    private students: IStudent[];
    current: IStudent;

    constructor() {
        this.students = students.get()
    }

    get() {
        return this.students
    }

    async login(student: IStudent) {
        this.current = student;

        spinner.text = 'Iniciando sesion con el correo ' + student.email;
        await page.goto(EMAILLOGIN_URL, { waitUntil: 'networkidle0' });

        await page.type('input[type="email"]', student.email)
        await page.click('#idSIButton9')
        
        // await page.waitForTimeout(3500)
        await page.waitForSelector("#i0118")

        // await page.waitForSelector('input[type="password"]')
        await page.waitForNetworkIdle()
        await page.type('input#i0118', student.password)
        
        await page.click('input[type="submit"]#idSIButton9')
        await page.waitForNavigation()
        
        const error = await page.$('#passwordError')
        
        if (error) {
            spinner.fail('Error de autenticación, posible contrasenia incorrecta')
            return false
        }
        
        const signIn = await page.$('#idBtn_Back')
        
        if (!signIn) {
            spinner.fail('No se encontró el botón de inicio de sesión')
            return false       }

        await signIn.click() // Quieres mantener la sesión iniciada?, No // idSIButton9

        await page.waitForNavigation()

        spinner.succeed('Sesión iniciada con éxito con ' + chalk.green(student.email))

        return true
    }

    async attendance(attendanceLink: string) {
        spinner.text = 'Asistencia de ' + chalk.green(this.current.name)
        spinner.start()

        await page.goto(attendanceLink, { waitUntil: 'networkidle0' })

        // click en el boton
    }
}

export default { Student }