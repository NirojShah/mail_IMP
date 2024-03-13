const Imap = require('imap');

const imap = new Imap({
    user: 'nirojshah102@gmail.com',
    password: 'nthp rmpu yjdd hbpz',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: {
        rejectUnauthorized: false
    }
});



let emails = [];

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

imap.once('ready', function() {
  openInbox(function(err, box) {
    if (err) throw err;
    imap.search(['ALL'], function(err, seqnums) {
      if (err) throw err;
      const fetch = imap.fetch(seqnums, { bodies: '' });
      fetch.on('message', function(msg, seqno) {
        console.log('Message #%d', seqno);
        const emailData = {
          seqno: seqno,
          header: {},
          bodies: []
        };
        msg.on('body', function(stream, info) {
          let buffer = '';
          stream.on('data', function(chunk) {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', function() {
            emailData.bodies.push({ type: 'text', content: buffer });
          });
        });
        msg.once('attributes', function(attrs) {
          emailData.header = attrs;
        });
        msg.once('end', function() {
          emails.push(emailData);
          console.log('Parsed email:', emailData);
        });
      });
      fetch.once('error', function(err) {
        console.error('Fetch error: ' + err);
      });
      fetch.once('end', function() {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  });
});

imap.once('error', function(err) {
  console.error(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();
