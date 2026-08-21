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
        
        // Add Category Button
        const addCatBtn = document.createElement('button');
        addCatBtn.className = 'btn-save';
        addCatBtn.style.marginTop = '20px';
        addCatBtn.style.background = '#4CAF50';
        addCatBtn.innerText = '+ Add Category';
        addCatBtn.addEventListener('click', () => {
            syncDOMToData();
            editableData[branch].push({ name: { en: '', ar: '' }, items: [] });
            renderEditor();
            // Restore active tab
            document.querySelectorAll('.branch-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.editor-section').forEach(s => s.style.display = 'none');
            const targetTab = Array.from(document.querySelectorAll('.branch-tab')).find(t => t.innerText === branch);
            if (targetTab) {
                targetTab.classList.add('active');
                const targetSection = document.querySelectorAll('.editor-section')[Array.from(document.querySelectorAll('.branch-tab')).indexOf(targetTab)];
                if (targetSection) targetSection.style.display = 'block';
            }
        });
        
        editableData[branch].forEach((category, catIndex) => {
            const catGroup = document.createElement('div');
            catGroup.className = 'category-group';
            catGroup.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <div style="display:flex; gap:10px; flex-grow:1; margin-right:20px;">
                        <input type="text" placeholder="Category EN Name" value="${escapeHtml(category.name.en)}" data-path="${branch}.${catIndex}.name.en" style="font-size:1.1rem; font-weight:bold; color:var(--color-accent);">
                        <input type="text" placeholder="Category AR Name" value="${escapeHtml(category.name.ar)}" data-path="${branch}.${catIndex}.name.ar" style="font-size:1.1rem; font-weight:bold; color:var(--color-accent);">
                    </div>
                    <button class="btn-delete-cat" data-branch="${branch}" data-cat="${catIndex}">Delete Category</button>
                </div>
                <div class="item-row header-row">
                    <div>Name (EN/AR)</div>
                    <div>Description (EN/AR)</div>
                    <div>Price</div>
                    <div></div>
                </div>
            `;
            
            // Delete Category Event
            catGroup.querySelector('.btn-delete-cat').addEventListener('click', (e) => {
                if (confirm("Are you sure you want to delete this entire category?")) {
                    syncDOMToData();
                    editableData[branch].splice(catIndex, 1);
                    renderEditor();
                    
                    document.querySelectorAll('.branch-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.editor-section').forEach(s => s.style.display = 'none');
                    const targetTab = Array.from(document.querySelectorAll('.branch-tab')).find(t => t.innerText === branch);
                    if (targetTab) {
                        targetTab.classList.add('active');
                        const targetSection = document.querySelectorAll('.editor-section')[Array.from(document.querySelectorAll('.branch-tab')).indexOf(targetTab)];
                        if (targetSection) targetSection.style.display = 'block';
                    }
                }
            });
            
            const itemsContainer = document.createElement('div');
            
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
                    <div style="display:flex; align-items:center; justify-content:center;">
                        <button class="btn-delete-item" data-branch="${branch}" data-cat="${catIndex}" data-item="${itemIndex}" title="Delete Item">❌</button>
                    </div>
                `;
                
                // Delete Item Event
                row.querySelector('.btn-delete-item').addEventListener('click', () => {
                    syncDOMToData();
                    editableData[branch][catIndex].items.splice(itemIndex, 1);
                    renderEditor();
                    
                    document.querySelectorAll('.branch-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.editor-section').forEach(s => s.style.display = 'none');
                    const targetTab = Array.from(document.querySelectorAll('.branch-tab')).find(t => t.innerText === branch);
                    if (targetTab) {
                        targetTab.classList.add('active');
                        const targetSection = document.querySelectorAll('.editor-section')[Array.from(document.querySelectorAll('.branch-tab')).indexOf(targetTab)];
                        if (targetSection) targetSection.style.display = 'block';
                    }
                });
                
                itemsContainer.appendChild(row);
            });
            
            catGroup.appendChild(itemsContainer);
            
            // Add Item Button
            const addItemBtn = document.createElement('button');
            addItemBtn.className = 'btn-add-item';
            addItemBtn.innerText = '+ Add Item';
            addItemBtn.addEventListener('click', () => {
                syncDOMToData();
                editableData[branch][catIndex].items.push({ en: '', ar: '', price: 0 });
                renderEditor();
                
                document.querySelectorAll('.branch-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.editor-section').forEach(s => s.style.display = 'none');
                const targetTab = Array.from(document.querySelectorAll('.branch-tab')).find(t => t.innerText === branch);
                if (targetTab) {
                    targetTab.classList.add('active');
                    const targetSection = document.querySelectorAll('.editor-section')[Array.from(document.querySelectorAll('.branch-tab')).indexOf(targetTab)];
                    if (targetSection) targetSection.style.display = 'block';
                }
            });
            
            catGroup.appendChild(addItemBtn);
            
            branchSection.appendChild(catGroup);
        });
        
        branchSection.appendChild(addCatBtn);
        container.appendChild(branchSection);
        isFirst = false;
    }
}

function syncDOMToData() {
    const inputs = document.querySelectorAll('input[data-path], textarea[data-path]');
    
    inputs.forEach(input => {
        const path = input.getAttribute('data-path').split('.');
        const branch = path[0];
        const catIdx = parseInt(path[1]);
        
        if (path[2] === 'name') {
            // It's a category name: "branch.catIdx.name.en"
            const lang = path[3];
            editableData[branch][catIdx].name[lang] = input.value;
        } else {
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
        }
    });
}

async function saveMenu() {
    const btn = document.getElementById('save-btn');
    btn.disabled = true;
    btn.innerText = "Saving...";
    
    syncDOMToData();

    
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
