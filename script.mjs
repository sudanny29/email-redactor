```javascript
// Theme handling
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  }
}

initTheme();

// Toggle theme
themeToggleBtn.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  
  if (isDark) {
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
    localStorage.setItem('theme', 'dark');
  } else {
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
    localStorage.setItem('theme', 'light');
  }
});

// Email redaction functionality
const form = document.getElementById('redact-form');
const emailInput = document.getElementById('email-input');
const errorMessage = document.getElementById('error-message');
const resultsContainer = document.getElementById('results-container');
const emptyState = document.getElementById('empty-state');
const emailsList = document.getElementById('emails-list');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Validate email format
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Redact email showing only the domain and three characters
function redactEmail(email, randomize = false) {
  const [localPart, domain] = email.split('@');
  
  if (!randomize) {
    // Default behavior - show first three characters
    const visiblePart = localPart.substring(0, 3);
    const hiddenPart = '*'.repeat(Math.max(0, localPart.length - 3));
    return `${visiblePart}${hiddenPart}@${domain}`;
  } else {
    // Randomized behavior - show three random characters
    if (localPart.length <= 3) {
      // If local part is 3 or fewer characters, just show it all
      return `${localPart}@${domain}`;
    }
    
    // Create an array of character positions
    const positions = Array.from({ length: localPart.length }, (_, i) => i);
    
    // Shuffle the positions array
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // Select the first 3 positions to be visible
    const visiblePositions = positions.slice(0, 3).sort((a, b) => a - b);
    
    // Create the redacted email
    let result = '';
    for (let i = 0; i < localPart.length; i++) {
      if (visiblePositions.includes(i)) {
        result += localPart[i];
      } else {
        result += '*';
      }
    }
    
    return `${result}@${domain}`;
  }
}

// Generate a unique ID
function generateId() {
  return `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Show toast notification
function showToast(message, duration = 3000) {
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, duration);
}

// Create email card element
function createEmailCard(id, original, redacted) {
  const card = document.createElement('div');
  card.className = 'email-card';
  card.dataset.id = id;
  
  card.innerHTML = `
    <div class="email-info">
      <span class="email-label">Original:</span>
      <span class="email-value">${original}</span>
      <span class="email-label">Redacted:</span>
      <span class="email-value redacted-value">${redacted}</span>
    </div>
    <div class="email-buttons">
      <button class="icon-button refresh-btn" title="Scramble the visible characters">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>
      </button>
      <button class="icon-button copy-btn" title="Copy to clipboard">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
      </button>
      <button class="icon-button delete-btn" title="Remove">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
      </button>
    </div>
  `;
  
  // Copy button event
  card.querySelector('.copy-btn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(redacted);
      showToast('Copied to clipboard!');
    } catch (err) {
      showToast('Failed to copy to clipboard');
    }
  });
  
  // Refresh button event
  card.querySelector('.refresh-btn').addEventListener('click', () => {
    const newRedacted = redactEmail(original, true);
    card.querySelector('.redacted-value').textContent = newRedacted;
    showToast('Email scrambled!');
  });
  
  // Delete button event
  card.querySelector('.delete-btn').addEventListener('click', () => {
    card.classList.add('removing');
    setTimeout(() => {
      card.remove();
      updateEmptyState();
    }, 300);
  });
  
  return card;
}

// Update empty state visibility
function updateEmptyState() {
  if (emailsList.children.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }
}

// Handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  
  // Reset error state
  errorMessage.classList.add('hidden');
  
  // Validate email
  if (!email) {
    errorMessage.textContent = 'Please enter an email address';
    errorMessage.classList.remove('hidden');
    return;
  }
  
  if (!validateEmail(email)) {
    errorMessage.textContent = 'Please enter a valid email address';
    errorMessage.classList.remove('hidden');
    return;
  }
  
  // Redact email
  const redacted = redactEmail(email);
  
  // Create email card
  const id = generateId();
  const card = createEmailCard(id, email, redacted);
  
  // Add to list
  emailsList.prepend(card);
  
  // Update empty state
  updateEmptyState();
  
  // Clear input
  emailInput.value = '';
  emailInput.focus();
});

// Initial update of empty state
updateEmptyState();
```
