import {getContactDetails, getTeeTimeDetails, getCookie, get_key_value} from '../src/utils'
import axios from 'axios'

const HOME_PAGE = 'https://www.brsgolf.com/wicklow/member/login'
const LOGIN_PAGE = 'https://www.brsgolf.com/wicklow/member/login_check'
const PAGE = 'https://www.brsgolf.com/wicklow/member/request'

exports.login = function(contactDetails, activity) {
  console.log(`Login contactDetails: ${JSON.stringify(contactDetails)} activity: ${JSON.stringify(activity)}`);
  return axios({
    method:'get',
    headers: {
      'User-Agent': 'R2D2 UA'
    },
    url:HOME_PAGE,
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
    return fetch(LOGIN_PAGE, data)
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
