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
import {saveTeeTimeDetails} from '../src/utils'
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
//import { Button } from 'react-native-elements';
//import Icon from 'react-native-vector-icons/FontAwesome';

class SelectTeeTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTime: null,
      showConfirmScheduleModal: false,
      showScheduleAlertModal: false,
      showContactGLGModal: false,
      backgroundColor: 'white',
      scheduleButtonActive:true,
      dateAvailable:moment().format('YYYY-MM-DD HH:mm'),
      teeTime:moment().format('YYYY-MM-DD HH:mm'),
      player1: 64,
      player2: -1,
      player3: -1,
      player4: -1
    };
  }

  _menu = null;

  setMenuRef = ref => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    console.log('showMenu....');
    this._menu.show();
  };

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

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this._goBack.bind(this));
  }

  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this._goBack.bind(this));
  }

  _availablePlayers() {
    let players = []

    if (this.state.player2 == -1)
      players.push({label:"Colm", value:"641"})

    if (this.state.player3 == -1)
      players.push({label:"Cormac", value:"642"})

    if (this.state.player4 == -1)
      players.push({label:"Philip", value:"643"})

    console.log(`_availablePlayers player2: ${this.state.player2} player3: ${this.state.player3} player4: ${this.state.player4} players: ${JSON.stringify(players)}`);
    return(players)
  }

  _menuLogout() {
    console.log('_menuLogout');
    this._menu.hide();
  }

  _menuPlayers() {
    console.log('_menuPlayers');
    this._menu.hide();
  }

  render() {
    const config = {
      velocityThreshold: 0.2,
      directionalOffsetThreshold: 60
    };

    const bannerText = 'Schedule a Tee Time'

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
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{flex:.75}}>
                <Text style={styles.page_title}>
                  {Platform.OS === 'ios'?<Icon name='chevron-left' style={styles.ios_icon}/>:null}
                  {bannerText}
                </Text>
              </View>
              <View style={{flex:.25, alignItems: 'center', justifyContent: 'center'}}>
                <Menu
                  ref={this.setMenuRef}
                  button={<Text onPress={this.showMenu} style={{color: 'white'}}>Show menu</Text>}
                >
                  <MenuItem onPress={this._menuPlayers.bind(this)}>Players</MenuItem>
                  <MenuDivider />
                  <MenuItem onPress={this._menuLogout.bind(this)}>Logout</MenuItem>
                </Menu>
            </View>
            </View>
          </View>
          <View style={styles.body}>
            <Text style={styles.heading}>
              Tee Time becomes available on
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                  // ... You can check the source to find the other keys.
                }}
                onDateChange={(date) => {this.setState({dateAvailable: date, scheduleButtonActive:true})}}
              />
            </View>
            <Text style={styles.heading}>
              Tee Time required
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{flex:.25}}>
                <Text style={{paddingTop: 5}}>Player1</Text>
              </View>
              <View style={{flex:.30}}>
                <Picker
                  selectedValue={this.state.player1}
                  style={{height: 30, width: 100}}
                  itemStyle={styles.itemStyle}
                  prompt='Select Player1'
                  onValueChange={(itemValue, itemIndex) => this.setState({player1: itemValue})}
                >
                  <Picker.Item label="Jack" value="64" />
                </Picker>
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:.25}}>
                <Text style={{paddingTop: 5}}>Player2</Text>
              </View>
              <View style={{flex:.3}}>
                <Picker
                  selectedValue={this.state.player2}
                  style={{height: 30, width: 100}}
                  itemStyle={styles.itemStyle}
                  prompt='Select Player2'
                  onValueChange={(itemValue, itemIndex) => this.setState({player2: itemValue})}
                >
                  <Picker.Item label="None" value="-1" />
                  {
                    this._availablePlayers().map((p, i) => {
                      return(
                          <Picker.Item key={i} label={p.label} value={p.value} />
                      )
                    })
                  }
                </Picker>
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:.25}}>
                <Text style={{paddingTop: 5}}>Player3</Text>
              </View>
              <View style={{flex:.3}}>
                <Picker
                  selectedValue={this.state.player3}
                  style={{height: 30, width: 100}}
                  itemStyle={styles.itemStyle}
                  prompt='Select Player3'
                  onValueChange={(itemValue, itemIndex) => this.setState({player3: itemValue})}
                >
                  <Picker.Item label="None" value="-1" />
                  {
                    this._availablePlayers().map((p, i) => {
                      return(
                          <Picker.Item key={i} label={p.label} value={p.value} />
                      )
                    })
                  }
                </Picker>
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:.25}}>
                <Text style={{paddingTop: 5}}>Player4</Text>
              </View>
              <View style={{flex:.3}}>
                <Picker
                  selectedValue={this.state.player4}
                  style={{height: 30, width: 100}}
                  itemStyle={styles.itemStyle}
                  prompt='Select Player4'
                  onValueChange={(itemValue, itemIndex) => this.setState({player4: itemValue})}
                >
                  <Picker.Item label="None" value="-1" />
                  {
                    this._availablePlayers().map((p, i) => {
                      return(
                          <Picker.Item key={i} label={p.label} value={p.value} />
                      )
                    })
                  }
                </Picker>
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
