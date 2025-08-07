// Script to update all HTML pages with responsive elements

const fs = require('fs');
const path = require('path');

// List of all HTML files to update
const htmlFiles = [
  'dashboard.html',
  'users.html',
  'payments.html',
  'reports.html',
  'requests.html',
  'settings.html'
];

// Base directory
const baseDir = __dirname;

// Mobile sidebar HTML template
const mobileSidebarTemplate = `
<!-- Mobile Menu Button -->
<button class="mobile-menu-btn">
  <i class="fas fa-bars"></i>
</button>

<!-- Mobile Sidebar -->
<div class="mobile-sidebar">
  <button class="mobile-close-btn">
    <i class="fas fa-times"></i>
  </button>
  <div class="mobile-sidebar-header">
    <h3>Admin Panel</h3>
    <p>Welcome, <span id="mobileAdminName">Admin</span></p>
  </div>
  <div class="mobile-sidebar-menu">
    <ul>
      <li>
        <a href="dashboard.html" class="DASHBOARD_ACTIVE">
          <i class="fas fa-tachometer-alt"></i> Dashboard
        </a>
      </li>
      <li>
        <a href="payments.html" class="PAYMENTS_ACTIVE">
          <i class="fas fa-money-bill-wave"></i> Payments
        </a>
      </li>
      <li>
        <a href="users.html" class="USERS_ACTIVE">
          <i class="fas fa-users"></i> Manage Users
        </a>
      </li>
      <li>
        <a href="reports.html" class="REPORTS_ACTIVE">
          <i class="fas fa-chart-bar"></i> Reports
        </a>
      </li>
      <li>
        <a href="requests.html" class="REQUESTS_ACTIVE">
          <i class="fas fa-trash-alt"></i> Delete Requests
        </a>
      </li>
      <li>
        <a href="settings.html" class="SETTINGS_ACTIVE">
          <i class="fas fa-cog"></i> Settings
        </a>
      </li>
      <li>
        <a href="#" id="mobileLogoutBtn">
          <i class="fas fa-sign-out-alt"></i> Logout
        </a>
      </li>
    </ul>
  </div>
</div>
`;

// CSS and JS includes
const cssInclude = '<link rel="stylesheet" href="css/responsive.css">\n';
const jsInclude = '<script src="js/responsive.js"></script>\n';

// Process each HTML file
htmlFiles.forEach(htmlFile => {
  const filePath = path.join(baseDir, htmlFile);
  
  // Read the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading ${htmlFile}:`, err);
      return;
    }
    
    // Determine which nav item should be active
    let modifiedMobileSidebar = mobileSidebarTemplate;
    const pageName = htmlFile.replace('.html', '').toUpperCase();
    modifiedMobileSidebar = modifiedMobileSidebar.replace(`${pageName}_ACTIVE`, 'active');
    
    // Remove other active placeholders
    modifiedMobileSidebar = modifiedMobileSidebar
      .replace(/DASHBOARD_ACTIVE|PAYMENTS_ACTIVE|USERS_ACTIVE|REPORTS_ACTIVE|REQUESTS_ACTIVE|SETTINGS_ACTIVE/g, '');
    
    // Add responsive CSS if not already present
    if (!data.includes('responsive.css')) {
      data = data.replace('</head>', `  ${cssInclude}</head>`);
    }
    
    // Add mobile sidebar if not already present
    if (!data.includes('mobile-sidebar')) {
      data = data.replace('<body>', `<body>\n${modifiedMobileSidebar}`);
    }
    
    // Add responsive JS if not already present
    if (!data.includes('responsive.js')) {
      data = data.replace('</body>', `  ${jsInclude}</body>`);
    }
    
    // Write the updated file
    fs.writeFile(filePath, data, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing ${htmlFile}:`, err);
        return;
      }
      console.log(`${htmlFile} updated successfully`);
    });
  });
});

console.log('Update script started. Check console for results.');