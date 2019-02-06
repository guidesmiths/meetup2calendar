const axios = require('axios');
const moment = require('moment');
const { authorize, addEvent, listEvents } = require('./calendar')();

// get the list of the next events in a group

const options = {
  groups: [
    'madridjs',
    'ironhack-madrid',
    'Smart-devices-for-Home-Madrid'
  ]
};

const getFullAddress = (event) => {
   let address =`${'address_1' in event.venue ? event.venue.address_1 : ''} ${event.venue.city} ${event.venue.localized_country_name}`
   return address;
}

const composeEvent = (event) => ({
  id: event.id,
  name: event.name,
  link: event.link,
  description: event.description,
  local_date_start: new Date(`${event.local_date}T${event.local_time}:00`),
  local_date_end: moment(new Date(`${event.local_date}T${event.local_time}:00`)).add(2, 'HOURS'),
  city: 'Madrid',
  timezone: event.group.timezone,
  address: getFullAddress(event)
});

const googleOptions = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uri: 'http://localhost',
}


let currentEvent = '';
let eventsIds = [];
options.groups.forEach(
 (group) => axios.get(`https://api.meetup.com/${group}/events?&key=${process.env.MEETUP_KEY}&sign=true&photo-host=public&page=20&status=upcoming`)
  .then(
    ({ data: events }) => {
      events.map((event) => {
        eventsIds.push(event.id);
        currentEvent = composeEvent(event);
        authorize(googleOptions)
        .then((auth) => {
          addEvent(auth, currentEvent);
        })
        console.log(eventsIds);
        return currentEvent;
      })
  })
)
