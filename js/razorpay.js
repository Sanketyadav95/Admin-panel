// Razorpay Integration JavaScript

// Razorpay configuration
const razorpayConfig = {
  key_id: 'rzp_test_1DP5mmOlF5G5ag', // Replace with your actual Razorpay test key
  currency: 'INR',
  name: 'Admin Panel',
  description: 'Manual Payment Collection',
  image: '../assets/logo.png', // Logo URL
  theme: {
    color: '#3498db'
  }
};

// Function to show loading indicator
function showLoading(element, text = 'Processing...') {
  if (!element) return;
  
  const originalText = element.innerHTML;
  element.setAttribute('data-original-text', originalText);
  element.classList.add('btn-loading');
  element.innerHTML = `<span class="loading-spinner"></span><span>${text}</span>`;
  element.disabled = true;
}

// Function to hide loading indicator
function hideLoading(element) {
  if (!element) return;
  
  const originalText = element.getAttribute('data-original-text');
  element.classList.remove('btn-loading');
  element.innerHTML = originalText;
  element.disabled = false;
}

// Function to show error message
function showError(message) {
  // Create error alert if it doesn't exist
  let errorAlert = document.getElementById('razorpayErrorAlert');
  
  if (!errorAlert) {
    errorAlert = document.createElement('div');
    errorAlert.id = 'razorpayErrorAlert';
    errorAlert.className = 'alert alert-danger';
    errorAlert.style.position = 'fixed';
    errorAlert.style.top = '20px';
    errorAlert.style.right = '20px';
    errorAlert.style.zIndex = '9999';
    errorAlert.style.maxWidth = '400px';
    document.body.appendChild(errorAlert);
  }
  
  errorAlert.innerHTML = `
    <strong>Error:</strong> ${message}
    <button type="button" class="close" onclick="this.parentElement.style.display='none'">&times;</button>
  `;
  errorAlert.style.display = 'block';
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    if (errorAlert) {
      errorAlert.style.display = 'none';
    }
  }, 5000);
}

// Function to show payment form
function showPaymentForm() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    showError('You must be logged in to process payments.');
    return;
  }
  
  // Show payment form modal
  let paymentFormModal = document.getElementById('paymentFormModal');
  if (paymentFormModal) {
    paymentFormModal.style.display = 'block';
    return;
  }
  
  // If modal doesn't exist, create it
  createPaymentFormModal();
  
  // Get the newly created modal and display it
  paymentFormModal = document.getElementById('paymentFormModal');
  if (paymentFormModal) {
    paymentFormModal.style.display = 'block';
  } else {
    showError('Failed to create payment form. Please try again.');
  }
}

// Create payment form modal
function createPaymentFormModal() {
  // Create modal element
  const modal = document.createElement('div');
  modal.id = 'paymentFormModal';
  modal.className = 'modal';
  modal.style.display = 'block';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';
  modalHeader.innerHTML = `
    <h3>Collect Manual Payment</h3>
    <span class="close" id="closePaymentFormModal">&times;</span>
  `;
  
  // Create modal body
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  modalBody.innerHTML = `
    <form id="paymentForm">
      <div class="form-group">
        <label for="paymentAmount">Amount (₹)</label>
        <input type="number" id="paymentAmount" class="form-control" placeholder="Enter amount" required min="1">
      </div>
      <div class="form-group">
        <label for="paymentName">Customer Name</label>
        <input type="text" id="paymentName" class="form-control" placeholder="Enter customer name" required>
      </div>
      <div class="form-group">
        <label for="paymentEmail">Customer Email</label>
        <input type="email" id="paymentEmail" class="form-control" placeholder="Enter customer email" required>
      </div>
      <div class="form-group">
        <label for="paymentPhone">Customer Phone</label>
        <input type="tel" id="paymentPhone" class="form-control" placeholder="Enter customer phone" required>
      </div>
      <div class="form-group">
        <label for="paymentDescription">Description</label>
        <textarea id="paymentDescription" class="form-control" placeholder="Enter payment description" rows="2"></textarea>
      </div>
      <div id="formErrorMessage" class="alert alert-danger" style="display: none;"></div>
      <button type="submit" id="paymentSubmitBtn" class="btn btn-primary btn-block">Proceed to Payment</button>
    </form>
  `;
  
  // Append modal parts
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modal.appendChild(modalContent);
  
  // Append modal to body
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('closePaymentFormModal').addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    processPaymentForm(e); // Pass the event object
  });
}

// Process payment form and open Razorpay checkout
function processPaymentForm(e) {
  // Check if e exists before calling preventDefault
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }
  
  // Get form values
  const amount = document.getElementById('paymentAmount').value;
  const name = document.getElementById('paymentName').value;
  const email = document.getElementById('paymentEmail').value;
  const phone = document.getElementById('paymentPhone').value;
  const description = document.getElementById('paymentDescription').value;
  
  // Validate form
  let isValid = true;
  let errorMessage = '';
  
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    isValid = false;
    errorMessage += 'Please enter a valid amount.\n';
  }
  
  if (!name || name.trim() === '') {
    isValid = false;
    errorMessage += 'Please enter customer name.\n';
  }
  
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    isValid = false;
    errorMessage += 'Please enter a valid email address.\n';
  }
  
  if (!phone || !/^\d{10}$/.test(phone.replace(/[\s-]/g, ''))) {
    isValid = false;
    errorMessage += 'Please enter a valid 10-digit phone number.\n';
  }
  
  // Display error if validation fails
  if (!isValid) {
    const formErrorMessage = document.getElementById('formErrorMessage');
    formErrorMessage.textContent = errorMessage;
    formErrorMessage.style.display = 'block';
    return;
  }
  
  // Hide error message if previously shown
  const formErrorMessage = document.getElementById('formErrorMessage');
  if (formErrorMessage) {
    formErrorMessage.style.display = 'none';
  }
  
  // Show loading on submit button
  const submitBtn = document.getElementById('paymentSubmitBtn');
  showLoading(submitBtn, 'Opening Payment Gateway...');
  
  // Convert amount to paise (Razorpay requires amount in smallest currency unit)
  const amountInPaise = Math.round(parseFloat(amount) * 100);
  
  // Create order ID (in a real app, this would come from your backend)
  const orderId = 'ORD' + Date.now();
  
  // Configure Razorpay options
  const options = {
    ...razorpayConfig,
    amount: amountInPaise,
    order_id: orderId,
    prefill: {
      name: name,
      email: email,
      contact: phone
    },
    notes: {
      description: description || 'Manual payment collection'
    },
    handler: function(response) {
      // Hide loading
      hideLoading(submitBtn);
      
      // Close modal
      const modal = document.getElementById('paymentFormModal');
      if (modal) {
        modal.style.display = 'none';
      }
      
      // Process payment success
      processPaymentSuccess(response, {
        amount: amount,
        name: name,
        email: email,
        phone: phone,
        description: description
      });
    },
    modal: {
      ondismiss: function() {
        // Hide loading when Razorpay modal is dismissed
        hideLoading(submitBtn);
      }
    }
  };
  
  // Open Razorpay checkout
  try {
    const rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    hideLoading(submitBtn);
    showError('Failed to open payment gateway: ' + error.message);
  }
}

// Process successful payment
function processPaymentSuccess(response, paymentDetails) {
  // In a real app, you would verify the payment with your backend here
  // For demo purposes, we'll just show a success message and log the details
  
  // Create payment record
  const paymentRecord = {
    id: response.razorpay_payment_id,
    order_id: response.razorpay_order_id,
    signature: response.razorpay_signature,
    amount: paymentDetails.amount,
    currency: razorpayConfig.currency,
    customer: {
      name: paymentDetails.name,
      email: paymentDetails.email,
      phone: paymentDetails.phone
    },
    description: paymentDetails.description,
    timestamp: new Date().toISOString(),
    status: 'success'
  };
  
  // Log payment details (in a real app, you would send this to your server)
  console.log('Payment successful:', paymentRecord);
  
  // Save to local storage for demo purposes
  savePaymentToLocalStorage(paymentRecord);
  
  // Show success message
  showSuccessMessage(paymentRecord);
  
  // Update payments list if on payments page
  if (typeof loadPayments === 'function') {
    loadPayments();
  }
}

// Save payment to local storage
function savePaymentToLocalStorage(paymentRecord) {
  // Get existing payments
  let payments = JSON.parse(localStorage.getItem('razorpayPayments') || '[]');
  
  // Add new payment
  payments.push(paymentRecord);
  
  // Save back to local storage
  localStorage.setItem('razorpayPayments', JSON.stringify(payments));
}

// Show success message
function showSuccessMessage(paymentRecord) {
  // Create success modal if it doesn't exist
  let successModal = document.getElementById('paymentSuccessModal');
  
  if (successModal) {
    // Update existing modal content
    updateSuccessModalContent(successModal, paymentRecord);
  } else {
    // Create new modal
    createSuccessModal(paymentRecord);
  }
  
  // Show the modal
  successModal = document.getElementById('paymentSuccessModal');
  if (successModal) {
    successModal.style.display = 'block';
  }
}

// Create success modal
function createSuccessModal(paymentRecord) {
  // Create modal element
  const modal = document.createElement('div');
  modal.id = 'paymentSuccessModal';
  modal.className = 'modal';
  modal.style.display = 'block';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header success-header';
  modalHeader.innerHTML = `
    <h3><i class="fas fa-check-circle"></i> Payment Successful</h3>
    <span class="close" id="closeSuccessModal">&times;</span>
  `;
  
  // Create modal body
  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  modalBody.innerHTML = getSuccessModalBodyHTML(paymentRecord);
  
  // Append modal parts
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modal.appendChild(modalContent);
  
  // Append modal to body
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('closeSuccessModal').addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Add print receipt event listener
  const printBtn = document.getElementById('printReceiptBtn');
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      printReceipt(paymentRecord);
    });
  }
}

// Update success modal content
function updateSuccessModalContent(modal, paymentRecord) {
  // Update modal body
  const modalBody = modal.querySelector('.modal-body');
  if (modalBody) {
    modalBody.innerHTML = getSuccessModalBodyHTML(paymentRecord);
  }
  
  // Re-add print receipt event listener
  const printBtn = document.getElementById('printReceiptBtn');
  if (printBtn) {
    printBtn.addEventListener('click', function() {
      printReceipt(paymentRecord);
    });
  }
}

// Get success modal body HTML
function getSuccessModalBodyHTML(paymentRecord) {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: razorpayConfig.currency
  }).format(paymentRecord.amount);
  
  const timestamp = new Date(paymentRecord.timestamp);
  const formattedDate = timestamp.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const formattedTime = timestamp.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
    <div class="success-message">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <p class="success-text">Your payment has been processed successfully!</p>
    </div>
    
    <div class="receipt">
      <div class="receipt-header">
        <h4>Payment Receipt</h4>
        <p class="receipt-date">${formattedDate} at ${formattedTime}</p>
      </div>
      
      <div class="receipt-details">
        <div class="receipt-row">
          <span class="receipt-label">Payment ID:</span>
          <span class="receipt-value">${paymentRecord.id}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Amount:</span>
          <span class="receipt-value receipt-amount">${formattedAmount}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Customer:</span>
          <span class="receipt-value">${paymentRecord.customer.name}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Email:</span>
          <span class="receipt-value">${paymentRecord.customer.email}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Phone:</span>
          <span class="receipt-value">${paymentRecord.customer.phone}</span>
        </div>
        ${paymentRecord.description ? `
        <div class="receipt-row">
          <span class="receipt-label">Description:</span>
          <span class="receipt-value">${paymentRecord.description}</span>
        </div>
        ` : ''}
        <div class="receipt-row">
          <span class="receipt-label">Status:</span>
          <span class="receipt-value receipt-status">Successful</span>
        </div>
      </div>
    </div>
    
    <div class="receipt-actions">
      <button id="printReceiptBtn" class="btn btn-outline-primary">
        <i class="fas fa-print"></i> Print Receipt
      </button>
    </div>
  `;
}

// Print receipt
function printReceipt(paymentRecord) {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Get formatted values
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: razorpayConfig.currency
  }).format(paymentRecord.amount);
  
  const timestamp = new Date(paymentRecord.timestamp);
  const formattedDate = timestamp.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const formattedTime = timestamp.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Write the receipt HTML to the new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Receipt - ${paymentRecord.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 20px;
        }
        
        .receipt-header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
          margin-bottom: 20px;
        }
        
        .receipt-header h1 {
          color: #3498db;
          margin-bottom: 5px;
        }
        
        .receipt-header p {
          color: #777;
          margin-top: 0;
        }
        
        .receipt-details {
          margin-bottom: 30px;
        }
        
        .receipt-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        
        .receipt-label {
          font-weight: bold;
          color: #555;
        }
        
        .receipt-amount {
          font-weight: bold;
          color: #3498db;
          font-size: 1.1em;
        }
        
        .receipt-status {
          color: #27ae60;
          font-weight: bold;
        }
        
        .receipt-footer {
          text-align: center;
          margin-top: 30px;
          color: #777;
          font-size: 0.9em;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .receipt-container {
            border: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="receipt-header">
          <h1>Payment Receipt</h1>
          <p>${formattedDate} at ${formattedTime}</p>
        </div>
        
        <div class="receipt-details">
          <div class="receipt-row">
            <span class="receipt-label">Payment ID:</span>
            <span>${paymentRecord.id}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Order ID:</span>
            <span>${paymentRecord.order_id}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Amount:</span>
            <span class="receipt-amount">${formattedAmount}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Customer:</span>
            <span>${paymentRecord.customer.name}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Email:</span>
            <span>${paymentRecord.customer.email}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Phone:</span>
            <span>${paymentRecord.customer.phone}</span>
          </div>
          ${paymentRecord.description ? `
          <div class="receipt-row">
            <span class="receipt-label">Description:</span>
            <span>${paymentRecord.description}</span>
          </div>
          ` : ''}
          <div class="receipt-row">
            <span class="receipt-label">Status:</span>
            <span class="receipt-status">Successful</span>
          </div>
        </div>
        
        <div class="receipt-footer">
          <p>Thank you for your payment!</p>
          <p>This is a computer-generated receipt and does not require a signature.</p>
        </div>
      </div>
      
      <script>
        // Auto print
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  
  // Close the document
  printWindow.document.close();
}

// Check if user is logged in
function isLoggedIn() {
  // In a real app, you would check session/token validity
  // For demo purposes, we'll just check if there's a user in local storage
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  return !!user;
}

// Initialize Razorpay
function initRazorpay() {
  // Add Razorpay script if not already added
  if (!document.getElementById('razorpay-js')) {
    const script = document.createElement('script');
    script.id = 'razorpay-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }
  
  // Add event listeners to payment buttons
  const paymentButtons = document.querySelectorAll('.payment-btn, .razorpay-btn');
  paymentButtons.forEach(button => {
    button.addEventListener('click', showPaymentForm);
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initRazorpay);