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
import {login, bookTeeTime} from '../src/brs'
import AppBar from './appBar'
import axios from 'axios'

class ScheduleTeeTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTime: null,
      comesAliveTime: 5,
      teeTimeDetails: {},
      activity: [],
      done: false,
      booking: false
    };
  }

  _onSwipeLeftRight(gestureState) {
    this.props.navigator.pop();
  }

  _goBack() {
    this.props.navigator.pop()
    return true
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

  _done() {
    if (!this.state.booking)
      this.props.navigator.push({name: 'selectTeeTime', url: this.props.url});
  }

  _logActivity(message) {
    let activity = this.state.activity
    activity.push(message)
    this.setState({activity: activity})
  }

  _timerFinished() {
    let activity = this.state.activity
    this.setState({booking: true})

    login(this.state.contactDetails, this._logActivity.bind(this))
    .then((response) => {
      return response
    })
    .then((response) => {
      return(bookTeeTime(response.phpsessid, "2019-01-11 10:30:00", moment(this.state.teeTimeDetails.teeTime).format('YYYY-MM-DD'), moment(this.state.teeTimeDetails.teeTime).format('HH:mm'), this.state.teeTimeDetails.player1, this.state.teeTimeDetails.player2, this.state.teeTimeDetails.player3, this.state.teeTimeDetails.player4, this._logActivity.bind(this)))
      .then((response) => {
        this.setState({done:true, booking:false})
      })
    })
    .catch(function (err) {
      console.log('error********: ' + err);
      this.setState(activity: err, done:true, booking:false)
    })
  }

  _calculateSeconds(dateComesAlive) {
    const comesAlive = moment(dateComesAlive, 'YYYY-MM-DD HH:mm')
  	const now = moment(new Date());
    return Math.round(moment.duration(comesAlive.diff(now)).asSeconds())
  }

  render() {
    const config = {
      velocityThreshold: 0.2,
      directionalOffsetThreshold: 60
    };

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
          <AppBar bannerText='Scheduling a Tee Time' navigator={this.props.navigator} url={this.props.url}/>
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
            <ScrollView style={{marginTop:40}}>
              {
                this.state.activity.map((a, i) => {
                  return(
                    <Text key={i} style={styles.activity}>{a}</Text>
                  )
                })
              }
            </ScrollView>
          </View>
          <View style={styles.footer}>
            {this.state.booking?
              <Button>
                <Text style={[styles.schedule_button,styles.buttonInactive]}>BOOKING</Text>
              </Button>
              :
              <Button
                onPress={this._done.bind(this)}>
                <Text style={[styles.schedule_button,styles.buttonActive]}>{this.state.done?'DONE':'STOP'}</Text>
              </Button>
            }
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
