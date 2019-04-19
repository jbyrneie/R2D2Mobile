import React, { Component } from 'react';
import { StyleSheet, Text, ScrollView, View } from 'react-native';
import { GlobalStyles } from '../src/styles';
import AppBar from './appBar'

class About extends Component {
  render() {
    return (
      <View style={styles.container}>
        <AppBar bannerText='About' navigation={this.props.navigation}/>
        <ScrollView style={styles.body}>
          <Text style={[styles.heading, styles.text]}>
            About R2D2
          </Text>
          <Text style={styles.text}>
            R2D2 enables you to beat the queue and reserve a tee-time on your Local Golf Club that is registered on the BRS
            system.
          </Text>
          <Text style={styles.text}>
            To get started, provide your BRS Login ID and password. R2D2 will authenticate you against the BRS system
            to ensure your credentials are correct.
          </Text>
          <Text style={styles.text}>
            The next task is to setup the Players you want to reserve a tee-time for. Simply give each player a name and
            provide the BRS ID for that player. This is a once off task, unless you wish to change your "friends" and reserve
            a tee-time for other "friends".
          </Text>
          <Text style={styles.text}>
            Finally, enter when the timesheet becomes available, select the tee-time slot you require, add yourself and up to 3 "friends"
            to the list. R2D2 will then "wake-up" when the timesheet is live and you and your friends will be the first to
            get that coveted tee-time. If for some reason, the tee-time is not available, R2D2 will look at the next slot for
            availability. The BRS system will send you an email confirmation of your tee-time as normal.
          </Text>
          <Text style={styles.text}>
            Enjoy your round!
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  body: {
    flex: 9,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5,
    marginBottom: 5
  },
  heading: {
    fontWeight: "600",
    paddingBottom: 8,
    paddingTop: 25,
  },
  text: {
    fontFamily: GlobalStyles.font,
    fontSize: 16,
    lineHeight: 20,
    paddingBottom: 10,
  },
});

module.exports = About;
