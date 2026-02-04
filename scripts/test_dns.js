const dns = require('dns');
const hostname = 'db.ssvhmcufqcswgwdblalk.supabase.co';

console.log(`Looking up ${hostname}...`);
dns.lookup(hostname, (err, address, family) => {
    if (err) {
        console.error('DNS Lookup Error:', err);
    } else {
        console.log('Address:', address);
        console.log('Family:', family);
    }
});
