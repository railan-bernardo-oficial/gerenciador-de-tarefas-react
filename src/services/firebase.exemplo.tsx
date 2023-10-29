import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
//configurações do firebase
const firebaseConfig = {
    apiKey: "*************************************",
    authDomain: "*********.firebaseapp.com",
    databaseURL: "https://************.firebaseio.com",
    projectId: "***************",
    storageBucket: "*********.appspot.com",
    messagingSenderId: "*********************",
    appId: "***************************************",
    measurementId: "*********"
  };

// inicializa o firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const firestore = firebaseApp.firestore();
const timestamp = firebase.firestore.Timestamp.fromDate(new Date());

export { firestore, timestamp };