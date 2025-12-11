# TaskFlow - Advanced Task Management Application

A modern, full-featured task management application built with vanilla JavaScript, featuring real-time synchronization, offline support, and a beautiful responsive interface.

## Features

### 🎯 Task Management
- Create, edit, and delete tasks
- Priority levels (High, Medium, Low)
- Due date tracking with overdue notifications
- Task search and filtering
- Checkbox completion tracking
- Assign tasks to projects

### 📁 Project Management
- Create and manage multiple projects
- Color-coded project organization
- Track task completion per project
- Progress visualization
- Project-based task filtering

### 📊 Analytics Dashboard
- Real-time statistics
- Completion trends visualization
- Time tracking insights
- Productivity scoring
- Recent activity feed

### 🔐 User Authentication
- Login/Register functionality
- User session management
- Secure data storage
- Multi-device sync support

### 💾 Data Management
- Local storage persistence
- Export data as JSON
- Import data from backup
- Clear all data option
- Auto-save functionality

### ⚙️ Settings
- Theme customization (Light/Dark)
- Color scheme selection
- Notification preferences
- API configuration
- Data export/import

### 🌐 Progressive Web App (PWA)
- Installable on desktop and mobile
- Offline support
- Service worker caching
- Fast loading times
- Native app-like experience

### 🔄 API Integration
- RESTful API structure
- Mock API for development
- Easy backend integration
- Real-time data synchronization
- Connection testing

## Getting Started

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Open `index.html` in a modern web browser

### Using a Development Server (Recommended)

```bash
# Install dependencies (optional, for development server)
npm install

# Start development server
npm run dev
```

Or use Python's built-in server:

```bash
# Python 3
python -m http.server 8080

# Then open http://localhost:8080 in your browser
```

### File Structure

```
website/
├── index.html              # Main application file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── package.json           # NPM configuration
├── README.md              # This file
├── css/
│   ├── app.css            # Main application styles
│   ├── demo.css           # Demo/background styles
│   ├── ef-tabs.css        # Tab component styles
│   ├── ef-tabs-light-green.css  # Color scheme
│   └── font-awesome.min.css     # Icons
├── js/
│   ├── app.js             # Main application logic
│   ├── api.js             # API integration module
│   ├── storage.js         # Local storage wrapper
│   ├── ef-tabs.js         # Tab component
│   └── jquery.transit.js  # Animation library
└── fonts/
    ├── Lato/              # Font family
    └── Montserrat/        # Font family
```

## Usage Guide

### Creating Tasks

1. Click the "Add Task" button in the Tasks section
2. Fill in task details:
   - Title (required)
   - Description (optional)
   - Priority level
   - Due date
   - Associated project
3. Click "Save Task"

### Managing Projects

1. Navigate to the Projects section
2. Click "New Project"
3. Enter project details:
   - Project name
   - Description
   - Color theme
4. Click "Create Project"

### Filtering Tasks

Use the filter buttons to view:
- All tasks
- Pending tasks only
- Completed tasks only
- High priority tasks

### Search

Use the search box to find tasks by title or description.

### Export/Import Data

1. Go to Settings
2. Use "Export Data" to download a JSON backup
3. Use "Import Data" to restore from a backup file

### API Configuration

1. Navigate to Settings
2. Scroll to "API Configuration"
3. Enter your API endpoint URL
4. Add your API key (if required)
5. Click "Test Connection" to verify

## Backend Integration

This application is designed with a mock API that can be easily replaced with a real backend. The `js/api.js` file contains all API methods.

### Endpoints to Implement

```javascript
// Authentication
POST /auth/login        - User login
POST /auth/register     - User registration
POST /auth/logout       - User logout

// Tasks
GET    /tasks           - Get all tasks
POST   /tasks           - Create new task
PUT    /tasks/:id       - Update task
DELETE /tasks/:id       - Delete task

// Projects
GET    /projects        - Get all projects
POST   /projects        - Create new project
PUT    /projects/:id    - Update project
DELETE /projects/:id    - Delete project

// Sync
GET    /sync            - Fetch user data
POST   /sync            - Sync user data
```

### Example API Response Format

```json
{
  "success": true,
  "data": {
    "id": "task_123",
    "title": "Complete project",
    "status": "pending",
    "priority": "high",
    "createdAt": "2025-12-10T12:00:00Z"
  }
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Application logic
- **jQuery** - DOM manipulation
- **Chart.js** - Data visualization
- **Font Awesome** - Icons
- **LocalStorage API** - Data persistence
- **Service Worker** - Offline support

## Customization

### Changing Colors

Modify the CSS variables in `css/app.css`:

```css
:root {
  --primary-color: #4CAF50;
  --secondary-color: #2196F3;
  --danger-color: #f44336;
  /* ... more variables */
}
```

### Adding New Features

1. Add UI elements in `index.html`
2. Implement logic in `js/app.js`
3. Add styles in `css/app.css`
4. Update API methods in `js/api.js`

## Performance Optimization

- Lazy loading of images
- Minified CSS and JavaScript (in production)
- Service worker caching
- Optimized rendering
- Debounced search input

## Security Considerations

- Input sanitization
- XSS prevention
- CSRF token implementation (for backend)
- Secure API key storage
- HTTPs required for production

## Future Enhancements

- [ ] Drag-and-drop task reordering
- [ ] Task tags and labels
- [ ] Recurring tasks
- [ ] Team collaboration features
- [ ] File attachments
- [ ] Comments and notes
- [ ] Calendar view
- [ ] Email notifications
- [ ] Mobile apps (iOS/Android)
- [ ] Integration with third-party services

## Troubleshooting

### Service Worker Not Registering

Make sure you're serving the app over HTTPS or localhost.

### Data Not Persisting

Check browser's LocalStorage settings and ensure it's not disabled.

### API Connection Failing

Verify your API endpoint URL and check for CORS issues.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub or contact support.

## Acknowledgments

- Font Awesome for icons
- Chart.js for data visualization
- jQuery team for the excellent library
- All contributors and testers

---

**Built with ❤️ for productivity enthusiasts**
