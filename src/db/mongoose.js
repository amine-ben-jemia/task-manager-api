const mongoose = require('mongoose')

mongoose.connect(env.process(MONGODB_URL),{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false
})















