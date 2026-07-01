import re

with open("script.js", "r") as f:
    js = f.read()

menu_tab_js = """    // --- Menu Tab Switching ---
    const menuButtons = document.querySelectorAll('.menu-tab');
    const menuTitleSpan = document.querySelector('.menu-header .section-title span');
    const menuContents = document.querySelectorAll('.menu-content');

    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all tabs
            menuButtons.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');

            // Hide all menus
            menuContents.forEach(menu => {
                menu.style.display = 'none';
                menu.classList.remove('active-menu');
            });

            // Show target menu
            const targetId = 'menu-' + btn.getAttribute('data-target');
            const targetMenu = document.getElementById(targetId);
            if (targetMenu) {
                targetMenu.style.display = 'block';
                targetMenu.classList.add('active-menu');
            }

            // Update the menu title with the location name
            if (menuTitleSpan) {
                const locationText = btn.textContent.replace('•', '').trim().toLowerCase();
                const locationName = locationText.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                menuTitleSpan.textContent = locationName;
            }
        });
    });"""

pattern = r'\/\/ --- Menu Tab Switching ---.*?(?=\}\);$)'
new_js = re.sub(pattern, menu_tab_js + '\n', js, flags=re.DOTALL)

with open("script.js", "w") as f:
    f.write(new_js)

print("Updated script.js")
