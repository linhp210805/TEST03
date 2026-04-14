document.addEventListener("DOMContentLoaded", function () {
    const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('library-system/') || !window.location.pathname.includes('/templates/');
    const basePath = isRoot ? '' : '../../../';

    const sidebarHTML = `
        <div class="sidebar-header">
            <div class="logo">
                <span class="logo-text">DUE</span>
            </div>
            <h2>Thư viện DUE</h2>
        </div>
        <ul class="nav-links">
            <li id="nav-overview"><a href="${basePath}index.html"><i class='bx bxs-grid-alt'></i> Tổng quan</a></li>
            <li id="nav-borrow"><a href="${basePath}templates/pages/circulation/borrow.html"><i class='bx bx-book-reader'></i> Mượn sách</a></li>
            <li id="nav-return"><a href="${basePath}templates/pages/circulation/returns.html"><i class='bx bx-history'></i> Trả sách</a></li>
            <li id="nav-books"><a href="${basePath}templates/pages/books/book-list.html"><i class='bx bx-book'></i> Quản lý sách</a></li>
            <li id="nav-users"><a href="${basePath}templates/pages/users/user-list.html"><i class='bx bx-group'></i> Người dùng</a></li>
            <li id="nav-reports"><a href="${basePath}templates/pages/reports/statistics.html"><i class='bx bx-line-chart'></i> Báo cáo</a></li>
        </ul>
        <div class="logout-wrapper">
            <a href="${basePath}index.html" class="logout-btn" onclick="if(typeof handleLogout === 'function') handleLogout();"><i class='bx bx-log-out'></i> Đăng xuất</a>
        </div>
    `;

    const existingSidebar = document.getElementById('app-sidebar');
    if (existingSidebar) {
        existingSidebar.innerHTML = sidebarHTML;
        
        const currentPath = window.location.pathname;
        const currentURL = window.location.href;

        const isIndexPage = currentURL.includes('index.html')
            || currentPath.endsWith('/')
            || currentPath.endsWith('/library-system')
            || (!currentPath.includes('.html'));

        if (isIndexPage) {
            document.getElementById('nav-overview').classList.add('active');

            const overviewLink = document.querySelector('#nav-overview a');
            if (overviewLink) {
                overviewLink.addEventListener('click', function (event) {
                    event.preventDefault();
                    if (typeof switchPage === 'function') switchPage('overview');
                });
            }
        } else if (currentURL.includes('borrow.html')) {
            document.getElementById('nav-borrow').classList.add('active');
        } else if (currentURL.includes('returns.html')) {
            document.getElementById('nav-return').classList.add('active');
        } else if (currentURL.includes('book-list.html')) {
            document.getElementById('nav-books').classList.add('active');
        } else if (currentURL.includes('user-list.html')) {
            document.getElementById('nav-users').classList.add('active');
        } else if (currentURL.includes('statistics.html')) {
            document.getElementById('nav-reports').classList.add('active');
        }
    }
});
