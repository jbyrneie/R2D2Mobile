'use strict';
import React, {Component} from 'react'
import ReactNative, {AppRegistry, AppState, StyleSheet, View} from 'react-native'
import {Navigator} from 'react-native-deprecated-custom-components'
import {getContactDetails, clearContactDetails} from '../src/utils'

class Start extends Component {
  waitToInitialize = function() {
    if (this.props.navigator) {
      const context = this
      clearContactDetails() // JUST for testing, ensures App starts at Login point
      return getContactDetails()
        .then(function(response) {
          const route = response === null?'login':'selectTeeTime'
          context.props.navigator.push({name: route, url: context.props.url});
        });
    }
    else return setTimeout(this.waitToInitialize.bind(this), 10000)
  }

  componentDidMount() {
    this.waitToInitialize()
  }

  render() {
    return null
  }
}

module.exports = Start;
