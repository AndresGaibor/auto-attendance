import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
class FileManagerClass {
    constructor(filename) {
        this.filename = filename;
        this._value = this.read(filename);
    }
    get() { return this._value; }
    set(value) {
        this._value = value;
        this.save(this.filename, this._value);
    }
    push(obj) {
        this._value.push(obj);
        this.save(this.filename, this._value);
    }
    PATH(filename) {
        return path.join(__dirname, `../files/${filename}.json`);
    }
    read(filename) {
        return JSON.parse(readFileSync(this.PATH(filename), 'utf8'));
    }
    save(filename, obj) {
        writeFileSync(this.PATH(filename), JSON.stringify(obj, null, 2));
    }
}
const students = new FileManagerClass("students");
const courses = new FileManagerClass("courses");
// fileManagerk
export { students, courses };
export default { students, courses };
//# sourceMappingURL=fileManager.js.map