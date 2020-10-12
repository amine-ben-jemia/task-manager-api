const mongoose = require('mongoose')
const validator = require('validator')
const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//on utilise schema pour avoir l'acces au middelware pour passer le hashage du 
//password avant 'save' 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if (value < 0 ){
                throw new Error('Age must be a positive number')
            }

        },
        
    },
    password:{
        type: String,
        default: 0,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if (value.toLowerCase().includes('password')) {
                throw new Error('Incrorrect Password')
            }
        },
        
    },
    email: {
        type: String,
        unique:true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error ('Email is invalid')
            }

        }
    },
    tokens:[{
        token:{
            type:String,
            required: true,
        }
    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})


// profile
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject 
}


userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id:user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token

}



userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({ email })

    if (!user){
        throw new Error('Unable to login')
    }
    
    const isMatch = await bycrypt.compare(password,user.password)

    if (!isMatch){
        throw new Error('Unable to login')
    }

    return user
}


//Hash the plain text password before saving
// userSchema.pre = avant / userSchema.post = apres
userSchema.pre('save', async function(next){
    const user = this
    if (user.isModified('password')){
    // console.log('just before saving!')
        user.password = await bycrypt.hash(user.password,8)
    }

    next()
})

userSchema.pre('remove',async function (next){
    const user = this
    await Task.deleteMany({ owner:user._id})

    next()
})


const User = mongoose.model('User',userSchema)

// const me = new User ({
//     name: 'bibo',
//     email: ' Amine@gmail.com',
//     password: 'Password1523'
    
// })

// me.save().then(()=>{
//     console.log(me)
// }).catch((error)=>{
//     console.log('Error!',error)
// })
module.exports = User