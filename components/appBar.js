import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import { GlobalStyles } from '../src/styles';
import Icon from 'react-native-fa-icons';
import ConfigPlayers from './configPlayers'
import {getContactDetails, saveContactDetails} from '../src/utils'

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
    console.log('showMenu....');
    this._menu.show();
  };

  _menuLogout(navigator, url) {
    console.log('_menuLogout');
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
            navigator.push({name: 'login', url: url});
          })
      });
  }

  _menuPlayers() {
    console.log('_menuPlayers');
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

  render() {
    return (
      <View>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex:.75}}>
              <Text style={styles.page_title}>
                {Platform.OS === 'ios'?<Icon name='chevron-left' style={styles.ios_icon}/>:null}
                {this.props.bannerText}
              </Text>
            </View>
            <View style={{flex:.25, alignItems: 'center', justifyContent: 'center'}}>
              <TouchableWithoutFeedback onPress={this.showMenu}>
                <View>
                  <Icon name='ellipsis-v' style={styles.ios_icon}/>
                </View>
              </TouchableWithoutFeedback>
              <Menu
                ref={this.setMenuRef}
                button={<Text></Text>}
              >
                <MenuItem onPress={this._menuPlayers.bind(this)}>Players</MenuItem>
                <MenuItem onPress={this._menuLogout.bind(this, this.props.navigator, this.props.url)}>Logout</MenuItem>
              </Menu>
            </View>
          </View>
        </View>
        <View>
          <ConfigPlayers
            visible={this.state.showConfigPlayersModal}
            showModal={this._showConfigPlayersModal.bind(this)}
            navigator={this.props.navigator}
          />
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
