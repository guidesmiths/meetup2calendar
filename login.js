module.exports = () => {
  const fs = require('fs');
  const util = require('util');
  const readline = require('readline');
  const {google} = require('googleapis');

  const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
  const TOKEN_PATH = 'token.json';

  const readFile = util.promisify(fs.readFile);
  const writeFile = util.promisify(fs.writeFile);

  const getToken = (code, oAuth2Client) => new Promise((resolve, reject) => {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return reject('Error retrieving access token', err);
      }
      oAuth2Client.setCredentials(token);
      writeFile(TOKEN_PATH, JSON.stringify())
        .then(resolve(oAuth2Client));
    });
  });

  async function authorize() {
    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const redirect_uri = 'http://localhost';

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
    let token = '' ;

    if (fs.existsSync(TOKEN_PATH)) {
      token = await readFile(TOKEN_PATH);
    } else {
      token = await getNewToken(oAuth2Client);
    }

    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }

  async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (err, code) => {
      rl.close();
      getToken(code, oAuth2Client).then((oAuth2Client) => oAuth2Client);
    });
  }

  function listLabels(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.labels.list({
      userId: 'me',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const labels = res.data.labels;
      if (labels.length) {
        console.log('Labels:');
        labels.forEach((label) => {
          console.log(`- ${label.name}`);
        });
      } else {
        console.log('No labels found.');
      }
    });
  }

  return {
   authorize,
   listLabels
  }
}
