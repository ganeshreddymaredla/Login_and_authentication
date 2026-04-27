// script.js — NexAuth Frontend Logic

// ─── API Base URL ───────────────────────────────
const API = 'http://localhost:5000/api';

// ═══════════════════════════════════════════════
// TAB SWITCHING (Sign In / Sign Up)
// ═══════════════════════════════════════════════
function switchTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const indicator = document.getElementById('tabIndicator');

  if (tab === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    indicator.classList.remove('right');
  } else {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    indicator.classList.add('right');
  }
}

// ═══════════════════════════════════════════════
// SHOW / HIDE PASSWORD TOGGLE
// ═══════════════════════════════════════════════
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'ri-eye-line';
  } else {
    input.type = 'password';
    icon.className = 'ri-eye-off-line';
  }
}

// ═══════════════════════════════════════════════
// DARK / LIGHT MODE TOGGLE
// ═══════════════════════════════════════════════
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeIcon.className = savedTheme === 'dark' ? 'ri-sun-fill' : 'ri-moon-fill';

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeIcon.className = next === 'dark' ? 'ri-sun-fill' : 'ri-moon-fill';
});

// ═══════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════

// Show inline validation message
function setValidation(groupId, msgId, message, type) {
  const group = document.getElementById(groupId);
  const msg = document.getElementById(msgId);
  group.classList.remove('error', 'success');
  if (type) group.classList.add(type);
  msg.textContent = message;
  msg.className = `validation-msg ${type}`;
}

// Validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Check password strength
// Returns: { score: 0-4, label: string, color: string }
function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Too weak', color: '#ef4444', width: '25%' },
    { label: 'Weak', color: '#f97316', width: '50%' },
    { label: 'Good', color: '#eab308', width: '75%' },
    { label: 'Strong', color: '#22c55e', width: '100%' },
  ];

  return { score, ...levels[Math.max(0, score - 1)] };
}

// ═══════════════════════════════════════════════
// LOGIN FORM — Real-time Validation
// ═══════════════════════════════════════════════
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');

function validateLoginForm() {
  let valid = true;

  // Email
  if (!loginEmail.value) {
    setValidation('login-email-group', 'loginEmailMsg', '', '');
    valid = false;
  } else if (!isValidEmail(loginEmail.value)) {
    setValidation('login-email-group', 'loginEmailMsg', 'Enter a valid email address', 'error');
    valid = false;
  } else {
    setValidation('login-email-group', 'loginEmailMsg', '', 'success');
  }

  // Password
  if (!loginPassword.value) {
    setValidation('login-password-group', 'loginPasswordMsg', '', '');
    valid = false;
  } else if (loginPassword.value.length < 8) {
    setValidation('login-password-group', 'loginPasswordMsg', 'Password must be at least 8 characters', 'error');
    valid = false;
  } else {
    setValidation('login-password-group', 'loginPasswordMsg', '', 'success');
  }

  loginSubmitBtn.disabled = !valid;
  return valid;
}

loginEmail.addEventListener('input', validateLoginForm);
loginPassword.addEventListener('input', validateLoginForm);

// ═══════════════════════════════════════════════
// REGISTER FORM — Real-time Validation
// ═══════════════════════════════════════════════
const regName = document.getElementById('regName');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const regConfirm = document.getElementById('regConfirm');
const registerSubmitBtn = document.getElementById('registerSubmitBtn');
const strengthFill = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');
const strengthContainer = document.getElementById('strengthContainer');

// Update password strength bar
regPassword.addEventListener('input', () => {
  const val = regPassword.value;

  if (val.length > 0) {
    strengthContainer.classList.add('visible');
    const strength = checkPasswordStrength(val);
    strengthFill.style.width = strength.width;
    strengthFill.style.background = strength.color;
    strengthLabel.textContent = `Strength: ${strength.label}`;
    strengthLabel.style.color = strength.color;
  } else {
    strengthContainer.classList.remove('visible');
  }

  validateRegisterForm();
});

function validateRegisterForm() {
  let valid = true;

  // Name
  if (!regName.value.trim()) {
    setValidation('reg-name-group', 'regNameMsg', '', '');
    valid = false;
  } else if (regName.value.trim().length < 2) {
    setValidation('reg-name-group', 'regNameMsg', 'Name must be at least 2 characters', 'error');
    valid = false;
  } else {
    setValidation('reg-name-group', 'regNameMsg', '✓ Looks good', 'success');
  }

  // Email
  if (!regEmail.value) {
    setValidation('reg-email-group', 'regEmailMsg', '', '');
    valid = false;
  } else if (!isValidEmail(regEmail.value)) {
    setValidation('reg-email-group', 'regEmailMsg', 'Enter a valid email address', 'error');
    valid = false;
  } else {
    setValidation('reg-email-group', 'regEmailMsg', '✓ Valid email', 'success');
  }

  // Password strength check
  const pw = regPassword.value;
  if (!pw) {
    setValidation('reg-password-group', 'regPasswordMsg', '', '');
    valid = false;
  } else if (pw.length < 8) {
    setValidation('reg-password-group', 'regPasswordMsg', 'At least 8 characters required', 'error');
    valid = false;
  } else if (!/[A-Z]/.test(pw)) {
    setValidation('reg-password-group', 'regPasswordMsg', 'Add at least one uppercase letter', 'error');
    valid = false;
  } else if (!/[0-9]/.test(pw)) {
    setValidation('reg-password-group', 'regPasswordMsg', 'Add at least one number', 'error');
    valid = false;
  } else if (!/[^A-Za-z0-9]/.test(pw)) {
    setValidation('reg-password-group', 'regPasswordMsg', 'Add at least one special character (!@#$...)', 'error');
    valid = false;
  } else {
    setValidation('reg-password-group', 'regPasswordMsg', '✓ Strong password', 'success');
  }

  // Confirm password
  if (!regConfirm.value) {
    setValidation('reg-confirm-group', 'regConfirmMsg', '', '');
    valid = false;
  } else if (regConfirm.value !== regPassword.value) {
    setValidation('reg-confirm-group', 'regConfirmMsg', 'Passwords do not match', 'error');
    valid = false;
  } else {
    setValidation('reg-confirm-group', 'regConfirmMsg', '✓ Passwords match', 'success');
  }

  registerSubmitBtn.disabled = !valid;
  return valid;
}

regName.addEventListener('input', validateRegisterForm);
regEmail.addEventListener('input', validateRegisterForm);
regConfirm.addEventListener('input', validateRegisterForm);

// ═══════════════════════════════════════════════
// SHOW FORM MESSAGE (success / error)
// ═══════════════════════════════════════════════
function showMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = `form-message ${type} show`;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    el.className = 'form-message';
  }, 5000);
}

// ═══════════════════════════════════════════════
// SET BUTTON LOADING STATE
// ═══════════════════════════════════════════════
function setLoading(btnId, loaderId, isLoading) {
  const btn = document.getElementById(btnId);
  if (isLoading) {
    btn.classList.add('loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════════════
// LOGIN FORM SUBMIT
// ═══════════════════════════════════════════════
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateLoginForm()) return;

  setLoading('loginSubmitBtn', 'loginLoader', true);

  try {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginEmail.value.trim(),
        password: loginPassword.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Show error message
      showMessage('loginMessage', data.message || 'Login failed', 'error');
    } else {
      // Save token and user info
      const storage = document.getElementById('rememberMe').checked
        ? localStorage
        : sessionStorage;

      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data.user));

      showMessage('loginMessage', '✓ Login successful! Redirecting...', 'success');

      // Navigate to dashboard after short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1200);
    }
  } catch (err) {
    showMessage('loginMessage', 'Network error. Is the server running?', 'error');
  } finally {
    setLoading('loginSubmitBtn', 'loginLoader', false);
  }
});

// ═══════════════════════════════════════════════
// REGISTER FORM SUBMIT
// ═══════════════════════════════════════════════
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateRegisterForm()) return;

  setLoading('registerSubmitBtn', 'registerLoader', true);

  try {
    const response = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: regName.value.trim(),
        email: regEmail.value.trim(),
        password: regPassword.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage('registerMessage', data.message || 'Registration failed', 'error');
    } else {
      // Save token and user info
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      showMessage('registerMessage', '✓ Account created! Redirecting...', 'success');

      // Navigate to dashboard with ?new=1 flag so it shows Thank You screen
      setTimeout(() => {
        window.location.href = '/dashboard?new=1';
      }, 1200);
    }
  } catch (err) {
    showMessage('registerMessage', 'Network error. Is the server running?', 'error');
  } finally {
    setLoading('registerSubmitBtn', 'registerLoader', false);
  }
});

// ═══════════════════════════════════════════════
// REDIRECT IF ALREADY LOGGED IN
// ═══════════════════════════════════════════════
const existingToken = localStorage.getItem('token') || sessionStorage.getItem('token');
if (existingToken) {
  window.location.href = '/dashboard';
}
