import {getContactDetails, getTeeTimeDetails, getCookie, get_index, get_key_value} from './utils'
import axios from 'axios'
import status from './status'
import moment from 'moment'

const HOME_PAGE = 'https://www.brsgolf.com/CLUB/member/login'
const LOGIN_PAGE = 'https://www.brsgolf.com/CLUB/member/login_check'
//const PAGE = 'https://www.brsgolf.com/CLUB/member/request'
const TEE_TIME_PAGE = 'https://www.brsgolf.com/CLUB/members_booking.php?operation=member_day&course_id1=1&d_date='
const BOOK_TEE_TIME = 'https://www.brsgolf.com/CLUB/members_booking.php?operation=member_process_booking'
const MEMBERS_BOOKING_FORM = 'https://www.brsgolf.com/CLUB/members_booking.php?operation=member_booking_form'

let notLiveRetries = 0
let retries = 0

_seconds_to_time = function(seconds) {
  let measuredTime = new Date(null);
  measuredTime.setSeconds(seconds); // specify value of SECONDS
  return measuredTime.toISOString().substr(11, 8);
}

_get_tee_time_page = function(whatDate, phpsessid, contactDetails) {
  let data = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'R2D2 UA',
      'Cookie': `PHPSESSID=${phpsessid};`
    },
    credentials: 'include'
  }

  // Get the Page
  return fetch(`${TEE_TIME_PAGE.replace("CLUB", contactDetails.club)}${whatDate}`, data)
  .then((response) => {
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
  const splitted = response.split("\n")
  let index = get_index(splitted, time)
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
      return {status: status.UNAVAILABLE, freeSlots: freeSlots}
    }
  } else {
    index = get_index(splitted, 'you have hit refresh too soon')
    if (index >= 0)
      return {status: status.REFRESH, freeSlots: freeSlots}
    else
      return {status: status.TIME_NOT_FOUND, freeSlots: freeSlots}
  }
}

_fillSlots = function(formData, freeSlots, player1UID, player2UID, player3UID, player4UID) {
  let playerUIDs = [player1UID?player1UID:null, player2UID?player2UID:null, player3UID?player3UID:null, player4UID?player4UID:null]

  for (var i = 0; i < freeSlots.length; i++) {
    if (freeSlots[i]) {
      for (var j = 0; j < playerUIDs.length; j++) {
        if (playerUIDs[j] && playerUIDs[j]!=-1) {
          formData.append(`Player${i+1}_uid`, playerUIDs[j])
          playerUIDs[j] = null
          break;
        }
      }
    }
  }
  return formData
}

_book_the_tee_time = function(bookingCode, phpsessid, freeSlots, teeTime, dateRequired, player1UID, player2UID, player3UID, player4UID, activity, contactDetails) {
  let formData = new FormData();
  formData.append("double_click", 'yes')
  formData.append("course_id", 1)
  formData.append("d_date", dateRequired)
  formData.append("TeeTime", `${teeTime}:00`)
  formData.append("bookingCode", bookingCode)
  _fillSlots(formData, freeSlots, player1UID, player2UID, player3UID, player4UID)

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

  return fetch(BOOK_TEE_TIME.replace("CLUB", contactDetails.club), data)
    .then((response) => {
      if (response._bodyInit.indexOf('The tee time has been successfully booked') >= 0) {
        console.log(`Tee Time booked for ${teeTime} on ${dateRequired}`);
        activity(`Tee Time booked for ${teeTime} on ${dateRequired}`);
        return(status.BOOKED)
      } else {
        activity(`Bummer, the tee-time was not booked ${teeTime} on ${dateRequired}`);
        throw new Error(`Bummer, the tee-time was not booked ${teeTime} on ${dateRequired}`)
      }
    })
    .catch(function (err) {
      console.log('error: ', err);
      return(status.ERROR)
    })
}

_get_time_difference = function(dateComesAlive) {
  const comesAlive = moment(dateComesAlive, 'YYYY-MM-DD HH:mm:ss')
	const now = moment(new Date());
  return moment.duration(comesAlive.diff(now)).asSeconds()
}

_book_the_tee_time_recursive = function(whatDate, time, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID, activity, contactDetails) {
    return _get_tee_time_page(whatDate, phpsessid, contactDetails)
    .then((response) => {
      const resp = _get_tee_time(response._bodyInit, time)

      switch (resp.status) {
        case status.NOT_LIVE_YET:
          console.log('NOT_LIVE_YET')
          return(status.NOT_LIVE_YET)
          break;
        case status.REFRESH:
          let nextDay = moment(whatDate).add(1,'days').format('YYYY-MM-DD')
          return _get_tee_time_page(nextDay, phpsessid, contactDetails)
          .then((response) => {
            if ((response._bodyInit.indexOf('To book a tee time') >= 0) || (response._bodyInit.indexOf('you have hit refresh too soon') >= 0))
              console.log('dummy refresh done....');
            return(_book_the_tee_time_recursive(whatDate, time, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID, activity, contactDetails))
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

          return fetch(MEMBERS_BOOKING_FORM.replace("CLUB", contactDetails.club), data)
          .then((response) => {
            if (response._bodyInit.indexOf('bookingCode') >= 0) {
              const splitted = response._bodyInit.split("\n")
              let index = get_index(splitted, 'bookingCode')

              if (index >= 0) {
                const bookingCode = get_key_value('value', splitted[index])
                console.log('Going to sleep for 20 seconds....', bookingCode)
                setTimeout(function() {
                  _book_the_tee_time(bookingCode, phpsessid, resp.freeSlots, time, whatDate, player1UID, player2UID, player3UID, player4UID, activity, contactDetails)
                  .then((response) => {
                    return(status.BOOKED) // TODO
                  })
                }, 10000);
                return(status.BOOKING) // FIX THIS
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

exports.login = function(contactDetails, activity) {
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
      activity('Logging in to BRS')
      return({token: get_key_value('_csrf_token', response.data), phpsessid: getCookie('PHPSESSID', cookies)})
    } else {
      console.log('Could NOT find home page....');
      throw new Error('Failed to login.....')
    }
  })
  .then(sess_data => {
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

    return fetch(LOGIN_PAGE.replace("CLUB", contactDetails.club), data)
    .then(response => {
    if (response._bodyInit.indexOf('Click here to book a tee time') >= 0) {
        activity('Logged in successfully')
        return({status: 9, phpsessid: sess_data.phpsessid, activity: activity})
      } else {
        console.log('NOT Logged in successfully');
        throw new Error('Failed to login.....')
      }
    })
  })
  .catch(function (err) {
    activity('Error: ' + err)
    return({status: 1, phpsessid: null, activity: activity})
  })
}

_bookTeeTime = function(phpsessid, dateComesAlive, dateRequired, teeTime, player1UID, player2UID, player3UID, player4UID, activity, contactDetails) {
return _book_the_tee_time_recursive(dateRequired, teeTime, dateComesAlive, phpsessid, player1UID, player2UID, player3UID, player4UID, activity, contactDetails)
  .then((response) => {
    switch(response) {
      case status.NOT_LIVE_YET:
        let timeDiff = _get_time_difference(dateComesAlive)
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
          sleeptime = 100
          notLiveRetries++
        }

        if (notLiveRetries <= 3) {
          console.log(`Not Live Yet (retries: ${notLiveRetries}) so going to sleep for ${sleeptime/1000} seconds as time_diff is: ${_seconds_to_time(timeDiff>=0?timeDiff:-timeDiff)}\n\n`)
          activity(`Not Live Yet (retry: ${notLiveRetries})`)
          setTimeout(function() {
            const resp = _bookTeeTime(phpsessid, dateComesAlive, dateRequired, teeTime, player1UID, player2UID, player3UID, player4UID, activity, contactDetails)
            if (resp == status.BOOKED) {
              console.log(`Tee Time booked for ${teeTime} on ${dateRequired}`);
              activity(`Tee Time booked for ${teeTime} on ${dateRequired}`)
              return({activity: activity})
            }
          }, sleeptime);
        } else {
          console.log('Giving up.... exceeded notLiveRetries.... goodbye');
          activity('Giving up.... exceeded notLiveRetries.... goodbye')
        }
        break;
      case status.BOOKING:
        console.log('Tee Time is being booked ....');
        activity('Tee Time is being booked ....');
        break;
      case status.BOOKED:
        console.log(`Tee Time booked for ${teeTime} on ${dateRequired}`);
        activity(`Tee Time booked for ${teeTime} on ${dateRequired}`);
        break;
      case status.UNAVAILABLE:
        console.log(`A Tee-time for ${teeTime} is unavailable on ${dateRequired}`);
        activity(`A Tee-time for ${teeTime} is unavailable on ${dateRequired}`);
        break;
      case status.ALREADY_BOOKED_BY_YOU:
        console.log(`What are doing, you have already booked a Tee-time for ${teeTime} on ${dateRequired}`);
        activity(`What are doing, you have already booked a Tee-time for ${teeTime} on ${dateRequired}`);
        break;
      case status.ALREADY_BOOKED:
        retries++

        if (retries <= 3) {
          activity(`${teeTime} already booked`)
          teeTime = moment(teeTime, 'HH:mm').add(10, 'minutes').format('HH:mm')
          activity(`Checking ${teeTime}`)
          console.log(`retry[${retries}]: ${status.STATUS_CODE[response.status]}\n\n`);
          return _bookTeeTime(phpsessid, dateComesAlive, dateRequired, teeTime, player1UID, player2UID, player3UID, player4UID, activity, contactDetails)
        } else {
          console.log('Giving up.... Retries exceeded.... goodbye');
          activity('Giving up.... retries exceeded.... goodbye')
        }
        break;
      case status.error:
        console.log(`There was an error when trying to book the Tee-time for ${teeTime} for ${dateRequired}`);
        activity(`There was an error when trying to book the Tee-time for ${teeTime} for ${dateRequired}`);
        break;
      default:
        console.log('Bummer.... we ran in to an error');
        activity('Bummer.... we ran in to an error');
    }
    return
  })
  .catch(function (err) {
    console.log('BRS error: ', err);
    activity('BRS error: ' + err)
    return
  })
}

exports.bookTeeTime = function(phpsessid, dateComesAlive, dateRequired, teeTime, player1UID, player2UID, player3UID, player4UID, activity, contactDetails) {
  notLiveRetries = 0
  retries = 0
  return _bookTeeTime(phpsessid, dateComesAlive, dateRequired, teeTime, player1UID, player2UID, player3UID, player4UID, activity, contactDetails)
}
