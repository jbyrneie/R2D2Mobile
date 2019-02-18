import {getContactDetails, getTeeTimeDetails, getCookie, get_index, get_key_value} from './utils'
import axios from 'axios'
import status from './status'
import moment from 'moment'

const HOME_PAGE = 'https://www.brsgolf.com/CLUB/member/login'
const LOGIN_PAGE = 'https://www.brsgolf.com/CLUB/member/login_check'
const PAGE = 'https://www.brsgolf.com/CLUB/member/request'
const TEE_TIME_PAGE = 'https://www.brsgolf.com/wicklow/members_booking.php?operation=member_day&course_id1=1&d_date='
const BOOK_TEE_TIME = 'https://www.brsgolf.com/wicklow/members_booking.php?operation=member_process_booking'
const MEMBERS_BOOKING_FORM = 'https://www.brsgolf.com/wicklow/members_booking.php?operation=member_booking_form'

_seconds_to_time = function(seconds) {
  let measuredTime = new Date(null);
  measuredTime.setSeconds(seconds); // specify value of SECONDS
  return measuredTime.toISOString().substr(11, 8);
}

_get_tee_time_page = function(whatDate, phpsessid) {
  let data = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'R2D2 UA',
      'Cookie': `PHPSESSID=${phpsessid};`
    },
    credentials: 'include'
  }

  console.log('_get_tee_time_page fetching: ', JSON.stringify(data));
  // Get the Page
  return fetch(`${TEE_TIME_PAGE}${whatDate}`, data)
  .then((response) => {
    //console.log('response: ', response);
    if ((response._bodyInit.indexOf('To book a tee time') >= 0) || (response._bodyInit.indexOf('you have hit refresh too soon') >= 0)) {
      console.log(`tee-time page found for ${whatDate}`);
      return(response)
    } else {
      console.log('_get_tee_time_page eror: ', response._bodyInit);
      throw new Error(`tee-time page for ${whatDate} not found`)
    }
  })
}

_numFreeSlots = function(slots) {
    let numFree = 0;

    for (var i = 0; i < slots.length; i++)
      if (slots[i])
        numFree++

    return numFree
}

_get_tee_time = function(response, time) {
  console.log('_get_tee_time: ', time);

  const splitted = response.split("\n")
  console.log('splitted...');
  let index = get_index(splitted, time)
  console.log('index....');
  let freeSlots = [false, false, false, false]
  if (index >= 0) {
    console.log(`tee-time ${time} found`);

    if (splitted[index+4] == '<td></td>')
      freeSlots[0] = true

    if (splitted[index+5] == '<td></td>')
      freeSlots[1] = true

    if (splitted[index+6] == '<td></td>')
      freeSlots[2] = true

    if (splitted[index+7] == '<td></td>')
      freeSlots[3] = true

    console.log(`Free Slots: ${_numFreeSlots(freeSlots)}`);
    const isItBooked = splitted[index+8]
    const edit = splitted[index+14]

    if (isItBooked.indexOf('Booked') >= 0) {
      console.log('This line is booked')
      return {status: status.ALREADY_BOOKED, freeSlots: freeSlots}
    } else if (isItBooked.indexOf('Only Allowed 1 tee time') >= 0) {
      console.log('You can only book 1 tee-time')
      return {status: status.ALREADY_BOOKED_BY_YOU, freeSlots: freeSlots}
    } else if (isItBooked.indexOf('Only&nbsp;Allowed<br>4 Players') >= 0) {
      console.log('4 Players are booked already')
      return {status: status.ALREADY_BOOKED, freeSlots: freeSlots}
    } else if (isItBooked.indexOf('All 4 players are already booked') >= 0) {
      console.log('All 4 Players are aleady booked already')
      return {status: status.ALREADY_BOOKED, freeSlots: freeSlots}
    } else if (isItBooked.indexOf('Not Live Yet') >= 0) {
      console.log('This line is not live yet')
      return {status: status.NOT_LIVE_YET, freeSlots: freeSlots}
    } else if (edit.indexOf('Edit') >= 0) {
      console.log('This line is already booked by you')
      return {status: status.ALREADY_BOOKED_BY_YOU, freeSlots: freeSlots}
    }
    /*
    else {
      console.log('isItBooked: ', isItBooked);
      // TODO
    }
    */

    //else @@courseId = get_key_value('value', splitted[index+11])

    let bookingType = splitted[index+14]
    if (bookingType.indexOf('Casual') >= 0)
      bookingType = 'casual'
    else
      bookingType = 'competition'

    const bookNow = splitted[index+14]
    if (bookNow.indexOf('Book Now') >= 0) {
      return {status: status.AVAILABLE, freeSlots: freeSlots}
    } else {
      console.log('splitted... ', splitted);
      console.log(`9: ${splitted[index+9]} 10: ${splitted[index+10]} 11: ${splitted[index+11]} 12: ${splitted[index+12]} 13: ${splitted[index+13]} 14: ${splitted[index+14]}`);
      return {status: status.UNAVAILABLE, freeSlots: freeSlots}
    }
  } else {
    console.log(`didnt find tee-time for ${time}`);
    index = get_index(splitted, 'you have hit refresh too soon')
    if (index >= 0)
      return {status: status.REFRESH, freeSlots: freeSlots}
    else
      return {status: status.TIME_NOT_FOUND, freeSlots: freeSlots}
  }
}

_fillSlots = function(form, freeSlots, player1UID, player2UID, player3UID, player4UID) {
  let playerUIDs = [player1UID?player1UID:null, player2UID?player2UID:null, player3UID?player3UID:null, player4UID?player4UID:null]
  const slots = ['Player1_uid', 'Player2_uid', 'Player3_uid', 'Player4_uid']
  //console.log('_fillSlots: ', JSON.stringify(freeSlots));

  for (var i = 0; i < freeSlots.length; i++) {
    if (freeSlots[i]) {
      for (var j = 0; j < playerUIDs.length; j++) {
        if (playerUIDs[j] && playerUIDs[j]!=-1) {
          form[slots[i]] = playerUIDs[j]
          playerUIDs[j] = null
          break;
        }
      }
    }
  }

  //console.log('form: ', JSON.stringify(form));
  return form
}

_book_the_tee_time = function(bookingCode, phpsessid, freeSlots, teeTime, dateRequired, player1UID, player2UID, player3UID, player4UID) {
  let formData = new FormData();
  formData.append("double_click", 'yes')
  formData.append("course_id", 1)
  formData.append("d_date", dateRequired)
  formData.append("TeeTime", `${teeTime}:00`)
  formData.append("bookingCode", bookingCode)
  formData.append("Player1_uid", '64')
  formData.append("Player2_uid", '')
  formData.append("Player3_uid", '')
  formData.append("Player4_uid", '')
  //options.form = _fillSlots(options.form, freeSlots, player1UID, player2UID, player3UID, player4UID)

  let data = {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
      'User-Agent': 'R2D2 UA',
      'Cookie': `PHPSESSID=${phpsessid};`
    },
    credentials: 'include',
    body: formData
  }

  console.log('Booking withxxx: ', JSON.stringify(data));
  return fetch(BOOK_TEE_TIME, data)
    .then((response) => {
      //console.log('resp: ', response._bodyInit);
      if (response._bodyInit.indexOf('The tee time has been successfully booked') >= 0) {
        console.log(`tee-time booked for ${teeTime} on ${dateRequired}`);
        return(status.BOOKED)
      } else {
        throw new Error(`Bummer, the tee-time was not booked ${teeTime} on ${dateRequired}`)
      }
    })
    .catch(function (err) {
      console.log('error: ', err);
      return(status.ERROR)
    })
}

_get_time_difference = function(dateComesAlive) {
  console.log('_get_time_difference: ', dateComesAlive);
  const comesAlive = moment(dateComesAlive, 'YYYY-MM-DD HH:mm:ss')
	const now = moment(new Date());
  return moment.duration(comesAlive.diff(now)).asSeconds()
}

_book_the_tee_time_recursive = function(whatDate, time, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID) {
    console.log('_book_the_tee_time_recursivexxx....');
    return _get_tee_time_page(whatDate, phpsessid)
    .then((response) => {
      //console.log('response: ', response);
      const resp = _get_tee_time(response._bodyInit, time)
      console.log('resp: ', JSON.stringify(resp), status.AVAILABLE);

      switch (resp.status) {
        case status.NOT_LIVE_YET:
          console.log('NOT_LIVE_YET')
          return(status.NOT_LIVE_YET)
          break;
        case status.REFRESH:
          console.log('Found REFRESH so going to refresh another page instead')
          // Load another page to fool refresh
          let nextDay = moment(whatDate).add(1,'days').format('YYYY-MM-DD')
          return _get_tee_time_page(nextDay, phpsessid)
          .then((response) => {
            console.log('loaded dummy page response....');
            if ((response._bodyInit.indexOf('To book a tee time') >= 0) || (response._bodyInit.indexOf('you have hit refresh too soon') >= 0))
              // TODO console.log(`tee-time page found for ${whatDate}`);
              console.log('dummy refresh done....');
            return(_book_the_tee_time_recursive(whatDate, time, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID))
          })
          break
        case status.ALREADY_BOOKED:
          console.log('ALREADY_BOOKED')
          return(status.ALREADY_BOOKED)
          break
        case status.ALREADY_BOOKED_BY_YOU:
          console.log('ALREADY_BOOKED_BY_YOU')
          return(status.ALREADY_BOOKED_BY_YOU)
          break
        case status.UNAVAILABLE:
          console.log('TeeTime UNAVAILABLE')
          return(status.UNAVAILABLE)
          break
        case status.AVAILABLE:
          console.log(`Tee-time: ${time} is AVAILABLE on ${whatDate}`)
          console.log(`Reserving teeTime: ${time} freeSlots: ${JSON.stringify(resp.freeSlots)}`)

          let formData = new FormData();
          formData.append("double_click", 'yes')
          formData.append("course_id", 1)
          formData.append("d_date", whatDate)
          formData.append("TeeTime", `${time}:00`)
          formData.append("bookingCode", 'casual') //bookingType TODO

          let data = {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              'User-Agent': 'R2D2 UA',
              'Cookie': `PHPSESSID=${phpsessid};`
            },
            credentials: 'include',
            body: formData
          }

          console.log('Booking with: ', JSON.stringify(data));
          return fetch(MEMBERS_BOOKING_FORM, data)
          .then((response) => {
            if (response._bodyInit.indexOf('bookingCode') >= 0) {
              const splitted = response._bodyInit.split("\n")
              let index = get_index(splitted, 'bookingCode')

              if (index >= 0) {
                const bookingCode = get_key_value('value', splitted[index])
                console.log('Going to sleep for 20 seconds....', bookingCode)
                //console.log('bookingCode: ', bookingCode, splitted[index]);
                setTimeout(function() {
                  return _book_the_tee_time(bookingCode, phpsessid, resp.freeSlots, time, whatDate, player1UID, player2UID, player3UID, player4UID)
                  .then((response) => {
                    //console.log('_reserve_tee_time response: ', JSON.stringify(response));
                    return(status.BOOKED) // TODO
                  })
                }, 5000);
              } else {
                console.log('Bummer, bookingCode not found....')
                return(status.ERROR)
              }
            } else {
              console.log('Bummer, bookingCode not found....');
              return(status.ERROR)
            }
          })
          break
        default:
          console.log(`Dunno whats happening status is: ${status.STATUS_CODE[resp.status]}`)
          return(status.ERROR)
      }
  })
}

/*
_brs_recursive = function(teeTime, phpsessid) {
  console.log(`bookTeeTime teeTime:${teeTime} phpsessid: ${phpsessid}`);

  _book_the_tee_time_recursive(dateRequired, teeTime, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID)
  .then((response) => {
    console.log('_brs_recursive response: ', JSON.stringify(response));
    console.log('_brs_recursive response: ', status.STATUS_CODE[response.status]);
    switch(response.status) {
      case status.NOT_LIVE_YET:
        let timeDiff = _get_time_difference(dateComesAlive)
        console.log('timeDiff: ', timeDiff);
        let sleepTime = 0

        if (timeDiff > 90)
          sleeptime = 60000
        else if (timeDiff > 60)
          sleeptime = 10000
        else if (timeDiff > 10)
          sleeptime = 5000
        else if (timeDiff >= 1)
          sleeptime = 1000
        else if (timeDiff >= 0.4)
          sleeptime = 200
        else {
          console.log(`Date comes alive is in the past ${dateComesAlive}`);
          sleeptime = 100
          notLiveRetries++
        }

        if (notLiveRetries <= 3) {
          console.log(`Not Live Yet (retries: ${notLiveRetries}) so going to sleep for ${sleeptime/1000} seconds as time_diff is: ${_seconds_to_time(timeDiff>=0?timeDiff:-timeDiff)}\n\n`)
          setTimeout(function() {
            _book_the_tee_time_recursive(dateRequired, teeTime, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID)
          }, sleeptime);
        } else console.log('Giving up.... exceeded notLiveRetries.... goodbye');
        break;
      case status.BOOKED:
        console.log(`A Tee-time for ${teeTime} has been booked ${dateRequired}`);
        break;
      case status.UNAVAILABLE:
        console.log(`A Tee-time for ${teeTime} is unavailable on ${dateRequired}`);
        break;
      case status.ALREADY_BOOKED_BY_YOU:
        console.log(`What are doing, you have already booked a Tee-time for ${teeTime} on ${dateRequired}`);
        break;
      case status.ALREADY_BOOKED:
        console.log(`Bummer the Tee-time for ${teeTime} for ${dateRequired} is already taken`);
        console.log(`We should try the next one retries: ${retries}\n\n`);

        retries++

        if (retries <= 3) {
          teeTime = moment(teeTime, 'HH:mm').add(10, 'minutes').format('HH:mm')
          console.log(`retry[${retries}]: ${status.STATUS_CODE[response.status]}\n\n`);
          _book_the_tee_time_recursive(dateRequired, teeTime, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID)
        }
        break;
      case status.error:
        console.log(`There was an error when trying to book the Tee-time for ${teeTime} for ${dateRequired}`);
        break;
      default:
        console.log('Bummer.... we ran in to an error');
    }
  })
  .catch(function (err) {
    console.log('BRS error: ', err);
  })
}
*/

exports.login = function(contactDetails, activity) {
  console.log(`Login contactDetails: ${JSON.stringify(contactDetails)} activity: ${JSON.stringify(activity)}`);
  return axios({
    method:'get',
    headers: {
      'User-Agent': 'R2D2 UA'
    },
    url:HOME_PAGE.replace("CLUB", contactDetails.club),
    credentials: 'include'
  })
  .then(response => {
    const cookies = response.headers['set-cookie'][0]
    if (response.data.indexOf('Enter your 8 digit GUI') >= 0) {
      console.log('Home Page found....');
      activity.push('Logging in to BRS')
      return({token: get_key_value('_csrf_token', response.data), phpsessid: getCookie('PHPSESSID', cookies)})
    } else {
      console.log('Could find home page....');
      throw new Error('Failed to login.....')
    }
  })
  .then(sess_data => {
    console.log('data: ', JSON.stringify(sess_data));
    console.log('contactDetails: ', JSON.stringify(contactDetails));
    let formData = new FormData();
    formData.append("_username", contactDetails.username)
    formData.append("_password", contactDetails.password)
    formData.append("_csrf_token", sess_data.token)

    let data = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'User-Agent': 'R2D2 UA',
        'Cookie': `PHPSESSID=${sess_data.phpsessid};`
      },
      credentials: 'include',
      body: formData
    }

    console.log('Loggin in with: ', JSON.stringify(data));
    return fetch(LOGIN_PAGE.replace("CLUB", contactDetails.club), data)
    .then(response => {
      //console.log('LOGIN_PAGE response****: ', JSON.stringify(response));
      if (response._bodyInit.indexOf('Click here to book a tee time') >= 0) {
        activity.push('Logged in successfully')
        return({status: 9, phpsessid: sess_data.phpsessid, activity: activity})
      } else {
        console.log('NOT Logged in successfully');
        throw new Error('Failed to login.....')
      }
    })
  })
  .catch(function (err) {
    console.log('error********: ' + err);
    activity.push('Error: ' + err)
    return({status: 1, phpsessid: null, activity: activity})
  })
}

exports.bookTeeTime = function(phpsessid, dateComesAlive, dateRequired, teeTime, player1UID, player2UID, player3UID, player4UID, activity) {
  console.log(`bookTeeTime dateRequired: ${dateRequired} teeTime:${teeTime} phpsessid: ${phpsessid}`);
  let notLiveRetries = 0
  let retries = 0

  return _book_the_tee_time_recursive(dateRequired, teeTime, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID)
  .then((response) => {
    //console.log('_brs_recursive response: ', JSON.stringify(response));
    console.log('_brs_recursive response: ', status.STATUS_CODE[response]);
    switch(response) {
      case status.NOT_LIVE_YET:
        let timeDiff = _get_time_difference(dateComesAlive)
        console.log('timeDiff: ', timeDiff);
        let sleepTime = 0

        if (timeDiff > 90)
          sleeptime = 60000
        else if (timeDiff > 60)
          sleeptime = 10000
        else if (timeDiff > 10)
          sleeptime = 5000
        else if (timeDiff >= 1)
          sleeptime = 1000
        else if (timeDiff >= 0.4)
          sleeptime = 200
        else {
          console.log(`Date comes alive is in the past ${dateComesAlive}`);
          activity.push(`Date comes alive is in the past ${dateComesAlive}`)
          sleeptime = 100
          notLiveRetries++
        }

        if (notLiveRetries <= 3) {
          console.log(`Not Live Yet (retries: ${notLiveRetries}) so going to sleep for ${sleeptime/1000} seconds as time_diff is: ${_seconds_to_time(timeDiff>=0?timeDiff:-timeDiff)}\n\n`)
          activity.push(`Not Live Yet (retries: ${notLiveRetries}) so going to sleep for ${sleeptime/1000} seconds as time_diff is: ${_seconds_to_time(timeDiff>=0?timeDiff:-timeDiff)}`)
          setTimeout(function() {
            const resp = _book_the_tee_time_recursive(dateRequired, teeTime, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID)
            if (resp == status.BOOKED) {
              console.log(`Tee Time booked for ${teeTime} on ${dateRequired}`);
              activity.push(`Tee Time booked for ${teeTime} on ${dateRequired}`)
              return({activity: activity})
            }
          }, sleeptime);
        } else {
          console.log('Giving up.... exceeded notLiveRetries.... goodbye');
          activity.push('Giving up.... exceeded notLiveRetries.... goodbye')
        }
        break;
      case status.BOOKED:
        console.log(`Tee Time booked for ${teeTime} on ${dateRequired}`);
        activity.push(`Tee Time booked for ${teeTime} on ${dateRequired}`);
        break;
      case status.UNAVAILABLE:
        console.log(`A Tee-time for ${teeTime} is unavailable on ${dateRequired}`);
        activity.push(`A Tee-time for ${teeTime} is unavailable on ${dateRequired}`);
        break;
      case status.ALREADY_BOOKED_BY_YOU:
        console.log(`What are doing, you have already booked a Tee-time for ${teeTime} on ${dateRequired}`);
        activity.push(`What are doing, you have already booked a Tee-time for ${teeTime} on ${dateRequired}`);
        break;
      case status.ALREADY_BOOKED:
        console.log(`Bummer the Tee-time for ${teeTime} for ${dateRequired} is already taken`);
        console.log(`We should try the next one retries: ${retries}\n\n`);

        retries++

        if (retries <= 3) {
          teeTime = moment(teeTime, 'HH:mm').add(10, 'minutes').format('HH:mm')
          console.log(`retry[${retries}]: ${status.STATUS_CODE[response.status]}\n\n`);
          activity.push(`retry[${retries}]: ${status.STATUS_CODE[response.status]}`)
          _book_the_tee_time_recursive(dateRequired, teeTime, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID)
        }
        break;
      case status.error:
        console.log(`There was an error when trying to book the Tee-time for ${teeTime} for ${dateRequired}`);
        activity.push(`There was an error when trying to book the Tee-time for ${teeTime} for ${dateRequired}`);
        break;
      default:
        console.log('Bummer.... we ran in to an error');
        activity.push('Bummer.... we ran in to an error');
    }
    return({activity: activity})
  })
  .catch(function (err) {
    console.log('BRS error: ', err);
    activity.push('BRS error: ' + err)
    return({activity: activity})
  })
}
