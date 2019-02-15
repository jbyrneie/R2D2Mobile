import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

class AppSpinner extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Spinner
          visible={true}
          overlayColor={'rgba(0, 0, 0, 0.85)'}
          textContent={this.props.message}
          textStyle={styles.spinnerTextStyle}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  }
});

module.exports = AppSpinner;
