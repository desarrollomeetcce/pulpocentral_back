

const accountSid = "AC0aee570a295ef12de9105ae2b418a40a";
const authToken = "3ff05bdf0f51ee151d9fc941ded9b773";
const client = require('twilio')(accountSid, authToken);

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