# 🍃 MongoDB Setup Guide

## 📋 **Overview**
Your Modern To-Do List application now supports MongoDB for persistent storage with automatic fallback to in-memory storage if MongoDB is not available.

## 🚀 **Quick Setup Options**

### **Option 1: Local MongoDB (Recommended for Development)**

#### **Install MongoDB Community Edition**

**Windows:**
1. Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB service:
   ```bash
   net start MongoDB
   ```

**macOS (with Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### **Verify Installation**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"
```

### **Option 2: MongoDB Atlas (Cloud - Free Tier)**

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose the free M0 tier
3. **Setup Database User**: Create username/password
4. **Whitelist IP**: Add your IP address (or 0.0.0.0/0 for development)
5. **Get Connection String**: Copy the connection URI

## ⚙️ **Configuration**

### **Environment Variables**
Update your `.env` file:

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/modern-todo

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/modern-todo

# Other settings
PORT=3000
NODE_ENV=development
```

### **Connection String Examples**

**Local MongoDB:**
```
mongodb://localhost:27017/modern-todo
```

**MongoDB Atlas:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/modern-todo?retryWrites=true&w=majority
```

**Local MongoDB with Authentication:**
```
mongodb://username:password@localhost:27017/modern-todo
```

## 🎯 **Features with MongoDB**

### **Enhanced Functionality**
- ✅ **Persistent Storage**: Tasks survive server restarts
- ✅ **Advanced Queries**: Fast filtering and searching
- ✅ **Data Validation**: Schema validation for data integrity
- ✅ **Statistics**: Real-time analytics and insights
- ✅ **Scalability**: Handle thousands of tasks efficiently
- ✅ **Backup & Recovery**: Built-in data protection

### **New API Endpoints**
```bash
# Get task statistics
GET /api/stats

# Seed initial data
POST /api/seed

# Get all tasks with metadata
GET /api/tasks
```

### **Task Model Features**
- **Automatic Timestamps**: `createdAt` and `updatedAt`
- **Virtual Fields**: `isOverdue` and `daysUntilDue`
- **Validation**: Text length, priority levels, categories
- **Indexing**: Optimized queries for better performance

## 🔧 **Development Commands**

```bash
# Start with MongoDB
npm start

# Start development server
npm run dev

# Check MongoDB connection
node -e "require('./config/database').connectDB()"

# Seed initial data
curl -X POST http://localhost:3000/api/seed
```

## 📊 **Database Schema**

### **Task Collection**
```javascript
{
  _id: ObjectId,
  text: String (required, max 500 chars),
  completed: Boolean (default: false),
  priority: String (enum: ['low', 'medium', 'high']),
  category: String (default: 'general', max 50 chars),
  dueDate: Date (optional),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-updated)
}
```

### **Indexes**
- `{ completed: 1, createdAt: -1 }` - For filtering active/completed tasks
- `{ category: 1 }` - For category filtering
- `{ priority: 1 }` - For priority filtering
- `{ dueDate: 1 }` - For due date queries

## 🛠️ **Troubleshooting**

### **Common Issues**

**MongoDB Connection Failed:**
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({connectionStatus : 1})"

# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB service (macOS)
brew services start mongodb/brew/mongodb-community

# Start MongoDB service (Linux)
sudo systemctl start mongod
```

**Port Already in Use:**
```bash
# Check what's using port 27017
netstat -an | grep 27017

# Kill process using port
sudo lsof -ti:27017 | xargs kill -9
```

**Authentication Failed:**
- Check username/password in connection string
- Verify database user permissions
- Ensure IP whitelist includes your address

### **Fallback Mode**
If MongoDB is not available, the app automatically falls back to in-memory storage:
- ⚠️ **Warning**: Data will be lost on server restart
- 🔄 **Automatic**: No configuration needed
- 📊 **Limited**: Some advanced features unavailable

## 🚀 **Production Deployment**

### **Environment Variables for Production**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/modern-todo
PORT=3000
```

### **MongoDB Atlas Production Setup**
1. **Upgrade Cluster**: Consider paid tiers for production
2. **Security**: Use strong passwords and IP whitelisting
3. **Monitoring**: Enable Atlas monitoring and alerts
4. **Backups**: Configure automatic backups
5. **Performance**: Monitor slow queries and optimize indexes

### **Local Production Setup**
1. **Replica Set**: Configure for high availability
2. **Authentication**: Enable authentication
3. **SSL/TLS**: Configure secure connections
4. **Monitoring**: Use MongoDB Compass or ops tools
5. **Backups**: Set up regular backups with `mongodump`

## 📈 **Performance Tips**

1. **Indexing**: Ensure proper indexes for your queries
2. **Connection Pooling**: Configure appropriate pool size
3. **Query Optimization**: Use explain() to analyze queries
4. **Data Modeling**: Design efficient document structure
5. **Monitoring**: Track performance metrics

## 🔐 **Security Best Practices**

1. **Authentication**: Always use authentication in production
2. **Authorization**: Implement role-based access control
3. **Network Security**: Use firewalls and VPNs
4. **Encryption**: Enable encryption at rest and in transit
5. **Auditing**: Enable audit logging for compliance

---

**© 2k25 𝕊𝕦𝕟𝕚𝕝 𝕊𝕙𝕒𝕣𝕞𝕒. All rights reserved.**