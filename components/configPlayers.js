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
                   player1: {},
                   player2: {},
                   player3: {},
                   player4: {},
                  };
  }

  _resetUserName(player, value) {
    console.log(`_resetUserName ${player} ${value}`);
    console.log('Player: ', JSON.stringify(this.state[player]));
    if (value == 'Name') {
      let thePlayer = this.state[player]
      thePlayer.name = ''
      this.setState({[player]: thePlayer})
    }
  }

  _resetUserValue(player, value) {
    console.log(`_resetUserName ${player} ${value}`);
    console.log('Player: ', JSON.stringify(this.state[player]));
    if (value == 'BRS ID') {
      let thePlayer = this.state[player]
      thePlayer.id = ''
      this.setState({[player]: thePlayer})
    }
  }

  _updatePlayer(player, attribute, value) {
    console.log(`value: ${value} player: ${player} attribute: ${attribute}`);
    let thePlayer = this.state[player]
    thePlayer[attribute] = value
    console.log(`thePlayer: ${JSON.stringify(thePlayer)}`);
    this.setState({[player]: thePlayer})
  }

  _savePlayers(event) {
    console.log(`_savePlayers: ${JSON.stringify(this.state.playerDetails)}`);
    const details = [{name: this.state.player1.name, id: this.state.player1.id},
                       {name: this.state.player2.name, id: this.state.player2.id},
                       {name: this.state.player3.name, id: this.state.player3.id},
                       {name: this.state.player4.name, id: this.state.player4.id}
                      ]
    console.log('details: ', JSON.stringify(details));
    savePlayerDetails(details)
    .then((playerDetails) => {
      this.props.showModal(false)
    })
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

  _getPlayers() {
    console.log('configPlayer _getPlayers****.....');
    const context = this
    getPlayerDetails()
    .then((playerDetails) => {
      context.setState({player1: playerDetails[0]&&playerDetails[0].id&&playerDetails[0].id.length>0?playerDetails[0]:{"name":"Name","id":"BRS ID"},
                        player2: playerDetails[1]&&playerDetails[1].id&&playerDetails[1].id.length>0?playerDetails[1]:{"name":"Name","id":"BRS ID"},
                        player3: playerDetails[2]&&playerDetails[2].id&&playerDetails[2].id.length>0?playerDetails[2]:{"name":"Name","id":"BRS ID"},
                        player4: playerDetails[3]&&playerDetails[3].id&&playerDetails[3].id.length>0?playerDetails[3]:{"name":"Name","id":"BRS ID"},
                       })
    })
  }

/*
  componentWillUpdate() {
    console.log('configPlayer componentWillUpdate****.....');
    this._getPlayers()
  }
*/

/*
  componentWillMount() {
    console.log('configPlayer componentWillMount****.....');
    this._getPlayers()
  }
*/

  componentDidMount() {
    console.log('configPlayer componentDidMount****.....');
    this._getPlayers()
  }

  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this._goBack.bind(this));
  }

  render () {
    console.log('configPlayer render....');
    const player1 = this.state.player1
    const player2 = this.state.player2
    const player3 = this.state.player3
    const player4 = this.state.player4

    console.log(`render player1: ${JSON.stringify(player1)} player2: ${JSON.stringify(player2)} player3: ${JSON.stringify(player3)} player4: ${JSON.stringify(player4)}`);

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
                  <TextInput value={player1?player1.name:'Name'} onFocus={this._resetUserName.bind(this, 'player1', player1?player1.name:'Name')} onChangeText={this._updatePlayer.bind(this, 'player1', 'name')}/>
                </View>
                <View style={{flex:.3}}>
                  <TextInput style={{color: 'gray'}} value={player1?player1.id:'BRS ID'} onFocus={this._resetUserValue.bind(this, 'player1', player1?player1.id:'BRS ID')} onChangeText={this._updatePlayer.bind(this, 'player1', 'id')}/>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 20}}>Player2</Text>
                </View>
                <View style={{flex:.3}}>
                  <TextInput value={player2?player2.name:'Name'} onFocus={this._resetUserName.bind(this, 'player2', player2?player2.name:'Name')} onChangeText={this._updatePlayer.bind(this, 'player2', 'name')}/>
                </View>
                <View style={{flex:.3}}>
                  <TextInput style={{color: 'gray'}} value={player1?player2.id:'BRS ID'} onFocus={this._resetUserValue.bind(this, 'player2', player1?player2.id:'BRS ID')} onChangeText={this._updatePlayer.bind(this, 'player2', 'id')}/>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 20}}>Player3</Text>
                </View>
                <View style={{flex:.3}}>
                  <TextInput value={player3?player3.name:'Name'} onFocus={this._resetUserName.bind(this, 'player3', player2?player3.name:'Name')} onChangeText={this._updatePlayer.bind(this, 'player3', 'name')}/>
                </View>
                <View style={{flex:.3}}>
                  <TextInput style={{color: 'gray'}} value={player3?player3.id:'BRS ID'} onFocus={this._resetUserValue.bind(this, 'player3', player3?player3.id:'BRS ID')} onChangeText={this._updatePlayer.bind(this, 'player3', 'id')}/>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex:.25}}>
                  <Text style={{paddingTop: 20}}>Player4</Text>
                </View>
                <View style={{flex:.3}}>
                  <TextInput value={player4.name} onFocus={this._resetUserName.bind(this, 'player4', player4.name)} onChangeText={this._updatePlayer.bind(this, 'player4', 'name')}/>
                </View>
                <View style={{flex:.3}}>
                  <TextInput style={{color: 'gray'}} value={player4.id} onFocus={this._resetUserValue.bind(this, 'player4', player4.id)} onChangeText={this._updatePlayer.bind(this, 'player4', 'id')}/>
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
