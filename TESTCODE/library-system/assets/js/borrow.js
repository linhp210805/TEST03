/* ================================================================
   borrow.js  –  Quản lý mượn sách (v3)
   ================================================================ */
document.addEventListener('DOMContentLoaded', function () {

    var overlay   = document.getElementById('pmOverlay');
    var searchInput = document.getElementById('borrowSearchInput');
    var searchBtn   = document.getElementById('borrowSearchBtn');
    var addBtn      = document.getElementById('addBorrowBtn');
    var tableBody   = document.getElementById('borrowTableBody');

    if (!tableBody) return;

    /* ════ DỮ LIỆU MẪU ════ */
    var slips = [
        {
            id:1, slipCode:'TC001', userId:'2051010001', userName:'Trần Thị Bình',
            borrowDate:'5/1/2026', dueDate:'19/1/2026',
            status:'Quá hạn', statusClass:'tb-orange',
            books:[
                { code:'MS001', title:'Kinh tế học vi mô', qty:1 },
                { code:'MS002', title:'Toán cao cấp A1',   qty:2 }
            ]
        },
        {
            id:2, slipCode:'TC001', userId:'2051010002', userName:'Trần Bình Na',
            borrowDate:'11/1/2026', dueDate:'19/11/2026',
            status:'Đang mượn', statusClass:'tb-blue',
            books:[{ code:'MS003', title:'Nguyên lý kế toán', qty:1 }]
        },
        {
            id:3, slipCode:'MIS3001', userId:'2051010003', userName:'Hồ Bảo Trần',
            borrowDate:'5/1/2026', dueDate:'19/11/2025',
            status:'Đã trả', statusClass:'tb-green',
            books:[{ code:'MS004', title:'Lịch sử Đảng', qty:1 }]
        },
        {
            id:4, slipCode:'MIS3021', userId:'2051010004', userName:'Nguyễn Bình',
            borrowDate:'5/1/2026', dueDate:'29/8/2026',
            status:'Đang mượn', statusClass:'tb-blue',
            books:[
                { code:'MS001', title:'Kinh tế học vi mô', qty:1 },
                { code:'MS005', title:'Lập trình Python cơ bản', qty:1 }
            ]
        },
        {
            id:5, slipCode:'MIS3007', userId:'2051010005', userName:'Nguyễn Khiêm',
            borrowDate:'14/2/2025', dueDate:'19/11/2025',
            status:'Đã trả', statusClass:'tb-green',
            books:[{ code:'MS006', title:'Kinh tế vi mô', qty:1 }]
        },
        {
            id:6, slipCode:'ELC3008', userId:'2051010006', userName:'Trần Thị Linh',
            borrowDate:'12/1/2026', dueDate:'9/12/2026',
            status:'Đang mượn', statusClass:'tb-blue',
            books:[{ code:'MS007', title:'English Communication', qty:2 }]
        },
        {
            id:7, slipCode:'SMT1006', userId:'2051010007', userName:'Đoàn Hồ Châu',
            borrowDate:'6/4/2026', dueDate:'24/3/2026',
            status:'Quá hạn', statusClass:'tb-orange',
            books:[{ code:'MS008', title:'Quản trị học', qty:1 }]
        },
        {
            id:8, slipCode:'LAW2001', userId:'2051010008', userName:'Lê Thị Loan',
            borrowDate:'18/10/2025', dueDate:'17/5/2026',
            status:'Đang mượn', statusClass:'tb-blue',
            books:[{ code:'MS009', title:'Pháp luật đại cương', qty:1 }]
        }
    ];

    var pendingDeleteId = null; // used by delete confirm popup

    /* ════ RENDER TABLE ════ */
    function renderRows(rows) {
        if (!rows.length) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:#9ca3af;">Không có dữ liệu</td></tr>';
            return;
        }
        tableBody.innerHTML = rows.map(function (s) {
            return '<tr data-id="' + s.id + '">' +
                '<td>' + s.slipCode + '</td>' +
                '<td>' + s.userId + '</td>' +
                '<td>' + s.userName + '</td>' +
                '<td>' + s.borrowDate + '</td>' +
                '<td>' + s.dueDate + '</td>' +
                '<td><span class="tbadge ' + s.statusClass + '">' + s.status + '</span></td>' +
                '<td class="col-action">' +
                    '<button class="icon-btn edit btn-edit" data-id="' + s.id + '" title="Gia hạn">' +
                        '<i class="bx bx-calendar"></i>' +
                    '</button>&nbsp;' +
                    '<button class="icon-btn del btn-del" data-id="' + s.id + '" title="Xóa">' +
                        '<i class="bx bx-trash"></i>' +
                    '</button>' +
                '</td>' +
            '</tr>';
        }).join('');
    }

    /* ════ SEARCH ════ */
    function doSearch() {
        var kw = (searchInput ? searchInput.value : '').toLowerCase().trim();
        if (!kw) { renderRows(slips); return; }
        var filtered = slips.filter(function (s) {
            return s.slipCode.toLowerCase().includes(kw) ||
                   s.userId.toLowerCase().includes(kw) ||
                   s.userName.toLowerCase().includes(kw);
        });
        renderRows(filtered);
        if (typeof showToast === 'function') {
            showToast(filtered.length ? 'success' : 'error',
                filtered.length
                    ? 'Tìm thấy ' + filtered.length + ' phiếu mượn.'
                    : 'Không tìm thấy phiếu mượn phù hợp.');
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', doSearch);
    if (searchInput) searchInput.addEventListener('keyup', function (e) { if (e.key === 'Enter') doSearch(); });

    /* ════ POPUP HELPERS ════ */
    function openPm(id) {
        overlay.classList.add('open');
        document.querySelectorAll('.pm-modal, .pm-modal-sm').forEach(function (m) {
            m.style.display = 'none';
        });
        var el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    }

    window.closePm = function () {
        overlay.classList.remove('open');
        document.querySelectorAll('.pm-modal, .pm-modal-sm').forEach(function (m) {
            m.style.display = 'none';
        });
    };

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) window.closePm();
    });

    /* ════ DATE HELPERS ════ */
    function toIso(display) {
        // "5/1/2026" → "2026-01-05"
        if (!display || !display.includes('/')) return '';
        var p = display.split('/');
        return p[2] + '-' + String(p[1]).padStart(2,'0') + '-' + String(p[0]).padStart(2,'0');
    }

    function toDisplay(iso) {
        // "2026-01-05" → "5/1/2026"
        if (!iso || !iso.includes('-')) return iso || '';
        var p = iso.split('-');
        return parseInt(p[2]) + '/' + parseInt(p[1]) + '/' + p[0];
    }

    /* ════ BOOK LIST ROWS (readonly) ════ */
    function renderBookList(containerId, books) {
        var el = document.getElementById(containerId);
        if (!el) return;
        if (!books || !books.length) {
            el.innerHTML = '<div style="color:#9ca3af;padding:14px 0;">Không có sách</div>';
            return;
        }
        el.innerHTML = books.map(function (b) {
            return '<div class="pm-list-row">' +
                '<div class="lcode">' + b.code + '</div>' +
                '<div class="ltitle">' + b.title + '</div>' +
                '<div class="lqty">' + b.qty + '</div>' +
            '</div>';
        }).join('');
    }

    /* ════ BOOK INPUT ROWS (add popup) ════ */
    window.addBookRow = function () {
        var body = document.getElementById('addBooksBody');
        if (!body) return;
        var row = document.createElement('div');
        row.className = 'pm-book-row';
        row.innerHTML =
            '<input class="pm-input" type="text" placeholder="MS001">' +
            '<input class="pm-input" type="text" placeholder="Tên sách">' +
            '<input class="pm-input" type="number" min="1" value="1">' +
            '<button class="btn-row-del" type="button" onclick="this.closest(\'.pm-book-row\').remove()">×</button>';
        body.appendChild(row);
    };

    /* ════ ① THÊM PHIẾU MƯỢN ════ */
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            document.getElementById('addUserId').value    = '';
            document.getElementById('addUserName').value  = '';
            document.getElementById('addBorrowDate').value = '';
            document.getElementById('addDueDate').value    = '';
            document.getElementById('addBooksBody').innerHTML = '';
            window.addBookRow();
            openPm('popup-add-borrow');
        });
    }

    // Auto-fill name when typing user ID
    var addUserIdEl = document.getElementById('addUserId');
    if (addUserIdEl) {
        addUserIdEl.addEventListener('blur', function () {
            var uid = this.value.trim();
            var found = slips.find(function (s) { return s.userId === uid; });
            document.getElementById('addUserName').value = found ? found.userName : '';
        });
    }

    window.submitAddBorrow = function (e) {
        e.preventDefault();
        var userId    = document.getElementById('addUserId').value.trim();
        var userName  = document.getElementById('addUserName').value.trim();
        var borrowDate = document.getElementById('addBorrowDate').value;
        var dueDate    = document.getElementById('addDueDate').value;
        if (!userId || !borrowDate || !dueDate) {
            if (typeof showToast === 'function') showToast('error', 'Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        var books = [];
        document.querySelectorAll('#addBooksBody .pm-book-row').forEach(function (row) {
            var inputs = row.querySelectorAll('input');
            var code  = inputs[0] ? inputs[0].value.trim() : '';
            var title = inputs[1] ? inputs[1].value.trim() : '';
            var qty   = inputs[2] ? parseInt(inputs[2].value) || 1 : 1;
            if (code) books.push({ code:code, title:title, qty:qty });
        });
        var maxId = slips.reduce(function (a, s) { return Math.max(a, s.id); }, 0);
        slips.unshift({
            id: maxId + 1,
            slipCode: userId.substring(0,7),
            userId: userId,
            userName: userName || userId,
            borrowDate: toDisplay(borrowDate),
            dueDate: toDisplay(dueDate),
            status: 'Đang mượn', statusClass: 'tb-blue',
            books: books
        });
        renderRows(slips);
        window.closePm();
        if (searchInput) searchInput.value = '';
        if (typeof showToast === 'function') showToast('success', 'Thêm phiếu mượn thành công.');
    };

    /* ════ TABLE CLICK HANDLING ════ */
    tableBody.addEventListener('click', function (e) {

        // ── Calendar icon → popup-extend-large (②)
        var editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
            var id = parseInt(editBtn.getAttribute('data-id'));
            var slip = slips.find(function (s) { return s.id === id; });
            if (!slip) return;
            document.getElementById('extLgUserId').value      = slip.userId;
            document.getElementById('extLgUserName').value    = slip.userName;
            document.getElementById('extLgCurrentDue').value  = toIso(slip.dueDate);
            document.getElementById('extLgNewDue').value       = toIso(slip.dueDate);
            renderBookList('extLgBooksBody', slip.books);
            window._extLgSlipId = id;
            openPm('popup-extend-large');
            return;
        }

        // ── Delete icon → popup-delete-confirm (⑤)
        var delBtn = e.target.closest('.btn-del');
        if (delBtn) {
            pendingDeleteId = parseInt(delBtn.getAttribute('data-id'));
            openPm('popup-delete-confirm');
            return;
        }

        // ── Row click → Chi tiết (③)
        var row = e.target.closest('tr[data-id]');
        if (row) {
            var rowId = parseInt(row.getAttribute('data-id'));
            var s = slips.find(function (x) { return x.id === rowId; });
            if (!s) return;
            document.getElementById('detUserId').value    = s.userId;
            document.getElementById('detUserName').value  = s.userName;
            document.getElementById('detBorrowDate').value = toIso(s.borrowDate);
            document.getElementById('detDueDate').value    = toIso(s.dueDate);
            renderBookList('detBooksBody', s.books);
            openPm('popup-borrow-detail');
        }
    });

    /* ════ ④ GIA HẠN SMALL – save ════ */
    window.saveExtendSmall = function () {
        var newDate = document.getElementById('extSmNewDate').value;
        if (!newDate) {
            if (typeof showToast === 'function') showToast('error', 'Vui lòng chọn ngày gia hạn mới.');
            return;
        }
        var slip = slips.find(function (s) { return s.id === window._extSmSlipId; });
        if (slip) { slip.dueDate = toDisplay(newDate); renderRows(slips); }
        window.closePm();
        if (typeof showToast === 'function') showToast('success', 'Gia hạn thành công.');
    };

    /* ════ ② GIA HẠN LARGE – save ════ */
    window.saveExtendLarge = function () {
        var newDate = document.getElementById('extLgNewDue').value;
        if (!newDate) {
            if (typeof showToast === 'function') showToast('error', 'Vui lòng chọn ngày đến hạn mới.');
            return;
        }
        var slip = slips.find(function (s) { return s.id === window._extLgSlipId; });
        if (slip) { slip.dueDate = toDisplay(newDate); renderRows(slips); }
        window.closePm();
        if (typeof showToast === 'function') showToast('success', 'Lưu thay đổi thành công.');
    };

    /* ════ ⑤ DELETE – confirm ════ */
    window.confirmDelete = function () {
        if (pendingDeleteId === null) return;
        slips = slips.filter(function (s) { return s.id !== pendingDeleteId; });
        pendingDeleteId = null;
        renderRows(slips);
        window.closePm();
        if (typeof showToast === 'function') showToast('success', 'Đã xóa phiếu mượn.');
    };

    /* ════ INITIAL RENDER ════ */
    renderRows(slips);
});
