const jwt = require('jsonwebtoken')

// jwttoken secret. 置き換えてください。
const secret = 'secret'

class Common {
    static getUserFromBearerToken (bearerToken) {
        if(!bearerToken) {
            return false
        }
        const bearer = bearerToken.split(' ')
        if(bearer.length < 2) {
            return false
        }
        return jwt.verify(bearer[1], secret)
    }
    
    /**
     * 前処理
     * - ログ
     * - 認証
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    static preProcess (req, res, next) {
        console.log(`+ ${req.method} ${req.originalUrl} params=${JSON.stringify(req.params)}`)
        
        const user = Common.getUserFromBearerToken(req.headers['authorization'])
        if(!user) {
            if(![ '/', '/login' ].includes(req.originalUrl)) {
                res.status(401).send('Unauthorized')
                return
            }
        }
        next()
    }
    
    static getToken (payload) {
        return jwt.sign(payload, secret)
    }
}
module.exports = Common
