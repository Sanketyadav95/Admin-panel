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
    errorAlert.style.display = 'none';
  }, 5000);
}

// Function to show success message
function showSuccess(message) {
  // Create success alert if it doesn't exist
  let successAlert = document.getElementById('razorpaySuccessAlert');
  
  if (!successAlert) {
    successAlert = document.createElement('div');
    successAlert.id = 'razorpaySuccessAlert';
    successAlert.className = 'alert alert-success';
    successAlert.style.position = 'fixed';
    successAlert.style.top = '20px';
    successAlert.style.right = '20px';
    successAlert.style.zIndex = '9999';
    successAlert.style.maxWidth = '400px';
    document.body.appendChild(successAlert);
  }
  
  successAlert.innerHTML = `
    <strong>Success:</strong> ${message}
    <button type="button" class="close" onclick="this.parentElement.style.display='none'">&times;</button>
  `;
  successAlert.style.display = 'block';
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    successAlert.style.display = 'none';
  }, 5000);
}

// Function to open Razorpay checkout
function openRazorpayCheckout() {
  // Check if Razorpay is loaded
  if (!isRazorpayLoaded()) {
    showError('Razorpay is not loaded yet. Please try again in a moment.');
    loadRazorpayScript(); // Try to load it again
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
  
  if (!isValid) {
    const errorElement = document.getElementById('formErrorMessage');
    errorElement.textContent = errorMessage;
    errorElement.style.display = 'block';
    return;
  }
  
  // Show loading indicator
  const submitBtn = document.getElementById('paymentSubmitBtn');
  showLoading(submitBtn, 'Processing...');
  
  try {
    // Close modal
    document.getElementById('paymentFormModal').style.display = 'none';
    
    // Create Razorpay options
    const options = {
      key: razorpayConfig.key_id,
      amount: parseFloat(amount) * 100, // Amount in paise
      currency: razorpayConfig.currency,
      name: razorpayConfig.name,
      description: description || 'Payment Collection',
      image: razorpayConfig.image,
      handler: function(response) {
        handleSuccessfulPayment(response, {
          amount: parseFloat(amount),
          name: name,
          email: email,
          phone: phone,
          description: description
        });
      },
      prefill: {
        name: name,
        email: email,
        contact: phone
      },
      theme: razorpayConfig.theme,
      modal: {
        ondismiss: function() {
          hideLoading(submitBtn);
        }
      }
    };
    
    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function(response) {
      hideLoading(submitBtn);
      showError('Payment failed: ' + response.error.description);
    });
    
    rzp.open();
  } catch (error) {
    hideLoading(submitBtn);
    showError('Error creating payment: ' + (error.message || 'Please try again'));
    console.error('Razorpay error:', error);
  }
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  try {
    // Get existing payments from localStorage
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    
    // Create new payment object
    const newPayment = {
      id: 'PAY' + Math.floor(Math.random() * 10000),
      razorpayId: response.razorpay_payment_id,
      sender: customerData.name,
      receiver: localStorage.getItem('adminName') || 'Admin',
      amount: parseFloat(customerData.amount),
      date: new Date().toISOString(),
      status: 'success',
      description: customerData.description,
      customerEmail: customerData.email,
      customerPhone: customerData.phone
    };
    
    // Add new payment to array
    payments.push(newPayment);
    
    // Save to localStorage
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // Show success message
    showSuccess('Payment successful! Payment ID: ' + response.razorpay_payment_id);
    
    // Reload page to update dashboard after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    showError('Error saving payment data: ' + (error.message || 'Unknown error'));
    console.error('Payment handling error:', error);
  }
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'razorpayLoadingIndicator';
  loadingIndicator.innerHTML = '<div class="loading-spinner"></div> Loading payment gateway...';
  loadingIndicator.style.position = 'fixed';
  loadingIndicator.style.top = '10px';
  loadingIndicator.style.right = '10px';
  loadingIndicator.style.background = 'rgba(255, 255, 255, 0.9)';
  loadingIndicator.style.padding = '10px';
  loadingIndicator.style.borderRadius = '4px';
  loadingIndicator.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  loadingIndicator.style.zIndex = '9999';
  document.body.appendChild(loadingIndicator);
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  
  script.onload = function() {
    // Remove loading indicator when script is loaded
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  };
  
  script.onerror = function() {
    // Show error and remove loading indicator
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
    showError('Failed to load payment gateway. Please check your internet connection and try again.');
  };
  
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
}

.form-group.has-error .form-control {
  border-color: var(--danger-color);
}

.form-group.has-error .error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Confirmation Dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-dialog-actions button {
  margin-left: 10px;
}
  
  // Handle payment failure
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  // Get existing payments from localStorage
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Create new payment object
  const newPayment = {
    id: 'PAY' + Math.floor(Math.random() * 10000),
    razorpayId: response.razorpay_payment_id,
    sender: customerData.name,
    receiver: localStorage.getItem('adminName') || 'Admin',
    amount: parseFloat(customerData.amount),
    date: new Date().toISOString(),
    status: 'success',
    description: customerData.description,
    customerEmail: customerData.email,
    customerPhone: customerData.phone
  };
  
  // Add new payment to array
  payments.push(newPayment);
  
  // Save to localStorage
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Show success message
  alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
  
  // Reload page to update dashboard
  window.location.reload();
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
}

.form-group.has-error .form-control {
  border-color: var(--danger-color);
}

.form-group.has-error .error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Confirmation Dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-dialog-actions button {
  margin-left: 10px;
}
  
  // Handle payment failure
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  // Get existing payments from localStorage
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Create new payment object
  const newPayment = {
    id: 'PAY' + Math.floor(Math.random() * 10000),
    razorpayId: response.razorpay_payment_id,
    sender: customerData.name,
    receiver: localStorage.getItem('adminName') || 'Admin',
    amount: parseFloat(customerData.amount),
    date: new Date().toISOString(),
    status: 'success',
    description: customerData.description,
    customerEmail: customerData.email,
    customerPhone: customerData.phone
  };
  
  // Add new payment to array
  payments.push(newPayment);
  
  // Save to localStorage
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Show success message
  alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
  
  // Reload page to update dashboard
  window.location.reload();
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
}

.form-group.has-error .form-control {
  border-color: var(--danger-color);
}

.form-group.has-error .error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Confirmation Dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-dialog-actions button {
  margin-left: 10px;
}
  
  // Handle payment failure
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  // Get existing payments from localStorage
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Create new payment object
  const newPayment = {
    id: 'PAY' + Math.floor(Math.random() * 10000),
    razorpayId: response.razorpay_payment_id,
    sender: customerData.name,
    receiver: localStorage.getItem('adminName') || 'Admin',
    amount: parseFloat(customerData.amount),
    date: new Date().toISOString(),
    status: 'success',
    description: customerData.description,
    customerEmail: customerData.email,
    customerPhone: customerData.phone
  };
  
  // Add new payment to array
  payments.push(newPayment);
  
  // Save to localStorage
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Show success message
  alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
  
  // Reload page to update dashboard
  window.location.reload();
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
}

.form-group.has-error .form-control {
  border-color: var(--danger-color);
}

.form-group.has-error .error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Confirmation Dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-dialog-actions button {
  margin-left: 10px;
}
  
  // Handle payment failure
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  // Get existing payments from localStorage
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Create new payment object
  const newPayment = {
    id: 'PAY' + Math.floor(Math.random() * 10000),
    razorpayId: response.razorpay_payment_id,
    sender: customerData.name,
    receiver: localStorage.getItem('adminName') || 'Admin',
    amount: parseFloat(customerData.amount),
    date: new Date().toISOString(),
    status: 'success',
    description: customerData.description,
    customerEmail: customerData.email,
    customerPhone: customerData.phone
  };
  
  // Add new payment to array
  payments.push(newPayment);
  
  // Save to localStorage
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Show success message
  alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
  
  // Reload page to update dashboard
  window.location.reload();
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
}

.form-group.has-error .form-control {
  border-color: var(--danger-color);
}

.form-group.has-error .error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Confirmation Dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-dialog-actions button {
  margin-left: 10px;
}
  
  // Handle payment failure
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  // Get existing payments from localStorage
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Create new payment object
  const newPayment = {
    id: 'PAY' + Math.floor(Math.random() * 10000),
    razorpayId: response.razorpay_payment_id,
    sender: customerData.name,
    receiver: localStorage.getItem('adminName') || 'Admin',
    amount: parseFloat(customerData.amount),
    date: new Date().toISOString(),
    status: 'success',
    description: customerData.description,
    customerEmail: customerData.email,
    customerPhone: customerData.phone
  };
  
  // Add new payment to array
  payments.push(newPayment);
  
  // Save to localStorage
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Show success message
  alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
  
  // Reload page to update dashboard
  window.location.reload();
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
}

.form-group.has-error .form-control {
  border-color: var(--danger-color);
}

.form-group.has-error .error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Confirmation Dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-dialog-actions button {
  margin-left: 10px;
}
  
  // Handle payment failure
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  // Get existing payments from localStorage
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Create new payment object
  const newPayment = {
    id: 'PAY' + Math.floor(Math.random() * 10000),
    razorpayId: response.razorpay_payment_id,
    sender: customerData.name,
    receiver: localStorage.getItem('adminName') || 'Admin',
    amount: parseFloat(customerData.amount),
    date: new Date().toISOString(),
    status: 'success',
    description: customerData.description,
    customerEmail: customerData.email,
    customerPhone: customerData.phone
  };
  
  // Add new payment to array
  payments.push(newPayment);
  
  // Save to localStorage
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Show success message
  alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
  
  // Reload page to update dashboard
  window.location.reload();
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
}

.form-group.has-error .form-control {
  border-color: var(--danger-color);
}

.form-group.has-error .error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Confirmation Dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-dialog-actions button {
  margin-left: 10px;
}
  
  // Handle payment failure
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  // Get existing payments from localStorage
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Create new payment object
  const newPayment = {
    id: 'PAY' + Math.floor(Math.random() * 10000),
    razorpayId: response.razorpay_payment_id,
    sender: customerData.name,
    receiver: localStorage.getItem('adminName') || 'Admin',
    amount: parseFloat(customerData.amount),
    date: new Date().toISOString(),
    status: 'success',
    description: customerData.description,
    customerEmail: customerData.email,
    customerPhone: customerData.phone
  };
  
  // Add new payment to array
  payments.push(newPayment);
  
  // Save to localStorage
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Show success message
  alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
  
  // Reload page to update dashboard
  window.location.reload();
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
}

.form-group.has-error .form-control {
  border-color: var(--danger-color);
}

.form-group.has-error .error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Confirmation Dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-dialog-actions button {
  margin-left: 10px;
}
  
  // Handle payment failure
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  // Get existing payments from localStorage
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Create new payment object
  const newPayment = {
    id: 'PAY' + Math.floor(Math.random() * 10000),
    razorpayId: response.razorpay_payment_id,
    sender: customerData.name,
    receiver: localStorage.getItem('adminName') || 'Admin',
    amount: parseFloat(customerData.amount),
    date: new Date().toISOString(),
    status: 'success',
    description: customerData.description,
    customerEmail: customerData.email,
    customerPhone: customerData.phone
  };
  
  // Add new payment to array
  payments.push(newPayment);
  
  // Save to localStorage
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Show success message
  alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
  
  // Reload page to update dashboard
  window.location.reload();
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
}

.form-group.has-error .form-control {
  border-color: var(--danger-color);
}

.form-group.has-error .error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Confirmation Dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-dialog-actions button {
  margin-left: 10px;
}
  
  // Handle payment failure
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  // Get existing payments from localStorage
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Create new payment object
  const newPayment = {
    id: 'PAY' + Math.floor(Math.random() * 10000),
    razorpayId: response.razorpay_payment_id,
    sender: customerData.name,
    receiver: localStorage.getItem('adminName') || 'Admin',
    amount: parseFloat(customerData.amount),
    date: new Date().toISOString(),
    status: 'success',
    description: customerData.description,
    customerEmail: customerData.email,
    customerPhone: customerData.phone
  };
  
  // Add new payment to array
  payments.push(newPayment);
  
  // Save to localStorage
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Show success message
  alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
  
  // Reload page to update dashboard
  window.location.reload();
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.25);
}

.form-group.has-error .form-control {
  border-color: var(--danger-color);
}

.form-group.has-error .error-message {
  color: var(--danger-color);
  font-size: 0.8rem;
  margin-top: 5px;
}

/* Confirmation Dialog */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog-content {
  background-color: var(--white);
  border-radius: var(--border-radius);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-dialog-actions button {
  margin-left: 10px;
}
  
  // Handle payment failure
  rzp.on('payment.failed', function(response) {
    alert('Payment failed: ' + response.error.description);
  });
}

// Handle successful payment
function handleSuccessfulPayment(response, customerData) {
  // Get existing payments from localStorage
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Create new payment object
  const newPayment = {
    id: 'PAY' + Math.floor(Math.random() * 10000),
    razorpayId: response.razorpay_payment_id,
    sender: customerData.name,
    receiver: localStorage.getItem('adminName') || 'Admin',
    amount: parseFloat(customerData.amount),
    date: new Date().toISOString(),
    status: 'success',
    description: customerData.description,
    customerEmail: customerData.email,
    customerPhone: customerData.phone
  };
  
  // Add new payment to array
  payments.push(newPayment);
  
  // Save to localStorage
  localStorage.setItem('payments', JSON.stringify(payments));
  
  // Show success message
  alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
  
  // Reload page to update dashboard
  window.location.reload();
}

// Check if Razorpay script is loaded
function isRazorpayLoaded() {
  return typeof Razorpay !== 'undefined';
}

// Load Razorpay script if not already loaded
function loadRazorpayScript() {
  if (isRazorpayLoaded()) return;
  
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  document.body.appendChild(script);
}

// Initialize Razorpay when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadRazorpayScript();
});

/* Loading Indicators */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.btn-loading .loading-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -10px;
  margin-top: -10px;
}

/* Tooltips */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 120px;
  background-color: var(--dark-color);
  color: var(--white);
  text-align: center;
  border-radius: 4px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Improved Mobile Responsiveness */
@media (max-width: 576px) {
  .login-card {
    padding: 20px;
    margin: 0 15px;
  }
  
  .card {
    padding: 15px;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .table-responsive {
    margin: 0 -15px;
    width: calc(100% + 30px);
  }
  
  .header h2 {
    font-size: 1.2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-link {
    width: 100%;
    text-align: center;
  }
}

/* Improved Form Styles */
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0