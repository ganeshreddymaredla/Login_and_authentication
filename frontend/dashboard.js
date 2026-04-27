// dashboard.js — NexAuth Dashboard Logic

const API = 'http://localhost:5000/api';

// ─── Get stored token (check both storages) ───
const token = localStorage.getItem('token') || sessionStorage.getItem('token');

// If no token, redirect to login
if (!token) {
  window.location.href = '/';
}

// ─── Dark/Light Mode ──────────────────────────
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

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

// ─── Fetch User Profile from API ─────────────
async function loadProfile() {
  try {
    const response = await fetch(`${API}/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Token invalid or expired — redirect to login
      logout();
      return;
    }

    const user = await response.json();
    renderProfile(user);

  } catch (err) {
    console.error('Failed to load profile:', err);
    // Show error but don't redirect (might be network issue)
    document.getElementById('loadingState').innerHTML = `
      <i class="ri-error-warning-line" style="font-size:48px;color:#ef4444"></i>
      <p style="color:#ef4444">Could not connect to server. Is it running?</p>
      <button onclick="window.location.reload()" style="margin-top:12px;padding:10px 20px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:Inter,sans-serif;font-weight:600">Retry</button>
    `;
  }
}

// ─── Render Profile Data ──────────────────────
function renderProfile(user) {
  // Detect if user just registered (flag set in URL)
  const isNewUser = new URLSearchParams(window.location.search).get('new') === '1';

  if (isNewUser) {
    // ── THANK YOU screen (after registration) ──
    document.getElementById('thankyouBanner').style.display = 'flex';
    document.getElementById('userNameThanks').textContent = user.name;
    document.getElementById('userAvatarThanks').textContent = user.name.charAt(0).toUpperCase();
    // Clean the URL so refreshing doesn't keep showing thank-you
    history.replaceState(null, '', '/dashboard');
  } else {
    // ── WELCOME BACK screen (after login) ──
    document.getElementById('loginBanner').style.display = 'flex';
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
  }

  // Profile fields
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;

  // Format date
  const date = new Date(user.createdAt);
  document.getElementById('profileDate').textContent = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Show token (truncated for display) — removed

  // Hide loading, show content
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('dashboardContent').style.display = 'flex';
}

// ─── Copy Token to Clipboard ──────────────────
function copyToken() {
  navigator.clipboard.writeText(token).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.innerHTML = '<i class="ri-check-line"></i> Copied!';
    btn.style.background = '#16a34a';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.innerHTML = '<i class="ri-file-copy-line"></i> Copy';
      btn.style.background = '';
      btn.style.color = '';
    }, 2000);
  });
}

// ─── Logout ───────────────────────────────────
function logout() {
  // Remove token from both storages
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');

  // Redirect to login page
  window.location.href = '/';
}

// ─── Initialize ───────────────────────────────
loadProfile();
