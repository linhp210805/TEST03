// -- KHỞI TẠO BIỂU ĐỒ (CHARTS LOGIC) --

document.addEventListener('DOMContentLoaded', function () {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#888';

    // 1. TRẠNG THÁI SÁCH (BAR CHART)
    const ctxBooks = document.getElementById('booksStatusChart');
    if (ctxBooks) {
        new Chart(ctxBooks.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Trong kho', 'Đang mượn'],
                datasets: [{
                    data: [49, 3],
                    backgroundColor: ['#2365c1', '#f44336'],
                    borderRadius: 4,
                    barThickness: 40
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                scales: {
                    y: { display: false, max: 60 },
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { font: { size: 10 } }
                    }
                },
                animation: {
                    onComplete: function (animation) {
                        const chartInstance = animation.chart;
                        const ctx = chartInstance.ctx;
                        ctx.font = Chart.helpers.fontString(12, 'bold', Chart.defaults.font.family);
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';

                        chartInstance.data.datasets.forEach((dataset, i) => {
                            const meta = chartInstance.getDatasetMeta(i);
                            meta.data.forEach((bar, index) => {
                                const data = dataset.data[index];
                                if (data > 0) {
                                    ctx.fillStyle = '#333';
                                    ctx.fillText(data, bar.x, bar.y - 5);
                                }
                            });
                        });
                    }
                }
            }
        });
    }

    // 2. ĐỘC GIẢ (DOUGHNUT CHART)
    const ctxReaders = document.getElementById('readersChart');
    if (ctxReaders) {
        new Chart(ctxReaders.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Hoạt động', 'Tạm khóa'],
                datasets: [{
                    data: [4, 0],
                    backgroundColor: ['#2365c1', '#e0e0e0'],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    }

    // 3. XU HƯỚNG QUÁ HẠN (LINE CHART)
    const ctxOverdue = document.getElementById('overdueChart');
    if (ctxOverdue) {
        new Chart(ctxOverdue.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                datasets: [{
                    label: 'Số phiếu quá hạn',
                    data: [0, 0, 0, 0, 1, 0, 0],
                    borderColor: '#2365c1',
                    backgroundColor: '#2365c1',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#2365c1',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: { boxWidth: 8, font: { size: 10 }, usePointStyle: true }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 2,
                        ticks: { stepSize: 1, font: { size: 10 } },
                        grid: { color: '#f0f0f0' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    }
                }
            }
        });
    }
});
