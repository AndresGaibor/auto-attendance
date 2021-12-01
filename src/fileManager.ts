import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
 
import { fileURLToPath } from 'url';
import { ICourse } from './course';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface IStudent {
    id: number,
    name: string,
    email: string,
    password: string,
}

class FileManagerClass<T> {
    private _value: T[];
    private filename: string;

    constructor(filename: string) {
        this.filename = filename;
        this._value = this.read(filename);
    }

    get() { return this._value; }

    set(value: T[]) {
        this._value = value;
        this.save(this.filename, this._value)
    }

    push(obj: T) {
        this._value.push(obj)
        this.save(this.filename, this._value)
    }

    private PATH(filename: string) {
        return path.join(__dirname, `../files/${filename}.json`) 
    }

    private read(filename: string) {
        return JSON.parse(readFileSync(this.PATH(filename), 'utf8'))
    }

    private save(filename: string, obj: Object) {
        writeFileSync(this.PATH(filename), JSON.stringify(obj, null, 2))
    }
}

const students = new FileManagerClass<IStudent>("students")
const courses = new FileManagerClass<ICourse>("courses")

// fileManagerk
export { students, courses }

export default { students, courses }