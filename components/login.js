import React, { Component } from 'react';
import { AppRegistry, TextInput, StyleSheet, Text, View, Image, Platform} from 'react-native';
import Button from 'react-native-button';
import Spinner from './spinner';
import { GlobalStyles } from '../src/styles';
import {login} from '../src/brs'
import {getContactDetails} from '../src/utils'
import axios from 'axios'

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { username: '8-digit BRS code',
                   password: 'BRS Password',
                   error: null,
                   spinner: false,
                   nextButtonActive: true
                 };
  }

  componentWillMount() {
    console.log('Login componentWillMount');
    const context = this
    getContactDetails()
    .then((contactDetails) => {
      console.log('contactDetails: ', JSON.stringify(contactDetails));
      if (contactDetails)
        context.setState({username: contactDetails.username, password: contactDetails.password})
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

  _next(event) {
    console.log(`_next username: ${this.state.username} password: ${this.state.password}`)
    let activity = []
    const context = this

    this.setState({spinner: true})
    login({username: this.state.username, password: this.state.password}, activity)
    .then((response) => {
      console.log('Login response: ', JSON.stringify(response));
      context.setState({spinner: false})
      if (response.status == 9)
        context.props.navigator.push({name: 'selectTeeTime', url: context.props.url});
      else throw new Error('Failed to login.....')
    })
    .catch(function (err) {
      console.log('error********: ' + err);
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
          <View style={styles.footer}>
            <Button
              onPress={this._next.bind(this)}>
              <Text style={[styles.next_button,
                            this.state.nextButtonActive? styles.buttonActive: styles.buttonInActive
                          ]}>VERIFY</Text>
            </Button>
          </View>
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
    marginBottom: 40
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
  logo_wrap: {
    alignItems: 'center',
    height: 220,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 20,
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
