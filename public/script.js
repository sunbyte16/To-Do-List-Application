/**
 * Modern To-Do List Application - Static JavaScript
 * © 2k25 𝕊𝕦𝕟𝕚𝕝 𝕊𝕙𝕒𝕣𝕞𝕒. All rights reserved
 */

// Static To-Do List with Local Storage
let tasks = [];
let currentFilter = 'all';
let currentCategory = 'all';
let editingTaskId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    initializeEventListeners();
    renderTasks();
    updateStats();
    
    // Add welcome task if no tasks exist
    if (tasks.length === 0) {
        addTask('Welcome to your modern To-Do app!', 'medium', 'general', null);
    }
});

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('modernTodoTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('modernTodoTasks', JSON.stringify(tasks));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize event listeners
function initializeEventListeners() {
    // Add task form
    document.getElementById('addTaskForm').addEventListener('submit', handleAddTask);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
    
    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', handleCategoryFilter);
    
    // Clear completed
    document.getElementById('clearCompleted').addEventListener('click', clearCompleted);
    
    // Edit form
    document.getElementById('editForm').addEventListener('submit', handleEditTask);
    
    // Modal close
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeEditModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeEditModal();
        }
    });
}

// Handle add task
function handleAddTask(e) {
    e.preventDefault();
    
    const taskText = document.getElementById('taskInput').value.trim();
    const priority = document.getElementById('prioritySelect').value;
    const category = document.getElementById('categoryInput').value.trim() || 'general';
    const dueDate = document.getElementById('dueDateInput').value || null;
    
    if (taskText) {
        addTask(taskText, priority, category, dueDate);
        
        // Reset form
        document.getElementById('addTaskForm').reset();
        document.getElementById('taskInput').focus();
    }
}

// Add new task
function addTask(text, priority, category, dueDate) {
    const newTask = {
        id: generateId(),
        text: text,
        completed: false,
        priority: priority,
        category: category,
        createdAt: new Date().toISOString(),
        dueDate: dueDate
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateStats();
    updateCategoryFilter();
    
    showNotification('Task added successfully!', 'success');
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
        
        showNotification(
            task.completed ? 'Task completed!' : 'Task marked as active!', 
            'success'
        );
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
        updateCategoryFilter();
        
        showNotification('Task deleted!', 'success');
    }
}

// Edit task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        editingTaskId = id;
        
        document.getElementById('editTaskText').value = task.text;
        document.getElementById('editPriority').value = task.priority;
        document.getElementById('editCategory').value = task.category;
        document.getElementById('editDueDate').value = task.dueDate || '';
        
        document.getElementById('editModal').style.display = 'block';
        document.getElementById('editTaskText').focus();
    }
}

// Handle edit task form
function handleEditTask(e) {
    e.preventDefault();
    
    if (editingTaskId) {
        const task = tasks.find(t => t.id === editingTaskId);
        if (task) {
            task.text = document.getElementById('editTaskText').value.trim();
            task.priority = document.getElementById('editPriority').value;
            task.category = document.getElementById('editCategory').value.trim() || 'general';
            task.dueDate = document.getElementById('editDueDate').value || null;
            
            saveTasks();
            renderTasks();
            updateStats();
            updateCategoryFilter();
            closeEditModal();
            
            showNotification('Task updated successfully!', 'success');
        }
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingTaskId = null;
}

// Handle filter change
function handleFilterChange(e) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentFilter = e.target.dataset.filter;
    renderTasks();
}

// Handle category filter
function handleCategoryFilter(e) {
    currentCategory = e.target.value;
    renderTasks();
}

// Clear completed tasks
function clearCompleted() {
    if (confirm('Clear all completed tasks?')) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        updateStats();
        updateCategoryFilter();
        
        showNotification('Completed tasks cleared!', 'success');
    }
}

// Render tasks
function renderTasks() {
    const container = document.getElementById('tasksListContainer');
    const emptyState = document.getElementById('emptyState');
    
    // Filter tasks
    let filteredTasks = tasks;
    
    // Filter by completion status
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Filter by category
    if (currentCategory !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === currentCategory);
    }
    
    // Show/hide empty state
    if (filteredTasks.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    } else {
        container.style.display = 'block';
        emptyState.style.display = 'none';
    }
    
    // Render task items
    container.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}">
            <div class="task-content">
                <button onclick="toggleTask('${task.id}')" class="toggle-btn">
                    <i class="${task.completed ? 'fas fa-check-circle' : 'far fa-circle'}"></i>
                </button>
                
                <div class="task-details">
                    <div class="task-text">${escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="priority-badge priority-${task.priority}">
                            <i class="fas fa-flag"></i> ${task.priority}
                        </span>
                        <span class="category-badge">
                            <i class="fas fa-tag"></i> ${task.category}
                        </span>
                        ${task.dueDate ? `
                            <span class="due-date">
                                <i class="fas fa-calendar"></i> 
                                ${new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        ` : ''}
                        <span class="created-date">
                            <i class="fas fa-clock"></i> 
                            ${new Date(task.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="task-actions">
                <button onclick="editTask('${task.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTask('${task.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('activeCount').textContent = active;
    document.getElementById('completedCount').textContent = completed;
    
    document.getElementById('allCount').textContent = total;
    document.getElementById('activeFilterCount').textContent = active;
    document.getElementById('completedFilterCount').textContent = completed;
    
    // Show/hide clear completed button
    const clearBtn = document.getElementById('clearCompleted');
    clearBtn.style.display = completed > 0 ? 'block' : 'none';
}

// Update category filter dropdown
function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(tasks.map(task => task.category))];
    
    // Keep current selection
    const currentSelection = categoryFilter.value;
    
    // Clear and rebuild options
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (categories.includes(currentSelection)) {
        categoryFilter.value = currentSelection;
    } else {
        categoryFilter.value = 'all';
        currentCategory = 'all';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    // Add notification styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#28a745' : '#dc3545',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'slideInRight 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);