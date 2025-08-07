// Dashboard JavaScript

// DOM Elements
const totalPaymentsEl = document.getElementById('totalPayments');
const totalUsersEl = document.getElementById('totalUsers');
const totalLeadersEl = document.getElementById('totalLeaders');
const pendingRequestsEl = document.getElementById('pendingRequests');
const recentActivityTable = document.getElementById('recentActivityTable');
const adminNameEl = document.getElementById('adminName');
const adminEmailEl = document.getElementById('adminEmail');
const logoutBtn = document.getElementById('logoutBtn');
const collectPaymentBtn = document.getElementById('collectPaymentBtn');

// Sample data (in a real app, this would come from a database)
let dashboardData = {
  payments: 0,
  users: 0,
  leaders: 0,
  seniors: 0,
  pendingRequests: 0,
  recentActivity: []
};

// Initialize dashboard
function initDashboard() {
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
  
  // Load dashboard data
  loadDashboardData();
  
  // Set up event listeners
  setupEventListeners();
}

// Load dashboard data
function loadDashboardData() {
  // In a real app, this would fetch data from a server
  // For now, we'll use localStorage or generate dummy data
  
  // Check if we have data in localStorage
  const storedPayments = JSON.parse(localStorage.getItem('payments')) || [];
  const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
  const storedLeaders = JSON.parse(localStorage.getItem('leaders')) || [];
  const storedSeniors = JSON.parse(localStorage.getItem('seniors')) || [];
  const storedRequests = JSON.parse(localStorage.getItem('deleteRequests')) || [];
  
  // Update dashboard data
  dashboardData.payments = storedPayments.length;
  dashboardData.users = storedUsers.length;
  dashboardData.leaders = storedLeaders.length;
  dashboardData.seniors = storedSeniors.length;
  dashboardData.pendingRequests = storedRequests.filter(req => req.status === 'pending').length;
  
  // Generate recent activity
  dashboardData.recentActivity = generateRecentActivity(storedPayments, storedRequests);
  
  // If no data exists, generate some dummy data for demonstration
  if (dashboardData.payments === 0) {
    generateDummyData();
  }
  
  // Update UI
  updateDashboardUI();
}

// Generate recent activity from payments and requests
function generateRecentActivity(payments, requests) {
  const activity = [];
  
  // Add recent payments to activity
  payments.slice(0, 5).forEach(payment => {
    activity.push({
      type: 'payment',
      user: payment.sender,
      date: payment.date,
      status: payment.status
    });
  });
  
  // Add recent requests to activity
  requests.slice(0, 5).forEach(request => {
    activity.push({
      type: 'request',
      user: request.name,
      date: request.date,
      status: request.status
    });
  });
  
  // Sort by date (newest first)
  activity.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return activity.slice(0, 5); // Return only the 5 most recent activities
}

// Generate dummy data for demonstration
function generateDummyData() {
  // Generate dummy payments
  const dummyPayments = [];
  const paymentStatuses = ['success', 'pending', 'failed'];
  const users = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Wilson'];
  
  for (let i = 0; i < 10; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    const receiver = users[Math.floor(Math.random() * users.length)];
    if (sender === receiver) continue;
    
    dummyPayments.push({
      id: 'PAY' + Math.floor(Math.random() * 10000),
      razorpayId: 'rzp_' + Math.random().toString(36).substr(2, 10),
      sender: sender,
      receiver: receiver,
      amount: Math.floor(Math.random() * 10000) + 100,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]
    });
  }
  
  // Generate dummy users
  const dummyUsers = [];
  for (let i = 0; i < 15; i++) {
    dummyUsers.push({
      id: 'USR' + Math.floor(Math.random() * 10000),
      name: users[Math.floor(Math.random() * users.length)] + ' ' + Math.floor(Math.random() * 100),
      email: 'user' + i + '@example.com',
      phone: '123456789' + i,
      assignedTo: i < 10 ? 'SNR' + Math.floor(Math.random() * 5) : null
    });
  }
  
  // Generate dummy seniors
  const dummySeniors = [];
  for (let i = 0; i < 5; i++) {
    dummySeniors.push({
      id: 'SNR' + i,
      name: 'Senior ' + users[Math.floor(Math.random() * users.length)],
      email: 'senior' + i + '@example.com',
      phone: '987654321' + i,
      assignedTo: 'LDR' + Math.floor(Math.random() * 3)
    });
  }
  
  // Generate dummy leaders
  const dummyLeaders = [];
  for (let i = 0; i < 3; i++) {
    dummyLeaders.push({
      id: 'LDR' + i,
      name: 'Leader ' + users[Math.floor(Math.random() * users.length)],
      email: 'leader' + i + '@example.com',
      phone: '555555555' + i
    });
  }
  
  // Generate dummy delete requests
  const dummyRequests = [];
  for (let i = 0; i < 3; i++) {
    dummyRequests.push({
      id: 'REQ' + Math.floor(Math.random() * 10000),
      role: ['user', 'senior', 'leader'][Math.floor(Math.random() * 3)],
      name: users[Math.floor(Math.random() * users.length)],
      paymentId: 'PAY' + Math.floor(Math.random() * 10000),
      reason: 'Payment made by mistake',
      date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    });
  }
  
  // Store in localStorage
  localStorage.setItem('payments', JSON.stringify(dummyPayments));
  localStorage.setItem('users', JSON.stringify(dummyUsers));
  localStorage.setItem('seniors', JSON.stringify(dummySeniors));
  localStorage.setItem('leaders', JSON.stringify(dummyLeaders));
  localStorage.setItem('deleteRequests', JSON.stringify(dummyRequests));
  
  // Update dashboard data
  dashboardData.payments = dummyPayments.length;
  dashboardData.users = dummyUsers.length;
  dashboardData.leaders = dummyLeaders.length;
  dashboardData.seniors = dummySeniors.length;
  dashboardData.pendingRequests = dummyRequests.filter(req => req.status === 'pending').length;
  dashboardData.recentActivity = generateRecentActivity(dummyPayments, dummyRequests);
}

// Update dashboard UI with data
function updateDashboardUI() {
  // Update stats
  totalPaymentsEl.textContent = dashboardData.payments;
  totalUsersEl.textContent = dashboardData.users;
  totalLeadersEl.textContent = dashboardData.leaders + dashboardData.seniors;
  pendingRequestsEl.textContent = dashboardData.pendingRequests;
  
  // Update recent activity table
  recentActivityTable.innerHTML = '';
  
  if (dashboardData.recentActivity.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="text-center">No recent activity</td>';
    recentActivityTable.appendChild(row);
  } else {
    dashboardData.recentActivity.forEach(activity => {
      const row = document.createElement('tr');
      
      // Format date
      const date = new Date(activity.date);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Create status badge
      let statusBadge = '';
      if (activity.status === 'success') {
        statusBadge = '<span class="badge badge-success">Success</span>';
      } else if (activity.status === 'pending') {
        statusBadge = '<span class="badge badge-warning">Pending</span>';
      } else if (activity.status === 'failed') {
        statusBadge = '<span class="badge badge-danger">Failed</span>';
      }
      
      row.innerHTML = `
        <td>${activity.type === 'payment' ? 'New Payment' : 'Delete Request'}</td>
        <td>${activity.user}</td>
        <td>${formattedDate}</td>
        <td>${statusBadge}</td>
      `;
      
      recentActivityTable.appendChild(row);
    });
  }
}

// Set up event listeners
function setupEventListeners() {
  // Logout button
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    window.location.href = 'index.html';
  });
  
  // Collect payment button
  collectPaymentBtn.addEventListener('click', function() {
    // This will be handled by razorpay.js
    if (typeof openRazorpayCheckout === 'function') {
      openRazorpayCheckout();
    } else {
      alert('Razorpay integration is not available');
    }
  });
  
  // Toggle sidebar on mobile
  document.querySelector('.toggle-sidebar').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.main-content').classList.toggle('pushed');
  });
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initDashboard();
  
  // Toggle sidebar functionality
  const toggleSidebar = document.querySelector('.toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  
  if (toggleSidebar && sidebar) {
    toggleSidebar.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  }
  
  // Mobile menu functionality
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');
  const mobileSidebar = document.querySelector('.mobile-sidebar');
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
  
  // Show mobile sidebar when menu button is clicked
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileSidebar.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    });
  }
  
  // Hide mobile sidebar when close button is clicked
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', function() {
      mobileSidebar.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    });
  }
  
  // Mobile logout functionality
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminEmail');
      window.location.href = 'index.html';
    });
  }
  
  // Sync admin name between desktop and mobile
  const adminName = localStorage.getItem('adminName') || 'Admin';
  const mobileAdminNameEl = document.getElementById('mobileAdminName');
  if (mobileAdminNameEl) {
    mobileAdminNameEl.textContent = adminName;
  }
});

