import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlobalStyles } from '../src/styles';
import AppBar from './appBar'

class About extends Component {
  render() {
    return (
      <View style={styles.container}>
        <AppBar bannerText='About' navigation={this.props.navigation}/>
        <View style={styles.body}>
          <Text style={styles.heading, styles.text}>
            About R2D2
          </Text>
          <Text style={styles.text}>
            This App lets you.....
          </Text>
          <Text style={styles.text}>
            Its also lets you.....
          </Text>
        </View>
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
    lineHeight: 20
  },
});

module.exports = About;
