const axios = require('axios');
const { google } = require('googleapis');
const { authorize, listEvents } = require('./login')();

// get the list of the next events in a group

const options = {
  groups: ['madridjs', 'ironhack-madrid']
};

const composeEvent = (event) => ({
  id: event.id,
  name: event.name,
  link: event.link,
  description: event.description,
});

const googleOptions = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: 'http://localhost',
}

const getUpcomingEvents = ({ groups }, auth) => new Promise ((resolve, reject) => groups.forEach(
  (group) => axios.get(`https://api.meetup.com/${group}/events?&key=${process.env.MEETUP_KEY}&sign=true&photo-host=public&page=20&status=upcoming`)
  .then(({ data: events }) => {
    return resolve(events.map(composeEvent));
  })
  .catch(reject)
))

const createApointment = (auth, events) => {
  const calendar = google.calendar({version: 'v3', auth});
  console.log('calendar ', calendar.events);
  console.log('calendar ', calendar.calendarList.list());
  let event = events[0]; //temp

  event = {
    'summary': 'Google I/O 2015',
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
      'dateTime': '2018-12-10T09:00:00-07:00',
      'timeZone': 'America/Los_Angeles',
    },
    'end': {
      'dateTime': '2018-12-10T17:00:00-07:00',
      'timeZone': 'America/Los_Angeles',
    },
    'recurrence': [
      'RRULE:FREQ=DAILY;COUNT=2'
    ],
    'attendees': [
      {'email': 'lpage@example.com'},
      {'email': 'sbrin@example.com'},
    ],
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10},
      ],
    },
  };

  calendar.events.insert({
    calendarId: 'Familia',
    resource: event,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', event.htmlLink);
  });
}

authorize(googleOptions)
  .then((auth) => {
     // createApointment(auth, events)
      listEvents(auth);
  })
  .catch((err) => console.log('err', err));
