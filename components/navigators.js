
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions
} from 'react-native';
import sideMenu from './sideMenu'

// Navigators
import { DrawerNavigator } from 'react-navigation'

import about from './about'
import login from './login'
import selectTeeTime from './selectTeeTime'
import scheduleTeeTime from './scheduleTeeTime'

export const Drawer = DrawerNavigator(
  {
    Login: { screen: login },
    SelectTeeTime: { screen: selectTeeTime },
    ScheduleTeeTime: { screen: scheduleTeeTime },
    About: { screen: about }
  },
  {
    contentComponent: sideMenu,
    drawerWidth: Dimensions.get('window').width/2,
  }
)
