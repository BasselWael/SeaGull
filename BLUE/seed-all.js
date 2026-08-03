const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, doc } = require('firebase/firestore');
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

const content = fs.readFileSync('menu-data.js', 'utf8');
const startIndex = content.indexOf('const DEFAULT_MENU_DATA = {');
const endIndex = content.indexOf('import { initializeApp }', startIndex);
const jsonString = content.substring(startIndex, endIndex).replace('const DEFAULT_MENU_DATA = ', '').trim().replace(/;$/, '');

let menuData;
try {
    menuData = eval('(' + jsonString + ')');
} catch (e) {
    console.error("Failed to parse DEFAULT_MENU_DATA");
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function seedDatabase() {
    try {
        await signInWithEmailAndPassword(auth, 'admin@seagull.com', 'admin123');
        console.log("Logged in for seeding...");
        
        console.log("Seeding remaining menus...");
        for (const branch of Object.keys(menuData)) {
            await setDoc(doc(db, "menu", branch), { categories: menuData[branch] });
            console.log(`Uploaded ${branch} menu.`);
        }
        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();
