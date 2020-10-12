const express = require ('express')
require('./db/mongoose')
const app = express()
const port = process.env.PORT
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const bycrypt = require('bcryptjs')
const Task = require('./models/task')
const User = require('./models/user')


// app.use((req,res,next)=>{
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     }else {
//         next()
//     }
// })

// maintenance message

// app.use((req,res,next)=>{
//     res.status(503).send('Site is currently down. Check back soon !')
// })




//configuration des routes 
//express.json est une methode qui reconnait les requetes object en tant que des objets-
//json
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



//demarrer le serveur local
app.listen(port,()=>{
    console.log('Server is up on port '+port)
})


