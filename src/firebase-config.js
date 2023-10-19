import firebase from "../node_modules/firebase/compat/app";
import '../node_modules/firebase/compat/firestore';
import '../node_modules/firebase/compat/auth/';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  projectId: process.env.REACT_APP_projectId,
  storageBucket: process.env.REACT_APP_storageBucket,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
  appId: process.env.REACT_APP_appId,
  measurementId: process.env.REACT_APP_measurementId,
};

// Initialize Firebase
export const app = firebase.initializeApp(firebaseConfig);

export const auth = app.auth();

export const db = firebase.firestore();