const Imap = require('imap');
const { simpleParser } = require('mailparser');

async function fetchEmailThreads(imapConfig, messageId) {
    return new Promise((resolve, reject) => {
        const imap = new Imap(imapConfig);

        const openInbox = (cb) => {
            imap.openBox('INBOX', true, cb);
        };

        const openSent = (cb) => {
            imap.openBox('[Gmail]/Sent Mail', true, cb);
        };

        const searchEmails = (boxName, criteria, cb) => {
            imap.openBox(boxName, true, (err, box) => {
                if (err) return cb(err);
                imap.search(criteria, (err, results) => {
                    if (err) return cb(err);
                    cb(null, results);
                });
            });
        };

        const fetchEmail = (uids, cb) => {
            const fetch = imap.fetch(uids, { bodies: '' });
            const emails = [];

            fetch.on('message', (msg) => {
                msg.on('body', (stream) => {
                    simpleParser(stream, (err, parsed) => {
                        if (err) return cb(err);
                        emails.push(parsed);
                    });
                });
            });

            fetch.on('end', () => {
                cb(null, emails);
            });

            fetch.on('error', (err) => {
                cb(err);
            });
        };

        const getThreadCriteria = (messageId, references, inReplyTo) => {
            const criteria = ['OR', ['HEADER', 'MESSAGE-ID', messageId]];
            if (references) {
                criteria.push(['HEADER', 'REFERENCES', references]);
            }
            if (inReplyTo) {
                criteria.push(['HEADER', 'IN-REPLY-TO', inReplyTo]);
            }
            return criteria;
        };

        imap.once('ready', () => {
            openInbox((err, box) => {
                if (err) return reject(err);

                const criteria = ['HEADER', 'MESSAGE-ID', messageId];

                searchEmails('INBOX', criteria, (err, inboxResults) => {
                    if (err) return reject(err);
                    if (inboxResults.length === 0) return resolve([]);

                    const uid = inboxResults[0];
                    fetchEmail([uid], (err, emails) => {
                        if (err) return reject(err);

                        const email = emails[0];
                        const { references, inReplyTo } = email;
                        const threadCriteria = getThreadCriteria(messageId, references, inReplyTo);

                        searchEmails('INBOX', threadCriteria, (err, threadResultsInbox) => {
                            if (err) return reject(err);

                            searchEmails('[Gmail]/Sent Mail', threadCriteria, (err, threadResultsSent) => {
                                if (err) return reject(err);

                                const allThreadUids = [...new Set([...threadResultsInbox, ...threadResultsSent])];

                                fetchEmail(allThreadUids, (err, threadEmails) => {
                                    if (err) return reject(err);
                                    resolve(threadEmails);
                                });
                            });
                        });
                    });
                });
            });
        });

        imap.once('error', (err) => {
            reject(err);
        });

        imap.connect();
    });
}

// Example usage
const imapConfig = {
    user: 'your-email@gmail.com',
    password: 'your-password',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
};

const messageId = '<your-message-id>';

fetchEmailThreads(imapConfig, messageId)
    .then(threads => {
        console.log('Email threads:', threads);
    })
    .catch(err => {
        console.error('Error fetching email threads:', err);
    });


















const Imap = require('imap');
const { simpleParser } = require('mailparser');

async function fetchEmailThreads(imapConfig, messageId) {
    return new Promise((resolve, reject) => {
        const imap = new Imap(imapConfig);

        const openBox = (boxName, cb) => {
            imap.openBox(boxName, true, cb);
        };

        const searchEmails = (criteria, cb) => {
            imap.search(criteria, (err, results) => {
                if (err) return cb(err);
                cb(null, results);
            });
        };

        const fetchEmails = (uids, cb) => {
            if (uids.length === 0) return cb(null, []);
            const fetch = imap.fetch(uids, { bodies: '' });
            const emails = [];

            fetch.on('message', (msg) => {
                msg.on('body', (stream) => {
                    simpleParser(stream, (err, parsed) => {
                        if (err) return cb(err);
                        emails.push(parsed);
                    });
                });
            });

            fetch.on('end', () => {
                cb(null, emails);
            });

            fetch.on('error', (err) => {
                cb(err);
            });
        };

        const getThreadCriteria = (messageId, references, inReplyTo) => {
            const criteria = ['OR', ['HEADER', 'MESSAGE-ID', messageId]];
            if (references) {
                criteria.push(['HEADER', 'REFERENCES', references]);
            }
            if (inReplyTo) {
                criteria.push(['HEADER', 'IN-REPLY-TO', inReplyTo]);
            }
            return criteria;
        };

        imap.once('ready', () => {
            openBox('INBOX', (err, box) => {
                if (err) return reject(err);

                const criteria = ['HEADER', 'MESSAGE-ID', messageId];

                searchEmails(criteria, (err, inboxResults) => {
                    if (err) return reject(err);
                    if (inboxResults.length === 0) return resolve([]);

                    const uid = inboxResults[0];
                    fetchEmails([uid], (err, emails) => {
                        if (err) return reject(err);

                        const email = emails[0];
                        const references = email.references ? email.references.join(' ') : '';
                        const inReplyTo = email.inReplyTo || '';
                        const threadCriteria = getThreadCriteria(messageId, references, inReplyTo);

                        openBox('INBOX', (err) => {
                            if (err) return reject(err);

                            searchEmails(threadCriteria, (err, threadResultsInbox) => {
                                if (err) return reject(err);

                                openBox('[Gmail]/Sent Mail', (err) => {
                                    if (err) return reject(err);

                                    searchEmails(threadCriteria, (err, threadResultsSent) => {
                                        if (err) return reject(err);

                                        const allThreadUids = [...new Set([...threadResultsInbox, ...threadResultsSent])];

                                        fetchEmails(allThreadUids, (err, threadEmails) => {
                                            if (err) return reject(err);
                                            resolve(threadEmails);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        imap.once('error', (err) => {
            reject(err);
        });

        imap.connect();
    });
}

// Example usage
const imapConfig = {
    user: 'your-email@gmail.com',
    password: 'your-password',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
};

const messageId = '<your-message-id>';

fetchEmailThreads(imapConfig, messageId)
    .then(threads => {
        console.log('Email threads:', threads);
    })
    .catch(err => {
        console.error('Error fetching email threads:', err);
    });















const Imap = require('imap');

async function fetchThreadByMessageId(imapConfig, messageId) {
  const imap = new Imap(imapConfig);

  try {
    const connection = await imap.connect();

    // Define mailboxes to search
    const mailboxes = ['INBOX', '[Gmail]/Sent Mail']; // Adjust mailbox names as needed

    const threads = [];

    // Loop through each mailbox
    for (const mailbox of mailboxes) {
      await connection.openBox(mailbox);

      // Search for messages with matching Message-ID or References
      const searchCriteria = ['OR', ['HEADER', 'Message-ID', messageId], ['HEADER', 'References', messageId]];
      const messages = await connection.search(searchCriteria, true);

      // Process retrieved messages
      for (const uid of messages) {
        const message = await connection.fetch([uid], { bodies: '' });
        threads.push({ mailbox, message: message[uid] });
      }

      await connection.closeBox();
    }

    await imap.disconnect();

    return threads;
  } catch (error) {
    console.error('Error fetching thread:', error);
    throw error; // Re-throw for further handling
  }
}

// Example usage
const imapConfig = {
  user: 'your_username',
  password: 'your_password',
  host: 'imap.yourserver.com',
  port: 993,
  tls: true, // Use secure connection
};

const messageId = '<unique_message_id@domain.com>';

fetchThreadByMessageId(imapConfig, messageId)
  .then(threads => {
    console.log('Fetched threads:');
    for (const thread of threads) {
      console.log(`  - Mailbox: ${thread.mailbox}`);
      console.log('    Message:', thread.message); // You can access specific message properties here
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });













const Imap = require('imap');
const { simpleParser } = require('mailparser');

async function fetchInboxEmails(imapConfig) {
    return new Promise((resolve, reject) => {
        const imap = new Imap(imapConfig);

        const openInbox = (cb) => {
            imap.openBox('INBOX', true, cb);
        };

        const searchEmails = (criteria, cb) => {
            imap.search(criteria, (err, results) => {
                if (err) return cb(err);
                cb(null, results);
            });
        };

        const fetchEmails = (uids, cb) => {
            if (uids.length === 0) return cb(null, []);
            const fetch = imap.fetch(uids, { bodies: '' });
            const emails = [];

            fetch.on('message', (msg) => {
                msg.on('body', (stream) => {
                    simpleParser(stream, (err, parsed) => {
                        if (err) return cb(err);
                        emails.push(parsed);
                    });
                });
            });

            fetch.on('end', () => {
                cb(null, emails);
            });

            fetch.on('error', (err) => {
                cb(err);
            });
        };

        imap.once('ready', () => {
            openInbox((err, box) => {
                if (err) return reject(err);

                const criteria = ['ALL'];

                searchEmails(criteria, (err, inboxResults) => {
                    if (err) return reject(err);
                    if (inboxResults.length === 0) return resolve([]);

                    fetchEmails(inboxResults, (err, emails) => {
                        if (err) return reject(err);

                        // Filter out replies and only keep the first email in a thread
                        const uniqueThreads = new Map();

                        emails.forEach(email => {
                            if (!email.references && !email['in-reply-to']) {
                                uniqueThreads.set(email.messageId, email);
                            } else if (email.references) {
                                const rootMessageId = email.references[0];
                                if (!uniqueThreads.has(rootMessageId)) {
                                    uniqueThreads.set(rootMessageId, email);
                                }
                            }
                        });

                        resolve(Array.from(uniqueThreads.values()));
                    });
                });
            });
        });

        imap.once('error', (err) => {
            reject(err);
        });

        imap.connect();
    });
}

// Example usage
const imapConfig = {
    user: 'your-email@gmail.com',
    password: 'your-password',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
};

fetchInboxEmails(imapConfig)
    .then(emails => {
        emails.forEach(email => {
            console.log(`From: ${email.from.text}`);
            console.log(`Subject: ${email.subject}`);
            console.log(`Date: ${email.date}`);
            console.log('-----------------------');
        });
    })
    .catch(err => {
        console.error('Error fetching emails:', err);
    });



