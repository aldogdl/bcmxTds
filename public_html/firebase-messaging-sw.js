
if( 'function' === typeof importScripts) {

  importScripts('https://www.gstatic.com/firebasejs/7.14.5/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/7.14.5/firebase-messaging.js');

  firebase.initializeApp(firebaseConfig);
  var messaging = firebase.messaging();

  // If you would like to customize notifications that are received in the
  // background (Web app is closed or not in browser focus) then you should
  // implement this optional method.
  // [START background_handler]
  messaging.setBackgroundMessageHandler(function(payload) {
      // Customize notification here
      var notificationTitle = 'Titulo del Mensaje en BG.';
      var notificationOptions = {
          body: 'Cuerpo del Mensaje en BG..',
          icon: 'images/logo_cpanel.png'
      };

      return self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // [END background_handler]
}
