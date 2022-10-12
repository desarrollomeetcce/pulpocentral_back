

const twilioAccountSid = 'AC0aee570a295ef12de9105ae2b418a40a';
const twilioApiKey = 'SK722fb1962d7bed87a60a4c84cc39d49f';
const twilioApiSecret = 'KnYo54OPxZ1oVNqY7Dwn1e1xZ8CL0SKC';

// Initialize a Twilio client
const client = require('twilio')(twilioApiKey, twilioApiSecret, {
    accountSid: twilioAccountSid });

async function call(number) {
    try {
        const resp = await client.calls.create({
            url: 'https://pulpo.sfo3.digitaloceanspaces.com/twilio/test.xml',
            to: number,
            from: '+19787055002',
            method: 'GET'
        })
        return resp;

    } catch (err) {
        console.log(err);
        return err;
    }
}


call("+525547649443");