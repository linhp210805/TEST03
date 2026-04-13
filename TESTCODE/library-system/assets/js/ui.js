// -- CÁC THÀNH PHẦN GIAO DIỆN CHUNG (UI COMPONENTS) --

let currentRowElement = null;

// -- SEARCH LOGIC --
function performSearch(showToastMessage = true) {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase().trim();

    const activeTabPane = document.querySelector('.tab-pane.active');
    if (!activeTabPane) return;

    const rows = activeTabPane.querySelectorAll('tbody tr');
    let matchCount = 0;

    rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(query)) {
            row.style.display = '';
            matchCount++;
        } else {
            row.style.display = 'none';
        }
    });

    if (showToastMessage && query !== '') {
        if (matchCount > 0) {
            showToast('success', `Tìm thấy ${matchCount} kết quả phù hợp.`);
        } else {
            showToast('error', `Không tìm thấy kết quả nào cho "${query}".`);
        }
    }
}

function resetSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        const rows = pane.querySelectorAll('tbody tr');
        rows.forEach(row => { row.style.display = ''; });
    });
}

// -- ACTION POPUPS LOGIC --
function openPopup(popupId, btnElement) {
    if (btnElement) {
        currentRowElement = btnElement.closest('tr');
    } else {
        currentRowElement = null;
    }

    const overlay = document.getElementById('popupOverlay');
    const modals = document.querySelectorAll('.popup-modal');

    modals.forEach(modal => modal.classList.remove('active'));

    overlay.classList.add('active');
    document.getElementById(popupId).classList.add('active');
}

function closePopup() {
    const overlay = document.getElementById('popupOverlay');
    const modals = document.querySelectorAll('.popup-modal');

    overlay.classList.remove('active');
    modals.forEach(modal => modal.classList.remove('active'));
}

function confirmAction(message) {
    if (currentRowElement) {
        currentRowElement.remove();
        currentRowElement = null;
    }
    showToast('success', message);
    closePopup();
}

// -- TOAST NOTIFICATIONS --
function showToast(type, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? "<i class='bx bx-check-circle' style='font-size:20px'></i>" : "<i class='bx bx-x-circle' style='font-size:20px'></i>";
    toast.innerHTML = `${icon} <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 3000);
}
