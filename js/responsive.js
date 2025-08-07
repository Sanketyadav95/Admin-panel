// Responsive functionality for all pages

document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const toggleSidebarBtn = document.querySelector('.toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  // Mobile menu elements
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');
  const mobileSidebar = document.querySelector('.mobile-sidebar');
  
  // Fix dashboard spacing issues
  const fixDashboardSpacing = () => {
    // Fix spacing in dashboard cards
    if (window.innerWidth <= 576) {
      const dashboardCards = document.querySelector('.dashboard-cards');
      if (dashboardCards) {
        dashboardCards.style.margin = '0';
        dashboardCards.style.padding = '0';
      }
      
      // Fix spacing in card body
      const cardBodies = document.querySelectorAll('.card-body');
      cardBodies.forEach(body => {
        body.style.padding = '10px 0';
      });
    }
  };
  
  // Call the function on load
  fixDashboardSpacing();
  
  // Toggle sidebar when button is clicked
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', function() {
      sidebar.classList.toggle('active');
      mainContent.classList.toggle('pushed');
      
      // Adjust main content width when sidebar is toggled
      if (window.innerWidth <= 768) {
        if (sidebar.classList.contains('active')) {
          mainContent.style.width = '100%';
          mainContent.style.marginLeft = '0';
        } else {
          mainContent.style.width = '100%';
          mainContent.style.marginLeft = '0';
        }
      }
    });
  }
  
  // Show mobile sidebar when menu button is clicked
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileSidebar.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
      
      // Ensure main content takes full width
      if (mainContent) {
        mainContent.style.width = '100%';
        mainContent.style.marginLeft = '0';
      }
    });
  }
  
  // Hide mobile sidebar when close button is clicked
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', function() {
      mobileSidebar.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    });
  }
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', function(event) {
    const isMobile = window.innerWidth <= 768;
    const isClickInsideSidebar = sidebar && sidebar.contains(event.target);
    const isClickOnToggleBtn = toggleSidebarBtn && toggleSidebarBtn.contains(event.target);
    const isClickOnMobileMenuBtn = mobileMenuBtn && mobileMenuBtn.contains(event.target);
    
    if (isMobile && sidebar && sidebar.classList.contains('active') && 
        !isClickInsideSidebar && !isClickOnToggleBtn && !isClickOnMobileMenuBtn) {
      sidebar.classList.remove('active');
      mainContent.classList.remove('pushed');
    }
    
    // Close mobile sidebar when clicking outside
    const isClickInsideMobileSidebar = mobileSidebar && mobileSidebar.contains(event.target);
    if (mobileSidebar && mobileSidebar.classList.contains('active') && 
        !isClickInsideMobileSidebar && !isClickOnMobileMenuBtn) {
      mobileSidebar.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    }
  });
  
  // Handle window resize events
  window.addEventListener('resize', function() {
    // Call the spacing fix function on resize
    fixDashboardSpacing();
    
    if (window.innerWidth > 768) {
      // Reset sidebar state on larger screens
      if (sidebar) sidebar.classList.remove('active');
      if (mainContent) {
        mainContent.classList.remove('pushed');
        mainContent.style.width = 'calc(100% - var(--sidebar-width))';
        mainContent.style.marginLeft = 'var(--sidebar-width)';
      }
      if (mobileSidebar) mobileSidebar.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    } else {
      // Ensure main content takes full width on mobile
      if (mainContent) {
        mainContent.style.width = '100%';
        mainContent.style.marginLeft = '0';
      }
    }
  });
});