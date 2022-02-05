const fs = require('fs')
const crypto = require('crypto')
const express = require('express')
const cors = require('cors')
const session = require('express-session')

const TaskUtil = require('./utils/TaskUtil')


const config = require('./config.js')

const _sessionSetting = {
    secret: 'simple-wbs-api-server',
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly: true,
        secure: false,
        maxage: 1000 * 60 * 30
    }
}

const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, {
    cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST']
    }
})
app.use(cors(config.cors))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(session(_sessionSetting))


const common = require('./common.js')

app.get('/', common.preProcess, (req, res) => {
    if(!req.session.viewCount) {
        req.session.viewCount = 0
    }
    req.session.viewCount++
    res.status(200).send(`Hello : ${req.session.viewCount}`)    
})

app.use('/api/auth', require('./router/auth'))

app.use('/api/accounts', common.preProcess, require('./router/accounts'))

app.use('/api/tasks', common.preProcess, require('./router/tasks'))
app.use('/api/resources', common.preProcess, require('./router/resources'))
app.use('/api/groups', common.preProcess, require('./router/groups'))
app.use('/api/holidays', common.preProcess, require('./router/holidays'))

TaskUtil.init()

let clients = []
io.on('connection', (socket) => {
    console.log('connect : ' + socket.id)
    clients.push({ id: socket.id })

    // トークンを作成
    const token = makeToken(socket.id)
    // 本人にトークンを送付
    io.to(socket.id).emit("onToken", {token:token})    

    socket.on('join', (o) => {
        const client = clients.find(c => c.id === socket.id)
        client.name = o.name
        console.log('# join()')
        io.emit('onUpdateClients', clients)
        console.log(clients)
    })

    socket.on('updateTasks', (o) => {
        TaskUtil.set(o.tasks)
        io.emit('onUpdateTasks', o)
    })

    socket.on('disconnect', () => {
        console.log('disconnect : ' + socket.id)
        clients = clients.filter(c => c.id !== socket.id)
        io.emit('onUpdateClients', clients)
        console.log(clients)
    })
})

http.listen(3010, () => {
    console.log('+ app start')
})


/**
 * トークンを作成する
 *
 * @param  {string} id - socket.id
 * @return {string}
 */
function makeToken(id){
    const str = "aqwsedrftgyhujiko" + id;
    return( crypto.createHash("sha1").update(str).digest('hex') );
}