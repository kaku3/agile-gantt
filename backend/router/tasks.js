const path = require('path')
const fs = require('fs')
const router = require('express').Router()

const TaskUtil = require('../utils/TaskUtil')

console.log('router/tasks')

const db = path.join(process.cwd(), 'db')

router.get('/', (req, res, next) => {
    res.json(TaskUtil.get())
})
router.post('/', (req, res, next) => {
    TaskUtil.save(req.body)
    res.json({
        result: 'success'
    })
})
router.get('/:id', (req, res, next) => {
    const id = req.params.id

    try {
        const json = fs.readFileSync(path.join(db, `tasks/${id}.json`), 'utf8')
        res.json(JSON.parse(json))
    } catch(e) {
        res.json({
            content: ''
        })
    }
})
router.post('/:id', (req, res, next) => {
    const id = req.params.id

    fs.writeFileSync(path.join(db, `tasks/${id}.json`), JSON.stringify(req.body))
    res.json({
        result: 'success'
    })
})

module.exports = router