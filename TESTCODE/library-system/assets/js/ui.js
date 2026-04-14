// -- CÁC THÀNH PHẦN GIAO DIỆN CHUNG (UI COMPONENTS) --

let currentRowElement = null;
let returnFormDirty = false;
let overdueFineValue = 0;

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

function closePopup(forceClose = false) {
    if (!forceClose) {
        const returnPopup = document.getElementById('popup-return');
        if (returnPopup && returnPopup.classList.contains('active')) {
            requestCloseReturnPopup();
            return;
        }
    }

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

function formatCurrency(value) {
    return `${new Intl.NumberFormat('vi-VN').format(Math.max(0, value || 0))}đ`;
}

function getSelectedRadioValue(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
}

function isReturnEligibleStatus(status) {
    return status === 'Đang mượn' || status === 'Quá hạn';
}

function markReturnConditionError(showError) {
    const conditionGroup = document.getElementById('returnConditionGroup');
    const conditionError = document.getElementById('returnConditionError');
    if (!conditionGroup || !conditionError) return;

    conditionGroup.classList.toggle('error', showError);
    conditionError.classList.toggle('hidden', !showError);
}

function resetReturnFormState() {
    const returnConditions = document.querySelectorAll('input[name="returnCondition"]');
    const damageLevels = document.querySelectorAll('input[name="damageLevel"]');
    returnConditions.forEach(input => { input.checked = false; });
    damageLevels.forEach(input => { input.checked = false; });

    const damageDescription = document.getElementById('damageDescription');
    if (damageDescription) damageDescription.value = '';

    const damageSection = document.getElementById('damageSection');
    if (damageSection) damageSection.classList.add('hidden');

    markReturnConditionError(false);
    returnFormDirty = false;
    updateReturnFeeSummary();
}

function updateReturnFeeSummary() {
    const isDamaged = getSelectedRadioValue('returnCondition') === 'damaged';
    const selectedDamageLevel = getSelectedRadioValue('damageLevel');
    const damageFeeMap = {
        light: 30000,
        medium: 70000,
        severe: 120000
    };

    const damageFee = isDamaged ? (damageFeeMap[selectedDamageLevel] || 0) : 0;
    const totalFine = overdueFineValue + damageFee;

    const damageFeeValue = document.getElementById('damageFeeValue');
    const overdueFeeValue = document.getElementById('overdueFeeValue');
    const overdueSummaryValue = document.getElementById('overdueSummaryValue');
    const damageSummaryValue = document.getElementById('damageSummaryValue');
    const totalFineValue = document.getElementById('totalFineValue');
    const overdueSummaryRow = document.getElementById('overdueSummaryRow');
    const damageSummaryRow = document.getElementById('damageSummaryRow');

    if (damageFeeValue) damageFeeValue.innerText = formatCurrency(damageFee);
    if (overdueFeeValue) overdueFeeValue.innerText = formatCurrency(overdueFineValue);
    if (overdueSummaryValue) overdueSummaryValue.innerText = formatCurrency(overdueFineValue);
    if (damageSummaryValue) damageSummaryValue.innerText = formatCurrency(damageFee);
    if (totalFineValue) totalFineValue.innerText = formatCurrency(totalFine);

    if (overdueSummaryRow) overdueSummaryRow.classList.toggle('hidden', overdueFineValue <= 0);
    if (damageSummaryRow) damageSummaryRow.classList.toggle('hidden', !isDamaged);
}

function bindReturnConditionEvents() {
    const returnConditionInputs = document.querySelectorAll('input[name="returnCondition"]');
    const damageLevelInputs = document.querySelectorAll('input[name="damageLevel"]');
    const damageDescription = document.getElementById('damageDescription');

    returnConditionInputs.forEach(input => {
        input.addEventListener('change', () => {
            const damageSection = document.getElementById('damageSection');
            const isDamaged = getSelectedRadioValue('returnCondition') === 'damaged';
            if (damageSection) damageSection.classList.toggle('hidden', !isDamaged);
            markReturnConditionError(false);
            returnFormDirty = true;
            updateReturnFeeSummary();
        });
    });

    damageLevelInputs.forEach(input => {
        input.addEventListener('change', () => {
            returnFormDirty = true;
            updateReturnFeeSummary();
        });
    });

    if (damageDescription) {
        damageDescription.addEventListener('input', () => {
            returnFormDirty = true;
        });
    }
}

function openReturnPopup(rowElement) {
    if (!rowElement) return;

    const status = rowElement.dataset.status || '';
    if (!isReturnEligibleStatus(status)) {
        showToast('error', 'Chỉ bản ghi Đang mượn hoặc Quá hạn mới được xác nhận trả.');
        return;
    }

    currentRowElement = rowElement;

    const bookCodeEl = document.getElementById('returnBookCode');
    const bookTitleEl = document.getElementById('returnBookTitle');
    const borrowerEl = document.getElementById('returnBorrower');
    const dueDateEl = document.getElementById('returnDueDate');
    const overdueSection = document.getElementById('overdueSection');
    const overdueDaysValue = document.getElementById('overdueDaysValue');
    const overdueRateValue = document.getElementById('overdueRateValue');

    if (bookCodeEl) bookCodeEl.innerText = rowElement.dataset.bookCode || '-';
    if (bookTitleEl) bookTitleEl.innerText = rowElement.dataset.bookTitle || '-';
    if (borrowerEl) borrowerEl.innerText = rowElement.dataset.borrower || '-';
    if (dueDateEl) dueDateEl.innerText = rowElement.dataset.dueDate || '-';

    const overdueDays = Number(rowElement.dataset.overdueDays || 0);
    const overdueRate = Number(rowElement.dataset.overdueRate || 0);
    overdueFineValue = overdueDays > 0 ? overdueDays * overdueRate : 0;

    if (overdueDaysValue) overdueDaysValue.innerText = `${overdueDays} ngày`;
    if (overdueRateValue) overdueRateValue.innerText = formatCurrency(overdueRate);
    if (overdueSection) overdueSection.classList.toggle('hidden', overdueDays <= 0);

    resetReturnFormState();
    openPopup('popup-return');
}

function requestCloseReturnPopup() {
    const hasCondition = !!getSelectedRadioValue('returnCondition');
    const hasDamageLevel = !!getSelectedRadioValue('damageLevel');
    const damageDescription = document.getElementById('damageDescription');
    const hasDescription = damageDescription && damageDescription.value.trim() !== '';
    const hasChanged = returnFormDirty || hasCondition || hasDamageLevel || hasDescription;

    if (!hasChanged) {
        closePopup(true);
        return;
    }

    const returnPopup = document.getElementById('popup-return');
    const cancelPopup = document.getElementById('popup-return-cancel-confirm');
    if (returnPopup) returnPopup.classList.remove('active');
    if (cancelPopup) cancelPopup.classList.add('active');
}

function backToReturnPopup() {
    const returnPopup = document.getElementById('popup-return');
    const cancelPopup = document.getElementById('popup-return-cancel-confirm');
    if (cancelPopup) cancelPopup.classList.remove('active');
    if (returnPopup) returnPopup.classList.add('active');
}

function confirmCancelReturnPopup() {
    closePopup(true);
    resetReturnFormState();
}

function submitReturnConfirm() {
    const condition = getSelectedRadioValue('returnCondition');

    if (!condition) {
        markReturnConditionError(true);
        return;
    }

    markReturnConditionError(false);

    try {
        if (!currentRowElement) {
            throw new Error('Missing selected row');
        }

        currentRowElement.dataset.status = 'Đã trả';
        currentRowElement.dataset.overdueDays = '0';

        const statusCell = currentRowElement.querySelector('td:nth-child(7)');
        const actionCell = currentRowElement.querySelector('td:nth-child(8)');

        if (!statusCell || !actionCell) {
            throw new Error('Invalid table structure');
        }

        statusCell.innerHTML = '<span class="badge">Đã trả</span>';
        actionCell.innerHTML = '<span class="action-disabled">Không khả dụng</span>';
        currentRowElement.classList.remove('row-overdue');

        closePopup(true);
        resetReturnFormState();
        showToast('success', 'Xác nhận trả sách thành công');
    } catch (error) {
        showToast('error', 'Xác nhận trả sách thất bại');
    }
}

function initReturnFlow() {
    const triggers = document.querySelectorAll('.return-confirm-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const row = trigger.closest('tr.return-record');
            openReturnPopup(row);
        });
    });

    const rows = document.querySelectorAll('tr.return-record');
    rows.forEach(row => {
        const status = row.dataset.status || '';
        const actionCell = row.querySelector('td:nth-child(8)');
        if (!actionCell) return;

        if (!isReturnEligibleStatus(status)) {
            actionCell.innerHTML = '<span class="action-disabled">Không khả dụng</span>';
            row.classList.remove('row-overdue');
        }
    });

    bindReturnConditionEvents();
}

document.addEventListener('DOMContentLoaded', initReturnFlow);

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
