window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    const navbar = document.getElementById("navbar");

    // Shrinking navbar and search bar on scroll
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        // Shrink navbar
        navbar.classList.add("small");
        navbar.classList.remove("large");


    } else {
        // Restore navbar size
        navbar.classList.add("large");
        navbar.classList.remove("small");

    }
}

// Initial state: when the page is loaded
document.addEventListener("DOMContentLoaded", function() {
    const navbar = document.getElementById("navbar");
    navbar.classList.add("large"); // Set navbar as large initially
});

// Counting animation for numbers
const counters = document.querySelectorAll('.counter');
const speed = 100; // The lower the number, the slower the animation

counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;

        const increment = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(updateCount, 20);
        } else {
            counter.innerText = target;
        }
    };

    const checkVisibility = () => {
        const rect = counter.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            updateCount();
            window.removeEventListener('scroll', checkVisibility); // Trigger only once
        }
    };

    window.addEventListener('scroll', checkVisibility);
});


// Get elements
const dropdownBtn = document.getElementById('dropdownBtn');
const buttonTray = document.getElementById('buttonTray');
const toggleIcon = document.getElementById('toggleIcon');
let isOpen = false; // Track whether the tray is open or closed

// Show and hide button tray
dropdownBtn.addEventListener('click', function(e) {
    e.preventDefault();
    isOpen = !isOpen;

    if (isOpen) {
        buttonTray.style.display = 'flex'; // Show buttons
        toggleIcon.classList.add('icon-rotate'); // Rotate icon
        toggleIcon.classList.replace('fa-chevron-right', 'fa-chevron-left'); // Change icon to right
    } else {
        buttonTray.style.display = 'none'; // Hide buttons
        toggleIcon.classList.remove('icon-rotate'); // Reset icon rotation
        toggleIcon.classList.replace('fa-chevron-right', 'fa-chevron-left'); // Change icon back to left
    }
});



// "Go to Top" Button functionality
document.getElementById('goTopBtn').addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// AI Chatbox (Placeholder Functionality)
document.getElementById('chatboxBtn').addEventListener('click', function(e) {
    e.preventDefault();
    alert('AI Chatbox will be available soon!\nUse our search engine meanwhile.'); // Replace this with actual chatbox integration
});
