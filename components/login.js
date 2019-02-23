import React, { Component } from 'react';
import { AppRegistry, TextInput, StyleSheet, Text, View, Image, Platform} from 'react-native';
import Button from 'react-native-button';
import Spinner from './spinner';
import { GlobalStyles } from '../src/styles';
import {login} from '../src/brs'
import {getContactDetails, saveContactDetails} from '../src/utils'

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { username: '8-digit BRS code',
                   password: '',
                   verified: false,
                   club: 'Club Name',
                   error: null,
                   spinner: false,
                   nextButtonActive: true,
                   activity: []
                 };
  }

  componentWillMount() {
    const context = this
    getContactDetails()
    .then((contactDetails) => {
      if (contactDetails)
        context.setState({username: contactDetails.username, password: contactDetails.password, verified: contactDetails.verified, club: contactDetails.club})
    })
  }

  _resetUserName(event) {
      if (this.state.username === '8-digit BRS code')
        this.setState({username: ''})
    }

  _resetPassword(event) {
    if (this.state.password === 'BRS Password')
      this.setState({password: ''})
  }

  _resetClub(event) {
    if (this.state.club === 'Club Name')
      this.setState({club: ''})
  }

  _logActivity(message) {
    let activity = this.state.activity
    activity.push(message)
    this.setState({activity: activity})
  }

  _enter(event) {
    this.props.navigator.push({name: 'selectTeeTime', url: this.props.url})
  }

  _next(event) {
    let activity = []
    const context = this

    this.setState({spinner: true})
    login({username: this.state.username.trim(), password: this.state.password.trim(), club: this.state.club.trim().toLowerCase()}, this._logActivity.bind(this))
    .then((response) => {
      context.setState({spinner: false})
      return saveContactDetails({username: this.state.username.trim(), password: this.state.password.trim(), club: this.state.club.trim().toLowerCase(), verified: response.status == 9?true:false})
      .then(() => {
        return(context.setState({verified: true}))
      })
      return
    })
    .catch(function (err) {
      context.setState({spinner: false})
      context.setState({error: 'Login failed.....'})
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.body}>
          <View style={styles.logo_wrap}>
            <Image
              style={{height:220, width: 341}}
              resizeMode='center'
              source={require('../images/r2d2.png')}
            />
          </View>
          <Text style={styles.register_body}>
            Welcome to R2D2
          </Text>
          {this.state.spinner ?
            <Spinner message='Logging In.....'/>
          :
          null
          }
          {this.state.verified ?
            <View>
              <View style={styles.input_wrapper}>
                <Text style={styles.copy_body}>
                  FORE. Select the Tee Time you want, pick your buddies, determine when the timesheet becomes available and
                  R2D2 will do the rest for you
                </Text>
                <Text style={styles.register_body}>
                  Enjoy your game
                </Text>
              </View>
              <View style={styles.footer}>
                <Button
                  onPress={this._enter.bind(this)}>
                  <Text style={[styles.next_button,styles.buttonActive
                              ]}>ENTER</Text>
                </Button>
              </View>
            </View>
          :
            <View>
              <View style={styles.input_wrapper}>
                <TextInput
                  style={{color: '#FFF',
                          height: 40,
                          textAlign: 'center',
                          fontFamily: GlobalStyles.font,
                          borderBottomWidth: 1,
                          borderBottomColor: '#696969'
                        }}
                  onChangeText={(username) => this.setState({username})}
                  onFocus={this._resetUserName.bind(this)}
                  value={this.state.username}
                  underlineColorAndroid='transparent'
                />
              </View>
              <View style={styles.input_wrapper}>
                <TextInput
                  style={{color: '#FFF',
                          height: 40,
                          textAlign: 'center',
                          fontFamily: GlobalStyles.font,
                          borderBottomWidth: 1,
                          borderBottomColor: '#696969'
                        }}
                  onChangeText={(password) => this.setState({password})}
                  onFocus={this._resetPassword.bind(this)}
                  value={this.state.password}
                  secureTextEntry={true}
                  underlineColorAndroid='transparent'
                />
              </View>
              <View style={styles.input_wrapper}>
                <TextInput
                  style={{color: '#FFF',
                          height: 40,
                          textAlign: 'center',
                          fontFamily: GlobalStyles.font,
                          borderBottomWidth: 1,
                          borderBottomColor: '#696969'
                        }}
                  onChangeText={(club) => this.setState({club})}
                  onFocus={this._resetClub.bind(this)}
                  value={this.state.club}
                  underlineColorAndroid='transparent'
                />
              </View>
              <View style={styles.footer}>
                <Button
                  onPress={this._next.bind(this)}>
                  <Text style={[styles.next_button,
                                this.state.nextButtonActive? styles.buttonActive: styles.buttonInActive
                              ]}>VERIFY</Text>
                </Button>
              </View>
            </View>
          }
          <Text style={styles.error}>{this.state.error != null?this.state.error:' '}</Text>
        </View>
      </View>
    );
  }
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlobalStyles.brandPrimary,
  },
  body: {
    paddingLeft: 40,
    paddingRight: 40,
  },
  error: {
    color: GlobalStyles.errorColor,
    textAlign: 'center',
    height: 30,
    marginTop: 10
  },
  input_wrapper: {
    borderBottomColor: '#323b44',
    borderBottomWidth: .75,
    marginBottom: 30
  },
  register_body: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: GlobalStyles.font,
    lineHeight: 24,
    paddingBottom: 5,
    textAlign: 'center',
    paddingBottom: 30
  },
  copy_body: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: GlobalStyles.font,
    lineHeight: 24,
    paddingBottom: 5,
    textAlign: 'center',
    paddingBottom: 30
  },
  logo_wrap: {
    alignItems: 'center',
    height: 220,
    paddingLeft: 30,
    paddingRight: 30
  },
  next_button: {
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
  footer: {
    //backgroundColor: GlobalStyles.lightBackground,
    borderTopColor: GlobalStyles.divider,
    // justifyContent: 'space-around',
    // flexDirection: 'row',
    // alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 15,
    paddingLeft: 15,
  },
});

module.exports = Login;
