// const nodemailer = require("nodemailer");

// const sendEmail = async (email, subject, text) => {
//     try {
//         let testAccount = await nodemailer.createTestAccount();

//         // create reusable transporter object using the default SMTP transport
//         let transporter = nodemailer.createTransport({
//           host: "smtp.ethereal.email",
//           port: 587,
//           secure: false, // true for 465, false for other ports
//           auth: {
//             user: testAccount.user, // generated ethereal user
//             pass: testAccount.pass, // generated ethereal password
//           },
//         });

//         await transporter.sendMail({
//             from: testAccount.user,
//             to: email,
//             subject: subject,
//             text: text,
//         });

//         console.log("email sent sucessfully");
//     } catch (error) {
//         console.log(error, "email not sent");
//     }
// };

// module.exports = sendEmail;
<script src="https://smtpjs.com/v3/smtp.js"></script>
function sendEmail() {
  Email.send({
    Host: "smtp.gmail.com",
    Username: "sohillalakiya2306@gmail.com",
    Password: "sohilm@2306$$##",
    To: "sohillalakiya2306@gmail.com",
    From: "sohillalakiya2306@gmail.com",
    Subject: "subject",
    Body: "Hello There",
  }).then((message) => alert("mail sent successfully"));
}
sendEmail()