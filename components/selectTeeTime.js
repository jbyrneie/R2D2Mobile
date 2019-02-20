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
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import AppBar from './appBar'
import ConfigPlayers from './configPlayers'

class SelectTeeTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTime: null,
      showConfirmScheduleModal: false,
      showScheduleAlertModal: false,
      showContactGLGModal: false,
      scheduleButtonActive:true,
      dateAvailable:moment().format('YYYY-MM-DD HH:mm'),
      teeTime:moment().format('YYYY-MM-DD HH:mm'),
      player1: {},
      player2: {},
      player3: {},
      player4: {},
      showConfigPlayersModal: false
    };
  }

  _schedule(event) {
    const context = this
    if (this.state.scheduleButtonActive) {
      saveTeeTimeDetails({dateAvailable: this.state.dateAvailable,
                          teeTime: this.state.teeTime,
                          player1: this.state.player1,
                          player2: this.state.player2,
                          player3: this.state.player3,
                          player4: this.state.player4
                        })
      .then(() => {
        context.props.navigator.push({name: 'scheduleTeeTime', url: context.props.url});
      })
    }
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

  _showConfigPlayersModal(showModal) {
    this.setState({
      showConfigPlayersModal: showModal
    })
  }

  componentDidMount() {
    const context = this
    getPlayerDetails()
    .then((playerDetails) => {
      context.setState({player1: playerDetails[0]&&playerDetails[0].id&&playerDetails[0].id.length>0?playerDetails[0]:{"name":"Name","id":"BRS ID"},
                        player2: playerDetails[1]&&playerDetails[1].id&&playerDetails[1].id.length>0?playerDetails[1]:{"name":"Name","id":"BRS ID"},
                        player3: playerDetails[2]&&playerDetails[2].id&&playerDetails[2].id.length>0?playerDetails[2]:{"name":"Name","id":"BRS ID"},
                        player4: playerDetails[3]&&playerDetails[3].id&&playerDetails[3].id.length>0?playerDetails[3]:{"name":"Name","id":"BRS ID"},
                        showConfigPlayersModal: playerDetails?false:true
                       })
      BackHandler.addEventListener('hardwareBackPress', context._goBack.bind(this));
    })
  }

  componentWillMount() {
    const context = this
    getPlayerDetails()
    .then((playerDetails) => {
      context.setState({player1: playerDetails[0]&&playerDetails[0].id&&playerDetails[0].id.length>0?playerDetails[0]:{"name":"Name","id":"BRS ID"},
                        player2: playerDetails[1]&&playerDetails[1].id&&playerDetails[1].id.length>0?playerDetails[1]:{"name":"Name","id":"BRS ID"},
                        player3: playerDetails[2]&&playerDetails[2].id&&playerDetails[2].id.length>0?playerDetails[2]:{"name":"Name","id":"BRS ID"},
                        player4: playerDetails[3]&&playerDetails[3].id&&playerDetails[3].id.length>0?playerDetails[3]:{"name":"Name","id":"BRS ID"},
                        showConfigPlayersModal: playerDetails?false:true
                       })
      BackHandler.addEventListener('hardwareBackPress', context._goBack.bind(this));
    })
  }

  componentWillUpdate() {
    console.log('selectTeeTime componentWillUpdate');
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._goBack.bind(this));
  }

  _availablePlayers() {
    console.log(`_availablePlayers player1: ${JSON.stringify(this.state.player1)} player2: ${JSON.stringify(this.state.player2)} player3: ${JSON.stringify(this.state.player3)} player4: ${JSON.stringify(this.state.player4)}`);

    let players = []
    /*
    players.push({label:`${this.state.player1 && this.state.player1.name && this.state.player1.name.length?this.state.player1.name:''}`,
                  value:`${this.state.player1 && this.state.player1.name && this.state.player1.name.length?this.state.player1.id:''}`})
    players.push({label:`${this.state.player2 && this.state.player2.name && this.state.player2.name.length?this.state.player2.name:''}`,
                  value:`${this.state.player2 && this.state.player2.name && this.state.player2.name.length?this.state.player2.id:''}`})
    players.push({label:`${this.state.player3 && this.state.player3.name && this.state.player3.name.length?this.state.player3.name:''}`,
                  value:`${this.state.player3 && this.state.player3.name && this.state.player3.name.length?this.state.player3.id:''}`})
    players.push({label:`${this.state.player4 && this.state.player4.name && this.state.player4.name.length?this.state.player4.name:''}`,
                  value:`${this.state.player4 && this.state.player4.name && this.state.player4.name.length?this.state.player4.id:''}`})
    */
    return getPlayerDetails()
    .then((playerDetails) => {
      players.push({label:`${playerDetails[0].name}`, value:`${playerDetails[0].id}`})
      players.push({label:`${playerDetails[1].name}`, value:`${playerDetails[1].id}`})
      players.push({label:`${playerDetails[2].name}`, value:`${playerDetails[2].id}`})
      players.push({label:`${playerDetails[3].name}`, value:`${playerDetails[3].id}`})
      return(players)
    })
  }

  _savePlayer(player, value) {
    this.setState({[player]: value})
  }

  render() {
    let availablePlayers = []
    this._availablePlayers()
    .then((available) => {
      console.log('available.... ', JSON.stringify(available));
      availablePlayers = available
    })

    console.log('selectTeeTime render availablePlayers: ', JSON.stringify(availablePlayers));
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
            <AppBar bannerText='Pick a Tee Time' navigator={this.props.navigator} url={this.props.url}/>
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
                  onDateChange={(date) => {this.setState({dateAvailable: date, scheduleButtonActive:true})}}
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
                    // ... You can check the source to find the other keys.
                  }}
                  onDateChange={(date) => {this.setState({teeTime: date, scheduleButtonActive:true})}}
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
                      availablePlayers.map((p, i) => {
                        return(
                            <Picker.Item key={i} label={p.label} value={p.value} />
                        )
                      })
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
                      availablePlayers.map((p, i) => {
                        return(
                            <Picker.Item key={i} label={p.label} value={p.value} />
                        )
                      })
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
                      availablePlayers.map((p, i) => {
                        return(
                            <Picker.Item key={i} label={p.label} value={p.value} />
                        )
                      })
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
                      availablePlayers.map((p, i) => {
                        return(
                            <Picker.Item key={i} label={p.label} value={p.value} />
                        )
                      })
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
              <ConfigPlayers
                visible={this.state.showConfigPlayersModal}
                showModal={this._showConfigPlayersModal.bind(this)}
                navigator={this.props.navigator}
              />
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
