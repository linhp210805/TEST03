// ====== KHỞI TẠO DỮ LIỆU ======
let books = JSON.parse(localStorage.getItem('due_library_books')) || [
    { id: "KT001", title: "Kinh tế học vi mô", author: "N. Gregory Mankiw", type: "Kinh tế học", publisher: "NXB Thống Kê", year: 2020, quantity: "7/10" },
    { id: "KT002", title: "Kinh tế vĩ mô", author: "N. Gregory Mankiw", type: "Kinh tế học", publisher: "NXB Thống Kê", year: 2020, quantity: "8/10" },
    { id: "TC001", title: "Nguyên lý kế toán", author: "Nguyễn Thị Mai", type: "Kế toán", publisher: "NXB Tài Chính", year: 2019, quantity: "5/8" },
    { id: "QT001", title: "Quản trị học", author: "Lê Văn Tâm", type: "Quản trị kinh doanh", publisher: "NXB Lao Động", year: 2021, quantity: "11/12" },
    { id: "MKT001", title: "Marketing căn bản", author: "Philip Kotler", type: "Marketing", publisher: "NXB Lao Động", year: 2018, quantity: "12/15" },
    { id: "TC002", title: "Tài chính doanh nghiệp", author: "Trần Văn Hùng", type: "Tài chính", publisher: "NXB Lao Động", year: 2022, quantity: "6/6" }
];

// ====== DOM ======
const tableBody = document.getElementById('bookTableBody');
const bookCount = document.getElementById('bookCount');
const bookModal = document.getElementById('bookModal');
const bookForm = document.getElementById('bookForm');

let currentDeleteIndex = -1;

// ====== HIỂN THỊ ======
function renderBooks(data = books) {
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Không tìm thấy sách</td></tr>`;
        bookCount.innerText = `Hiển thị 0 sách`;
        return;
    }

    data.forEach((book, index) => {
        const row = `
        <tr>
            <td><strong>${book.id}</strong></td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.type}</td>
            <td>${book.publisher}</td>
            <td>${book.year}</td>
            <td>${book.quantity}</td>
            <td><span class="status-badge">CÓ SẴN</span></td>
            <td class="actions">
                <i class="fa-solid fa-book-open" onclick="viewDetail(${index})" title="Chi tiết"></i>
                <i class="fa-regular fa-pen-to-square" onclick="editBook(${index})"></i>
                <i class="fa-solid fa-trash-can" onclick="requestDelete(${index})"></i>
            </td>
        </tr>
        `;
        tableBody.innerHTML += row; // FIX QUAN TRỌNG
    });

    bookCount.innerText = `Hiển thị ${data.length} quyển sách`;

    localStorage.setItem('due_library_books', JSON.stringify(books));
}
function viewDetail(index) {
    const book = books[index];
    const content = `
        <p><strong>Mã sách:</strong> ${book.id}</p>
        <p><strong>Tên sách:</strong> ${book.title}</p>
        <p><strong>Tác giả:</strong> ${book.author}</p>
        <p><strong>Thể loại:</strong> ${book.type}</p>
        <p><strong>Nhà xuất bản:</strong> ${book.publisher}</p>
        <p><strong>Năm xuất bản:</strong> ${book.year}</p>
        <p><strong>Số lượng:</strong> ${book.quantity}</p>
    `;
    document.getElementById('bookDetailContent').innerHTML = content;
    document.getElementById('detailModal').style.display = 'flex';
}
function searchBook() {
    const term = document.getElementById('searchInput').value.toLowerCase();

    const filtered = books.filter(b =>
        b.title.toLowerCase().includes(term) ||
        b.id.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term)
    );

    renderBooks(filtered);
}

// ====== ĐẶT LẠI TÌM KIẾM ======
function resetBooks() {
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    renderBooks();
}

// ====== MODAL ======
function openAddModal() {
    document.getElementById('modalTitle').innerText = "Thêm sách";
    document.getElementById('editIndex').value = -1;
    bookForm.reset();
    bookModal.style.display = "flex";
}

function editBook(index) {
    const book = books[index];

    document.getElementById('modalTitle').innerText = "Chỉnh sửa";
    document.getElementById('editIndex').value = index;

    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookType').value = book.type;
    document.getElementById('bookPublisher').value = book.publisher;
    document.getElementById('bookYear').value = book.year;
    document.getElementById('bookQty').value = book.quantity;

    bookModal.style.display = "flex";
}

function closeModal() {
    bookModal.style.display = "none";
}

// ====== CANCEL ======
function handleCancelClick() {
    document.getElementById('cancelConfirmModal').style.display = 'flex';
}

function confirmCancel() {
    closeSubModal('cancelConfirmModal');
    closeModal();
}

// ====== DELETE ======
function requestDelete(index) {
    currentDeleteIndex = index;
    document.getElementById('deleteConfirmModal').style.display = 'flex';
}

function confirmDelete() {
    if (currentDeleteIndex > -1) {
        books.splice(currentDeleteIndex, 1);
        renderBooks();
        showToast("Xóa thông tin sách thành công");
        closeSubModal('deleteConfirmModal');
        currentDeleteIndex = -1;
    }
}

// ====== SAVE ======
bookForm.onsubmit = (e) => {
    e.preventDefault();

    const index = parseInt(document.getElementById('editIndex').value);

    const bookData = {
        id: document.getElementById('bookId').value,
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        type: document.getElementById('bookType').value,
        publisher: document.getElementById('bookPublisher').value,
        year: document.getElementById('bookYear').value,
        quantity: document.getElementById('bookQty').value
    };

    if (index === -1) {
        books.unshift(bookData);
        showToast("Thêm thông tin sách thành công");
    } else {
        books[index] = bookData;
        showToast("Cập nhật thông tin sách thành công");
    }

    renderBooks();
    closeModal();
};

// ====== UTIL ======
function closeSubModal(id) {
    document.getElementById(id).style.display = 'none';
}

function showToast(message) {
    const container = document.getElementById('toastContainer') || document.body;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// ====== CLICK NGOÀI MODAL ======
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
};

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
    renderBooks();
});

function goToPage(page) {
    switch(page) {
        case 'logout':
            window.location.href = '../../../index.html';
            break;

        case 'overview':
            window.location.href = '../../../index.html';
            break;

        case 'return':
            window.location.href = '../../../index.html';
            break;

        case 'borrow':
            window.location.href = '../circulation/borrow.html';
            break;

        case 'manage-books':
            window.location.href = 'book-list.html';
            break;

        case 'users':
            window.location.href = '../users/user-list.html';
            break;

        case 'reports':
            window.location.href = '../reports/statistics.html';
            break;
    }
}