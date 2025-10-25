/**
 * Task Model for MongoDB
 * © 2k25 𝕊𝕦𝕟𝕚𝕝 𝕊𝕙𝕒𝕣𝕞𝕒. All rights reserved
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Task text is required'],
        trim: true,
        maxlength: [500, 'Task text cannot exceed 500 characters']
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    category: {
        type: String,
        trim: true,
        default: 'general',
        maxlength: [50, 'Category cannot exceed 50 characters']
    },
    dueDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
    if (!this.dueDate || this.completed) return false;
    return new Date() > this.dueDate;
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
    if (!this.dueDate || this.completed) return null;
    const today = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Index for better query performance
taskSchema.index({ completed: 1, createdAt: -1 });
taskSchema.index({ category: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

// Pre-save middleware to update the updatedAt field
taskSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Static method to get task statistics
taskSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
                },
                active: {
                    $sum: { $cond: [{ $eq: ['$completed', false] }, 1, 0] }
                },
                overdue: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$completed', false] },
                                    { $ne: ['$dueDate', null] },
                                    { $lt: ['$dueDate', new Date()] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);
    
    return stats[0] || { total: 0, completed: 0, active: 0, overdue: 0 };
};

// Static method to get tasks by priority
taskSchema.statics.getByPriority = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$priority',
                count: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
                }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

// Static method to get tasks by category
taskSchema.statics.getByCategory = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
                }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Instance method to toggle completion
taskSchema.methods.toggleCompletion = function() {
    this.completed = !this.completed;
    return this.save();
};

// Instance method to update priority
taskSchema.methods.updatePriority = function(newPriority) {
    if (['low', 'medium', 'high'].includes(newPriority)) {
        this.priority = newPriority;
        return this.save();
    }
    throw new Error('Invalid priority level');
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;