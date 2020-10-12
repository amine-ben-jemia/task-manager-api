const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail,sendCancellationEmail } = require('../emails/account')



router.post('/users', async (req , res)=>{
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
        
    }catch(e){
        res.status(400).send(e)
    }
    // sans fonction await async
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

router.post('/users/login', async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.generateAuthToken()

        res.send({user,token})
    }catch(e){
        res.status(400).send()
    }
})



router.post('/users/logout',auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            
            return token.token !== req.token
        })

        await req.user.save()
        res.send()

    }catch (e){
        res.status(500).send()
    }
})
router.post('/users/logoutAll',auth, async(req,res)=>{
    try{
        req.user.tokens =[]

        await req.user.save()
        res.send()

    }catch (e){
        res.status(500).send()
    }
})


router.get('/users/me', auth ,async (req,res)=>{

    res.send(req.user)

    // User.find({}).then((users)=>{
    //     res.send(users)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})



// router.get('/users', auth ,async (req,res)=>{
//     try{
//         const users = await User.find({})
//         res.status(400).send(users)
//     }catch(e){
//         res.status(500).send(e)
//     }

//     // User.find({}).then((users)=>{
//     //     res.send(users)
//     // }).catch((e)=>{
//     //     res.status(500).send()
//     // })
// })

router.get('/users/:id', async (req,res)=>{
    const _id = req.params.id
    try{
        const user = await User.findById(_id)
        if (!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch(e){
        res.status(500).send(e)
    }
    // User.findById(_id).then((user)=>{
    //     if(!user){
    //         return res.status(404).send()
    //     }
    //     res.send(user)
    // }).catch((e)=>{
    // res.status(500).send()
    // })
})

router.patch('/users/me', auth ,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if (!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})


// router.patch('/users/:id',async(req,res)=>{
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name','email','password','age']
//     const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
//     if (!isValidOperation){
//         return res.status(400).send({error: 'Invalid updates!'})
//     }
//     try {
//         const user = await User.findById(req.params.id)
//         updates.forEach((update) => user[update] = req.body[update])
//         await user.save()

//         //Si on laisse cette structure findByIdAndUpdate bypass (controune) Mongoose
//         // const user = await User.findByIdAndUpdate(req.params.id,req.body,{ new:true, runValidators:true})
        
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e){
//         res.status(400).send(e)
//     }
// })

router.delete('/users/me', auth ,async (req,res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        sendCancellationEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

const upload = multer({
    limits : {
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        // fonction match(/expressionreguliere/) prend en parametre une expression reguliere
        // \. c a dire on cherche le caractere qui vient apres le . dans le nom du fichier
        // $ c a dire a la fin du nom du fichier c a dire ya rien apres le mot doc ou docx
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})



router.post('/users/me/avatar',auth, upload.single('avatar') , async (req,res)=> {
    const buffer = await sharp(req.file.buffer).resize({ width:150,height:150 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth ,async (req,res)=>{
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send()
})

// router.delete('/users/:id',async(req,res)=>{
//     try{
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e){
//         res.status(500).send(e)
//     }
// })

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})


module.exports = router