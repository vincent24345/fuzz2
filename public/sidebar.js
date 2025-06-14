function toggleDropdown(button) {
    const content = button.nextElementSibling;
    const isOpen = content.classList.contains('show');
    
    // Close all dropdowns first
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    const allButtons = document.querySelectorAll('.dropdown-btn');
    
    allDropdowns.forEach(dropdown => dropdown.classList.remove('show'));
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    // Close all fuzzer dropdowns
    const allFuzzerDropdowns = document.querySelectorAll('.fuzzer-content');
    const allFuzzerButtons = document.querySelectorAll('.fuzzer-btn');
    
    allFuzzerDropdowns.forEach(dropdown => dropdown.classList.remove('show'));
    allFuzzerButtons.forEach(btn => btn.classList.remove('active'));
    
    // If it wasn't open, open it
    if (!isOpen) {
        content.classList.add('show');
        button.classList.add('active');
    }
}

function toggleFuzzer(button) {
    const content = button.nextElementSibling;
    const isOpen = content.classList.contains('show');
    
    // Close all fuzzer dropdowns in the same binary
    const parentDropdown = button.closest('.dropdown-content');
    const siblingFuzzerContents = parentDropdown.querySelectorAll('.fuzzer-content');
    const siblingFuzzerButtons = parentDropdown.querySelectorAll('.fuzzer-btn');
    
    siblingFuzzerContents.forEach(dropdown => dropdown.classList.remove('show'));
    siblingFuzzerButtons.forEach(btn => btn.classList.remove('active'));
    
    // If it wasn't open, open it
    if (!isOpen) {
        content.classList.add('show');
        button.classList.add('active');
    }
}