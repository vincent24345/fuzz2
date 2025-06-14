document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".dropdown-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", function () {
      this.classList.toggle("active");
      const dropdown = this.nextElementSibling;
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });
  });
});
