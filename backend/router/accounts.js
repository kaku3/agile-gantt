const path = require('path')
const fs = require('fs')
const bcrypt = require('bcrypt')

const router = require('express').Router()

const db = path.join(process.cwd(), 'db')
const accounts = require(path.join(db, 'accounts.json'))

router.post('/:id/change-password', (req, res, next) => {
    const { id } = req.params
    const { oldPassword, password } = req.body

    const account = accounts.find(u => u.id === id)
    if(!account || !bcrypt.compareSync(oldPassword, account.password)) {
        return res.status(400).json({"error": "invalid"})
    }
    account.password = bcrypt.hashSync(password, 10)

    fs.writeFileSync(path.join(db, `accounts.json`), JSON.stringify(accounts), 'utf-8')
    res.json({
        result: 'success'
    })
})

router.get('/:id/config', (req, res, next) => {
    const { id } = req.params
    const f = path.join(db, `accounts/${id}/config.json`)

    let json = {}
    if(fs.existsSync(f)) {
        json = JSON.parse(fs.readFileSync(f, 'utf8'))
    }
    // data 変更対応
    if(!json.zoom) {
        json.zoom = 1
    }
    res.json(json)
})


router.post('/:id/config', (req, res, next) => {
    const { id } = req.params
    const config = req.body
    const d = path.join(db, `accounts/${id}/`)

    if(!fs.existsSync(d)) {
        fs.mkdirSync(d)
    }

    fs.writeFileSync(path.join(d, 'config.json'), JSON.stringify(config), 'utf-8')
    res.json({
        result: 'success'
    })
})

module.exports = router