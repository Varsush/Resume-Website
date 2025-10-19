// --- 1. Custom Cursor Animation ---
document.addEventListener("mousemove", (e) => {
  const cursor = document.getElementById("custom-cursor");
  // Ensure the cursor exists before trying to move it
  if (cursor) {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  }
});

// --- 2. Dynamic Galaxy Background Generation ---
function generateStars(count) {
  const background = document.querySelector(".galaxy-background");
  if (!background) return; // Exit if background element is missing

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    // Random size
    const size = Math.random();
    if (size < 0.3) {
      star.classList.add("star-small");
    } else if (size < 0.7) {
      star.classList.add("star-medium");
    } else {
      star.classList.add("star-large");
    }

    // Random position
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;

    // Random animation delay for the shimmer effect
    star.style.animationDelay = `${Math.random() * 10}s`;

    // Random opacity for a more natural look
    star.style.opacity = `${Math.random() * 0.8}`;

    background.appendChild(star);
  }
}

// --- 3. Smooth Page Transition Logic (Crucial for the requirement) ---
$(document).ready(function () {
  // Generate about 150 stars for the galaxy effect
  generateStars(150);

  // Initial page load fade-in
  $("#page-wrapper").css("opacity", 1);

  // Capture all internal links (a tags not starting with # or targeting external sites)
  $('a[href^="http"]:not([href*="' + location.hostname + '"]), a[href^="#"]')
    .each(function () {
      // Do nothing for external links or internal anchors
    })
    .end()
    .filter('a:not([href^="#"])')
    .click(function (e) {
      const newLocation = this.href;

      // Prevent default navigation
      e.preventDefault();

      // Fade the current page out
      $("#page-wrapper").animate({ opacity: 0 }, 500, function () {
        // Once the fade out is complete, navigate to the new page
        window.location.href = newLocation;
      });
    });
});
