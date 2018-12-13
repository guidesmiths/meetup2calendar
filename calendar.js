module.exports = () => {
  const fs = require('fs');
  const util = require('util');
  const readline = require('readline');
  const {google} = require('googleapis');

  const SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly'
  ];

  const TOKEN_PATH = 'token.json';

  const readFile = util.promisify(fs.readFile);
  const writeFile = util.promisify(fs.writeFile);

  const getToken = (code, oAuth2Client) => new Promise((resolve, reject) => {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return reject('Error retrieving access token', err);
      }
      oAuth2Client.setCredentials(token);
      writeFile(TOKEN_PATH, JSON.stringify(token))
        .then(resolve(oAuth2Client));
    });
  });

  async function authorize({ client_id, client_secret, redirect_uri }) {
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
    let token = '' ;

    if (fs.existsSync(TOKEN_PATH)) {
      token = await readFile(TOKEN_PATH);
      oAuth2Client.setCredentials(JSON.parse(token));
    } else {
      token = await getNewToken(oAuth2Client);
    }
    return oAuth2Client;
  }

  function getNewToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        getToken(code, oAuth2Client).then((oAuth2Client) => resolve(oAuth2Client));
      });
    });
  }

  function addEvent(authorize, event) {
    console.log('I am goint to add a new event', event);
  }

  return {
   authorize,
   addEvent
  }
}
