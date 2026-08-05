import { adminApi } from './admin-api.js';

let chartsInitialized = false;

export async function loadDashboardData() {
    loadMessages();
    loadGuestbook();
    loadAnalytics();
}

// --- Messages ---
async function loadMessages() {
    try {
        const messages = await adminApi.getMessages();
        const tbody = document.getElementById('messages-body');
        tbody.innerHTML = '';

        if (!messages || messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No messages found.</td></tr>';
            return;
        }

        messages.forEach(msg => {
            const tr = document.createElement('tr');
            const date = new Date(msg.created_at).toLocaleString();
            const statusClass = msg.is_read ? 'status-read' : 'status-unread';
            const statusText = msg.is_read ? 'Read' : 'Unread';
            
            let actionHtml = '';
            if (!msg.is_read) {
                actionHtml = `<button class="btn btn-sm btn-primary btn-mark-read" data-id="${msg.id}">Mark Read</button>`;
            }

            tr.innerHTML = `
                <td>${date}</td>
                <td><strong>${msg.name}</strong></td>
                <td><a href="mailto:${msg.email}">${msg.email}</a></td>
                <td><div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${msg.message}">${msg.message}</div></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${actionHtml}</td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners for buttons
        document.querySelectorAll('.btn-mark-read').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                try {
                    await adminApi.markMessageRead(id);
                    loadMessages(); // reload table
                } catch (err) {
                    alert('Error marking message as read: ' + err.message);
                }
            });
        });

    } catch (err) {
        console.error('Failed to load messages:', err);
    }
}

// --- Guestbook ---
async function loadGuestbook() {
    try {
        const entries = await adminApi.getGuestbook();
        const tbody = document.getElementById('guestbook-body');
        tbody.innerHTML = '';

        if (!entries || entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No guestbook entries found.</td></tr>';
            return;
        }

        entries.forEach(entry => {
            const tr = document.createElement('tr');
            const date = new Date(entry.created_at).toLocaleString();
            
            let statusClass = 'status-pending';
            if (entry.status === 'approved') statusClass = 'status-approved';
            if (entry.status === 'rejected') statusClass = 'status-rejected';
            
            let actionHtml = '';
            if (entry.status === 'pending') {
                actionHtml = `
                    <button class="btn btn-sm btn-primary btn-approve" data-id="${entry.id}">Approve</button>
                    <button class="btn btn-sm btn-danger btn-reject" data-id="${entry.id}">Reject</button>
                `;
            } else {
                actionHtml = `<span style="color: #6c757d; font-size: 0.8rem;">Reviewed</span>`;
            }

            tr.innerHTML = `
                <td>${date}</td>
                <td><strong>${entry.name}</strong></td>
                <td><div style="max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${entry.message}">${entry.message}</div></td>
                <td><span class="status-badge ${statusClass}">${entry.status}</span></td>
                <td>${actionHtml}</td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                try {
                    await adminApi.approveGuestbook(id);
                    loadGuestbook();
                } catch (err) {
                    alert('Error approving entry: ' + err.message);
                }
            });
        });
        
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                try {
                    await adminApi.rejectGuestbook(id);
                    loadGuestbook();
                } catch (err) {
                    alert('Error rejecting entry: ' + err.message);
                }
            });
        });

    } catch (err) {
        console.error('Failed to load guestbook:', err);
    }
}

// --- Analytics ---
async function loadAnalytics() {
    if (chartsInitialized) return; // Only init once to avoid canvas issues

    try {
        const summary = await adminApi.getAnalyticsSummary();
        if (!summary) return;
        
        initPageViewsChart(summary.page_views_last_30_days);
        initCommandsChart(summary.top_commands);
        chartsInitialized = true;
    } catch (err) {
        console.error('Failed to load analytics:', err);
    }
}

function initPageViewsChart(data) {
    const ctx = document.getElementById('page-views-chart').getContext('2d');
    
    // Sort chronologically
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedData.map(item => item.date);
    const counts = sortedData.map(item => item.count);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Page Views',
                data: counts,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

function initCommandsChart(data) {
    const ctx = document.getElementById('commands-chart').getContext('2d');
    
    const labels = data.map(item => item.command);
    const counts = data.map(item => item.count);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Uses',
                data: counts,
                backgroundColor: '#198754',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}
