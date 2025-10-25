/**
 * Modern To-Do List Application
 * © 2k25 𝕊𝕦𝕟𝕚𝕝 𝕊𝕙𝕒𝕣𝕞𝕒. All rights reserved
 */

const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory task storage with enhanced structure
let tasks = [
    {
        id: uuidv4(),
        text: 'Welcome to your modern To-Do app!',
        completed: false,
        priority: 'medium',
        category: 'general',
        createdAt: new Date(),
        dueDate: null
    }
];

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    const filter = req.query.filter || 'all';
    const category = req.query.category || 'all';
    
    let filteredTasks = tasks;
    
    // Filter by completion status
    if (filter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Filter by category
    if (category !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === category);
    }
    
    // Get unique categories for filter dropdown
    const categories = [...new Set(tasks.map(task => task.category))];
    
    res.render('index', { 
        tasks: filteredTasks,
        allTasks: tasks,
        filter,
        category,
        categories,
        taskCount: {
            total: tasks.length,
            active: tasks.filter(t => !t.completed).length,
            completed: tasks.filter(t => t.completed).length
        }
    });
});

// Add new task
app.post('/add', (req, res) => {
    const { task, priority, category, dueDate } = req.body;
    
    if (task && task.trim()) {
        const newTask = {
            id: uuidv4(),
            text: task.trim(),
            completed: false,
            priority: priority || 'medium',
            category: category || 'general',
            createdAt: new Date(),
            dueDate: dueDate || null
        };
        tasks.push(newTask);
    }
    
    res.redirect('/');
});

// Toggle task completion
app.post('/toggle/:id', (req, res) => {
    const taskId = req.params.id;
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        task.completed = !task.completed;
    }
    
    res.redirect('/');
});

// Delete task
app.post('/delete/:id', (req, res) => {
    const taskId = req.params.id;
    tasks = tasks.filter(t => t.id !== taskId);
    res.redirect('/');
});

// Edit task
app.post('/edit/:id', (req, res) => {
    const taskId = req.params.id;
    const { task, priority, category, dueDate } = req.body;
    const taskToEdit = tasks.find(t => t.id === taskId);
    
    if (taskToEdit && task && task.trim()) {
        taskToEdit.text = task.trim();
        taskToEdit.priority = priority || taskToEdit.priority;
        taskToEdit.category = category || taskToEdit.category;
        taskToEdit.dueDate = dueDate || taskToEdit.dueDate;
    }
    
    res.redirect('/');
});

// Clear completed tasks
app.post('/clear-completed', (req, res) => {
    tasks = tasks.filter(t => !t.completed);
    res.redirect('/');
});

// API endpoints for AJAX requests
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks/:id/toggle', (req, res) => {
    const taskId = req.params.id;
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        task.completed = !task.completed;
        res.json({ success: true, task });
    } else {
        res.status(404).json({ success: false, message: 'Task not found' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Modern To-Do App running on http://localhost:${PORT}`);
    console.log(`📝 Features: Priority levels, Categories, Due dates, Filters`);
});