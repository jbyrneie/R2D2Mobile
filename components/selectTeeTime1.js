import React, { Component } from 'react'
import ReactNative, {StyleSheet,Text,View,ScrollView,Image,RefreshControl, StatusBar, Platform, BackHandler} from 'react-native'
import Button from 'react-native-button';
import Spinner from 'react-native-spinkit'
import Icon from 'react-native-fa-icons';
import {getCM, getNextCM, haveFCMToken, getClientDetails, getInitialNotification, setInitialNotification, declineProject} from '../src/glg';
import { GlobalStyles } from '../src/styles';
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm';
import DeclineReason from './declineReason'

class SelectTeeTime extends Component {
  constructor() {
    super()

    this.state = {
      cm: null,
      error: null,
      spinner: true,
      refreshing: false,
      notificationReceived: false,
      initialNotificationCouncilMemberId: null,
      initialNotificationConsultationId: null,
      showDeclineReasonModal: false,
      showCM: true,
      showJobs: false,
      showPQs: false
    };
  }

  _accept(event) {
    this.props.navigator.push({name: 'schedule', url: this.props.url, props: {cm: this.state.cm, clientDetails: this.state.clientDetails}});
  }

  _showDeclineReasonModal(showModal) {
    this.setState({
      showDeclineReasonModal: showModal
    })
  }

  _decline(event) {
    this.setState({
      showDeclineReasonModal: true
    })
  }

  _onRefresh(event) {
    // No need to get a CM if we have one
    if (this.state.cm)
      return

    this.setState({refreshing:true});
    const context = this
    getNextCM(context.state.clientDetails)
    .then((cm) => {
      context.setState({cm: cm, refreshing:false, notificationReceived: false})
    }).catch((e) => {
      console.log(e); // "oh, no!"
      context.setState({cm: null, spinner:false, refreshing: false, error: 'Could not get CM details'})
    })
  }

  _toggleShowCM(event) {
    this.setState({
      showCM: !this.state.showCM
    })
  }

  _toggleShowJobs(event) {
    this.setState({
      showJobs: !this.state.showJobs
    })
  }

  _toggleShowPQs(event) {
    this.setState({
      showPQs: !this.state.showPQs
    })
  }

  _goBack() {
    if (this.state.showDeclineReasonModal) {
      this.setState({showDeclineReasonModal: false})
      return true
    } else
      return false
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this._goBack.bind(this));
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._goBack.bind(this));
  }

  componentDidMount() {
    const context = this

    return getClientDetails()
      .then((clientDetails) => {
        if (clientDetails != null)
          context.setState({clientDetails: clientDetails})
      }).then(() => {
        FCM.getInitialNotification()
          .then(notification => {
            // Check that this Initial Notification has not been processed before
            if (notification != undefined) {
              const initialNotification = getInitialNotification()

              if (notification.consultation_participant_id != undefined
                  && (initialNotification === null || initialNotification === undefined || (initialNotification != null
                      && notification.consultation_participant_id != initialNotification.consultation_participant_id))
                 ) {
                getCM(context.state.clientDetails, notification.consultation_participant_id)
                  .then((cm) => {
                    context.setState({cm: cm, spinner:false})
                    return cm
                  }).then((cm) => {
                    setInitialNotification(notification)
                    return cm
                  }).then((cm) => {
                    return track({action: 'accept page view - Notification', value:cm?cm.consultation_participant_id:0})
                  }).catch((e) => {
                    console.log(e); // "oh, no!"
                    context.setState({cm: null, spinner:false, notificationReceived: false, error: 'Could not get CM details'})
                  })
              } else {
                getNextCM(context.state.clientDetails)
                .then((cm) => {
                  context.setState({cm: cm, spinner:false, notificationReceived: false})
                  return track({action: 'accept page view - NextCM', value:cm?cm.consultation_participant_id:0})
                }).catch((e) => {
                  console.log(e); // "oh, no!"
                  context.setState({cm: null, spinner:false, notificationReceived: false, error: 'Could not get CM details'})
                })
              }
            } else {
              getNextCM(context.state.clientDetails)
                .then((cm) => {
                  context.setState({cm: cm, spinner:false, notificationReceived: false})
                  return track({action: 'accept page view - NextCM', value:cm?cm.consultation_participant_id:0})
                }).catch((e) => {
                  console.log(e); // "oh, no!"
                  context.setState({cm: null, spinner:false, notificationReceived: false, error: 'Could not get CM details'})
                })
            }
        }).catch((e) => {
          console.log(e); // "oh, no!"
          context.setState({cm: null, spinner:false, notificationReceived: false, error: 'Could not get CM details'})
        });
      })
  }

  componentWillUnmount() {
    // stop listening for events
    //this.notificationListener.remove();

    if (this.refreshTokenListener != undefined || this.refreshTokenListener != null)
      this.refreshTokenListener.remove();
  }

  render() {
    let jobsHistory = null
    if (this.state.cm != null && this.state.cm.jobsHistory != null) {
      const header = <View>
                        <Text style={styles.jobs_history_header} onPress={this._toggleShowJobs.bind(this)}>
                          JOBS HISTORY&nbsp;&nbsp;
                          {this.state.showJobs?<Icon name='minus-square-o' style={styles.fa_icon}/>:<Icon name='plus-square-o' style={styles.fa_icon} />}
                        </Text>
                    </View>

      const jobs = this.state.cm.jobsHistory.map((job, i) => {
        return(
          <View key={i}>
            <View
              style={{
                borderBottomColor: GlobalStyles.dividerLight,
                borderBottomWidth: 1,
                marginTop: 15,
              }}
            />
            <View style={styles.job_history}>
              <Text key={i} style={styles.job_company}>{job.company.toUpperCase()}</Text>
              <Text key={i+100} style={styles.job}>{job.job_title}</Text>
              <Text key={i+200} style={styles.job}>
                {job.start_month?job.start_month + '/':null}
                {job.start_year?job.start_year + ' - ':null}
                {job.end_month?job.end_month + '/':null}
                {job.end_year}
              </Text>
            </View>

          </View>
        )
      })
      jobsHistory = <View style={styles.body_inner}>{header}{this.state.showJobs?jobs:null}</View>
    }

    let pqs = null
    if (this.state.cm != null && this.state.cm.pqs != null) {
      const header = <View>
                        <Text style={styles.pqs_header} onPress={this._toggleShowPQs.bind(this)}>
                          PROFILE QUESTIONS&nbsp;&nbsp;
                          {this.state.showPQs?<Icon name='minus-square-o' style={styles.fa_icon}/>:<Icon name='plus-square-o' style={styles.fa_icon} />}
                        </Text>
                    </View>

      const questions = this.state.cm.pqs.map((pq, i) => {
        return(
          <View key={i}>
            <View
              style={{
                borderBottomColor: GlobalStyles.dividerLight,
                borderBottomWidth: 1,
                marginTop: 15,
              }}
            />
            <View style={styles.question_list}>
              <View key={i+100}>
                <Text key={i+200} style={styles.job_company}>QUESTION</Text>
                <Text key={i+300} style={styles.question}>{pq.question}</Text>
                <View style={{backgroundColor: GlobalStyles.lightBackground, padding: 15, marginTop: 15}}>
                  <Text key={i+400} style={styles.strong}>
                    ANSWER: {pq.response_value}.
                  </Text>
                  {pq.comment && pq.comment.length > 0?
                    <Text key={i+500} style={styles.comment}>{pq.comment}</Text>
                   : null
                  }
                </View>
              </View>
            </View>
          </View>
        )
      })
      pqs = <View style={styles.body_inner}>{header}{this.state.showPQs?questions:null}</View>
    }

    return (

      <View style={styles.container}>
        <StatusBar barStyle = "light-content" hidden = {false}/>
        {this.state.cm?
          <View style={styles.header}>
            <Text style={styles.page_title}>{this.state.cm.project_title}</Text>
          </View>
        :<View style={styles.header}>
          <View style={styles.logo_wrap}>
            <Image
                resizeMode={Image.resizeMode.contain}
                source={require('../images/logo.png')}
                style={styles.logo}
              />
          </View>
        </View>}
        <View style={styles.body}>
          <ScrollView style={{backgroundColor: GlobalStyles.lightBackground}}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh.bind(this)}
                />
              }
            >
              {this.state.cm?
                <View>
                  <View style={styles.body_inner}>
                    <Text style={styles.cm_name} onPress={this._toggleShowCM.bind(this)}>
                      {this.state.cm.first_name.toUpperCase()} {this.state.cm.last_name.toUpperCase()} &nbsp;
                    </Text>
                    {this.state.showCM?
                      <View>
                        <Text style={styles.cm_title}>
                          {this.state.cm.rm_headline?this.state.cm.rm_headline:this.state.cm.cm_title}
                        </Text>
                        <Text style={styles.cm_body}>
                          {this.state.cm.rm_highlight_notes?this.state.cm.rm_highlight_notes:this.state.cm.short_bio}
                        </Text>
                      </View>
                      :null
                    }
                  </View>
                  {jobsHistory!=null?jobsHistory:null}
                  {pqs!=null?pqs:null}
                </View>
              : null}
              {!this.state.cm && !this.state.spinner && !this.state.error?
                <View>
                  <View style={styles.icon_wrap}>
                    <Image
                      style={styles.image}
                      source={require('../images/icon_check.png')}
                    />
                  </View>
                  <Text style={styles.no_cm}>
                    There are no Council Members to approve.
                  </Text>
                  <Text style={styles.more_info}>
                    Swipe down to refresh.
                  </Text>
                </View>
              : null}
              {this.state.error ?
                <View>
                  <View style={styles.icon_wrap}>
                    <Image
                      style={styles.image}
                      source={require('../images/icon_ex.png')}
                    />
                  </View>
                  <Text style={styles.no_cm}>
                    {this.state.error}
                  </Text>
                  <Text style={styles.more_info}>Ensure you have a network connection</Text>
                </View>
              : null}
              {this.state.spinner ?
                <View style={styles.spinner}>
                  <Spinner
                   isVisible={this.state.spinner}
                   type='ThreeBounce'
                   size={100}
                   color={GlobalStyles.headlineColor}/>
                 <Text style={styles.more_info}>
                   Loading....
                 </Text>
                </View>
              : null}
          </ScrollView>
        </View>
        {this.state.cm?
          <View style={styles.footer}>
            <View style={{flex: 1}}>
              <Button
                onPress={this._decline.bind(this)}>
                <Text style={styles.decline_button}>DECLINE</Text>
              </Button>
            </View>
            <View style={{flex: 1}}>
              <Button
                onPress={this._accept.bind(this)}>
                <Text style={styles.accept_button}>ACCEPT</Text>
              </Button>
            </View>
          </View>
          : null
        }
        <View>
          <DeclineReason visible={this.state.showDeclineReasonModal}
            showModal={this._showDeclineReasonModal.bind(this)}
            navigator={this.props.navigator}
            cm={this.state.cm}
            clientDetails={this.state.clientDetails}
          />
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  body: {
    flex: 9,
    paddingTop: 5,
    paddingBottom: 0,
    marginBottom: 0
  },
  body_inner: {
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomColor: GlobalStyles.divider,
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingTop: 15,
    paddingBottom: 15,
  },
  header: {
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: GlobalStyles.brandPrimary,
  },
  icon_wrap: {
    alignItems: 'center',
    height: 175,
    paddingTop: 80,
    marginBottom: 20,
    paddingBottom: 20
  },
  image: {
    resizeMode: 'contain',
    height: 100,
    width: 100,
    opacity: .25
  },
  fa_icon: {
    fontSize: 14,
  },
  logo:{
    marginTop: 0,
    height:75,
    width: 75
  },
  logo_wrap: {
    alignItems: 'center',
  },
  no_cm:{
    fontFamily: GlobalStyles.font,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 40,
    paddingBottom: 20,
    textAlign: 'center',
    color: GlobalStyles.headlineColor,
  },
  more_info:{
    fontFamily: GlobalStyles.font,
    fontSize: 16,
    lineHeight: 22,
    paddingBottom: 20,
    textAlign: 'center',
    color: GlobalStyles.headlineColor,
  },
  page_title: {
    color: '#FFF',
    fontFamily: GlobalStyles.font,
    fontSize: 20,
    lineHeight: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  cm_name: {
    fontFamily: GlobalStyles.font,
    fontSize: 18,
    lineHeight: 22,
    color: GlobalStyles.headlineColor,
  },
  cm_title: {
    fontFamily: GlobalStyles.font,
    fontSize: 13,
    lineHeight: 20,
    paddingBottom: 12,
    color: GlobalStyles.subheadlineColor
  },
  cm_body: {
    color: GlobalStyles.bodyColor,
    fontFamily: GlobalStyles.font,
    fontSize: 13,
    lineHeight: 17,
    paddingTop: 5,
    paddingBottom: 5,
  },
  jobs_history_header: {
    fontFamily: GlobalStyles.font,
    fontSize: 18,
    lineHeight: 22,
    color: GlobalStyles.headlineColor,
  },
  job_history: {
    paddingTop: 15,
  },
  job_company: {
    fontFamily: GlobalStyles.font,
    fontSize: 14,
    lineHeight: 20,
    color: GlobalStyles.headlineColor,
  },
  job: {
    fontFamily: GlobalStyles.font,
    color: GlobalStyles.headlineColor,
    fontSize: 13,
    lineHeight: 17,
  },
  pqs_header: {
    fontFamily: GlobalStyles.font,
    fontSize: 18,
    lineHeight: 22,
    // paddingTop: 10,
    // paddingBottom: 10,
    color: GlobalStyles.headlineColor,
  },
  question: {
    color: GlobalStyles.subheadlineColor,
    fontFamily: GlobalStyles.font,
    fontSize: 13,
    lineHeight: 17,
    paddingTop: 5,
    paddingBottom: 1,
  },
  question_list: {
    paddingBottom: 10,
    paddingTop: 20,
  },
  strong: {
    fontFamily: GlobalStyles.font,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '900'
  },
  comment: {
    color: GlobalStyles.bodyColor,
    fontFamily: GlobalStyles.font,
    fontSize: 13,
    margin: 0,
    padding: 0,
  },
  accept_button: {
    fontFamily: GlobalStyles.font,
    fontSize: 13,
    borderRadius: 3,
    paddingTop: 10,
    paddingBottom: 10,
    color: 'white',
    backgroundColor: GlobalStyles.buttonPrimary,
    borderWidth: 0.5,
    borderColor: GlobalStyles.buttonPrimary,
    margin: 5,
    textAlign: 'center',
    overflow: 'hidden',
  },
  decline_button: {
    fontFamily: GlobalStyles.font,
    fontSize: 13,
    borderRadius: 3,
    paddingTop: 10,
    paddingBottom: 10,
    color: GlobalStyles.buttonPrimary,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: GlobalStyles.buttonPrimary,
    margin: 5,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: GlobalStyles.lightBackground,
    borderTopColor: GlobalStyles.divider,
    borderWidth: 0.5,
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 15,
    paddingLeft: 15,
    marginTop: 0,
  },
  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
    marginBottom: 20,
  }
});

module.exports = SelectTeeTime;
