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

// Search Button functionality: Focus on search bar at the top
document.getElementById('searchBtn').addEventListener('click', function(e) {
    e.preventDefault();

    // Scroll to the search bar and focus it
    const searchBar = document.getElementById('searchBar');
    searchBar.scrollIntoView({ behavior: 'smooth' });
    searchBar.querySelector('input').focus(); // Focus on the input field
});

// AI Chatbox (Placeholder Functionality)
document.getElementById('chatboxBtn').addEventListener('click', function(e) {
    e.preventDefault();
    alert('AI Chatbox will be available soon!\nUse our search engine meanwhile.'); // Replace this with actual chatbox integration
});



// Get modal element
const modal = document.getElementById("authModal");
const closeBtn = document.getElementsByClassName("close-btn")[0];

// Get login/register buttons
const loginBtn = document.querySelector(".button.small"); // Assuming you have a button with this class
const registerBtn = document.querySelector(".button.small"); // Assuming you have a button with this class for registration

// Show modal when login or register buttons are clicked
loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = "block";
});

// Close modal when close button is clicked
closeBtn.addEventListener('click', function() {
    modal.style.display = "none";
});

// Close modal when clicking outside of modal content
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Sign In with Google button functionality (placeholder)
document.getElementById('gmailSignIn').addEventListener('click', function() {
    alert('Sign in with Google functionality to be implemented!');
});
