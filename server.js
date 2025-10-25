/**
 * Modern To-Do List Application with MongoDB
 * © 2k25 𝕊𝕦𝕟𝕚𝕝 𝕊𝕙𝕒𝕣𝕞𝕒. All rights reserved
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { connectDB, isConnected } = require('./config/database');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// In-memory fallback storage (when MongoDB is not available)
let fallbackTasks = [
    {
        id: Date.now().toString(),
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

// Helper function to use MongoDB or fallback
const useMongoDB = () => isConnected();

// Routes
app.get('/', async (req, res) => {
    try {
        const filter = req.query.filter || 'all';
        const category = req.query.category || 'all';
        
        let allTasks, filteredTasks, categories, taskCount;
        
        if (useMongoDB()) {
            // Use MongoDB
            let query = {};
            
            // Filter by completion status
            if (filter === 'active') {
                query.completed = false;
            } else if (filter === 'completed') {
                query.completed = true;
            }
            
            // Filter by category
            if (category !== 'all') {
                query.category = category;
            }
            
            filteredTasks = await Task.find(query).sort({ createdAt: -1 });
            allTasks = await Task.find().sort({ createdAt: -1 });
            
            // Get unique categories
            const categoryData = await Task.distinct('category');
            categories = categoryData;
            
            // Get task statistics
            const stats = await Task.getStats();
            taskCount = {
                total: stats.total,
                active: stats.active,
                completed: stats.completed
            };
        } else {
            // Use fallback in-memory storage
            let filteredTasks = fallbackTasks;
            
            // Filter by completion status
            if (filter === 'active') {
                filteredTasks = fallbackTasks.filter(task => !task.completed);
            } else if (filter === 'completed') {
                filteredTasks = fallbackTasks.filter(task => task.completed);
            }
            
            // Filter by category
            if (category !== 'all') {
                filteredTasks = filteredTasks.filter(task => task.category === category);
            }
            
            allTasks = fallbackTasks;
            categories = [...new Set(fallbackTasks.map(task => task.category))];
            taskCount = {
                total: fallbackTasks.length,
                active: fallbackTasks.filter(t => !t.completed).length,
                completed: fallbackTasks.filter(t => t.completed).length
            };
        }
        
        res.render('index', { 
            tasks: filteredTasks,
            allTasks,
            filter,
            category,
            categories,
            taskCount,
            usingMongoDB: useMongoDB()
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).render('error', { error: 'Failed to load tasks' });
    }
});

// Add new task
app.post('/add', async (req, res) => {
    try {
        const { task, priority, category, dueDate } = req.body;
        
        if (task && task.trim()) {
            if (useMongoDB()) {
                // Use MongoDB
                const newTask = new Task({
                    text: task.trim(),
                    priority: priority || 'medium',
                    category: category || 'general',
                    dueDate: dueDate || null
                });
                await newTask.save();
            } else {
                // Use fallback storage
                const newTask = {
                    id: Date.now().toString(),
                    text: task.trim(),
                    completed: false,
                    priority: priority || 'medium',
                    category: category || 'general',
                    createdAt: new Date(),
                    dueDate: dueDate || null
                };
                fallbackTasks.push(newTask);
            }
        }
        
        res.redirect('/');
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ error: 'Failed to add task' });
    }
});

// Toggle task completion
app.post('/toggle/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        
        if (useMongoDB()) {
            // Use MongoDB
            const task = await Task.findById(taskId);
            if (task) {
                await task.toggleCompletion();
            }
        } else {
            // Use fallback storage
            const task = fallbackTasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
            }
        }
        
        res.redirect('/');
    } catch (error) {
        console.error('Error toggling task:', error);
        res.status(500).json({ error: 'Failed to toggle task' });
    }
});

// Delete task
app.post('/delete/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        
        if (useMongoDB()) {
            // Use MongoDB
            await Task.findByIdAndDelete(taskId);
        } else {
            // Use fallback storage
            fallbackTasks = fallbackTasks.filter(t => t.id !== taskId);
        }
        
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Edit task
app.post('/edit/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { task, priority, category, dueDate } = req.body;
        
        if (task && task.trim()) {
            if (useMongoDB()) {
                // Use MongoDB
                await Task.findByIdAndUpdate(taskId, {
                    text: task.trim(),
                    priority: priority,
                    category: category || 'general',
                    dueDate: dueDate || null
                });
            } else {
                // Use fallback storage
                const taskToEdit = fallbackTasks.find(t => t.id === taskId);
                if (taskToEdit) {
                    taskToEdit.text = task.trim();
                    taskToEdit.priority = priority || taskToEdit.priority;
                    taskToEdit.category = category || taskToEdit.category;
                    taskToEdit.dueDate = dueDate || taskToEdit.dueDate;
                }
            }
        }
        
        res.redirect('/');
    } catch (error) {
        console.error('Error editing task:', error);
        res.status(500).json({ error: 'Failed to edit task' });
    }
});

// Clear completed tasks
app.post('/clear-completed', async (req, res) => {
    try {
        if (useMongoDB()) {
            // Use MongoDB
            await Task.deleteMany({ completed: true });
        } else {
            // Use fallback storage
            fallbackTasks = fallbackTasks.filter(t => !t.completed);
        }
        
        res.redirect('/');
    } catch (error) {
        console.error('Error clearing completed tasks:', error);
        res.status(500).json({ error: 'Failed to clear completed tasks' });
    }
});

// API endpoints for AJAX requests
app.get('/api/tasks', async (req, res) => {
    try {
        let tasks;
        
        if (useMongoDB()) {
            tasks = await Task.find().sort({ createdAt: -1 });
        } else {
            tasks = fallbackTasks;
        }
        
        res.json({ success: true, tasks, usingMongoDB: useMongoDB() });
    } catch (error) {
        console.error('Error fetching tasks via API:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
    }
});

app.post('/api/tasks/:id/toggle', async (req, res) => {
    try {
        const taskId = req.params.id;
        let task;
        
        if (useMongoDB()) {
            task = await Task.findById(taskId);
            if (task) {
                await task.toggleCompletion();
            }
        } else {
            task = fallbackTasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
            }
        }
        
        if (task) {
            res.json({ success: true, task });
        } else {
            res.status(404).json({ success: false, message: 'Task not found' });
        }
    } catch (error) {
        console.error('Error toggling task via API:', error);
        res.status(500).json({ success: false, error: 'Failed to toggle task' });
    }
});

// API endpoint for task statistics
app.get('/api/stats', async (req, res) => {
    try {
        let stats;
        
        if (useMongoDB()) {
            stats = await Task.getStats();
            const priorityStats = await Task.getByPriority();
            const categoryStats = await Task.getByCategory();
            
            res.json({
                success: true,
                stats,
                priorityStats,
                categoryStats,
                usingMongoDB: true
            });
        } else {
            stats = {
                total: fallbackTasks.length,
                active: fallbackTasks.filter(t => !t.completed).length,
                completed: fallbackTasks.filter(t => t.completed).length,
                overdue: 0
            };
            
            res.json({
                success: true,
                stats,
                priorityStats: [],
                categoryStats: [],
                usingMongoDB: false
            });
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
});

// API endpoint to seed initial data
app.post('/api/seed', async (req, res) => {
    try {
        if (useMongoDB()) {
            const existingTasks = await Task.countDocuments();
            if (existingTasks === 0) {
                const welcomeTask = new Task({
                    text: 'Welcome to your modern To-Do app with MongoDB!',
                    priority: 'medium',
                    category: 'general'
                });
                await welcomeTask.save();
                
                res.json({ success: true, message: 'Welcome task created!' });
            } else {
                res.json({ success: true, message: 'Tasks already exist' });
            }
        } else {
            res.json({ success: false, message: 'MongoDB not connected' });
        }
    } catch (error) {
        console.error('Error seeding data:', error);
        res.status(500).json({ success: false, error: 'Failed to seed data' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Modern To-Do App running on http://localhost:${PORT}`);
    console.log(`📝 Features: Priority levels, Categories, Due dates, Filters`);
});