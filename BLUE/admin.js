import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getMenuData } from './menu-data.js';

const firebaseConfig = {
  projectId: "seagull-menu-db-35",
  appId: "1:17567596488:web:207ff2936bd00f4a198afd",
  storageBucket: "seagull-menu-db-35.firebasestorage.app",
  apiKey: "AIzaSyCZCHNVr-SlZrC9Hp4IQUDHRgChR8ITJ8Y",
  authDomain: "seagull-menu-db-35.firebaseapp.com",
  messagingSenderId: "17567596488"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let editableData = {};

document.addEventListener('DOMContentLoaded', async () => {
    // Attach event listeners
    document.getElementById('login-btn').addEventListener('click', checkAuth);
    document.getElementById('auth-pass').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAuth();
    });
    document.getElementById('save-btn').addEventListener('click', saveMenu);
    document.getElementById('reset-btn').addEventListener('click', () => {
        alert("Reset is disabled in this database version.");
    });
    
    // Check if user is already logged in
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            document.getElementById('auth-overlay').style.display = 'none';
            await loadDataAndRender();
        } else {
            document.getElementById('auth-overlay').style.display = 'flex';
        }
    });
});

async function checkAuth() {
    const pass = document.getElementById('auth-pass').value;
    const errorEl = document.getElementById('auth-error');
    errorEl.style.display = 'none';
    
    // We assume the admin email is admin@seagull.com
    const email = 'admin@seagull.com';
    
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // onAuthStateChanged will handle the rest
    } catch (error) {
        if (error.code === 'auth/configuration-not-found') {
            errorEl.innerText = "Firebase Auth is not enabled! Please go to Firebase Console > Authentication > Get Started > Enable Email/Password, and create user 'admin@seagull.com'.";
        } else if (error.code === 'auth/user-not-found') {
            errorEl.innerText = "Admin user not found. Please create 'admin@seagull.com' in Firebase Console.";
        } else {
            errorEl.innerText = "Login failed: " + error.message;
        }
        errorEl.style.display = 'block';
    }
}

async function loadDataAndRender() {
    editableData = await getMenuData();
    renderEditor();
}

function renderEditor() {
    const container = document.getElementById('admin-editor');
    const tabsContainer = document.getElementById('branch-selector');
    container.innerHTML = '';
    tabsContainer.innerHTML = '';
    
    let isFirst = true;

    for (const branch in editableData) {
        // Create Tab
        const tab = document.createElement('button');
        tab.className = `branch-tab ${isFirst ? 'active' : ''}`;
        tab.innerText = branch;
        tabsContainer.appendChild(tab);

        // Create Section
        const branchSection = document.createElement('div');
        branchSection.className = 'editor-section';
        branchSection.style.display = isFirst ? 'block' : 'none';
        branchSection.innerHTML = `<h2 class="branch-title">${branch}</h2>`;
        
        // Tab Click Event
        tab.addEventListener('click', () => {
            document.querySelectorAll('.branch-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.editor-section').forEach(s => s.style.display = 'none');
            tab.classList.add('active');
            branchSection.style.display = 'block';
        });
        
        editableData[branch].forEach((category, catIndex) => {
            const catGroup = document.createElement('div');
            catGroup.className = 'category-group';
            catGroup.innerHTML = `
                <h4 class="cat-title">${category.name.en} / ${category.name.ar}</h4>
                <div class="item-row header-row">
                    <div>Name (EN/AR)</div>
                    <div>Description (EN/AR)</div>
                    <div>Price</div>
                </div>
            `;
            
            category.items.forEach((item, itemIndex) => {
                const row = document.createElement('div');
                row.className = 'item-row';
                
                row.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <input type="text" placeholder="EN Name" value="${escapeHtml(item.en)}" data-path="${branch}.${catIndex}.${itemIndex}.en">
                        <input type="text" placeholder="AR Name" value="${escapeHtml(item.ar)}" data-path="${branch}.${catIndex}.${itemIndex}.ar">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <textarea placeholder="EN Description" data-path="${branch}.${catIndex}.${itemIndex}.desc.en">${item.desc ? escapeHtml(item.desc.en) : ''}</textarea>
                        <textarea placeholder="AR Description" data-path="${branch}.${catIndex}.${itemIndex}.desc.ar">${item.desc ? escapeHtml(item.desc.ar) : ''}</textarea>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <input type="number" placeholder="Price" value="${item.price || ''}" data-path="${branch}.${catIndex}.${itemIndex}.price">
                    </div>
                `;
                catGroup.appendChild(row);
            });
            
            branchSection.appendChild(catGroup);
        });
        
        container.appendChild(branchSection);
        isFirst = false;
    }
}

async function saveMenu() {
    const btn = document.getElementById('save-btn');
    btn.disabled = true;
    btn.innerText = "Saving...";
    
    // Reconstruct data from DOM
    const inputs = document.querySelectorAll('input[data-path], textarea[data-path]');
    
    inputs.forEach(input => {
        const path = input.getAttribute('data-path').split('.');
        const branch = path[0];
        const catIdx = parseInt(path[1]);
        const itemIdx = parseInt(path[2]);
        const field = path[3];
        
        const item = editableData[branch][catIdx].items[itemIdx];
        
        if (field === 'price') {
            item.price = input.value ? parseInt(input.value) : 0;
        } else if (field === 'desc') {
            const lang = path[4];
            if (!item.desc) item.desc = { en: '', ar: '' };
            item.desc[lang] = input.value;
            // cleanup if both empty
            if (!item.desc.en && !item.desc.ar) delete item.desc;
        } else {
            item[field] = input.value;
        }
    });
    
    try {
        // Save to Firestore
        for (const branch in editableData) {
            await setDoc(doc(db, "menu", branch), { categories: editableData[branch] });
        }
        
        // Show toast
        const toast = document.getElementById('toast');
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3000);
    } catch (e) {
        alert("Error saving to database: " + e.message);
    }
    
    btn.disabled = false;
    btn.innerText = "Save Changes";
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
