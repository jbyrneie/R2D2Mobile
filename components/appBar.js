import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import { GlobalStyles } from '../src/styles';

class AppBar extends Component {
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
  
  _menuLogout() {
    console.log('_menuLogout');
    this._menu.hide();
  }

  _menuPlayers() {
    console.log('_menuPlayers');
    this._menu.hide();
  }

  render() {
    return (
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{flex:.75}}>
            <Text style={styles.page_title}>
              {Platform.OS === 'ios'?<Icon name='chevron-left' style={styles.ios_icon}/>:null}
              {this.props.bannerText}
            </Text>
          </View>
          <View style={{flex:.25, alignItems: 'center', justifyContent: 'center'}}>
            <Menu
              ref={this.setMenuRef}
              button={<Text onPress={this.showMenu} style={styles.page_title}>></Text>}
            >
              <MenuItem onPress={this._menuPlayers.bind(this)}>Players</MenuItem>
              <MenuDivider />
              <MenuItem onPress={this._menuLogout.bind(this)}>Logout</MenuItem>
            </Menu>
          </View>
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
    marginRight: 50,
  },
});

module.exports = AppBar;
