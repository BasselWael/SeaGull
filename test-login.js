const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  projectId: "seagull-menu-db-35",
  appId: "1:17567596488:web:207ff2936bd00f4a198afd",
  storageBucket: "seagull-menu-db-35.firebasestorage.app",
  apiKey: "AIzaSyCZCHNVr-SlZrC9Hp4IQUDHRgChR8ITJ8Y",
  authDomain: "seagull-menu-db-35.firebaseapp.com",
  messagingSenderId: "17567596488",
  version: "2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, 'admin@seagull.com', 'admin123')
  .then((userCredential) => {
    console.log("SUCCESS! Logged in as:", userCredential.user.email);
    process.exit(0);
  })
  .catch((error) => {
    console.error("FAILED! Error:", error.code, error.message);
    process.exit(1);
  });
