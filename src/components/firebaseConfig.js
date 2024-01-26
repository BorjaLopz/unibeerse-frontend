// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDe-vhUew0LF32bYnoXPa2xLsEvSfyOr4k",
  authDomain: "unibeerse-db.firebaseapp.com",
  projectId: "unibeerse-db",
  storageBucket: "unibeerse-db.appspot.com",
  messagingSenderId: "734269366757",
  appId: "1:734269366757:web:37ba5872bc66b31aa50f0c",
  measurementId: "G-0JKM6HMJY9",
};

//Inicializamos la app
const app = initializeApp(firebaseConfig);

//Referencia de la DB
const db = getFirestore();

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { auth, db };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Authentication and get a reference to the service
// const auth = getAuth(app);

// //Obtenemos la DB
// const db = getFirestore(app);

// export { auth, db, firebaseConfig };
