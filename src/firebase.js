// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore";

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


  // firestore

const db = getFirestore();
const colRef = collection(db, "users");

export const getUser = async (user) => {
  const userRef = doc(colRef, user.uid);
  const userSnapshot = await getDoc(userRef);
  return userSnapshot.data();
};


export const pointsLookUp = {
  0: 600,
  1: 400,
  2: 300,
  3: 200,
  4: 150,
  5: 100,
  6: 5,
}


export const updateUser = async (user, gameState, userData, username, photoURL) => {
  const points = userData.guessDistribution.reduce((acc, val, idx) => acc + (pointsLookUp[idx] * val), 0);

  try {
    await setDoc(doc(db, "users", user.uid), {
      gameState, userData, username, photoURL, points
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateUsername = async (user, username) => {
  try {
    const userSnapshot = await getDoc(userRef);
    const updatedDoc = await updateDoc(userRef, {
      ...userSnapshot.data(),
      username
    });
  } catch (error) {
    console.log(error);
  }
}

export const updateUserGameState = async (user, gameState) => {

  try {
    const userRef = doc(colRef, user.uid);
    const userSnapshot = await getDoc(userRef);

    const updatedDoc = await updateDoc(userRef, {
      ...userSnapshot.data(),
      gameState
    });
  } catch (error) {
    console.log(error);
  };

};

export const updateUserData = async (user, userData) => {
  try {
    const userRef = doc(colRef, user.uid);
    const userSnapshot = await getDoc(userRef);
    const points = userData.guessDistribution.reduce((acc, val, idx) => acc + (pointsLookUp[idx] * val), 0);

    await updateDoc(userRef, {
      ...userSnapshot.data(),
      userData,
      points
      // update points too
    });
  } catch (error) {
    console.log(error);
  };
}

export let leaderboards = [];

export const getLeaderboardsListener = async () => {
  try {
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));

    return onSnapshot(q, (snapshots) => {
      leaderboards = [];
      snapshots.forEach((doc) => {
        leaderboards.push({...doc.data(), id: doc.id});
      })
    });

  } catch (error) {
    console.log(error);
  }
};


