import re

with open("styles.css", "r") as f:
    css = f.read()

new_css = """
/* Locations Section */
.locations-section {
    padding: var(--spacing-xl) 5%;
    background-color: var(--color-bg-alt);
}

.locations-section-header {
    margin-bottom: 2rem;
}

.section-subtitle-locations {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--color-accent);
    margin-bottom: 0.5rem;
}

.section-title-locations {
    font-size: 3.5rem;
    line-height: 1.1;
    color: var(--color-text-dark);
}

.locations-white-box {
    background-color: var(--color-bg);
    border: 1px solid #dcd1be;
    padding: 3rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.loc-box-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 3rem;
}

.loc-box-title-area h3 {
    font-size: 1.2rem;
    color: var(--color-accent);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 1rem;
}

.loc-box-title-area p {
    font-size: 1.5rem;
    color: var(--color-text-dark);
    margin-bottom: 0.5rem;
}

.loc-box-count {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1.5rem;
}

.loc-legend {
    display: flex;
    gap: 1.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--color-text-dark);
    font-weight: 600;
}

.legend-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 0.5rem;
    vertical-align: middle;
}

.dot-round { background-color: #c9b189; }
.dot-seasonal { border: 2px solid #d32f2f; background-color: transparent; }
.dot-hotel { background-color: #1c2e36; }

.loc-box-body {
    display: flex;
    gap: 2rem;
}

.loc-map-side {
    flex: 1;
    position: relative;
    background-color: #e5dac6; /* map placeholder color */
    min-height: 400px;
}

.loc-map-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Base pin style */
.loc-pin {
    position: absolute;
    width: 24px;
    height: 24px;
    background-color: #c9b189; /* default dot-round */
    border: 3px solid var(--color-bg);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    transition: transform 0.2s;
}

.loc-pin:hover, .loc-pin.active {
    transform: translate(-50%, -50%) scale(1.3);
}

.pin-marina {
    background-color: transparent;
    border: 3px solid #d32f2f;
}
.pin-gleem { background-color: #1c2e36; }

.loc-card-side {
    width: 400px;
    background-color: #1c2e36;
    color: #e9e3d3;
    padding: 3rem 2rem;
}

.loc-detail-card {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.card-subtitle {
    color: var(--color-accent);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
}

.card-title {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 2.5rem;
    color: var(--color-accent);
    margin-bottom: 0.5rem;
}

.card-city {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 1.1rem;
    color: #e9e3d3;
    margin-bottom: 2rem;
}

.card-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2rem;
}

.card-table th, .card-table td {
    padding: 1.5rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    font-size: 0.85rem;
    vertical-align: top;
}

.card-table tr:last-child th, .card-table tr:last-child td {
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.card-table th {
    text-align: left;
    color: var(--color-accent);
    font-weight: 600;
    width: 100px;
    letter-spacing: 1px;
}

.card-table td {
    color: #e9e3d3;
}

.card-actions {
    margin-top: auto;
    display: flex;
    gap: 1rem;
}

.btn-card-dir {
    background-color: var(--color-accent);
    color: var(--color-text-dark);
    border: none;
    padding: 0.8rem 1.5rem;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.btn-card-res {
    background-color: transparent;
    color: var(--color-accent);
    border: 1px solid var(--color-accent);
    padding: 0.8rem 1.5rem;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 1px;
}

@media (max-width: 992px) {
    .loc-box-body {
        flex-direction: column;
    }
    .loc-card-side {
        width: 100%;
    }
    .loc-box-header {
        flex-direction: column;
        gap: 1.5rem;
    }
}
"""

# Replace everything from .locations-section { ... up to /* Delivery Section */
pattern = r'\.locations-section\s*\{.*?(?=\/\* Delivery Section \*\/)'
new_file = re.sub(pattern, new_css + "\n", css, flags=re.DOTALL)

with open("styles.css", "w") as f:
    f.write(new_file)

print("Updated Locations CSS")
