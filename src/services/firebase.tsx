import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
//configurações do firebase
const firebaseConfig = {
    apiKey: "AIzaSyDxqdjSUvICEZ5hFfZRlfhLUZzzkSRt_BE",
    authDomain: "tasknow-bd2a2.firebaseapp.com",
    databaseURL: "https://tasknow-bd2a2-default-rtdb.firebaseio.com",
    projectId: "tasknow-bd2a2",
    storageBucket: "tasknow-bd2a2.appspot.com",
    messagingSenderId: "1032114607193",
    appId: "1:1032114607193:web:20a90c7d1b3cb012a88d48",
    measurementId: "G-CTYFXF7MMP"
  };

// inicializa o firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const firestore = firebaseApp.firestore();
const timestamp = firebase.firestore.Timestamp.fromDate(new Date());

export { firestore, timestamp };