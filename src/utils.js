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

exports.saveContactDetails = function(contactDetails) {
  return AsyncStorage.setItem('contactDetails', JSON.stringify(contactDetails))
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

exports.getPlayerDetails = function() {
  return AsyncStorage.getItem('playerDetails')
    .then(function(playerDetails) {
      if (playerDetails != null && playerDetails != undefined) {
        playerDetails = JSON.parse(playerDetails)
        return playerDetails
      } else return null
    });
};

exports.savePlayerDetails = function(playerDetails) {
  return AsyncStorage.setItem('playerDetails', JSON.stringify(playerDetails))
    .then(function(response) {
      return
    });
};

exports.clearPlayerDetails = function() {
  AsyncStorage.removeItem('playerDetails')
};
