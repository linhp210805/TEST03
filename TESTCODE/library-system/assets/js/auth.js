// -- LỚP XỬ LÝ XÁC THỰC (AUTH LOGIC) --

function showModal(modalId) {
    const forms = document.querySelectorAll('.auth-form-container');
    forms.forEach((form) => form.classList.remove('active'));

    const authPage = document.getElementById('authPage');
    if (authPage) authPage.classList.add('active');

    const targetForm = document.getElementById(modalId);
    if (targetForm) targetForm.classList.add('active');
}

function handleLogin(e) {
    if(e) e.preventDefault();
    
    localStorage.setItem('due_logged_in', 'true');

    // Ẩn auth page
    const authPage = document.getElementById('authPage');
    if (authPage) authPage.classList.remove('active');
    
    // Hiển thị dashboard
    const dashboardPage = document.getElementById('dashboardPage');
    if (dashboardPage) dashboardPage.classList.remove('hidden');

    // Khởi tạo trang overview
    switchPage('overview');
}

function handleLogout() {
    localStorage.removeItem('due_logged_in');
    
    // Ẩn dashboard
    const dashboardPage = document.getElementById('dashboardPage');
    if (dashboardPage) dashboardPage.classList.add('hidden');

    // Hiển thị trang login
    showModal('loginModal');
}

function initAuthState() {
    const isLoggedIn = localStorage.getItem('due_logged_in') === 'true';
    const authPage = document.getElementById('authPage');
    const dashboardPage = document.getElementById('dashboardPage');

    if (isLoggedIn) {
        if (authPage) authPage.classList.remove('active');
        if (dashboardPage) dashboardPage.classList.remove('hidden');
        switchPage('overview');
        return;
    }

    if (dashboardPage) dashboardPage.classList.add('hidden');
    showModal('loginModal');
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthState();
});
