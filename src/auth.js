// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6g9dzeaajmhm_qqvI1yi1IeBaLTv6tlU",
  authDomain: "whiteboard-ed812.firebaseapp.com",
  projectId: "whiteboard-ed812",
  storageBucket: "whiteboard-ed812.appspot.com",
  messagingSenderId: "113477211389",
  appId: "1:113477211389:web:4e524d15ff2ec993c2da94",
  measurementId: "G-THBSZPDZ6T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export default auth;