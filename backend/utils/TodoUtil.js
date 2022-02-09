const path = require('path')
const fs = require('fs')

const db = path.join(process.cwd(), 'db')

class TodoUtil {
    static _todos = null

    static init() {
        TodoUtil.load()
    }

    static load() {
        TodoUtil._todos = JSON.parse(
            fs.readFileSync(path.join(db, 'todos.json'), 'utf8')
        )
    }
    static get() {
        return TodoUtil._todos
    }
    static set(todos) {
        TodoUtil._todos = todos
    }

    static save(todos = null) {
        if(todos) {
            TodoUtil.set(todos)
        }
        fs.writeFileSync(
            path.join(db, 'todos.json'),
            JSON.stringify(TodoUtil._todos)
        )
    }
}

module.exports = TodoUtil
