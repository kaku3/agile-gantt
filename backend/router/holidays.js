const path = require('path')
const fs = require('fs')
const router = require('express').Router()

const db = path.join(process.cwd(), 'db')

router.get('/', (req, res, next) => {
    const json = fs.readFileSync(path.join(db, '/holidays.json'), 'utf8')
    res.json(JSON.parse(json))
})
router.post('/', (req, res, next) => {
    fs.writeFileSync(path.join(db, '/holidays.json'), JSON.stringify(req.body))
    res.json({
        result: 'success'
    })
})

module.exports = router
