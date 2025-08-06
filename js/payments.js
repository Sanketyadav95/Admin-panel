// Payments JavaScript

// DOM Elements
const paymentsTable = document.getElementById('paymentsTable');
const dateFilter = document.getElementById('dateFilter');
const roleFilter = document.getElementById('roleFilter');
const statusFilter = document.getElementById('statusFilter');
const paymentModal = document.getElementById('paymentModal');
const paymentDetails = document.getElementById('paymentDetails');
const closeModal = document.getElementById('closeModal');
const printPayment = document.getElementById('printPayment');
const requestDelete = document.getElementById('requestDelete');
const adminEmailEl = document.getElementById('adminEmail');
const adminNameEl = document.getElementById('adminName');
const logoutBtn = document.getElementById('logoutBtn');

// Current selected payment for modal
let currentPayment = null;

// DataTable instance
let dataTable;

// Initialize payments page
function initPaymentsPage() {
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
  
  // Load payments data
  loadPaymentsData();
  
  // Set up event listeners
  setupEventListeners();
}

// Load payments data
function loadPaymentsData() {
  // In a real app, this would fetch data from a server
  // For now, we'll use localStorage or generate dummy data
  
  // Check if we have data in localStorage
  let payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // If no data exists, redirect to dashboard to generate dummy data
  if (payments.length === 0) {
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Initialize DataTable
  initDataTable(payments);
}

// Initialize DataTable with payments data
function initDataTable(payments) {
  // Format data for DataTable
  const tableData = payments.map(payment => {
    // Format date
    const date = new Date(payment.date);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format amount
    const formattedAmount = '₹' + payment.amount.toLocaleString();
    
    // Create status badge
    let statusBadge = '';
    if (payment.status === 'success') {
      statusBadge = '<span class="badge badge-success">Success</span>';
    } else if (payment.status === 'pending') {
      statusBadge = '<span class="badge badge-warning">Pending</span>';
    } else if (payment.status === 'failed') {
      statusBadge = '<span class="badge badge-danger">Failed</span>';
    }
    
    // Create action buttons
    const actionButtons = `
      <button class="btn btn-sm btn-primary view-payment" data-id="${payment.id}">
        <i class="fas fa-eye"></i>
      </button>
      <button class="btn btn-sm btn-danger request-delete" data-id="${payment.id}" ${payment.status === 'success' ? '' : 'disabled'}>
        <i class="fas fa-trash"></i>
      </button>
    `;
    
    return [
      payment.id,
      payment.razorpayId,
      payment.sender,
      payment.receiver,
      formattedAmount,
      formattedDate,
      statusBadge,
      actionButtons
    ];
  });
  
  // Initialize DataTable
  dataTable = $('#paymentsTable').DataTable({
    data: tableData,
    columns: [
      { title: 'Payment ID' },
      { title: 'Razorpay ID' },
      { title: 'Sender' },
      { title: 'Receiver' },
      { title: 'Amount' },
      { title: 'Date' },
      { title: 'Status' },
      { title: 'Actions' }
    ],
    order: [[5, 'desc']], // Sort by date (newest first)
    responsive: true,
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100]
  });
  
  // Add event listeners for action buttons
  $('#paymentsTable').on('click', '.view-payment', function() {
    const paymentId = $(this).data('id');
    openPaymentModal(paymentId);
  });
  
  $('#paymentsTable').on('click', '.request-delete', function() {
    const paymentId = $(this).data('id');
    requestPaymentDeletion(paymentId);
  });
}

// Open payment details modal
function openPaymentModal(paymentId) {
  // Get payment data
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  currentPayment = payments.find(p => p.id === paymentId);
  
  if (!currentPayment) {
    alert('Payment not found!');
    return;
  }
  
  // Format date
  const date = new Date(currentPayment.date);
  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Format amount
  const formattedAmount = '₹' + currentPayment.amount.toLocaleString();
  
  // Create status badge
  let statusBadge = '';
  if (currentPayment.status === 'success') {
    statusBadge = '<span class="badge badge-success">Success</span>';
  } else if (currentPayment.status === 'pending') {
    statusBadge = '<span class="badge badge-warning">Pending</span>';
  } else if (currentPayment.status === 'failed') {
    statusBadge = '<span class="badge badge-danger">Failed</span>';
  }
  
  // Populate modal with payment details
  paymentDetails.innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <div>
          <strong>Payment ID:</strong> ${currentPayment.id}
        </div>
        <div>
          ${statusBadge}
        </div>
      </div>
      <div>
        <strong>Razorpay ID:</strong> ${currentPayment.razorpayId}
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div>
        <strong>Sender:</strong><br>
        ${currentPayment.sender}
      </div>
      <div>
        <strong>Receiver:</strong><br>
        ${currentPayment.receiver}
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div>
        <strong>Amount:</strong><br>
        ${formattedAmount}
      </div>
      <div>
        <strong>Date:</strong><br>
        ${formattedDate}
      </div>
    </div>
    
    <div>
      <strong>Payment Method:</strong><br>
      Razorpay (Card/UPI/Netbanking)
    </div>
  `;
  
  // Show modal
  paymentModal.style.display = 'block';
  
  // Disable delete button for non-success payments
  requestDelete.disabled = currentPayment.status !== 'success';
}

// Request payment deletion
function requestPaymentDeletion(paymentId) {
  // Get payment data
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  const payment = payments.find(p => p.id === paymentId);
  
  if (!payment) {
    alert('Payment not found!');
    return;
  }
  
  // Confirm deletion
  if (!confirm(`Are you sure you want to request deletion of payment ${paymentId}?`)) {
    return;
  }
  
  // Create delete request
  const deleteRequests = JSON.parse(localStorage.getItem('deleteRequests')) || [];
  
  // Check if request already exists
  const existingRequest = deleteRequests.find(req => req.paymentId === paymentId);
  if (existingRequest) {
    alert('A delete request for this payment already exists!');
    return;
  }
  
  // Add new request
  const newRequest = {
    id: 'REQ' + Math.floor(Math.random() * 10000),
    role: 'admin',
    name: localStorage.getItem('adminName') || 'Admin',
    paymentId: paymentId,
    reason: 'Admin requested deletion',
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  deleteRequests.push(newRequest);
  localStorage.setItem('deleteRequests', JSON.stringify(deleteRequests));
  
  // Show success message
  alert('Delete request submitted successfully!');
  
  // Close modal if open
  if (currentPayment && currentPayment.id === paymentId) {
    paymentModal.style.display = 'none';
  }
}

// Apply filters to DataTable
function applyFilters() {
  // Get filter values
  const dateValue = dateFilter.value;
  const roleValue = roleFilter.value;
  const statusValue = statusFilter.value;
  
  // Clear existing filters
  dataTable.search('').columns().search('').draw();
  
  // Apply date filter
  if (dateValue !== 'all') {
    // In a real app, this would filter by date range
    // For now, we'll just show a message
    console.log('Date filter applied:', dateValue);
  }
  
  // Apply role filter
  if (roleValue !== 'all') {
    // In a real app, this would filter by role
    // For now, we'll just show a message
    console.log('Role filter applied:', roleValue);
  }
  
  // Apply status filter
  if (statusValue !== 'all') {
    dataTable.column(6).search(statusValue, true, false).draw();
  } else {
    dataTable.draw();
  }
}

// Set up event listeners
function setupEventListeners() {
  // Filter changes
  dateFilter.addEventListener('change', applyFilters);
  roleFilter.addEventListener('change', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  
  // Close modal
  closeModal.addEventListener('click', function() {
    paymentModal.style.display = 'none';
    currentPayment = null;
  });
  
  // Print payment
  printPayment.addEventListener('click', function() {
    if (!currentPayment) return;
    
    // In a real app, this would open a print dialog with formatted receipt
    // For now, we'll just show a message
    alert('Print functionality would be implemented here');
  });
  
  // Request delete
  requestDelete.addEventListener('click', function() {
    if (!currentPayment) return;
    requestPaymentDeletion(currentPayment.id);
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === paymentModal) {
      paymentModal.style.display = 'none';
      currentPayment = null;
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

// Initialize payments page when DOM is loaded
document.addEventListener('DOMContentLoaded', initPaymentsPage);