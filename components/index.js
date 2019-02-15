'use strict';
import React, {Component} from 'react'
import ReactNative, {AppRegistry, AppState, StyleSheet, View, Platform} from 'react-native'
import {Navigator} from 'react-native-deprecated-custom-components'
import start from './start'
import login from './login'
import selectTeeTime from './selectTeeTime'
import scheduleTeeTime from './scheduleTeeTime'

const ROUTES = {
  start: start,
  login: login,
  selectTeeTime: selectTeeTime,
  scheduleTeeTime: scheduleTeeTime
};

class R2D2 extends Component {
  constructor(props) {
    super(props);
    this.state = {route:'login'}
  }

  renderScene(route, navigator) {
    var Component = ROUTES[route.name];
    return (
        <Component route={route} navigator={navigator} url={route.url} {... route.props}/>
    );
  }

  render() {
    const route = this.state.route
    return (
      <Navigator
        ref='navigator'
        style={styles.container}
        initialRoute={{name: 'start', url: ''}}
        renderScene={this.renderScene}
        configureScene={() => { return Navigator.SceneConfigs.FloatFromRight; }} />
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

module.exports = R2D2;
