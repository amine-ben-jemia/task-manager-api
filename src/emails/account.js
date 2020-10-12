const sgMail = require('@sendgrid/mail')
//const sendgridAPIKey = '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'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to: 'amine.ben.jemia@gmail.com',
//     from: 'amine.ben.jemia@gmail.com',
//     subject: 'This is my first creation!',
//     text: 'I hope this one actually get to you'
// })

const sendWelcomeEmail = (email,name)=> {
    sgMail.send({
        to: email,
        from: 'amine.ben.jemia@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}

const sendCancellationEmail = (email,name)=> {
    sgMail.send({
        to: email,
        from: 'amine.ben.jemia@gmail.com',
        subject: 'Sorry to see you go',
        text: `Goodbye , ${name}. I hope see you back sometime soon`
    })
}
 module.exports = {
     sendWelcomeEmail,
     sendCancellationEmail
 }