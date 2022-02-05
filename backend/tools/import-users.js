const fs = require('fs')
const { parse } = require('csv-parse/sync')
const bcrypt = require('bcrypt')

const accounts = require('../db/accounts.json')

// accounts.csv に含まれるユーザー
let importAccounts = parse(
    fs.readFileSync('../csv-files/accounts.csv', 'utf-8'),
    {
        columns: true
    }
)
// default password 追加
importAccounts = importAccounts.map(u => {
    return {
        ...u,
        password: bcrypt.hashSync('testtest', 10)
    }
})
// 存在しないユーザーであれば追加
importAccounts.forEach(u => {
    if(!accounts.find(uu => uu.id == u.id)) {
        accounts.push(u)
    }
})
fs.writeFileSync('../db/accounts.json', JSON.stringify(accounts), 'utf-8')
