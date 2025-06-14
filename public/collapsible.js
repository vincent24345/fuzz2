document.addEventListener("DOMContentLoaded", () => {
  const collapsibles = document.querySelectorAll(".collapsible");
  
  collapsibles.forEach(button => {
    // Set initial ARIA attributes
    button.setAttribute("aria-expanded", "false");
    const contentId = `content-${Math.random().toString(36).substr(2, 9)}`;
    const content = button.nextElementSibling;
    content.id = contentId;
    button.setAttribute("aria-controls", contentId);
    
    // Add indicator element
    const indicator = document.createElement("span");
    indicator.className = "collapse-indicator";
    indicator.innerHTML = "&#9660;"; // Down arrow
    button.appendChild(indicator);
    
    button.addEventListener("click", function() {
      // Toggle active class
      this.classList.toggle("active");
      
      // Toggle aria-expanded attribute
      const expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", !expanded);
      
      // Toggle content visibility
      const content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
        indicator.style.transform = "rotate(0deg)";
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
        indicator.style.transform = "rotate(180deg)";
      }
    });
  });
  
  // Handle window resize to adjust content heights for open sections
  window.addEventListener("resize", () => {
    const openContents = document.querySelectorAll(".content[style*='max-height']");
    openContents.forEach(content => {
      content.style.maxHeight = content.scrollHeight + "px";
    });
  });
});