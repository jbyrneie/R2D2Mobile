import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import { GlobalStyles } from '../src/styles';
import Icon from 'react-native-fa-icons';
import ConfigPlayers from './configPlayers'
import {getContactDetails, saveContactDetails} from '../src/utils'
import { EventRegister } from 'react-native-event-listeners'

class AppBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showConfigPlayersModal: false
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
    this._menu.show();
  };

  _menuLogout(navigator, url) {
    const context = this
    return getContactDetails()
      .then(function(response) {
        response.verified = false
        return response
      })
      .then((response) => {
        return saveContactDetails(response)
          .then(function(response) {
            context._menu.hide();
            context.props.navigation.navigate('Login')
          })
      });
  }

  _menuPlayers() {
    this.setState({
      showConfigPlayersModal: true
    })
    this._menu.hide();
  }

  _showConfigPlayersModal(showModal) {
    this.setState({
      showConfigPlayersModal: showModal
    })
  }

  componentWillMount() {
    const context = this
    this.listener = EventRegister.addEventListener('showConfigPlayersModalEvent', () => {
      context.setState({showConfigPlayersModal: true})
    })
  }

  render() {
    return (
      <View>
        <View style={styles.header}>
          <Text style={styles.page_title}>
            {Platform.OS === 'ios'?<Icon name='chevron-left' style={styles.ios_icon}/>:null}
            {this.props.bannerText}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
    marginLeft: 40,
    marginTop: 10
  },
});

module.exports = AppBar;
