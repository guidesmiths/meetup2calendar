const axios = require('axios');
const { google } = require('googleapis');

// get the list of my next events
const options = {
  groups: ['madridjs', 'ironhack-madrid']
}

const composeEvent = (event) => ({
  id: event.id,
  name: event.name,
  link: event.link,
  description: event.description,
})

const getUpcomingEvents = ({ groups }) => new Promise ((resolve, reject) => groups.forEach(
  (group) => axios.get(`https://api.meetup.com/${group}/events?&key=${process.env.MEETUP_KEY}&sign=true&photo-host=public&page=20&status=upcoming`)
  .then(({ data: events }) => {
    resolve(events.map(composeEvent));
  }).catch(reject)
))

const createApointment = (events) => {
  const calendar = google.calendar('v3');

  var event = {
    'summary': 'Google I/O 2015',
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
      'dateTime': '2015-05-28T09:00:00-07:00',
      'timeZone': 'America/Los_Angeles',
    },
    'end': {
      'dateTime': '2015-05-28T17:00:00-07:00',
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
    auth: 'secret',
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

// create a calendar apointment in google calendar

getUpcomingEvents(options)
  .then(() => createApointment())
  .catch(err => console.log(err))
