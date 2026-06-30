document.addEventListener('DOMContentLoaded', () => {
    
    // --- Reservation Modal Logic ---
    const dialog = document.getElementById('reservationDialog');
    const openBtns = [
        document.getElementById('openReservationBtn'),
        document.getElementById('heroReserveBtn'),
        document.getElementById('footerReserveBtn')
    ];
    const closeBtn = document.getElementById('closeModalBtn');
    const resForm = document.getElementById('resForm');

    // Open Modal
    openBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                dialog.showModal();
                // Prevent scrolling on body when modal is open
                document.body.style.overflow = 'hidden';
            });
        }
    });

    // Close Modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            dialog.close();
            document.body.style.overflow = '';
        });
    }

    // Close when clicking outside of the modal content
    dialog.addEventListener('click', (e) => {
        const dialogDimensions = dialog.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            dialog.close();
            document.body.style.overflow = '';
        }
    });

    // Handle Form Submission (Simulated WhatsApp redirection)
    if (resForm) {
        resForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Gather form data
            const branch = document.getElementById('branch').options[document.getElementById('branch').selectedIndex].text;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const guests = document.getElementById('guests').value;
            const name = document.getElementById('name').value;
            
            const message = `Hello, I would like to reserve a table at Seagull (${branch}).\n\nName: ${name}\nDate: ${date}\nTime: ${time}\nGuests: ${guests}\n\nPlease confirm my reservation.`;
            
            // Construct WhatsApp URL (replace with actual number if needed)
            const whatsappUrl = `https://wa.me/201212333311?text=${encodeURIComponent(message)}`;
            
            // Open in new tab
            window.open(whatsappUrl, '_blank');
            
            // Close modal and reset form
            dialog.close();
            document.body.style.overflow = '';
            resForm.reset();
        });
    }

    // --- FAQ Accordion Logic ---
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', () => {
            // Close other open items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // --- Menu Tab Switching ---
    const menuButtons = document.querySelectorAll('.map-pin');
    const menuTitleSpan = document.querySelector('.menu-header .section-title span');
    
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            menuButtons.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            
            // Update the menu title with the location name
            if (menuTitleSpan) {
                // Title Case the location name (e.g. "NEW CAIRO" -> "New Cairo") and strip bullet
                const locationText = btn.textContent.replace('•', '').trim().toLowerCase();
                const locationName = locationText.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                menuTitleSpan.textContent = locationName;
            }
        });
    });

});
