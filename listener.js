const notifier = require('mail-notifier');

const imap = {
  user: 'nirojshah102@gmail.com',
  password: 'nthp rmpu yjdd hbpz',
  host: 'imap.gmail.com',
  port: 993, // imap port
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};

notifier(imap).on('mail', (mail) => {
  console.log(mail.from)
  console.log(mail.to)
  console.log(mail.subject)
  console.log(mail.text)
}).start();
