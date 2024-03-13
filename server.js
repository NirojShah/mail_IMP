var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nirojshah102@gmail.com',
    pass: 'nthp rmpu yjdd hbpz'
  }
});

var mailOptions = {
  from: "NO-REPLY'<nirojshah102@gmail.com>'",
  to: 'nenixet695@cmheia.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});