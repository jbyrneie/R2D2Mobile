import PropTypes from 'prop-types';
import React, {Component} from 'react';
//import styles from './sideMenu.style';
import { GlobalStyles } from '../src/styles';
import {NavigationActions} from 'react-navigation';
import Icon from 'react-native-fa-icons';
//import { Icon } from 'react-native-elements'
//import FontAwesome, { Icons } from 'react-native-fontawesome';
import {ScrollView, Text, View, StyleSheet} from 'react-native';
import { EventRegister } from 'react-native-event-listeners'
import { StackNavigator } from 'react-navigation';
import {getContactDetails, saveContactDetails} from '../src/utils'

class SideMenu extends Component {
  navigateToScreen = (route) => () => {
    console.log('navigateToScreen: ', route);
    const navigateAction = NavigationActions.navigate({
      routeName: route
    });
    this.props.navigation.dispatch(navigateAction);
  }

  _configPlayers() {
    console.log('_configPlayers');
    EventRegister.emit('showConfigPlayersModalEvent', '')
    this.props.navigation.navigate('DrawerClose')
  }

  _menuLogout() {
    console.log('_menuLogout...');
    const context = this
    return getContactDetails()
      .then(function(response) {
        response.verified = false
        return response
      })
      .then((response) => {
        return saveContactDetails(response)
          .then(function(response) {
            console.log('navigating to Login...');
            context.props.navigation.navigate('Login')
          })
      });
  }

  render () {
    const configPlayers = 'Config Players'
    const logout = 'Logout'
    const about = 'About'

    return (
      <View style={styles.container}>
        <ScrollView>
          <View>
            <Text style={styles.sectionHeadingStyle}>
            </Text>
            <View style={styles.navSectionStyle}>
              <View style={{flexDirection: 'row'}} >
                <View style={{flex:.25}}>
                  <Icon name="chevron-left" onPress={this._configPlayers.bind(this)}/>
                </View>
                <View style={{flex:.75}}>
                  <Text onPress={this._configPlayers.bind(this)}>Config Players</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex:.25}}>
                  <Icon name="chevron-left" onPress={this._menuLogout.bind(this)}/>
                </View>
                <View style={{flex:.75}}>
                  <Text onPress={this._menuLogout.bind(this)}>Logout</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footerContainer}>
          <View style={{flexDirection: 'row'}} onPress={this.navigateToScreen('About')}>
            <View style={{flex:.25}}>
              <Icon name="chevron-left" />
            </View>
            <View style={{flex:.75}}>
              <Text>About</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

SideMenu.propTypes = {
  navigation: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  navItemStyle: {
    padding: 10
  },
  navSectionStyle: {
    backgroundColor: 'lightgrey'
  },
  sectionHeadingStyle: {
    paddingVertical: 39,
    paddingHorizontal: 5,
    backgroundColor: GlobalStyles.brandPrimary
  },
  ios_icon: {
    fontSize: 18,
    marginLeft: 10,
    marginRight: 10,
    paddingLeft: 40,
    paddingRight: 40,
  },
  footerContainer: {
    backgroundColor: 'lightgrey'
  }
});

export default SideMenu;
