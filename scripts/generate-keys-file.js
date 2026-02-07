const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
const fs = require('fs');

const content = `
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
NEXT_PUBLIC_VAPID_SUBJECT=mailto:support@velox.app
`;

fs.writeFileSync('vapid_keys.txt', content);
console.log('Keys written to vapid_keys.txt');
