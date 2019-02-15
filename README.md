# Client CM Accept #

Mobile (Android/iOS) native App to enable Client Contacts to accept(and schedule)/decline GTC'd CMs. The Contact is presented with the "next" available GTC'd CM.

The App is developed using react-native.

The Client can
* Decline a CM - an email is sent to the Primary and Delegate RM
* Accept a CM - the Client can pick one or more schedule times suggested by the CM or ask GLG to organise a call. The server (https://github.com/glg/client-cm-accept-fcm-server) uses STREAMLINER_SCHEDULING_API to schedule a call or the SCHEDULER_API to request GLG to schedule a call on behalf of the Client.

The App also processes Push Notifications. When opened, the associated GTC'd CM is presented to the Client.

Google Firebase Cloud Messaging (FCM) (https://firebase.google.com/docs/cloud-messaging/) is used to manage Push Notifications.

The App uses the Express Server https://github.com/glg/client-cm-accept-fcm-server to manage notifications and connect with GLGLIVE (using epi).

Security is managed using an FCM Token. A unique token is registered with every device when the App runs. This token is saved in the dbo.FIREBASE_CLOUD_MESSAGING_CONTACT_MAPPING table and associates a Contact email with a token. This token is provided to the Express Server every time the App communicates with GLG.


# Set up #
```
npm i -g react-native-cli
git clone client-cm-accept-mobile.
cd client-cm-accept-mobile
npm install
```

# Testing #
You will need an Android Phone emulator or Xcode for iOS

To Test on Android
* Open a Terminal window and enter
```
npm start -- --reset-cache
```
* Start an Emulator - create one in Android Studio or connect your Android phone via USB and enable degugging on the device
* Open a Terminal window and enter
```
react-native run-android
```

To Test on iOS
* Start XCode (Version 9.0 or higher is required)
* Open a Terminal window and enter
```
react-native run-ios
```
