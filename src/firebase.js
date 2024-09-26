// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXTdVrpP062FdyF5G3N_F124CV8gLKJwo",
  authDomain: "yet-another-wordle-clone.firebaseapp.com",
  projectId: "yet-another-wordle-clone",
  storageBucket: "yet-another-wordle-clone.appspot.com",
  messagingSenderId: "125079979526",
  appId: "1:125079979526:web:c2fcdc570bfc40091ce587",
  measurementId: "G-EMMCZENGBE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth();

export const signUpUser = async (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        console.log("User Created: ", cred.user);
      })
      .catch((err) => console.error(err));
  };
  
  export const signOutUser = async () => {
    try {
      const res = signOut(auth);
      console.log("User signed out.");
    } catch (err) {
      console.err(err);
    }
  };
  
  const provider = new GoogleAuthProvider();
  
  export const googleSignUpPopup = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
  
      // gives google access token
      const credential = GoogleAuthProvider.credentialFromResult(res);
  
      return res;
    } catch (error) {
      console.error(error);
    }
  };