import re

with open("styles.css", "r") as f:
    styles = f.read()

menu_tabs_css = """
/* Menu Tabs */
.menu-tabs {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 2rem;
    margin-bottom: 3rem;
    border-bottom: 1px solid #dcd1be;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0;
}

.menu-tabs::-webkit-scrollbar {
    display: none;
}

.menu-tab {
    background: none;
    border: none;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text-dark);
    padding: 0.8rem 0;
    cursor: pointer;
    position: relative;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.6;
    transition: opacity 0.3s ease;
}

.menu-tab:hover {
    opacity: 1;
}

.menu-tab::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--color-accent);
    transform: scaleX(0);
    transition: transform 0.3s ease;
    transform-origin: center;
}

.menu-tab.active {
    opacity: 1;
    font-weight: 600;
}

.menu-tab.active::after {
    transform: scaleX(1);
}
"""

pattern = r'\.map-nav-container\s*\{.*?(?=\.menu-header\s*\{)'
new_styles = re.sub(pattern, menu_tabs_css + '\n', styles, flags=re.DOTALL)

with open("styles.css", "w") as f:
    f.write(new_styles)

print("Updated styles")
