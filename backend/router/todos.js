const path = require('path')
const fs = require('fs')
const router = require('express').Router()

const TodoUtil = require('../utils/TodoUtil')

const db = path.join(process.cwd(), 'db')

router.get('/', (req, res, next) => {
    res.json(TodoUtil.get())
})
router.post('/', (req, res, next) => {
    TodoUtil.save(req.body)
    res.json({
        result: 'success'
    })
})

module.exports = router