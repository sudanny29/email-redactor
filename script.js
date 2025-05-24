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

  const info = document.createElement('div');
  info.className = 'email-info';

  const origLabel = document.createElement('span');
  origLabel.className = 'email-label';
  origLabel.textContent = 'Original:';

  const origValue = document.createElement('span');
  origValue.className = 'email-value';
  origValue.textContent = original;

  const redactedLabel = document.createElement('span');
  redactedLabel.className = 'email-label';
  redactedLabel.textContent = 'Redacted:';

  const redactedValue = document.createElement('span');
  redactedValue.className = 'email-value redacted-value';
  redactedValue.textContent = redacted;

  info.append(origLabel, origValue, redactedLabel, redactedValue);

  const buttons = document.createElement('div');
  buttons.className = 'email-buttons';

  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'icon-button refresh-btn';
  refreshBtn.title = 'Scramble the visible characters';
  refreshBtn.textContent = '🔄';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'icon-button copy-btn';
  copyBtn.title = 'Copy to clipboard';
  copyBtn.textContent = '📋';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'icon-button delete-btn';
  deleteBtn.title = 'Remove';
  deleteBtn.textContent = '❌';

  buttons.append(refreshBtn, copyBtn, deleteBtn);
  card.append(info, buttons);

  // Copy button event
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(redacted);
      showToast('Copied to clipboard!');
    } catch (err) {
      showToast('Failed to copy to clipboard');
    }
  });

  // Refresh button event
  refreshBtn.addEventListener('click', () => {
    const newRedacted = redactEmail(original, true);
    redactedValue.textContent = newRedacted;
    showToast('Email scrambled!');
  });

  // Delete button event
  deleteBtn.addEventListener('click', () => {
    card.classList.add('removing');
    setTimeout(() => {
      card.remove();
      updateEmptyState();
    }, 300);
  });

  return card;
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
