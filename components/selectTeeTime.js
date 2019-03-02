import React, { Component } from 'react';
import { Text,View, ScrollView, StyleSheet, TouchableHighlight, Image, StatusBar, BackHandler, Platform, Picker, Alert, YellowBox} from 'react-native';
import Button from 'react-native-button';
import CountDown from 'react-native-countdown-component';
import { GlobalStyles } from '../src/styles';
import _ from 'lodash'
import moment from 'moment'
import momenttz from 'moment-timezone'
import Icon from 'react-native-fa-icons';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import DatePicker from 'react-native-datepicker'
import {getPlayerDetails, saveTeeTimeDetails} from '../src/utils'
import AppBar from './appBar'
import ConfigPlayers from './configPlayers'
import { EventRegister } from 'react-native-event-listeners'

class SelectTeeTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTime: null,
      scheduleButtonActive:false,
      dateAvailable:moment().format('YYYY-MM-DD HH:mm'),
      teeTime:moment().format('YYYY-MM-DD HH:mm'),
      playerDetails: [],
      player1: {},
      player2: {},
      player3: {},
      player4: {},
      showConfigPlayersModal: false,
      playerDetails: []
    };
  }

  _schedule(event) {
    const context = this
    if (this.state.scheduleButtonActive) {
      saveTeeTimeDetails({dateAvailable: this.state.dateAvailable,
                          teeTime: this.state.teeTime,
                          player1: this.state.player1?this.state.player1:-1,
                          player2: this.state.player2?this.state.player2:-1,
                          player3: this.state.player3?this.state.player3:-1,
                          player4: this.state.player4?this.state.player4:-1
                        })
      .then(() => {
        this.props.navigation.navigate('ScheduleTeeTime')
      })
    }
  }

  _onSwipeLeftRight(gestureState) {
    this.props.navigator.pop();
  }

  _showConfigPlayersModal(showModal) {
    console.log('_showConfigPlayersModal: ', showModal);
    this.setState({
      showConfigPlayersModal: showModal
    })
  }

  componentWillMount() {
    const context = this
    this.listener = EventRegister.addEventListener('showConfigPlayersModalEvent', () => {
      console.log('selecTeeTime showConfigPlayersModalEvent');
      context.setState({showConfigPlayersModal: true})
    })
    this.listener = EventRegister.addEventListener('playersUpdatedEvent', () => {
      getPlayerDetails()
      .then((playerDetails) => {
        context.setState({playerDetails: playerDetails?playerDetails:[]})
      })
    })
  }

  componentWillMount() {
    const context = this

    this.listener = EventRegister.addEventListener('showConfigPlayersModalEvent', () => {
      console.log('selecTeeTime showConfigPlayersModalEvent');
      context.setState({showConfigPlayersModal: true})
    })
    this.listener = EventRegister.addEventListener('playersUpdatedEvent', () => {
      getPlayerDetails()
      .then((playerDetails) => {
        context.setState({playerDetails: playerDetails?playerDetails:[]})
      })
    })

    getPlayerDetails()
    .then((playerDetails) => {
      console.log('playerDetails: ', JSON.stringify(playerDetails));
      /*
      if (!playerDetails ||
        ((playerDetails[0] && playerDetails[0].name=='Name') &&
         (playerDetails[1] && playerDetails[1].name=='Name') &&
         (playerDetails[2] && playerDetails[2].name=='Name') &&
         (playerDetails[3] && playerDetails[3].name=='Name')))
        EventRegister.emit('showConfigPlayersModalEvent', '')
      */
      context.setState({playerDetails: playerDetails?playerDetails:[]})
    })
  }

  _scheduleButtonActive() {
    let active = true
    const mins = moment(this.state.teeTime).format('mm')
    const now = moment(new Date());
    const diff = this.state.teeTime?Math.round(moment.duration(moment(this.state.teeTime, 'YYYY-MM-DD HH:mm').diff(now)).asSeconds()):-1

    console.log('_scheduleButtonActive ', mins, diff);
    if ((this.state.player1 == -1 && this.state.player2 == -1 && this.state.player3 == -1 && this.state.player4 == -1) ||
        (mins%10 != 0 || diff <= 0)
       )
       active = false
    console.log('_scheduleButtonActive: ', active);
    return active
  }

  _savePlayer(player, value) {
    console.log(`_savePlayer player: ${player} value: ${value} scheduleButtonActive ${this._scheduleButtonActive()}`);
    this.setState({[player]: value}, function() {
      console.log(`setting scheduleButtonActive: ${this._scheduleButtonActive()}`);
      this.setState({scheduleButtonActive: this._scheduleButtonActive() && value != -1})
    });
  }

  _setTeeTime(teeTime) {
    console.log(`_setTeeTime scheduleButtonActive ${this._scheduleButtonActive()} teeTime: ${teeTime}`);
    this.setState({teeTime: teeTime}, function() {
      console.log(`setting scheduleButtonActive: ${this._scheduleButtonActive()}`);
      this.setState({scheduleButtonActive: this._scheduleButtonActive()})
    })
  }

  render() {
    console.log('SelectTeeTime render: ', this.state.showConfigPlayersModal);
    const config = {
      velocityThreshold: 0.2,
      directionalOffsetThreshold: 60
    };
    const menu = <Text>Hello</Text>

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
            <AppBar bannerText='Pick a Tee Time' navigation={this.props.navigation} url={this.props.url}/>
            <View style={styles.body}>
              <Text style={styles.heading}>
                Tee Time becomes available on
              </Text>
              <View style={{flexDirection:'row', justifyContent:'flex-start', marginLeft:25}}>
                <DatePicker
                  style={{width: 200}}
                  date={this.state.dateAvailable}
                  mode="datetime"
                  placeholder="select date"
                  format="YYYY-MM-DD HH:mm"
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      marginLeft: 0
                    },
                    dateInput: {
                      marginLeft: 36
                    }
                  }}
                  onDateChange={(date) => {this.setState({dateAvailable: date})}}
                />
              </View>
              <Text style={styles.heading}>
                Tee Time required
              </Text>
              <View style={{flexDirection:'row', justifyContent:'flex-start', marginLeft:25}}>
                <DatePicker
                  style={{width: 200}}
                  date={this.state.teeTime}
                  mode="datetime"
                  placeholder="select date"
                  format="YYYY-MM-DD HH:mm"
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      marginLeft: 0
                    },
                    dateInput: {
                      marginLeft: 36
                    }
                  }}
                  onDateChange={this._setTeeTime.bind(this)}
                />
              </View>
              <Text style={styles.heading}>
                Select Players
              </Text>
              <View style={{flexDirection:'row', justifyContent:'flex-start', marginLeft:25}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 5}}>Player1</Text>
                </View>
                <View style={{flex:.30}}>
                  <Picker
                    selectedValue={this.state.player1}
                    style={{height: 30, width: 100}}
                    itemStyle={styles.itemStyle}
                    prompt='Select Player1'
                    onValueChange={this._savePlayer.bind(this, 'player1')}
                  >
                  <Picker.Item label="None" value="-1" />
                    {
                      this.state.playerDetails?
                      this.state.playerDetails.map((p, i) => {
                        return(
                            <Picker.Item key={i} label={p.name} value={p.id} />
                        )
                      })
                      :
                      null
                    }
                  </Picker>
                </View>
              </View>
              <View style={{flexDirection:'row', justifyContent:'flex-start', marginLeft:25}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 5}}>Player2</Text>
                </View>
                <View style={{flex:.3}}>
                  <Picker
                    selectedValue={this.state.player2}
                    style={{height: 30, width: 100}}
                    itemStyle={styles.itemStyle}
                    prompt='Select Player2'
                    onValueChange={this._savePlayer.bind(this, 'player2')}
                  >
                    <Picker.Item label="None" value="-1" />
                      {
                        this.state.playerDetails?
                        this.state.playerDetails.map((p, i) => {
                          return(
                              <Picker.Item key={i} label={p.name} value={p.id} />
                          )
                        })
                        :
                        null
                      }
                  </Picker>
                </View>
              </View>
              <View style={{flexDirection:'row', justifyContent:'flex-start', marginLeft:25}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 5}}>Player3</Text>
                </View>
                <View style={{flex:.3}}>
                  <Picker
                    selectedValue={this.state.player3}
                    style={{height: 30, width: 100}}
                    itemStyle={styles.itemStyle}
                    prompt='Select Player3'
                    onValueChange={this._savePlayer.bind(this, 'player3')}
                  >
                    <Picker.Item label="None" value="-1" />
                      {
                        this.state.playerDetails?
                        this.state.playerDetails.map((p, i) => {
                          return(
                              <Picker.Item key={i} label={p.name} value={p.id} />
                          )
                        })
                        :
                        null
                      }
                  </Picker>
                </View>
              </View>
              <View style={{flexDirection:'row', justifyContent:'flex-start', marginLeft:25}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 5}}>Player4</Text>
                </View>
                <View style={{flex:.3}}>
                  <Picker
                    selectedValue={this.state.player4}
                    style={{height: 30, width: 100}}
                    itemStyle={styles.itemStyle}
                    prompt='Select Player4'
                    onValueChange={this._savePlayer.bind(this, 'player4')}
                  >
                    <Picker.Item label="None" value="-1" />
                      {
                        this.state.playerDetails?
                        this.state.playerDetails.map((p, i) => {
                          return(
                              <Picker.Item key={i} label={p.name} value={p.id} />
                          )
                        })
                        :
                        null
                      }
                  </Picker>
                </View>
              </View>
            </View>
            <View style={styles.footer}>
              <Button
                onPress={this._schedule.bind(this)}>
                <Text style={[styles.schedule_button,
                              this.state.scheduleButtonActive? styles.buttonActive: styles.buttonInActive
                            ]}>SCHEDULE TEE TIME</Text>
              </Button>
            </View>
            <View>
              {this.state.showConfigPlayersModal?
                <ConfigPlayers showModal={this._showConfigPlayersModal.bind(this)}/>
              :
              null
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
  schedule_body: {
    color: GlobalStyles.bodyColor,
    fontFamily: GlobalStyles.font,
    fontSize: 14,
    lineHeight: 17,
    paddingTop: 10,
    paddingBottom: 15,
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
  contact_button: {
    fontFamily: GlobalStyles.font,
    fontSize: 14,
    paddingTop: 0,
    paddingBottom: 10,
    marginTop: 20,
    marginBottom: 20,
    color: GlobalStyles.buttonPrimary,
    textAlign: 'center',
  },
  container: {
    flex: 1
  },
  date: {
    color: GlobalStyles.subheadlineColor,
    fontFamily: GlobalStyles.font,
    fontSize: 14,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: GlobalStyles.lightBackground,
    borderTopColor: GlobalStyles.divider,
    borderTopWidth: .3,
    borderBottomColor: GlobalStyles.divider,
    borderBottomWidth: .3,
  },
  icon_wrap: {
    alignItems: 'center',
    height: 175,
    paddingTop: 80,
  },
  image: {
    resizeMode: 'contain',
    height: 100,
    width: 100,
    opacity: .25
  },
  no_schedule:{
    fontFamily: GlobalStyles.font,
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 40,
    paddingBottom: 20,
    textAlign: 'center',
    color: GlobalStyles.headlineColor,
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
  time_selected: {
    borderRadius: 3,
    borderColor: GlobalStyles.buttonPrimary,
    borderWidth: 1,
    color: GlobalStyles.buttonPrimary
  },
  time_unselected: {
    borderColor: 'transparent',
    borderWidth: 1,
  },
  heading: {
    fontFamily: GlobalStyles.font,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    paddingBottom: 8,
    paddingTop: 25,
  },
  datePicker: {
    textAlign: 'center'
  },
  itemStyle: {
    fontFamily: GlobalStyles.font
  }
});

module.exports = SelectTeeTime;
