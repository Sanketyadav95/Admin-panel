// Settings JavaScript

// DOM Elements
const profileForm = document.getElementById('profileForm');
const securityForm = document.getElementById('securityForm');
const notificationForm = document.getElementById('notificationForm');
const profileImage = document.getElementById('profileImage');
const profileImageUpload = document.getElementById('profileImageUpload');
const fullName = document.getElementById('fullName');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const currentPassword = document.getElementById('currentPassword');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const emailNotifications = document.getElementById('emailNotifications');
const paymentNotifications = document.getElementById('paymentNotifications');
const deleteRequestNotifications = document.getElementById('deleteRequestNotifications');
const successAlert = document.getElementById('successAlert');
const successAlertMessage = document.getElementById('successAlertMessage');
const closeAlert = document.getElementById('closeAlert');
const adminEmailEl = document.getElementById('adminEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize settings page
function initSettingsPage() {
  // Check if user is logged in
  if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'index.html';
    return;
  }
  
  // Display admin email
  const adminEmail = localStorage.getItem('adminEmail');
  if (adminEmail) {
    adminEmailEl.textContent = adminEmail;
    email.value = adminEmail;
  }
  
  // Load settings data
  loadSettingsData();
  
  // Set up event listeners
  setupEventListeners();
}

// Load settings data
function loadSettingsData() {
  // In a real app, this would fetch data from a server
  // For now, we'll use localStorage
  
  // Load profile data
  const adminName = localStorage.getItem('adminName');
  if (adminName) {
    fullName.value = adminName;
  }
  
  const adminPhone = localStorage.getItem('adminPhone');
  if (adminPhone) {
    phone.value = adminPhone;
  }
  
  const adminProfileImage = localStorage.getItem('adminProfileImage');
  if (adminProfileImage) {
    profileImage.src = adminProfileImage;
  }
  
  // Load notification settings
  const notifications = JSON.parse(localStorage.getItem('adminNotifications')) || {
    email: true,
    payment: true,
    deleteRequest: true
  };
  
  emailNotifications.checked = notifications.email;
  paymentNotifications.checked = notifications.payment;
  deleteRequestNotifications.checked = notifications.deleteRequest;
}

// Save profile data
function saveProfileData(e) {
  e.preventDefault();
  
  // Validate form
  if (!fullName.value || !email.value) {
    alert('Please fill all required fields');
    return;
  }
  
  // Save to localStorage
  localStorage.setItem('adminName', fullName.value);
  localStorage.setItem('adminEmail', email.value);
  localStorage.setItem('adminPhone', phone.value);
  
  // Update displayed email
  adminEmailEl.textContent = email.value;
  
  // Show success message
  showSuccessAlert('Profile updated successfully!');
}

// Save security data
function saveSecurityData(e) {
  e.preventDefault();
  
  // Validate form
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    alert('Please fill all required fields');
    return;
  }
  
  // Check if current password is correct (in a real app, this would be validated on the server)
  const storedPassword = localStorage.getItem('adminPassword') || 'admin123';
  if (currentPassword.value !== storedPassword) {
    alert('Current password is incorrect');
    return;
  }
  
  // Check if new passwords match
  if (newPassword.value !== confirmPassword.value) {
    alert('New passwords do not match');
    return;
  }
  
  // Save to localStorage
  localStorage.setItem('adminPassword', newPassword.value);
  
  // Clear form
  securityForm.reset();
  
  // Show success message
  showSuccessAlert('Password updated successfully!');
}

// Save notification settings
function saveNotificationSettings(e) {
  e.preventDefault();
  
  // Save to localStorage
  const notifications = {
    email: emailNotifications.checked,
    payment: paymentNotifications.checked,
    deleteRequest: deleteRequestNotifications.checked
  };
  
  localStorage.setItem('adminNotifications', JSON.stringify(notifications));
  
  // Show success message
  showSuccessAlert('Notification settings updated successfully!');
}

// Handle profile image upload
function handleProfileImageUpload() {
  const file = profileImageUpload.files[0];
  
  if (file) {
    // In a real app, this would upload the file to a server
    // For now, we'll use a FileReader to display the image locally
    const reader = new FileReader();
    
    reader.onload = function(e) {
      profileImage.src = e.target.result;
      localStorage.setItem('adminProfileImage', e.target.result);
    };
    
    reader.readAsDataURL(file);
  }
}

// Show success alert
function showSuccessAlert(message) {
  successAlertMessage.textContent = message;
  successAlert.style.display = 'flex';
  
  // Hide alert after 3 seconds
  setTimeout(function() {
    successAlert.style.display = 'none';
  }, 3000);
}

// Set up event listeners
function setupEventListeners() {
  // Form submissions
  profileForm.addEventListener('submit', saveProfileData);
  securityForm.addEventListener('submit', saveSecurityData);
  notificationForm.addEventListener('submit', saveNotificationSettings);
  
  // Profile image upload
  profileImageUpload.addEventListener('change', handleProfileImageUpload);
  
  // Close alert
  closeAlert.addEventListener('click', function() {
    successAlert.style.display = 'none';
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

// Initialize settings page when DOM is loaded
document.addEventListener('DOMContentLoaded', initSettingsPage);