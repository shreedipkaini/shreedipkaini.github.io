// Get elements for service selection popup
const selectProblemBtn = document.getElementById('selectProblemBtn');
const servicePopup = document.getElementById('servicePopup');
const closePopup = document.getElementById('closePopup');
const closeSuccessPopup = document.getElementById('closeSuccessPopup');
const servicesList = document.getElementById('servicesList');
const problemInput = document.getElementById('problem');
const getStartedForm = document.getElementById('getStartedForm');
const serviceCategorySelect = document.getElementById('serviceCategory');

// Sample services for each category
const services = {
    "Home Repair Services": ["Plumbing", "Electrical Repair", "Carpentry", "Painting", "General Handyman"],
    "Cleaning Services": ["Home Cleaning", "Deep Cleaning", "Window Cleaning", "Bathroom Cleaning", "Carpet Cleaning"],
    "Appliance Repair Services": ["TV Repair", "AC Repair", "Refrigerator Repair", "Washing Machine Repair", "Computer Repair"],
    "Beauty and Wellness": ["Haircut", "Massage Therapy", "Makeup", "Spa Services", "Yoga & Fitness"],
    "Moving Services": ["Packers & Movers", "Furniture Moving", "Local Delivery", "Heavy Lifting", "Storage Solutions"]
};

// Function to show the service selection popup
selectProblemBtn.addEventListener('click', function() {
    servicePopup.style.display = 'block'; // Show the popup
    servicesList.innerHTML = ''; // Clear the previous list
});

// Populate services when category is selected
serviceCategorySelect.addEventListener('change', function() {
    const selectedCategory = serviceCategorySelect.value;
    servicesList.innerHTML = ''; // Clear previous services

    if (selectedCategory && services[selectedCategory]) {
        // Populate services for the selected category
        services[selectedCategory].forEach(service => {
            const serviceDiv = document.createElement('div');
            serviceDiv.innerText = service;
            serviceDiv.classList.add('service-option');
            serviceDiv.addEventListener('click', function() {
                problemInput.value = service; // Set the selected service in the input
                servicePopup.style.display = 'none'; // Close the popup after selection
            });
            servicesList.appendChild(serviceDiv);
        });
    }
});

// Close service selection popup
closePopup.addEventListener('click', function() {
    servicePopup.style.display = 'none';
});

// Handle form submission and show success popup
getStartedForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form submission

    // Check if a specific service has been selected, not just a category
    if (problemInput.value === '' || !servicesCategoryIsSelected()) {
        alert('Please select a specific service.');
        return; // Stop form submission
    }

    // Show success popup
    const successPopup = document.getElementById('successPopup');
    successPopup.style.display = 'block';
});

// Close success popup
closeSuccessPopup.addEventListener('click', function() {
    const successPopup = document.getElementById('successPopup');
    successPopup.style.display = 'none';
});

// Function to check if a service category is selected but no service is selected
function servicesCategoryIsSelected() {
    const selectedCategory = serviceCategorySelect.value;
    return services[selectedCategory] && services[selectedCategory].includes(problemInput.value);
}
