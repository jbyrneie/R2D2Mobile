import React, { Component } from 'react'
import {StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, BackHandler} from 'react-native'
import Modal from 'react-native-modal'
import Button from 'react-native-button';
import { GlobalStyles } from '../src/styles';
import {getPlayerDetails, savePlayerDetails} from '../src/utils'

class Players extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false,
                   showModal: true,
                   playerDetails: {},
                   player1: {name:'Name', value:'yyyy'},
                   player2: {},
                   player3: {},
                   player4: {},
                  };
  }

  _resetUserName(player, value) {
    console.log(`_resetUserName ${player} ${attribute}`);
    console.log('Player: ', JSON.stringify(this.state[player]));
    if (value == 'Name') {
      let thePlayer = this.state[player]
      thePlayer.name = ''
      this.setState({[player]: thePlayer})
    }
  }

  _resetUserValue(player, value) {
    console.log(`_resetUserName ${player} ${attribute}`);
    console.log('Player: ', JSON.stringify(this.state[player]));
    if (value == 'BRS ID') {
      let thePlayer = this.state[player]
      thePlayer.value = ''
      this.setState({[player]: thePlayer})
    }
  }

  _updatePlayerName(player, value) {
    console.log(`value: ${value} player: ${player} attribute: ${attribute}`);
    let thePlayer = this.state[player]
    thePlayer.name = value
    this.setState({[player]: thePlayer})
  }

  _savePlayers(event) {
    this.props.showModal(false)
  }

  _cancel(event) {
    this.props.showModal(false)
  }

  _goBack() {
    if (this.state.showDeclineReasonModal) {
      this.setState({showDeclineReasonModal: false})
      return true
    }
    else return false
  }

  componentWillMount() {
    const context = this
    getPlayerDetails()
    .then((playerDetails) => {
      context.setState({playerDetails: playerDetails})
    })
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this._goBack.bind(this));
  }

  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this._goBack.bind(this));
  }

  render () {
    const player1 = this.state.player1
    const player2 = this.state.player2
    const player3 = this.state.player3
    const player4 = this.state.player4

    return (
      <View style={styles.container}>
        <Modal style={styles.bottomModal} isVisible={this.props.visible} onRequestClose={this._cancel.bind(this)}>
          <View style={styles.modalContent}>
            <View>
              <Text style={styles.heading}>
                Configure Players
              </Text>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 20}}>Player1</Text>
                </View>
                <View style={{flex:.3}}>
                  <TextInput value={player1?player1.name:'Name'} onFocus={this._resetUserName.bind(this, 'player1', player1?player1.name:'Name')} onChangeText={this._updatePlayerName.bind(this, 'player1')}/>
                </View>
                <View style={{flex:.3}}>
                  <TextInput style={{color: 'gray'}} value={player1?player1.id:'BRS ID'} onFocus={this._resetUserValue.bind(this, 'player1', player1?player1.value:'BRS ID')} onChangeText={(text) => this.setState({input: text})}/>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 20}}>Player2</Text>
                </View>
                <View style={{flex:.3}}>
                  <TextInput onChangeText={(text) => this.setState({input: text})}/>
                </View>
                <View style={{flex:.3}}>
                  <TextInput onChangeText={(text) => this.setState({input: text})}/>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 20}}>Player3</Text>
                </View>
                <View style={{flex:.3}}>
                  <TextInput onChangeText={(text) => this.setState({input: text})}/>
                </View>
                <View style={{flex:.3}}>
                  <TextInput onChangeText={(text) => this.setState({input: text})}/>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 20}}>Player4</Text>
                </View>
                <View style={{flex:.3}}>
                  <TextInput onChangeText={(text) => this.setState({input: text})}/>
                </View>
                <View style={{flex:.3}}>
                  <TextInput onChangeText={(text) => this.setState({input: text})}/>
                </View>
              </View>
              <View style={{marginTop:25}}>
                <Button
                  onPress={this._savePlayers.bind(this)}>
                  <Text style={styles.close_button}>UPDATE</Text>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomModal: {
    margin: 20,
  },
  close_button: {
    fontFamily: GlobalStyles.font,
    fontSize: 13,
    borderRadius: 3,
    paddingTop: 10,
    paddingBottom: 10,
    color: 'white',
    backgroundColor: GlobalStyles.buttonPrimary,
    margin: 5,
    textAlign: 'center',
    overflow: 'hidden',
  },
  heading: {
    fontFamily: GlobalStyles.font,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    paddingBottom: 25,
    paddingTop: 5,
    textAlign: 'center'
  },
})

module.exports = Players;
