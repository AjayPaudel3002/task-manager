const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "b.ajpaudel@gmail.com",
        subject: "Welcome ",
        text: `Hi ${name} , welcome onboard`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "b.ajpaudel@gmail.com",
        subject: "Cancellation Email ",
        text: `Hi ${name},\n \nLooking forward for you comeback again! `
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}
