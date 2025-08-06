// Requests JavaScript

// DOM Elements
const deleteRequestsTable = document.getElementById('deleteRequestsTable');
const deleteRequestModal = document.getElementById('deleteRequestModal');
const modalRequestId = document.getElementById('modalRequestId');
const modalUser = document.getElementById('modalUser');
const modalEmail = document.getElementById('modalEmail');
const modalReason = document.getElementById('modalReason');
const modalDate = document.getElementById('modalDate');
const modalStatus = document.getElementById('modalStatus');
const userDataPreview = document.getElementById('userDataPreview');
const approveRequestBtn = document.getElementById('approveRequestBtn');
const rejectRequestBtn = document.getElementById('rejectRequestBtn');
const adminEmailEl = document.getElementById('adminEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Stats counters
const pendingCountEl = document.getElementById('pendingCount');
const approvedCountEl = document.getElementById('approvedCount');
const rejectedCountEl = document.getElementById('rejectedCount');

// Get all close buttons for modals
const closeButtons = document.querySelectorAll('.close');

// Current selected request for modal
let currentRequest = null;

// Initialize requests page
function initRequestsPage() {
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
  
  // Load requests data
  loadRequestsData();
  
  // Initialize DataTables
  initializeDataTables();
  
  // Set up event listeners
  setupEventListeners();
}

// Initialize DataTables
function initializeDataTables() {
  // Initialize Delete Requests DataTable
  $('#deleteRequestsTable').DataTable({
    responsive: true,
    columnDefs: [
      { responsivePriority: 1, targets: 0 }, // Request ID
      { responsivePriority: 2, targets: 1 }, // User
      { responsivePriority: 3, targets: 5 }, // Status
      { responsivePriority: 4, targets: 6 }, // Actions
      { responsivePriority: 10, targets: '_all' }
    ],
    language: {
      search: "_INPUT_",
      searchPlaceholder: "Search requests...",
      lengthMenu: "Show _MENU_ requests",
      info: "Showing _START_ to _END_ of _TOTAL_ requests",
      infoEmpty: "Showing 0 to 0 of 0 requests",
      infoFiltered: "(filtered from _MAX_ total requests)"
    },
    dom: '<"top"lf>rt<"bottom"ip>',
    lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
    pageLength: 10,
    order: [[4, 'desc']] // Sort by Date Requested column by default
  });
}

// Load requests data
function loadRequestsData() {
  // In a real app, this would fetch data from a server
  // For now, we'll use localStorage or generate dummy data
  
  // Check if we have data in localStorage
  let requests = JSON.parse(localStorage.getItem('deleteRequests')) || [];
  
  // If no data exists, redirect to dashboard to generate dummy data
  if (requests.length === 0) {
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Separate requests by status
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');
  
  // Update stats counters
  pendingCountEl.textContent = pendingRequests.length;
  approvedCountEl.textContent = approvedRequests.length;
  rejectedCountEl.textContent = rejectedRequests.length;
  
  // Populate tables
  populatePendingRequestsTable(pendingRequests);
}

// Populate pending requests table
function populatePendingRequestsTable(requests) {
  // Get DataTable instance
  const dataTable = $('#deleteRequestsTable').DataTable();
  
  // Clear existing data
  dataTable.clear();
  
  if (requests.length === 0) {
    // Draw the table (will show "No data available" message)
    dataTable.draw();
    return;
  }
  
  // Add rows to DataTable
  requests.forEach(request => {
    // Format date
    const date = new Date(request.date);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create status badge
    let statusClass = 'status-pending';
    let statusText = 'Pending';
    
    if (request.status === 'approved') {
      statusClass = 'status-approved';
      statusText = 'Approved';
    } else if (request.status === 'rejected') {
      statusClass = 'status-rejected';
      statusText = 'Rejected';
    }
    
    const statusBadge = `<span class="status-badge ${statusClass}">${statusText}</span>`;
    
    // Create action buttons
    const actionButtons = `
      <button class="btn btn-sm btn-primary view-request" data-id="${request.id}">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn btn-sm btn-success approve-request" data-id="${request.id}">
        <i class="fas fa-check"></i>
      </button>
      <button class="btn btn-sm btn-danger reject-request" data-id="${request.id}">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add row to DataTable
    dataTable.row.add([
      request.id,
      request.name,
      request.email || 'N/A',
      request.reason,
      formattedDate,
      statusBadge,
      actionButtons
    ]);
  });
  
  // Draw the table with new data
  dataTable.draw();
}

// Note: We've removed the separate history table functionality
// All requests (pending, approved, rejected) are now shown in the main table

// Open request details modal
function openRequestModal(requestId) {
  // Get request data
  const requests = JSON.parse(localStorage.getItem('deleteRequests')) || [];
  currentRequest = requests.find(r => r.id === requestId);
  
  if (!currentRequest) {
    alert('Request not found!');
    return;
  }
  
  // Format date
  const date = new Date(currentRequest.date);
  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Create status badge
  let statusClass = '';
  if (currentRequest.status === 'pending') {
    statusClass = 'status-pending';
  } else if (currentRequest.status === 'approved') {
    statusClass = 'status-approved';
  } else if (currentRequest.status === 'rejected') {
    statusClass = 'status-rejected';
  }
  
  // Populate modal fields
  modalRequestId.textContent = currentRequest.id;
  modalUser.textContent = currentRequest.name;
  modalEmail.textContent = currentRequest.email || 'N/A';
  modalReason.textContent = currentRequest.reason;
  modalDate.textContent = formattedDate;
  modalStatus.innerHTML = `<span class="status-badge ${statusClass}">${currentRequest.status.charAt(0).toUpperCase() + currentRequest.status.slice(1)}</span>`;
  
  // Get user data for preview
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.id === currentRequest.userId);
  
  if (user) {
    // Format user data for preview
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      // Remove sensitive data
      // Include any other relevant fields
    };
    
    userDataPreview.textContent = JSON.stringify(userData, null, 2);
  } else {
    userDataPreview.textContent = 'User data not found';
  }
  
  // Show/hide action buttons based on request status
  if (currentRequest.status === 'pending') {
    approveRequestBtn.style.display = 'inline-block';
    rejectRequestBtn.style.display = 'inline-block';
  } else {
    approveRequestBtn.style.display = 'none';
    rejectRequestBtn.style.display = 'none';
  }
  
  // Show the modal
  deleteRequestModal.style.display = 'block';
}

// Approve request
function approveDeleteRequest(requestId) {
  try {
    // Get request data
    const requests = JSON.parse(localStorage.getItem('deleteRequests')) || [];
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) {
      alert('Request not found!');
      return;
    }
    
    // Update request status
    requests[requestIndex].status = 'approved';
    requests[requestIndex].processedDate = new Date().toISOString();
    requests[requestIndex].processedBy = localStorage.getItem('adminEmail') || 'Admin';
    
    // Save updated requests
    localStorage.setItem('deleteRequests', JSON.stringify(requests));
    
    // Delete the user
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === requests[requestIndex].userId);
    
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Show success message
    alert('Delete request approved and user deleted successfully!');
    
    // Reload requests data
    loadRequestsData();
    
    // Close modal
    deleteRequestModal.style.display = 'none';
    currentRequest = null;
  } catch (error) {
    console.error('Error approving request:', error);
    alert('An error occurred while approving the request. Please try again.');
  }
}

// Reject request
function rejectDeleteRequest(requestId) {
  // Get requests data
  const requests = JSON.parse(localStorage.getItem('deleteRequests')) || [];
  const requestIndex = requests.findIndex(r => r.id === requestId);
  
  if (requestIndex === -1) {
    alert('Request not found!');
    return;
  }
  
  // Update request status
  requests[requestIndex].status = 'rejected';
  requests[requestIndex].processedDate = new Date().toISOString();
  requests[requestIndex].processedBy = localStorage.getItem('adminEmail') || 'Admin';
  
  // Save updated requests
  localStorage.setItem('deleteRequests', JSON.stringify(requests));
  
  // Reload data and refresh DataTable
  const dataTable = $('#deleteRequestsTable').DataTable();
  dataTable.clear().draw();
  loadRequestsData();
  
  // Close modal if open
  deleteRequestModal.style.display = 'none';
  currentRequest = null;
  
  // Show success message
  alert('Delete request rejected successfully!');
}

// Set up event listeners
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and content
      document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
  
  // Close modals when clicking the X
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
        currentRequest = null;
      }
    });
  });
  
  // Handle DataTable row actions using event delegation
  $('#deleteRequestsTable').on('click', '.view-request', function() {
    const requestId = $(this).data('id');
    openRequestModal(requestId);
  });
  
  $('#deleteRequestsTable').on('click', '.approve-request', function() {
    const requestId = $(this).data('id');
    if (confirm('Are you sure you want to approve this delete request?')) {
      approveDeleteRequest(requestId);
    }
  });
  
  $('#deleteRequestsTable').on('click', '.reject-request', function() {
    const requestId = $(this).data('id');
    if (confirm('Are you sure you want to reject this delete request?')) {
      rejectDeleteRequest(requestId);
    }
  });
  
  // Approve request from modal
  approveRequestBtn.addEventListener('click', function() {
    if (!currentRequest) return;
    if (confirm('Are you sure you want to approve this delete request?')) {
      approveDeleteRequest(currentRequest.id);
    }
  });
  
  // Reject request from modal
  rejectRequestBtn.addEventListener('click', function() {
    if (!currentRequest) return;
    if (confirm('Are you sure you want to reject this delete request?')) {
      rejectDeleteRequest(currentRequest.id);
    }
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
      currentRequest = null;
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
    document.querySelector('.sidebar').classList.toggle('show');
    document.querySelector('.main-content').classList.toggle('pushed');
  });
}

// Initialize requests page when DOM is loaded
document.addEventListener('DOMContentLoaded', initRequestsPage);