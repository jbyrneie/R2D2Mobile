import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GlobalStyles } from '../src/styles';
import Icon from 'react-native-fa-icons';
import {getContactDetails, saveContactDetails} from '../src/utils'
import { EventRegister } from 'react-native-event-listeners'

class AppBar extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <View>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex:.25}}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('DrawerOpen')}>
                <View>
                  <Icon name='ellipsis-v' style={styles.ios_icon}/>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{flex:.75}}>
              <Text style={styles.page_title}>
                {this.props.bannerText}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    paddingLeft: 5,
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
    marginLeft: 15,
    marginTop: 3
  },
});

module.exports = AppBar;
