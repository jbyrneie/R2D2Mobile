import React, { Component } from 'react';
import { Text,View, ScrollView, StyleSheet, TouchableHighlight, Image, StatusBar, BackHandler, Platform, Picker} from 'react-native';
import Button from 'react-native-button';
import CountDown from 'react-native-countdown-component';
import { GlobalStyles } from '../src/styles';
import _ from 'lodash'
import moment from 'moment'
import momenttz from 'moment-timezone'
import Icon from 'react-native-fa-icons';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import DatePicker from 'react-native-datepicker'
import {getContactDetails, getTeeTimeDetails, getCookie, get_key_value} from '../src/utils'
import {login} from '../src/brs'
import axios from 'axios'

class ScheduleTeeTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTime: null,
      comesAliveTime: 5,
      teeTimeDetails: {},
      activity: []
    };
  }

  _onSwipeLeftRight(gestureState) {
    this.props.navigator.pop();
  }

  _goBack() {
    if (this.state.showConfirmScheduleModal || this.state.showScheduleAlertModal || this.state.showContactGLGModal) {
      this.setState({showDeclineReasonModal: false, showScheduleAlertModal: false, showContactGLGModal: false})
      return true
    }
    else {
      this.props.navigator.pop()
      return true
    }
  }

  componentWillMount() {
    const context = this
    getContactDetails()
    .then((contactDetails) => {
      context.setState({contactDetails: contactDetails})
      return getTeeTimeDetails()
      .then((teeTimeDetails) => {
        context.setState({teeTimeDetails: teeTimeDetails})
      })
    })

    BackHandler.addEventListener('hardwareBackPress', this._goBack.bind(this));
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._goBack.bind(this));
  }

  _toggleTimer() {
    this.setState({comesAliveTime: 0})
  }

  _timerFinished() {
    console.log('_timerFinished....')
    let activity = this.state.activity

    login(this.state.contactDetails, activity)
    .then((response) => {
      console.log('Login response: ', JSON.stringify(response));
      this.setState(activity: response.activity)
    })
  }

  _timerFinished1() {
    console.log('_timerFinished....')
    const context = this
    let activity = this.state.activity
    const HOME_PAGE = 'https://www.brsgolf.com/wicklow/member/login'
    const LOGIN_PAGE = 'https://www.brsgolf.com/wicklow/member/login_check'
    const PAGE = 'https://www.brsgolf.com/wicklow/member/request'
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
        activity.push('Logging in to BRS')
        this.setState({activity: activity})
        return({token: get_key_value('_csrf_token', response.data), phpsessid: getCookie('PHPSESSID', cookies)})
      }
    })
    .then(sess_data => {
      console.log('data: ', JSON.stringify(sess_data));
      console.log('context.state.contactDetails: ', JSON.stringify(context.state.contactDetails));
      let formData = new FormData();
      formData.append("_username", context.state.contactDetails.username)
      formData.append("_password", context.state.contactDetails.password)
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

      console.log('Loggin in with: ', JSON);
      return fetch(LOGIN_PAGE, data)
      .then(response => {
        //console.log('LOGIN_PAGE response****: ', JSON.stringify(response));
        if (response._bodyInit.indexOf('Click here to book a tee time') >= 0) {
          activity.push('Logged in successfully')
          this.setState({activity: activity})
          return({status: 9, phpsessid: sess_data.phpsessid})
        } else {
          throw new Error('Failed to login.....')
        }
      })
    })
    .catch(function (err) {
      console.log('error********: ' + err);
      activity.push('An error occurred')
      context.setState({activity: activity})
      return({status: 1, phpsessid: null})
    })
  }

  _calculateSeconds(dateComesAlive) {
    console.log('_calculateSeconds: ', dateComesAlive);
    const comesAlive = moment(dateComesAlive, 'YYYY-MM-DD HH:mm')
  	const now = moment(new Date());
    console.log('seconds: ', moment.duration(comesAlive.diff(now)).asSeconds())
    return Math.round(moment.duration(comesAlive.diff(now)).asSeconds())
  }

  render() {
    const config = {
      velocityThreshold: 0.2,
      directionalOffsetThreshold: 60
    };

    const bannerText = 'Scheduling a Tee Time'

    return (
      <GestureRecognizer
          onSwipeRight={this._onSwipeLeftRight.bind(this)}
          onSwipeLeft={this._onSwipeLeftRight.bind(this)}
          config={config}
          style={{
            flex: 1
          }}
          >
        <StatusBar barStyle = "light-content" hidden = {false}/>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.page_title} onPress={this._goBack.bind(this)}>
              {Platform.OS === 'ios'?<Icon name='chevron-left' style={styles.ios_icon}/>:null}
              {bannerText}
            </Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.heading}>
              Countdown to Tee Time Booking
            </Text>
            <CountDown
              until={this._calculateSeconds(this.state.teeTimeDetails.dateAvailable)}
              onFinish={this._timerFinished.bind(this)}
              onPress={() => alert('hello')}
              size={20}
            />
          <View style={{marginTop:50}}>
              {
                this.state.activity.map((a, i) => {
                  return(
                    <Text key={i} style={styles.activity}>{a}</Text>
                  )
                })
              }
            </View>
          </View>
          <View style={styles.footer}>
            <Button
              onPress={this._toggleTimer.bind(this)}>
              <Text style={[styles.schedule_button,styles.buttonActive]}>STOP</Text>
            </Button>
          </View>
        </View>
      </GestureRecognizer>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 9,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5,
    marginBottom: 5
  },
  schedule_button: {
    fontFamily: GlobalStyles.font,
    fontSize: 13,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: GlobalStyles.buttonPrimary,
    paddingTop: 10,
    paddingBottom: 10,
    margin: 5,
    textAlign: 'center',
    overflow: 'hidden',
  },
  buttonActive: {
    color: 'white',
    backgroundColor: GlobalStyles.buttonPrimary,
  },
  buttonInActive: {
    color: GlobalStyles.buttonPrimary,
    backgroundColor: GlobalStyles.buttonInactive
  },
  container: {
    flex: 1
  },
  footer: {
    backgroundColor: GlobalStyles.lightBackground,
    borderTopColor: GlobalStyles.divider,
    // justifyContent: 'space-around',
    // flexDirection: 'row',
    // alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 15,
    paddingLeft: 15,
  },
  header: {
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: GlobalStyles.brandPrimary,
  },
  page_title: {
    color: '#FFF',
    fontFamily: GlobalStyles.font,
    fontSize: 18,
    lineHeight: 24,
    paddingTop: 30,
    paddingBottom: 30
  },
  ios_icon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 50,
  },
  time: {
    color: GlobalStyles.headlineColor,
    fontFamily: GlobalStyles.font,
    fontSize: 16,
    paddingBottom: 10,
    paddingTop: 10,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  heading: {
    fontFamily: GlobalStyles.font,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    paddingBottom: 8,
    paddingTop: 25,
    textAlign: 'center'
  },
  activity: {
    fontFamily: GlobalStyles.font,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    paddingBottom: 5,
    paddingTop: 5,
    textAlign: 'center'
  },
});

module.exports = ScheduleTeeTime;
