import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Global Setup (Uses variables defined in the HTML head) ---
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== "undefined" ? __firebase_config : "{}"
);
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

let db, auth, userId;
let isAuthReady = false;

// --- Firebase Initialization and Auth Setup ---
function initializeFirebase() {
  try {
    if (Object.keys(firebaseConfig).length === 0) {
      console.error("Firebase config is empty. Firestore will not function.");
      return;
    }

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        userId = user.uid;
        console.log("Firebase Auth Ready. Logged in as:", userId);
      } else {
        // Try signing in with custom token if available, otherwise anonymously
        if (initialAuthToken) {
          try {
            const userCredential = await signInWithCustomToken(
              auth,
              initialAuthToken
            );
            userId = userCredential.user.uid;
            console.log("Signed in with custom token. User ID:", userId);
          } catch (error) {
            console.error(
              "Custom token sign-in failed, falling back to anonymous:",
              error
            );
            const userCredential = await signInAnonymously(auth);
            userId = userCredential.user.uid;
          }
        } else {
          // Fallback to anonymous sign-in if no token is present
          const userCredential = await signInAnonymously(auth);
          userId = userCredential.user.uid;
        }
      }
      isAuthReady = true;
    });
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

// --- Form Submission Handler (Exported for HTML use) ---
export async function handleFormSubmit(event) {
  event.preventDefault(); // Stop the default page refresh

  const form = document.getElementById("contact-form");
  const statusMessage = document.getElementById("form-status-message");
  const submitButton = form.querySelector('input[type="submit"]');

  // Temporarily disable button and show loading state
  submitButton.value = "Sending...";
  submitButton.disabled = true;
  statusMessage.style.display = "none";

  // Wait for auth to be ready
  if (!isAuthReady) {
    statusMessage.textContent =
      "System initialization in progress, please wait a moment.";
    statusMessage.style.background = "rgba(255, 165, 0, 0.2)"; // Orange for warning
    statusMessage.style.borderLeftColor = "#ffa500";
    statusMessage.style.display = "block";
    submitButton.value = "Engage Transmission";
    submitButton.disabled = false;
    return;
  }

  const formData = new FormData(form);
  const messageData = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    timestamp: serverTimestamp(),
    senderId: userId,
  };

  try {
    // Determine the collection path for private data
    const collectionPath = `/artifacts/${appId}/users/${userId}/messages`;

    // Add the new message document to Firestore
    await addDoc(collection(db, collectionPath), messageData);

    // Success message
    statusMessage.textContent =
      "Transmission received! I will respond to your frequency soon.";
    statusMessage.style.background = "rgba(0, 255, 0, 0.1)";
    statusMessage.style.borderLeftColor = "#0f0";
    statusMessage.style.display = "block";

    // Reset form fields
    form.reset();
  } catch (error) {
    console.error("Error sending transmission to Firestore:", error);
    // Error message
    statusMessage.textContent = `Transmission failed: ${error.message}. Please try again or use direct email.`;
    statusMessage.style.background = "rgba(255, 0, 0, 0.1)";
    statusMessage.style.borderLeftColor = "#f00";
    statusMessage.style.display = "block";
  } finally {
    // Re-enable button
    submitButton.value = "Engage Transmission";
    submitButton.disabled = false;
  }
}

// Initialize Firebase on script load
initializeFirebase();
