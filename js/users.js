// DOM Elements
const adminEmailEl = document.getElementById('adminEmail');
const logoutBtn = document.getElementById('logoutBtn');
const leadersCountEl = document.getElementById('leadersCount');
const seniorsCountEl = document.getElementById('seniorsCount');
const usersCountEl = document.getElementById('usersCount');
const addSeniorBtn = document.getElementById('addSeniorBtn');
const addLeaderBtn = document.getElementById('addLeaderBtn');
const addUserBtn = document.getElementById('addUserBtn');
const closeAddFormBtn = document.getElementById('closeAddFormBtn');
const addUserSection = document.getElementById('addUserSection');
const userRoleSelect = document.getElementById('userRole');

// DataTable instances
let leadersDataTable;
let seniorsDataTable;
let usersDataTable;

// Initialize users page
function initUsersPage() {
  // Check if user is logged in
  if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'index.html';
    return;
  }
  
  // Display admin email
  const adminEmail = localStorage.getItem('adminEmail');
  if (adminEmail) {
    adminEmailEl.textContent = adminEmail;
  }
  
  // Load users data
  loadUsersData();
  
  // Set up event listeners
  setupEventListeners();
}

// Load users data
function loadUsersData() {
  // Get data from localStorage
  const leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  const seniors = JSON.parse(localStorage.getItem('seniors')) || [];
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Update hierarchy counts
  updateHierarchyCounts(leaders, seniors, users);
  
  // Initialize DataTables
  initLeadersTable(leaders);
  initSeniorsTable(seniors);
  initUsersTable(users);
}

// Update hierarchy counts
function updateHierarchyCounts(leaders, seniors, users) {
  leadersCountEl.textContent = leaders.length;
  seniorsCountEl.textContent = seniors.length;
  usersCountEl.textContent = users.length;
}

// Initialize leaders table
function initLeadersTable(leaders) {
  if ($.fn.DataTable.isDataTable('#leadersTable')) {
    $('#leadersTable').DataTable().destroy();
  }
  
  leadersDataTable = $('#leadersTable').DataTable({
    data: leaders.map(leader => [
      leader.id,
      leader.name,
      leader.email,
      leader.phone || '-',
      'Leader',
      '-',
      `
      <button class="btn btn-sm btn-primary edit-user" data-id="${leader.id}" data-role="leader">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn btn-sm btn-danger delete-user" data-id="${leader.id}" data-role="leader">
        <i class="fas fa-trash"></i>
      </button>
      `
    ]),
    columns: [
      { title: 'ID' },
      { title: 'Name' },
      { title: 'Email' },
      { title: 'Phone' },
      { title: 'Role' },
      { title: 'Assigned To' },
      { title: 'Actions' }
    ],
    responsive: true,
    pageLength: 10,
    dom: 'Bfrtip',
    buttons: [
      {
        text: '<i class="fas fa-file-export"></i> Export',
        className: 'btn btn-secondary',
        action: function () {
          alert('Export functionality will be implemented here');
        }
      },
      {
        text: '<i class="fas fa-sync-alt"></i> Refresh',
        className: 'btn btn-primary',
        action: function () {
          loadUsersData();
        }
      }
    ]
  });
}

// Initialize seniors table
function initSeniorsTable(seniors) {
  if ($.fn.DataTable.isDataTable('#seniorsTable')) {
    $('#seniorsTable').DataTable().destroy();
  }
  
  const leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  
  seniorsDataTable = $('#seniorsTable').DataTable({
    data: seniors.map(senior => {
      const assignedLeader = leaders.find(leader => leader.id === senior.assignedTo);
      return [
        senior.id,
        senior.name,
        senior.email,
        senior.phone || '-',
        'Senior',
        assignedLeader ? assignedLeader.name : '-',
        `
        <button class="btn btn-sm btn-primary edit-user" data-id="${senior.id}" data-role="senior">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-success assign-user" data-id="${senior.id}" data-role="senior">
          <i class="fas fa-user-plus"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-user" data-id="${senior.id}" data-role="senior">
          <i class="fas fa-trash"></i>
        </button>
        `
      ];
    }),
    columns: [
      { title: 'ID' },
      { title: 'Name' },
      { title: 'Email' },
      { title: 'Phone' },
      { title: 'Role' },
      { title: 'Assigned To' },
      { title: 'Actions' }
    ],
    responsive: true,
    pageLength: 10,
    dom: 'Bfrtip',
    buttons: [
      {
        text: '<i class="fas fa-file-export"></i> Export',
        className: 'btn btn-secondary',
        action: function () {
          alert('Export functionality will be implemented here');
        }
      },
      {
        text: '<i class="fas fa-sync-alt"></i> Refresh',
        className: 'btn btn-primary',
        action: function () {
          loadUsersData();
        }
      }
    ]
  });
}

// Initialize users table
function initUsersTable(users) {
  if ($.fn.DataTable.isDataTable('#usersTable')) {
    $('#usersTable').DataTable().destroy();
  }
  
  const seniors = JSON.parse(localStorage.getItem('seniors')) || [];
  
  usersDataTable = $('#usersTable').DataTable({
    data: users.map(user => {
      const assignedSenior = seniors.find(senior => senior.id === user.assignedTo);
      return [
        user.id,
        user.name,
        user.email,
        user.phone || '-',
        'User',
        assignedSenior ? assignedSenior.name : '-',
        `
        <button class="btn btn-sm btn-primary edit-user" data-id="${user.id}" data-role="user">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-success assign-user" data-id="${user.id}" data-role="user">
          <i class="fas fa-user-plus"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}" data-role="user">
          <i class="fas fa-trash"></i>
        </button>
        `
      ];
    }),
    columns: [
      { title: 'ID' },
      { title: 'Name' },
      { title: 'Email' },
      { title: 'Phone' },
      { title: 'Role' },
      { title: 'Assigned To' },
      { title: 'Actions' }
    ],
    responsive: true,
    pageLength: 10,
    dom: 'Bfrtip',
    buttons: [
      {
        text: '<i class="fas fa-file-export"></i> Export',
        className: 'btn btn-secondary',
        action: function () {
          alert('Export functionality will be implemented here');
        }
      },
      {
        text: '<i class="fas fa-sync-alt"></i> Refresh',
        className: 'btn btn-primary',
        action: function () {
          loadUsersData();
        }
      }
    ]
  });
}

// Toggle add user form visibility and set role
function toggleAddUserForm(role = '') {
  if (addUserSection.style.display === 'none' || addUserSection.style.display === '') {
    // Set the role in the dropdown if provided
    if (role && userRoleSelect) {
      userRoleSelect.value = role;
      // Trigger change event to update any dependent fields
      const event = new Event('change');
      userRoleSelect.dispatchEvent(event);
    }
    
    addUserSection.style.display = 'block';
    // Add animation class
    addUserSection.classList.add('fadeInUp');
    // Scroll to the form
    addUserSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    addUserSection.style.display = 'none';
    addUserSection.classList.remove('fadeInUp');
    // Reset form when hiding
    document.getElementById('addUserForm').reset();
  }
}

// Delete user directly (simplified version without modals)
function deleteUser(role, userId) {
  // Confirm with browser dialog
  if (!confirm(`Are you sure you want to delete this ${role}?`)) {
    return;
  }
  
  // Get users array
  const users = JSON.parse(localStorage.getItem(`${role}s`)) || [];
  const user = users.find(user => user.id === userId);
  
  if (!user) {
    alert(`${role} not found!`);
    return;
  }
  
  // Find user index
  const userIndex = users.findIndex(user => user.id === userId);
  
  // Check for dependencies
  if (role === 'leader') {
    // Check if any seniors are assigned to this leader
    const seniors = JSON.parse(localStorage.getItem('seniors')) || [];
    const hasDependencies = seniors.some(senior => senior.assignedTo === userId);
    
    if (hasDependencies) {
      alert('Cannot delete this leader because there are seniors assigned to them!');
      return;
    }
  } else if (role === 'senior') {
    // Check if any users are assigned to this senior
    const regularUsers = JSON.parse(localStorage.getItem('users')) || [];
    const hasDependencies = regularUsers.some(user => user.assignedTo === userId);
    
    if (hasDependencies) {
      alert('Cannot delete this senior because there are users assigned to them!');
      return;
    }
  }
  
  // Remove user
  users.splice(userIndex, 1);
  
  // Save to localStorage
  localStorage.setItem(`${role}s`, JSON.stringify(users));
  
  // Show success message
  alert(`${role} deleted successfully!`);
  
  // Reload users data
  loadUsersData();
}

// Add new user
function addNewUser(e) {
  e.preventDefault();
  
  // Get form values
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  const role = document.getElementById('userRole').value;
  
  // Validate form
  if (!name || !email || !password || !role) {
    alert('Please fill all required fields');
    return;
  }
  
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    alert('Please enter a valid email address');
    return;
  }
  
  // Get users array
  const users = JSON.parse(localStorage.getItem(`${role}s`)) || [];
  
  // Check if email already exists
  const emailExists = users.some(user => user.email === email);
  
  if (emailExists) {
    alert(`A ${role} with this email already exists!`);
    return;
  }
  
  // Create new user
  const newUser = {
    id: `${role.toUpperCase().substring(0, 3)}${Math.floor(Math.random() * 10000)}`,
    name: name,
    email: email,
    password: password, // In a real app, this should be hashed
    role: role,
    status: 'active',
    assignedTo: null,
    createdAt: new Date().toISOString()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Save to localStorage
  localStorage.setItem(`${role}s`, JSON.stringify(users));
  
  // Show success message
  alert(`${role} added successfully!`);
  
  // Reset form
  document.getElementById('addUserForm').reset();
  
  // Hide add user form
  toggleAddUserForm();
  
  // Reload users data
  loadUsersData();
}

// Set up event listeners
function setupEventListeners() {
  // Add user buttons for each category
  addSeniorBtn.addEventListener('click', () => toggleAddUserForm('senior'));
  addLeaderBtn.addEventListener('click', () => toggleAddUserForm('leader'));
  addUserBtn.addEventListener('click', () => toggleAddUserForm('user'));
  closeAddFormBtn.addEventListener('click', toggleAddUserForm);
  
  // Add user form submission
  document.getElementById('addUserForm').addEventListener('submit', addNewUser);
  
  // Table action buttons
  document.addEventListener('click', (event) => {
    // Handle delete user button clicks
    if (event.target.closest('.delete-user-btn') || event.target.closest('.delete-user')) {
      const button = event.target.closest('.delete-user-btn') || event.target.closest('.delete-user');
      const userId = button.dataset.id;
      const role = button.dataset.role;
      deleteUser(role, userId);
    }
  });
  
  // Logout button
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    window.location.href = 'index.html';
  });
  
  // Toggle sidebar on mobile
  document.querySelector('.toggle-sidebar').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.main-content').classList.toggle('pushed');
  });
}

// Initialize users page when DOM is loaded
document.addEventListener('DOMContentLoaded', initUsersPage);