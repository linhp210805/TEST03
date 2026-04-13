// -- CHUYỂN TRANG VÀ TAB (NAVIGATION & TABS) --

function switchPage(page) {
    // Ẩn tất cả các page
    const pages = document.querySelectorAll('[id^="page-"]');
    pages.forEach(p => p.classList.add('hidden'));

    // Xóa active từ tất cả nav items
    const navItems = document.querySelectorAll('.nav-links li');
    navItems.forEach(item => item.classList.remove('active'));

    // Hiển thị page được chọn và set active cho nav
    if (page === 'overview') {
        document.getElementById('page-overview').classList.remove('hidden');
        document.getElementById('nav-overview').classList.add('active');
        document.getElementById('pageTitle').innerText = 'Tổng quan';
        const event = new Event('resize');
        window.dispatchEvent(event);
    } else if (page === 'borrow') {
        document.getElementById('page-borrow').classList.remove('hidden');
        document.getElementById('nav-borrow').classList.add('active');
        document.getElementById('pageTitle').innerText = 'Mượn sách';
    } else if (page === 'return') {
        document.getElementById('page-return').classList.remove('hidden');
        document.getElementById('nav-return').classList.add('active');
        document.getElementById('pageTitle').innerText = 'Quản lý trả sách';
    } else if (page === 'books') {
        document.getElementById('page-books').classList.remove('hidden');
        document.getElementById('nav-books').classList.add('active');
        document.getElementById('pageTitle').innerText = 'Quản lý sách';
    } else if (page === 'users') {
        document.getElementById('page-users').classList.remove('hidden');
        document.getElementById('nav-users').classList.add('active');
        document.getElementById('pageTitle').innerText = 'Người dùng';
    } else if (page === 'reports') {
        document.getElementById('page-reports').classList.remove('hidden');
        document.getElementById('nav-reports').classList.add('active');
        document.getElementById('pageTitle').innerText = 'Báo cáo';
    }
}

function switchTab(clickedTab, targetId) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => pane.classList.add('hidden'));

    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        const rows = pane.querySelectorAll('tbody tr');
        rows.forEach(row => { row.style.display = ''; });
    });

    clickedTab.classList.add('active');
    document.getElementById(targetId).classList.remove('hidden');
}
