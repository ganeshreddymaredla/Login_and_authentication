// dashboard.js — NexAuth Dashboard + To-Do Logic

const API = 'http://localhost:5000/api';

// ── Auth Guard ────────────────────────────────
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (!token) window.location.href = '/';

// ── State ─────────────────────────────────────
let allTasks = [];
let currentFilter = 'all';

// ── Theme ─────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const savedTheme  = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeIcon.className = savedTheme === 'dark' ? 'ri-sun-fill' : 'ri-moon-fill';

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeIcon.className = next === 'dark' ? 'ri-sun-fill' : 'ri-moon-fill';
});

// ── Helpers ───────────────────────────────────
function authHeaders() {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function showError(msg) {
  const el = document.getElementById('taskError');
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 3000);
}

// ── Load Profile ──────────────────────────────
async function loadProfile() {
  try {
    const res = await fetch(`${API}/user/profile`, { headers: authHeaders() });
    if (!res.ok) { logout(); return; }
    const user = await res.json();

    const isNew = new URLSearchParams(window.location.search).get('new') === '1';
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    if (isNew) {
      document.getElementById('bannerBadge').textContent = '🎉 Registration Successful';
      history.replaceState(null, '', '/dashboard');
    }

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'flex';

    await loadTasks();
  } catch {
    document.getElementById('loadingState').innerHTML = `
      <i class="ri-error-warning-line" style="font-size:48px;color:#ef4444"></i>
      <p style="color:#ef4444">Could not connect to server.</p>
      <button onclick="window.location.reload()" style="margin-top:12px;padding:10px 20px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:Inter,sans-serif;font-weight:600">Retry</button>
    `;
  }
}

// ── Load Tasks ────────────────────────────────
async function loadTasks() {
  try {
    const res = await fetch(`${API}/tasks`, { headers: authHeaders() });
    if (!res.ok) throw new Error();
    allTasks = await res.json();
    renderTasks();
  } catch {
    showError('Failed to load tasks.');
  }
}

// ── Render Tasks ──────────────────────────────
function renderTasks() {
  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  const emptyMsg = document.getElementById('emptyMsg');

  // Update stats
  const total   = allTasks.length;
  const done    = allTasks.filter(t => t.isCompleted).length;
  const pending = total - done;
  document.getElementById('statTotal').textContent   = total;
  document.getElementById('statDone').textContent    = done;
  document.getElementById('statPending').textContent = pending;

  // Filter
  const filtered = allTasks.filter(t => {
    if (currentFilter === 'completed') return t.isCompleted;
    if (currentFilter === 'pending')   return !t.isCompleted;
    return true;
  });

  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.style.display = 'flex';
    emptyMsg.textContent = currentFilter === 'all'
      ? 'No tasks yet. Add your first task above!'
      : `No ${currentFilter} tasks.`;
    return;
  }

  empty.style.display = 'none';
  filtered.forEach(t => list.appendChild(createTaskEl(t)));
}

// ── Create Task Element ───────────────────────
function createTaskEl(t) {
  const item = document.createElement('div');
  item.className = `task-item${t.isCompleted ? ' completed' : ''}`;
  item.dataset.id = t._id;

  item.innerHTML = `
    <input type="checkbox" class="task-checkbox" ${t.isCompleted ? 'checked' : ''}
      onchange="toggleComplete('${t._id}', this.checked)" />
    <span class="task-text" id="text-${t._id}">${escapeHtml(t.task)}</span>
    <div class="task-actions">
      <button class="task-btn edit-btn" title="Edit" onclick="startEdit('${t._id}')">
        <i class="ri-pencil-line"></i>
      </button>
      <button class="task-btn delete-btn" title="Delete" onclick="deleteTask('${t._id}')">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  `;
  return item;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Add Task ──────────────────────────────────
async function addTask() {
  const input = document.getElementById('taskInput');
  const text  = input.value.trim();
  if (!text) { showError('Please enter a task.'); input.focus(); return; }

  const btn = document.getElementById('addBtn');
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ task: text }),
    });
    if (!res.ok) { const d = await res.json(); showError(d.message || 'Failed to add task.'); return; }
    const newTask = await res.json();
    allTasks.unshift(newTask);
    input.value = '';
    renderTasks();
  } catch {
    showError('Network error.');
  } finally {
    btn.disabled = false;
  }
}

// Enter key to add
document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// ── Toggle Complete ───────────────────────────
async function toggleComplete(id, isCompleted) {
  try {
    const res = await fetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ isCompleted }),
    });
    if (!res.ok) throw new Error();
    const updated = await res.json();
    allTasks = allTasks.map(t => t._id === id ? updated : t);
    renderTasks();
  } catch {
    showError('Failed to update task.');
    renderTasks(); // revert UI
  }
}

// ── Edit Task ─────────────────────────────────
function startEdit(id) {
  const span = document.getElementById(`text-${id}`);
  const item = span.closest('.task-item');
  const actions = item.querySelector('.task-actions');

  span.contentEditable = 'true';
  span.focus();

  // Move cursor to end
  const range = document.createRange();
  range.selectNodeContents(span);
  range.collapse(false);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  // Swap edit btn for save btn
  actions.innerHTML = `
    <button class="task-btn save-btn" title="Save" onclick="saveEdit('${id}')">
      <i class="ri-check-line"></i>
    </button>
    <button class="task-btn delete-btn" title="Delete" onclick="deleteTask('${id}')">
      <i class="ri-delete-bin-line"></i>
    </button>
  `;

  // Save on Enter
  span.addEventListener('keydown', function handler(e) {
    if (e.key === 'Enter') { e.preventDefault(); saveEdit(id); span.removeEventListener('keydown', handler); }
    if (e.key === 'Escape') { renderTasks(); span.removeEventListener('keydown', handler); }
  });
}

async function saveEdit(id) {
  const span = document.getElementById(`text-${id}`);
  const newText = span.textContent.trim();
  if (!newText) { showError('Task cannot be empty.'); return; }

  try {
    const res = await fetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ task: newText }),
    });
    if (!res.ok) throw new Error();
    const updated = await res.json();
    allTasks = allTasks.map(t => t._id === id ? updated : t);
    renderTasks();
  } catch {
    showError('Failed to save task.');
    renderTasks();
  }
}

// ── Delete Task ───────────────────────────────
async function deleteTask(id) {
  // Animate out
  const item = document.querySelector(`.task-item[data-id="${id}"]`);
  if (item) { item.style.opacity = '0'; item.style.transform = 'translateX(20px)'; item.style.transition = '0.2s ease'; }

  try {
    const res = await fetch(`${API}/tasks/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) throw new Error();
    allTasks = allTasks.filter(t => t._id !== id);
    setTimeout(renderTasks, 200);
  } catch {
    showError('Failed to delete task.');
    renderTasks();
  }
}

// ── Filter ────────────────────────────────────
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTasks();
}

// ── Logout ────────────────────────────────────
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  window.location.href = '/';
}

// ── Init ──────────────────────────────────────
loadProfile();
