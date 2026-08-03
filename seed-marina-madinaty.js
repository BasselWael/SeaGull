const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, getDoc, doc } = require('firebase/firestore');
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
const db = getFirestore(app);
const auth = getAuth(app);

async function seedDatabase() {
    try {
        await signInWithEmailAndPassword(auth, 'admin@seagull.com', 'admin123');
        console.log("Logged in for seeding...");
        
        // Copy Dokki to Marina
        const dokkiDoc = await getDoc(doc(db, "menu", "dokki"));
        if (dokkiDoc.exists()) {
            await setDoc(doc(db, "menu", "marina"), dokkiDoc.data());
            console.log("Uploaded marina menu.");
        }
        
        // Copy Tagamoa to Madinaty
        const tagamoaDoc = await getDoc(doc(db, "menu", "tagamoa"));
        if (tagamoaDoc.exists()) {
            await setDoc(doc(db, "menu", "madinaty"), tagamoaDoc.data());
            console.log("Uploaded madinaty menu.");
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();
