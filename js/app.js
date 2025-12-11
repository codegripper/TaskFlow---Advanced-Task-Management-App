/**
 * TaskFlow - Advanced Task Management Application
 * Main Application Logic
 */

class TaskFlowApp {
    constructor() {
        this.currentUser = null;
        this.tasks = [];
        this.projects = [];
        this.activities = [];
        this.chart = null;
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
        this.startAutoSync();
        
        // Show welcome message
        if (!this.currentUser) {
            this.showNotification('Welcome to TaskFlow! Login to sync your data across devices.', 'info');
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Authentication
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showAuthModal('login'));
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Auth tabs
        document.querySelectorAll('.auth-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab));
        });
        
        // Task Management
        document.getElementById('addTaskBtn')?.addEventListener('click', () => this.showTaskModal());
        document.getElementById('taskForm')?.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('taskSearch')?.addEventListener('input', (e) => this.searchTasks(e.target.value));
        
        // Task Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTasks(e.target.dataset.filter));
        });
        
        // Project Management
        document.getElementById('addProjectBtn')?.addEventListener('click', () => this.showProjectModal());
        document.getElementById('projectForm')?.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        
        // Settings
        document.getElementById('themeSelect')?.addEventListener('change', (e) => this.changeTheme(e.target.value));
        document.getElementById('colorScheme')?.addEventListener('change', (e) => this.changeColorScheme(e.target.value));
        document.getElementById('exportDataBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn')?.addEventListener('click', () => this.importData());
        document.getElementById('clearDataBtn')?.addEventListener('click', () => this.clearAllData());
        document.getElementById('testApiBtn')?.addEventListener('click', () => this.testApiConnection());
        
        // Modal Close Buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });
        
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
            });
        });
        
        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
    }

    // Authentication Methods
    showAuthModal(tab = 'login') {
        const modal = document.getElementById('authModal');
        modal.classList.remove('hidden');
        this.switchAuthTab(tab);
    }

    switchAuthTab(tab) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const tabs = document.querySelectorAll('.auth-tab-btn');
        
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            // Simulate API call - replace with actual API integration
            const user = await API.login(email, password);
            this.currentUser = user;
            Storage.set('currentUser', user);
            
            document.getElementById('authModal').classList.add('hidden');
            this.showNotification('Login successful!', 'success');
            this.updateUI();
            this.syncWithServer();
        } catch (error) {
            document.getElementById('loginMessage').textContent = error.message;
            document.getElementById('loginMessage').className = 'auth-message error';
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        try {
            const user = await API.register(name, email, password);
            this.currentUser = user;
            Storage.set('currentUser', user);
            
            document.getElementById('authModal').classList.add('hidden');
            this.showNotification('Registration successful!', 'success');
            this.updateUI();
        } catch (error) {
            document.getElementById('registerMessage').textContent = error.message;
            document.getElementById('registerMessage').className = 'auth-message error';
        }
    }

    logout() {
        this.currentUser = null;
        Storage.remove('currentUser');
        this.showNotification('Logged out successfully', 'info');
        this.updateUI();
    }

    // Task Management Methods
    showTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        const title = document.getElementById('taskModalTitle');
        
        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskProject').value = task.projectId || '';
            form.dataset.taskId = task.id;
        } else {
            title.textContent = 'Add New Task';
            form.reset();
            delete form.dataset.taskId;
        }
        
        // Populate project dropdown
        this.populateProjectDropdown();
        modal.classList.remove('hidden');
    }

    populateProjectDropdown() {
        const select = document.getElementById('taskProject');
        select.innerHTML = '<option value="">None</option>';
        
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const taskId = form.dataset.taskId;
        
        const task = {
            id: taskId || this.generateId(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            projectId: document.getElementById('taskProject').value,
            status: 'pending',
            createdAt: taskId ? this.tasks.find(t => t.id === taskId).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (taskId) {
            // Update existing task
            const index = this.tasks.findIndex(t => t.id === taskId);
            this.tasks[index] = task;
            this.addActivity(`Updated task: ${task.title}`);
        } else {
            // Add new task
            this.tasks.push(task);
            this.addActivity(`Created task: ${task.title}`);
        }
        
        this.saveTasks();
        this.renderTasks();
        this.updateDashboard();
        document.getElementById('taskModal').classList.add('hidden');
        this.showNotification('Task saved successfully!', 'success');
    }

    renderTasks(filter = 'all') {
        const taskList = document.getElementById('taskList');
        let filteredTasks = this.tasks;
        
        // Apply filter
        if (filter !== 'all') {
            filteredTasks = this.tasks.filter(task => {
                if (filter === 'completed') return task.status === 'completed';
                if (filter === 'pending') return task.status === 'pending';
                if (filter === 'high') return task.priority === 'high';
                return true;
            });
        }
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<div class="empty-state">No tasks found. Create your first task!</div>';
            return;
        }
        
        taskList.innerHTML = filteredTasks.map(task => this.createTaskElement(task)).join('');
        
        // Add event listeners to task elements
        this.attachTaskEventListeners();
    }

    createTaskElement(task) {
        const project = this.projects.find(p => p.id === task.projectId);
        const projectBadge = project ? `<span class="project-badge" style="background: ${project.color}">${project.name}</span>` : '';
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        
        return `
            <div class="task-item ${task.status} priority-${task.priority}" data-task-id="${task.id}">
                <div class="task-checkbox">
                    <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} 
                           onchange="app.toggleTaskStatus('${task.id}')">
                </div>
                <div class="task-content">
                    <h4 class="task-title">${task.title}</h4>
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    <div class="task-meta">
                        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                        ${projectBadge}
                        ${task.dueDate ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fa fa-calendar"></i> ${this.formatDate(task.dueDate)}
                        </span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon" onclick="app.editTask('${task.id}')" title="Edit">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="app.deleteTask('${task.id}')" title="Delete">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    attachTaskEventListeners() {
        // Event listeners are handled via onclick attributes for simplicity
    }

    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderTasks();
            this.updateDashboard();
            this.addActivity(`${task.status === 'completed' ? 'Completed' : 'Reopened'} task: ${task.title}`);
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.showTaskModal(task);
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const task = this.tasks.find(t => t.id === taskId);
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateDashboard();
            this.addActivity(`Deleted task: ${task.title}`);
            this.showNotification('Task deleted', 'info');
        }
    }

    searchTasks(query) {
        const taskList = document.getElementById('taskList');
        const lowerQuery = query.toLowerCase();
        
        const filteredTasks = this.tasks.filter(task => 
            task.title.toLowerCase().includes(lowerQuery) || 
            (task.description && task.description.toLowerCase().includes(lowerQuery))
        );
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<div class="empty-state">No tasks match your search.</div>';
            return;
        }
        
        taskList.innerHTML = filteredTasks.map(task => this.createTaskElement(task)).join('');
        this.attachTaskEventListeners();
    }

    filterTasks(filter) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTasks(filter);
    }

    // Project Management Methods
    showProjectModal() {
        const modal = document.getElementById('projectModal');
        document.getElementById('projectForm').reset();
        modal.classList.remove('hidden');
    }

    handleProjectSubmit(e) {
        e.preventDefault();
        
        const project = {
            id: this.generateId(),
            name: document.getElementById('projectName').value,
            description: document.getElementById('projectDescription').value,
            color: document.getElementById('projectColor').value,
            createdAt: new Date().toISOString(),
            taskCount: 0
        };
        
        this.projects.push(project);
        this.saveProjects();
        this.renderProjects();
        this.updateDashboard();
        document.getElementById('projectModal').classList.add('hidden');
        this.addActivity(`Created project: ${project.name}`);
        this.showNotification('Project created successfully!', 'success');
    }

    renderProjects() {
        const projectList = document.getElementById('projectList');
        
        if (this.projects.length === 0) {
            projectList.innerHTML = '<div class="empty-state">No projects yet. Create your first project!</div>';
            return;
        }
        
        projectList.innerHTML = this.projects.map(project => {
            const projectTasks = this.tasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
            const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length * 100).toFixed(0) : 0;
            
            return `
                <div class="project-card" style="border-left: 4px solid ${project.color}">
                    <h3>${project.name}</h3>
                    <p>${project.description || 'No description'}</p>
                    <div class="project-stats">
                        <span>${projectTasks.length} tasks</span>
                        <span>${completedTasks} completed</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%; background: ${project.color}"></div>
                    </div>
                    <div class="project-actions">
                        <button class="btn-small" onclick="app.viewProject('${project.id}')">View</button>
                        <button class="btn-small btn-danger" onclick="app.deleteProject('${project.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    viewProject(projectId) {
        // Switch to tasks tab and filter by project
        const tasksTab = document.querySelector('a[href="#section-tasks"]');
        tasksTab.click();
        
        // Filter tasks by project
        setTimeout(() => {
            const projectTasks = this.tasks.filter(t => t.projectId === projectId);
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = projectTasks.map(task => this.createTaskElement(task)).join('');
            this.attachTaskEventListeners();
        }, 300);
    }

    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project? Tasks will not be deleted.')) {
            const project = this.projects.find(p => p.id === projectId);
            this.projects = this.projects.filter(p => p.id !== projectId);
            
            // Remove project reference from tasks
            this.tasks.forEach(task => {
                if (task.projectId === projectId) {
                    task.projectId = null;
                }
            });
            
            this.saveProjects();
            this.saveTasks();
            this.renderProjects();
            this.addActivity(`Deleted project: ${project.name}`);
            this.showNotification('Project deleted', 'info');
        }
    }

    // Dashboard Methods
    updateDashboard() {
        const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
        const pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
        const activeProjects = this.projects.length;
        const productivity = this.tasks.length > 0 ? (completedTasks / this.tasks.length * 100).toFixed(0) : 0;
        
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('activeProjects').textContent = activeProjects;
        document.getElementById('productivityScore').textContent = `${productivity}%`;
        
        this.updateActivityList();
        this.updateAnalytics();
    }

    updateActivityList() {
        const activityList = document.getElementById('activityList');
        const recentActivities = this.activities.slice(-10).reverse();
        
        if (recentActivities.length === 0) {
            activityList.innerHTML = '<li>No recent activity</li>';
            return;
        }
        
        activityList.innerHTML = recentActivities.map(activity => `
            <li>
                <span class="activity-text">${activity.text}</span>
                <span class="activity-time">${this.formatTimeAgo(activity.timestamp)}</span>
            </li>
        `).join('');
    }

    addActivity(text) {
        this.activities.push({
            text,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 activities
        if (this.activities.length > 100) {
            this.activities = this.activities.slice(-100);
        }
        
        Storage.set('activities', this.activities);
        this.updateActivityList();
    }

    // Analytics Methods
    updateAnalytics() {
        this.updateChart();
        this.updateTimeStats();
        this.updateProjectProgress();
    }

    updateChart() {
        const ctx = document.getElementById('completionChart');
        if (!ctx) return;
        
        // Generate data for last 7 days
        const labels = [];
        const completedData = [];
        const createdData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
            const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();
            
            const completed = this.tasks.filter(t => 
                t.status === 'completed' && 
                t.updatedAt >= dayStart && 
                t.updatedAt <= dayEnd
            ).length;
            
            const created = this.tasks.filter(t => 
                t.createdAt >= dayStart && 
                t.createdAt <= dayEnd
            ).length;
            
            completedData.push(completed);
            createdData.push(created);
        }
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Completed',
                        data: completedData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Created',
                        data: createdData,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateTimeStats() {
        // Simulated time tracking - in a real app, this would track actual time
        const todayTasks = this.tasks.filter(t => {
            const today = new Date().toDateString();
            return new Date(t.createdAt).toDateString() === today;
        }).length;
        
        const weekTasks = this.tasks.filter(t => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(t.createdAt) >= weekAgo;
        }).length;
        
        const monthTasks = this.tasks.filter(t => {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return new Date(t.createdAt) >= monthAgo;
        }).length;
        
        document.getElementById('todayTime').textContent = `${todayTasks * 0.5}h`;
        document.getElementById('weekTime').textContent = `${weekTasks * 0.5}h`;
        document.getElementById('monthTime').textContent = `${monthTasks * 0.5}h`;
    }

    updateProjectProgress() {
        const progressContainer = document.getElementById('projectProgress');
        
        if (this.projects.length === 0) {
            progressContainer.innerHTML = '<p>No projects to display</p>';
            return;
        }
        
        progressContainer.innerHTML = this.projects.map(project => {
            const projectTasks = this.tasks.filter(t => t.projectId === project.id);
            const completed = projectTasks.filter(t => t.status === 'completed').length;
            const progress = projectTasks.length > 0 ? (completed / projectTasks.length * 100).toFixed(0) : 0;
            
            return `
                <div class="progress-item">
                    <div class="progress-header">
                        <span>${project.name}</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%; background: ${project.color}"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Settings Methods
    changeTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        Storage.set('theme', theme);
        this.showNotification(`Theme changed to ${theme}`, 'info');
    }

    changeColorScheme(scheme) {
        // Remove existing color scheme classes
        document.body.className = document.body.className.replace(/bg-\w+/, '');
        document.body.classList.add(`bg-${scheme === 'green' ? 'yellow' : scheme}`);
        
        Storage.set('colorScheme', scheme);
        this.showNotification(`Color scheme changed to ${scheme}`, 'info');
    }

    exportData() {
        const data = {
            tasks: this.tasks,
            projects: this.projects,
            activities: this.activities,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taskflow-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (confirm('This will replace all current data. Continue?')) {
                        this.tasks = data.tasks || [];
                        this.projects = data.projects || [];
                        this.activities = data.activities || [];
                        
                        this.saveTasks();
                        this.saveProjects();
                        Storage.set('activities', this.activities);
                        
                        this.updateUI();
                        this.showNotification('Data imported successfully!', 'success');
                    }
                } catch (error) {
                    this.showNotification('Invalid file format', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    clearAllData() {
        if (confirm('This will delete ALL your data permanently. Are you absolutely sure?')) {
            if (confirm('Last chance! This cannot be undone.')) {
                this.tasks = [];
                this.projects = [];
                this.activities = [];
                
                Storage.clear();
                this.updateUI();
                this.showNotification('All data cleared', 'info');
            }
        }
    }

    async testApiConnection() {
        const endpoint = document.getElementById('apiEndpoint').value;
        const apiKey = document.getElementById('apiKey').value;
        const statusDiv = document.getElementById('apiStatus');
        
        if (!endpoint) {
            statusDiv.textContent = 'Please enter an API endpoint';
            statusDiv.className = 'api-status error';
            return;
        }
        
        statusDiv.textContent = 'Testing connection...';
        statusDiv.className = 'api-status info';
        
        try {
            const success = await API.testConnection(endpoint, apiKey);
            if (success) {
                Storage.set('apiEndpoint', endpoint);
                Storage.set('apiKey', apiKey);
                statusDiv.textContent = 'Connection successful!';
                statusDiv.className = 'api-status success';
            }
        } catch (error) {
            statusDiv.textContent = `Connection failed: ${error.message}`;
            statusDiv.className = 'api-status error';
        }
    }

    // Data Persistence Methods
    loadUserData() {
        this.currentUser = Storage.get('currentUser');
        this.tasks = Storage.get('tasks') || [];
        this.projects = Storage.get('projects') || [];
        this.activities = Storage.get('activities') || [];
        
        // Load settings
        const theme = Storage.get('theme');
        if (theme) {
            document.body.setAttribute('data-theme', theme);
            const themeSelect = document.getElementById('themeSelect');
            if (themeSelect) themeSelect.value = theme;
        }
        
        const colorScheme = Storage.get('colorScheme');
        if (colorScheme) {
            const colorSelect = document.getElementById('colorScheme');
            if (colorSelect) colorSelect.value = colorScheme;
        }
    }

    saveTasks() {
        Storage.set('tasks', this.tasks);
    }

    saveProjects() {
        Storage.set('projects', this.projects);
    }

    // Sync Methods
    startAutoSync() {
        // Auto-sync every 5 minutes if user is logged in
        setInterval(() => {
            if (this.currentUser) {
                this.syncWithServer();
            }
        }, 5 * 60 * 1000);
    }

    async syncWithServer() {
        const syncIndicator = document.getElementById('syncIndicator');
        
        try {
            syncIndicator.innerHTML = '<i class="fa fa-refresh fa-spin"></i> Syncing...';
            
            await API.syncData({
                tasks: this.tasks,
                projects: this.projects,
                activities: this.activities
            });
            
            syncIndicator.innerHTML = '<i class="fa fa-check-circle"></i> Synced';
            syncIndicator.className = 'sync-indicator online';
            
            setTimeout(() => {
                syncIndicator.innerHTML = '<i class="fa fa-circle"></i> Online';
            }, 2000);
        } catch (error) {
            syncIndicator.innerHTML = '<i class="fa fa-circle"></i> Offline';
            syncIndicator.className = 'sync-indicator offline';
        }
    }

    // UI Update Methods
    updateUI() {
        // Update user info
        const userName = document.getElementById('userName');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (this.currentUser) {
            userName.textContent = this.currentUser.name || this.currentUser.email;
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
        } else {
            userName.textContent = 'Guest';
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
        }
        
        // Render all sections
        this.renderTasks();
        this.renderProjects();
        this.updateDashboard();
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TaskFlowApp();
});
