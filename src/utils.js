const _ = require('lodash');
import {AsyncStorage} from 'react-native';

exports.get_index = function(arr, subString) {
  let index = -1

  for (i = 0; i < arr.length; i++) {
    if (arr[i].indexOf(subString) >= 0)
      return i
  }

  return index
}

exports.get_key_value = function(key, stringData) {
  let value = null
  const splitted = stringData.split("\n")
  splitted.map((line, index) => {
    if (line.indexOf(key) >= 0) {
      const subSplit = line.split('=')
      subSplit.map((token, index) => {
        if (token.indexOf('value') >= 0) {
          value = subSplit[index+1].replace(/>\s*$/, "");
          value = value.substring(1, value.length-1)
        }
      })
    }
  })

  return value
}

exports.get_cookies1 = function(cookieString) {
  let cookies = []
  for (var i in cookieString) {
    const cookie = new Cookie(cookieString[i]);

    if (cookie.value != 'deleted')
      cookies.push(cookie)
  }
  return cookies
}

exports.get_cookie1 = function(cookieName, cookies) {
  let value = null
  for (var i=0; i<cookies.length; i++)
    if (cookies[i].key == cookieName)
      return cookies[i].value

  return null
}

_parseCookies = function (cookieString) {
	var cookieData = cookieString.trim();

	return (cookieData ? cookieData.split(';') : []).reduce(function (cookies, cookieString) {
		var cookiePair = cookieString.split('=');

		cookies[cookiePair[0].trim()] = cookiePair.length > 1 ? cookiePair[1].trim() : '';

		return cookies;
	}, {});
};

exports.parseCookies = function (cookieString) {
	return _parseCookies(cookieString)
};

exports.getCookie = function (cookieName, cookies) {
  console.log(`getCookie cookieName: ${cookieName} cookies: ${cookieName}`);
  return _parseCookies(cookies)[cookieName] || '';
};

exports.getContactDetails = function() {
  return AsyncStorage.getItem('contactDetails')
    .then(function(contactDetails) {
      if (contactDetails != null && contactDetails != undefined) {
        contactDetails = JSON.parse(contactDetails)
        return contactDetails
      } else return null
    });
};

exports.register = function(contact) {
  return AsyncStorage.setItem('contactDetails', JSON.stringify(contact))
    .then(function(response) {
      return
    });
};

exports.clearContactDetails = function() {
  AsyncStorage.removeItem('contactDetails')
};

exports.saveTeeTimeDetails = function(teeTimeDetails) {
  return AsyncStorage.setItem('teeTimeDetails', JSON.stringify(teeTimeDetails))
    .then(function(response) {
      return
    });
};

exports.getTeeTimeDetails = function() {
  return AsyncStorage.getItem('teeTimeDetails')
    .then(function(teeTimeDetails) {
      if (teeTimeDetails != null && teeTimeDetails != undefined) {
        teeTimeDetails = JSON.parse(teeTimeDetails)
        return teeTimeDetails
      } else return null
    });
};
