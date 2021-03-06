const { google } = require('googleapis');

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

  function addEvent(auth, event) {
    const calendar = google.calendar({version: 'v3', auth});
    event = {
      'summary': event.name,
      'location': event.address,
      'description': event.description,
      'start': {
        'dateTime': event.local_date_start,
        'timeZone': event.timezone,
      },
      'end': {
        'dateTime': event.local_date_end,
        'timeZone': event.timezone,
      },
    };

    calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    }, function(err, event) {
      if (err) {
        console.log('There was an error contacting the Calendar service: ' + err);
        return;
      }
      console.log('Event created: %s', event.htmlLink);
    });
  }

  function listEvents(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = res.data.items;
      if (events.length) {
        console.log('Upcoming 10 events:');
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          console.log(`${start} - ${event.summary}`);
        });
      } else {
        console.log('No upcoming events found.');
      }
    });
  }



  return {
   authorize,
   addEvent,
   listEvents
  }
}
