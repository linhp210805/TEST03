// -- CÁC THÀNH PHẦN GIAO DIỆN CHUNG (UI COMPONENTS) --

let currentRowElement = null;
let returnFormDirty = false;
let overdueFineValue = 0;
let fineFormDirty = false;
let activeFineHasPayableItems = false;

const fineDetailsByRef = {
    FHS001: [
        {
            bookCode: 'KT001',
            bookTitle: 'Kinh tế học vi mô',
            fineType: 'Trễ hạn',
            reason: 'Quá hạn 5 ngày',
            amount: 50000,
            createdDate: '18/1/2026',
            loanCode: 'PM001',
            status: 'Chưa thanh toán'
        },
        {
            bookCode: 'KT001',
            bookTitle: 'Kinh tế học vi mô',
            fineType: 'Hư hỏng',
            reason: 'Rách bìa sách',
            amount: 80000,
            createdDate: '18/1/2026',
            loanCode: 'PM001',
            status: 'Đã thanh toán'
        }
    ],
    FHS002: [
        {
            bookCode: 'TC001',
            bookTitle: 'Nguyên lý kế toán',
            fineType: 'Trễ hạn',
            reason: 'Quá hạn 8 ngày',
            amount: 80000,
            createdDate: '20/1/2026',
            loanCode: 'PM002',
            status: 'Chưa thanh toán'
        }
    ]
};

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

        const finePopup = document.getElementById('popup-fine');
        if (finePopup && finePopup.classList.contains('active')) {
            requestCloseFinePopup();
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

function markPaymentMethodError(showError) {
    const paymentMethodGroup = document.getElementById('paymentMethodGroup');
    const paymentMethodError = document.getElementById('paymentMethodError');
    if (!paymentMethodGroup || !paymentMethodError) return;

    paymentMethodGroup.classList.toggle('error', showError);
    paymentMethodError.classList.toggle('hidden', !showError);
}

function getFineTypeBadge(type) {
    if (type === 'Trễ hạn') return '<span class="badge badge-light-blue">Trễ hạn</span>';
    if (type === 'Hư hỏng') return '<span class="badge badge-light-orange">Hư hỏng</span>';
    if (type === 'Đền sách') return '<span class="badge badge-light-red">Đền sách</span>';
    return `<span class="badge">${type}</span>`;
}

function resetFineFormState() {
    document.querySelectorAll('input[name="payment"]').forEach(input => {
        input.checked = false;
    });
    markPaymentMethodError(false);
    fineFormDirty = false;
}

function setFinePopupErrorState(showError) {
    const errorBox = document.getElementById('fineUserErrorBox');
    const infoBox = document.getElementById('fineUserInfoBox');
    const tableWrapper = document.getElementById('fineDetailTableWrapper');
    const paymentBox = document.getElementById('finePaymentBox');
    const totalBar = document.getElementById('fineTotalBar');

    if (errorBox) errorBox.classList.toggle('hidden', !showError);
    if (infoBox) infoBox.classList.toggle('hidden', showError);
    if (tableWrapper) tableWrapper.classList.toggle('hidden', showError);
    if (paymentBox) paymentBox.classList.toggle('hidden', showError);
    if (totalBar) totalBar.classList.toggle('hidden', showError);
}

function renderFineDetails(unpaidItems) {
    const fineDetailBody = document.getElementById('fineDetailBody');
    const fineTotalAmount = document.getElementById('fineTotalAmount');
    if (!fineDetailBody || !fineTotalAmount) return;

    activeFineHasPayableItems = unpaidItems.length > 0;

    if (!unpaidItems.length) {
        fineDetailBody.innerHTML = '<tr><td colspan="8" class="text-center">Không có khoản phạt chưa thanh toán.</td></tr>';
        fineTotalAmount.innerText = formatCurrency(0);
        return;
    }

    fineDetailBody.innerHTML = unpaidItems.map(item => `
        <tr>
            <td>${item.bookCode}</td>
            <td>${item.bookTitle}</td>
            <td>${getFineTypeBadge(item.fineType)}</td>
            <td>${item.reason}</td>
            <td class="text-red font-weight-bold">${formatCurrency(item.amount)}</td>
            <td>${item.createdDate}</td>
            <td>${item.loanCode}</td>
            <td><span class="badge badge-orange-solid">${item.status}</span></td>
        </tr>
    `).join('');

    const total = unpaidItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    fineTotalAmount.innerText = formatCurrency(total);
}

function openFinePopup(rowElement) {
    if (!rowElement) return;

    currentRowElement = rowElement;
    const fineRef = rowElement.dataset.fineRef || '';
    const userName = rowElement.dataset.userName || '';
    const fineUserName = document.getElementById('fineUserName');

    if (fineUserName) fineUserName.innerText = userName || '-';

    const detailItems = fineDetailsByRef[fineRef] || [];
    const unpaidItems = detailItems.filter(item => item.status === 'Chưa thanh toán');

    if (!userName) {
        activeFineHasPayableItems = false;
        setFinePopupErrorState(true);
        openPopup('popup-fine');
        showToast('error', 'Không tìm thấy thông tin người dùng.');
        return;
    }

    setFinePopupErrorState(false);
    renderFineDetails(unpaidItems);
    resetFineFormState();
    openPopup('popup-fine');
}

function requestCloseFinePopup() {
    const selectedMethod = getSelectedRadioValue('payment');
    if (!fineFormDirty && !selectedMethod) {
        closePopup(true);
        return;
    }

    const finePopup = document.getElementById('popup-fine');
    const cancelPopup = document.getElementById('popup-fine-cancel-confirm');
    if (finePopup) finePopup.classList.remove('active');
    if (cancelPopup) cancelPopup.classList.add('active');
}

function backToFinePopup() {
    const finePopup = document.getElementById('popup-fine');
    const cancelPopup = document.getElementById('popup-fine-cancel-confirm');
    if (cancelPopup) cancelPopup.classList.remove('active');
    if (finePopup) finePopup.classList.add('active');
}

function confirmCancelFinePopup() {
    closePopup(true);
    resetFineFormState();
}

function submitFinePayment() {
    if (!activeFineHasPayableItems) {
        showToast('error', 'Xác nhận thanh toán thất bại');
        return;
    }

    const paymentMethod = getSelectedRadioValue('payment');
    if (!paymentMethod) {
        markPaymentMethodError(true);
        return;
    }

    markPaymentMethodError(false);

    try {
        if (!currentRowElement) {
            throw new Error('Missing selected fine row');
        }

        const statusCell = currentRowElement.querySelector('td:nth-child(5)');
        const actionCell = currentRowElement.querySelector('td:nth-child(6)');
        if (!statusCell || !actionCell) {
            throw new Error('Invalid fine table structure');
        }

        statusCell.innerHTML = '<span class="badge">Đã thanh toán</span>';
        actionCell.innerHTML = '<span class="action-disabled">Không khả dụng</span>';

        closePopup(true);
        resetFineFormState();
        showToast('success', 'Xác nhận thanh toán thành công');
    } catch (error) {
        showToast('error', 'Xác nhận thanh toán thất bại');
    }
}

function initFineFlow() {
    const fineTriggers = document.querySelectorAll('.fine-payment-trigger');
    fineTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const row = trigger.closest('tr.fine-record');
            openFinePopup(row);
        });
    });

    const paymentMethodInputs = document.querySelectorAll('input[name="payment"]');
    paymentMethodInputs.forEach(input => {
        input.addEventListener('change', () => {
            fineFormDirty = true;
            markPaymentMethodError(false);
        });
    });
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

document.addEventListener('DOMContentLoaded', () => {
    initReturnFlow();
    initFineFlow();
});

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
