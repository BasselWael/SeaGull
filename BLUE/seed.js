const fs = require('fs');
const { createContext, runInContext } = require('vm');
const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "seagull-menu-db-35",
  appId: "1:17567596488:web:207ff2936bd00f4a198afd",
  storageBucket: "seagull-menu-db-35.firebasestorage.app",
  apiKey: "AIzaSyCZCHNVr-SlZrC9Hp4IQUDHRgChR8ITJ8Y",
  authDomain: "seagull-menu-db-35.firebaseapp.com",
  messagingSenderId: "17567596488",
  version: "2"
};

const content = fs.readFileSync('menu-data.js', 'utf8') + ';\n getMenuData();';
const scriptContext = { 
    localStorage: { getItem: () => null },
    console: console,
    window: {}
};
const context = createContext(scriptContext);
let menuData = runInContext(content, context);

if (!menuData) {
    console.error("Failed to extract DEFAULT_MENU_DATA from menu-data.js");
    process.exit(1);
}

// Convert custom vm objects to plain objects
menuData = JSON.parse(JSON.stringify(menuData));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
    console.log("Seeding database...");
    try {
        await setDoc(doc(db, "menu", "elMax"), { categories: menuData.elMax });
        console.log("Uploaded elMax menu.");
        
        await setDoc(doc(db, "menu", "dokki"), { categories: menuData.dokki });
        console.log("Uploaded dokki menu.");
        
        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();
