// Auto-scroll nav to active link on mobile
const activeNav = document.querySelector('.nav-links a.active');
if (activeNav) {
    activeNav.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' });
}

// Hide nav scroll hint when scrolled to end
const navLinks = document.querySelector('.nav-links');
const scrollHint = document.querySelector('.nav-scroll-hint');
if (navLinks && scrollHint) {
    function updateHint() {
        const atEnd = navLinks.scrollLeft + navLinks.clientWidth >= navLinks.scrollWidth - 10;
        scrollHint.style.opacity = atEnd ? '0' : '1';
    }
    navLinks.addEventListener('scroll', updateHint);
    updateHint();
}

const toggleButton = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// 1. On Load: Set the correct icon based on the current theme
// (The theme itself is already set by the script in <head>)
const currentTheme = htmlElement.getAttribute('data-theme');
updateButtonIcon(currentTheme);

// 2. Event Listener: Handle the toggle click
toggleButton.addEventListener('click', () => {
    const theme = htmlElement.getAttribute('data-theme');
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateButtonIcon(newTheme);
});

// 3. Helper function for icons
function updateButtonIcon(theme) {
    toggleButton.innerHTML = theme === 'dark' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' // Sun
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'; // Moon
}

const contactForm = document.getElementById("contact-form");

if (contactForm) {
    
    async function handleSubmit(event) {
        event.preventDefault(); // Stop the page from reloading
        
        const status = document.getElementById("form-status");
        const data = new FormData(event.target);
        
        // Change button text to indicate loading
        const originalText = status.innerHTML;
        status.innerHTML = "Sending...";
        status.disabled = true; // Prevent double clicking

        fetch(event.target.action, {
            method: contactForm.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                // SUCCESS: Change button to success message
                status.innerHTML = "Message Sent ✓";
                status.style.backgroundColor = "var(--text-color)"; // Optional visual cue
                contactForm.reset(); // Clear the inputs
            } else {
                // ERROR: Formspree rejected it
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        status.innerHTML = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        status.innerHTML = "Oops! Problem sending.";
                    }
                });
                status.disabled = false;
            }
        }).catch(error => {
            // NETWORK ERROR
            status.innerHTML = "Network error. Try again.";
            status.disabled = false;
        });
    }

    contactForm.addEventListener("submit", handleSubmit);
}