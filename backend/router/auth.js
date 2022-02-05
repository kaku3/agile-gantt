const path = require('path')
const bcrypt = require('bcrypt')

const router = require('express').Router()

const common = require('../common')

const db = path.join(process.cwd(), 'db')
const users = require(path.join(db, 'accounts.json'))

router.post('/login', (req, res) => {
    const { email, password } = req.body

    const user = users.find(u => u.email === email)
    if(!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({"error": "invalid"})
    }
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email
    }
    const token = common.getToken(payload)
    return res.json({ token })
})
router.post('/logout', (req, res) => {
    return res.sendStatus(200)
})

router.get('/user', (req, res) => {
    const user = common.getUserFromBearerToken(req.headers['authorization'])
    if(user) {
        return res.json({
            user
        })
    }
    return res.sendStatus(403)
})

module.exports = router