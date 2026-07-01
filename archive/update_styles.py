import re

with open("styles.css", "r") as f:
    styles = f.read()

menu_styles = """
/* Exact Replica Menu CSS */

.menu-category {
    margin-bottom: 2.5rem;
}

.category-title {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-family: var(--font-serif);
    font-size: 1.8rem;
    color: var(--color-text-dark);
    margin-bottom: 1.5rem;
    white-space: nowrap;
}

.category-title-ar {
    color: var(--color-accent);
    font-size: 1.4rem;
    font-family: inherit;
    font-weight: 400;
}

.category-title::after {
    content: '';
    flex-grow: 1;
    height: 1px;
    background-color: var(--color-accent);
}

.menu-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem 4rem;
    list-style: none;
    padding: 0;
    margin: 0;
}

.menu-items li {
    display: flex;
    flex-direction: column;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-accent);
}

.item-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.item-name {
    font-weight: 700;
    color: var(--color-text-dark);
    font-size: 1.1rem;
    line-height: 1.2;
    text-transform: capitalize;
}

.item-name-ar {
    color: var(--color-accent);
    font-size: 1rem;
    font-weight: 700;
    margin-top: 0.2rem;
    line-height: 1.2;
}

.item-desc {
    color: #888;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .menu-items {
        grid-template-columns: 1fr;
    }
}
"""

start = styles.find('.menu-grid {')
end = styles.find('.locations-section {')

if start != -1 and end != -1:
    new_styles = styles[:start] + menu_styles + "\n" + styles[end:]
    with open("styles.css", "w") as f:
        f.write(new_styles)
    print("Injected exact replica styles")
else:
    print("Could not find boundaries")
