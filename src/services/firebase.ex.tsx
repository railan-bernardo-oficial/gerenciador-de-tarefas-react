import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
//configurações do firebase
const firebaseConfig = {
    apiKey: "***************************************",
    authDomain: "***************************",
    databaseURL: "*********************************",
    projectId: "************************",
    storageBucket: "**********************",
    messagingSenderId: "**************************",
    appId: "*********************************",
    measurementId: "***************************"
  };

// inicializa o firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const firestore = firebaseApp.firestore();
const timestamp = firebase.firestore.Timestamp.fromDate(new Date());

export { firestore, timestamp };