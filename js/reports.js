// Reports JavaScript

// DOM Elements
const dateRangeFilter = document.getElementById('dateRangeFilter');
const customDateRange = document.getElementById('customDateRange');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const applyDateFilter = document.getElementById('applyDateFilter');
const exportCSV = document.getElementById('exportCSV');
const exportPDF = document.getElementById('exportPDF');
const printReport = document.getElementById('printReport');
const roleChartCanvas = document.getElementById('roleChart');
const trendChartCanvas = document.getElementById('trendChart');
const totalAmountEl = document.getElementById('totalAmount');
const avgPaymentEl = document.getElementById('avgPayment');
const highestPaymentEl = document.getElementById('highestPayment');
const totalTransactionsEl = document.getElementById('totalTransactions');
const reportTable = document.getElementById('reportTable');
const adminEmailEl = document.getElementById('adminEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Chart instances
let roleChart;
let trendChart;

// Current date range
let currentStartDate = new Date();
let currentEndDate = new Date();

// Initialize reports page
function initReportsPage() {
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
  
  // Set default date range (last 30 days)
  currentStartDate.setDate(currentStartDate.getDate() - 30);
  startDate.value = formatDateForInput(currentStartDate);
  endDate.value = formatDateForInput(currentEndDate);
  
  // Load reports data
  loadReportsData();
  
  // Set up event listeners
  setupEventListeners();
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Load reports data
function loadReportsData() {
  // In a real app, this would fetch data from a server
  // For now, we'll use localStorage or generate dummy data
  
  // Check if we have data in localStorage
  let payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // If no data exists, redirect to dashboard to generate dummy data
  if (payments.length === 0) {
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Filter payments by date range
  payments = filterPaymentsByDateRange(payments, currentStartDate, currentEndDate);
  
  // Generate reports
  generateRoleChart(payments);
  generateTrendChart(payments);
  generateSummaryStats(payments);
  generateReportTable(payments);
}

// Filter payments by date range
function filterPaymentsByDateRange(payments, startDate, endDate) {
  // Convert dates to timestamps for comparison
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime() + (24 * 60 * 60 * 1000 - 1); // End of the day
  
  return payments.filter(payment => {
    const paymentDate = new Date(payment.date).getTime();
    return paymentDate >= startTimestamp && paymentDate <= endTimestamp;
  });
}

// Generate role-based payment chart
function generateRoleChart(payments) {
  // Get users, seniors, and leaders
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const seniors = JSON.parse(localStorage.getItem('seniors')) || [];
  const leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  
  // Create a map of user emails to roles
  const userRoles = {};
  
  users.forEach(user => {
    userRoles[user.email] = 'User';
  });
  
  seniors.forEach(senior => {
    userRoles[senior.email] = 'Senior';
  });
  
  leaders.forEach(leader => {
    userRoles[leader.email] = 'Leader';
  });
  
  // Calculate total amount by role
  const roleAmounts = {
    'User': 0,
    'Senior': 0,
    'Leader': 0,
    'Admin': 0,
    'Other': 0
  };
  
  payments.forEach(payment => {
    // Use sender's email to determine role
    const senderEmail = payment.customerEmail || payment.sender;
    const role = userRoles[senderEmail] || 'Other';
    
    roleAmounts[role] += payment.amount;
  });
  
  // Prepare data for chart
  const labels = Object.keys(roleAmounts);
  const data = Object.values(roleAmounts);
  const backgroundColor = [
    '#4e73df',
    '#1cc88a',
    '#36b9cc',
    '#f6c23e',
    '#e74a3b'
  ];
  
  // Destroy existing chart if it exists
  if (roleChart) {
    roleChart.destroy();
  }
  
  // Create new chart
  roleChart = new Chart(roleChartCanvas, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColor,
        hoverBackgroundColor: backgroundColor,
        hoverBorderColor: 'rgba(234, 236, 244, 1)'
      }]
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: 'rgb(255,255,255)',
        bodyFontColor: '#858796',
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, data) {
            const value = data.datasets[0].data[tooltipItem.index];
            return data.labels[tooltipItem.index] + ': ₹' + value.toLocaleString();
          }
        }
      },
      legend: {
        display: true,
        position: 'bottom'
      },
      cutoutPercentage: 0
    }
  });
}

// Generate monthly payment trend chart
function generateTrendChart(payments) {
  // Group payments by month
  const monthlyPayments = {};
  
  payments.forEach(payment => {
    const date = new Date(payment.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyPayments[monthYear]) {
      monthlyPayments[monthYear] = 0;
    }
    
    monthlyPayments[monthYear] += payment.amount;
  });
  
  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyPayments).sort();
  
  // Format month labels
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const labels = sortedMonths.map(monthYear => {
    const [year, month] = monthYear.split('-');
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  });
  
  // Prepare data for chart
  const data = sortedMonths.map(monthYear => monthlyPayments[monthYear]);
  
  // Destroy existing chart if it exists
  if (trendChart) {
    trendChart.destroy();
  }
  
  // Create new chart
  trendChart = new Chart(trendChartCanvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Payment Amount',
        backgroundColor: '#4e73df',
        hoverBackgroundColor: '#2e59d9',
        borderColor: '#4e73df',
        data: data
      }]
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 6
          },
          maxBarThickness: 25
        }],
        yAxes: [{
          ticks: {
            min: 0,
            maxTicksLimit: 5,
            padding: 10,
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          },
          gridLines: {
            color: 'rgb(234, 236, 244)',
            zeroLineColor: 'rgb(234, 236, 244)',
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }]
      },
      tooltips: {
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        backgroundColor: 'rgb(255,255,255)',
        bodyFontColor: '#858796',
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem) {
            return 'Amount: ₹' + tooltipItem.yLabel.toLocaleString();
          }
        }
      }
    }
  });
}

// Generate summary statistics
function generateSummaryStats(payments) {
  // Calculate total amount
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate average payment
  const avgPayment = payments.length > 0 ? totalAmount / payments.length : 0;
  
  // Find highest payment
  const highestPayment = payments.length > 0 ? 
    Math.max(...payments.map(payment => payment.amount)) : 0;
  
  // Count total transactions
  const totalTransactions = payments.length;
  
  // Update UI
  totalAmountEl.textContent = '₹' + totalAmount.toLocaleString();
  avgPaymentEl.textContent = '₹' + avgPayment.toLocaleString(undefined, { maximumFractionDigits: 2 });
  highestPaymentEl.textContent = '₹' + highestPayment.toLocaleString();
  totalTransactionsEl.textContent = totalTransactions;
}

// Generate report table
function generateReportTable(payments) {
  // Clear table
  reportTable.innerHTML = '';
  
  if (payments.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" class="text-center">No payments found in the selected date range</td>';
    reportTable.appendChild(row);
    return;
  }
  
  // Sort payments by date (newest first)
  payments.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Add rows to table
  payments.forEach(payment => {
    const row = document.createElement('tr');
    
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
    
    row.innerHTML = `
      <td>${payment.id}</td>
      <td>${payment.sender}</td>
      <td>${payment.receiver}</td>
      <td>${formattedAmount}</td>
      <td>${formattedDate}</td>
      <td>${statusBadge}</td>
    `;
    
    reportTable.appendChild(row);
  });
}

// Export report to CSV
function exportReportToCSV() {
  // Get payments
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Filter payments by date range
  const filteredPayments = filterPaymentsByDateRange(payments, currentStartDate, currentEndDate);
  
  if (filteredPayments.length === 0) {
    alert('No data to export!');
    return;
  }
  
  // Create CSV content
  let csvContent = 'Payment ID,Razorpay ID,Sender,Receiver,Amount,Date,Status\n';
  
  filteredPayments.forEach(payment => {
    // Format date
    const date = new Date(payment.date);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add row
    csvContent += `"${payment.id}","${payment.razorpayId}","${payment.sender}","${payment.receiver}","${payment.amount}","${formattedDate}","${payment.status}"\n`;
  });
  
  // Create download link
  const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `payment_report_${formatDateForInput(currentStartDate)}_to_${formatDateForInput(currentEndDate)}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
}

// Export report to PDF
function exportReportToPDF() {
  // Get payments
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Filter payments by date range
  const filteredPayments = filterPaymentsByDateRange(payments, currentStartDate, currentEndDate);
  
  if (filteredPayments.length === 0) {
    alert('No data to export!');
    return;
  }
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Payment Report', 14, 22);
  
  // Add date range
  doc.setFontSize(12);
  doc.text(`Date Range: ${currentStartDate.toLocaleDateString()} to ${currentEndDate.toLocaleDateString()}`, 14, 30);
  
  // Add summary statistics
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const avgPayment = filteredPayments.length > 0 ? totalAmount / filteredPayments.length : 0;
  const highestPayment = filteredPayments.length > 0 ? 
    Math.max(...filteredPayments.map(payment => payment.amount)) : 0;
  
  doc.text(`Total Amount: ₹${totalAmount.toLocaleString()}`, 14, 40);
  doc.text(`Average Payment: ₹${avgPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 14, 48);
  doc.text(`Highest Payment: ₹${highestPayment.toLocaleString()}`, 14, 56);
  doc.text(`Total Transactions: ${filteredPayments.length}`, 14, 64);
  
  // Add table header
  doc.setFontSize(10);
  doc.text('Payment ID', 14, 80);
  doc.text('Sender', 50, 80);
  doc.text('Receiver', 90, 80);
  doc.text('Amount', 130, 80);
  doc.text('Date', 150, 80);
  doc.text('Status', 180, 80);
  
  // Add horizontal line
  doc.line(14, 82, 196, 82);
  
  // Add table rows
  let y = 90;
  filteredPayments.slice(0, 20).forEach(payment => { // Limit to 20 rows per page
    // Format date
    const date = new Date(payment.date);
    const formattedDate = date.toLocaleDateString();
    
    // Format amount
    const formattedAmount = '₹' + payment.amount.toLocaleString();
    
    // Add row
    doc.text(payment.id.substring(0, 8), 14, y);
    doc.text(payment.sender.substring(0, 15), 50, y);
    doc.text(payment.receiver.substring(0, 15), 90, y);
    doc.text(formattedAmount, 130, y);
    doc.text(formattedDate, 150, y);
    doc.text(payment.status, 180, y);
    
    y += 8;
    
    // Add new page if needed
    if (y > 280) {
      doc.addPage();
      y = 20;
      
      // Add table header on new page
      doc.text('Payment ID', 14, y);
      doc.text('Sender', 50, y);
      doc.text('Receiver', 90, y);
      doc.text('Amount', 130, y);
      doc.text('Date', 150, y);
      doc.text('Status', 180, y);
      
      // Add horizontal line
      doc.line(14, y + 2, 196, y + 2);
      
      y += 10;
    }
  });
  
  // Save PDF
  doc.save(`payment_report_${formatDateForInput(currentStartDate)}_to_${formatDateForInput(currentEndDate)}.pdf`);
}

// Print report
function printReportTable() {
  // Create a new window
  const printWindow = window.open('', '_blank');
  
  // Get payments
  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  
  // Filter payments by date range
  const filteredPayments = filterPaymentsByDateRange(payments, currentStartDate, currentEndDate);
  
  if (filteredPayments.length === 0) {
    alert('No data to print!');
    printWindow.close();
    return;
  }
  
  // Calculate summary statistics
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const avgPayment = filteredPayments.length > 0 ? totalAmount / filteredPayments.length : 0;
  const highestPayment = filteredPayments.length > 0 ? 
    Math.max(...filteredPayments.map(payment => payment.amount)) : 0;
  
  // Create HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .summary { margin: 20px 0; }
        .summary div { margin-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .success { color: green; }
        .pending { color: orange; }
        .failed { color: red; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Payment Report</h1>
      <div>Date Range: ${currentStartDate.toLocaleDateString()} to ${currentEndDate.toLocaleDateString()}</div>
      
      <div class="summary">
        <div><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString()}</div>
        <div><strong>Average Payment:</strong> ₹${avgPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        <div><strong>Highest Payment:</strong> ₹${highestPayment.toLocaleString()}</div>
        <div><strong>Total Transactions:</strong> ${filteredPayments.length}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  // Add table rows
  filteredPayments.forEach(payment => {
    // Format date
    const date = new Date(payment.date);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format amount
    const formattedAmount = '₹' + payment.amount.toLocaleString();
    
    // Create status class
    const statusClass = payment.status;
    
    htmlContent += `
      <tr>
        <td>${payment.id}</td>
        <td>${payment.sender}</td>
        <td>${payment.receiver}</td>
        <td>${formattedAmount}</td>
        <td>${formattedDate}</td>
        <td class="${statusClass}">${payment.status}</td>
      </tr>
    `;
  });
  
  htmlContent += `
        </tbody>
      </table>
      
      <button onclick="window.print(); return false;">Print Report</button>
    </body>
    </html>
  `;
  
  // Write HTML to the new window
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// Set up event listeners
function setupEventListeners() {
  // Date range filter change
  document.getElementById('reportDateRange').addEventListener('change', function() {
    const value = this.value;
    
    if (value === 'custom') {
      document.getElementById('customDateRange').style.display = 'flex';
    } else {
      document.getElementById('customDateRange').style.display = 'none';
      
      // Set date range based on selection
      const today = new Date();
      currentEndDate = new Date(today);
      
      if (value === 'month') {
        currentStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
      } else if (value === 'quarter') {
        const quarter = Math.floor(today.getMonth() / 3);
        currentStartDate = new Date(today.getFullYear(), quarter * 3, 1);
      } else if (value === 'year') {
        currentStartDate = new Date(today.getFullYear(), 0, 1);
      }
      
      // Load reports data with new date range
      loadReportsData();
    }
  });
  
  // Generate report button
  document.getElementById('generateReportBtn').addEventListener('click', function() {
    const startDateValue = document.getElementById('startDate').value;
    const endDateValue = document.getElementById('endDate').value;
    
    if (!startDateValue || !endDateValue) {
      alert('Please select both start and end dates');
      return;
    }
    
    currentStartDate = new Date(startDateValue);
    currentEndDate = new Date(endDateValue);
    
    // Validate date range
    if (currentStartDate > currentEndDate) {
      alert('Start date cannot be after end date');
      return;
    }
    
    // Load reports data with new date range
    loadReportsData();
  });
  
  // Apply custom date filter
  applyDateFilter.addEventListener('click', function() {
    const startDateValue = startDate.value;
    const endDateValue = endDate.value;
    
    if (!startDateValue || !endDateValue) {
      alert('Please select both start and end dates');
      return;
    }
    
    currentStartDate = new Date(startDateValue);
    currentEndDate = new Date(endDateValue);
    
    // Validate date range
    if (currentStartDate > currentEndDate) {
      alert('Start date cannot be after end date');
      return;
    }
    
    // Load reports data with new date range
    loadReportsData();
  });
  
  // Export buttons
  exportCSV.addEventListener('click', exportReportToCSV);
  exportPDF.addEventListener('click', exportReportToPDF);
  printReport.addEventListener('click', printReportTable);
  
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

// Initialize reports page when DOM is loaded
document.addEventListener('DOMContentLoaded', initReportsPage);