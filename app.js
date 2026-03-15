'use strict';

const STORAGE_KEY = 'todo-app-items';

/** @type {{ id: string, text: string, completed: boolean }[]} */
let todos = [];
let currentFilter = 'all';

// --- Persistence ---

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch {
    todos = [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// --- State mutations ---

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.unshift({ id: crypto.randomUUID(), text: trimmed, completed: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  render();
}

// --- Rendering ---

function filteredTodos() {
  if (currentFilter === 'active')    return todos.filter(t => !t.completed);
  if (currentFilter === 'completed') return todos.filter(t =>  t.completed);
  return todos;
}

function render() {
  const list = document.getElementById('todoList');
  const footer = document.getElementById('footer');
  const remaining = document.getElementById('remaining');
  const items = filteredTodos();

  // List
  if (items.length === 0) {
    list.innerHTML = '<li class="empty-state">タスクはありません</li>';
  } else {
    list.innerHTML = items.map(todo => `
      <li class="todo-item${todo.completed ? ' completed' : ''}" data-id="${todo.id}">
        <input
          type="checkbox"
          class="todo-checkbox"
          ${todo.completed ? 'checked' : ''}
          aria-label="完了にする"
        />
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="delete-btn" aria-label="削除">×</button>
      </li>
    `).join('');
  }

  // Footer
  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  if (todos.length === 0) {
    footer.classList.add('hidden');
  } else {
    footer.classList.remove('hidden');
    remaining.textContent = `残り ${activeCount} 件`;
    document.getElementById('clearCompleted').style.visibility =
      completedCount > 0 ? 'visible' : 'hidden';
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Event listeners ---

document.getElementById('addForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('todoInput');
  addTodo(input.value);
  input.value = '';
});

document.getElementById('todoList').addEventListener('click', e => {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.classList.contains('todo-checkbox')) {
    toggleTodo(id);
  } else if (e.target.classList.contains('delete-btn')) {
    deleteTodo(id);
  }
});

document.querySelector('.filters').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  render();
});

document.getElementById('clearCompleted').addEventListener('click', clearCompleted);

// --- Init ---
loadTodos();
render();
