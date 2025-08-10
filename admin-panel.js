// Admin panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    loadAdminDashboard();
    initializeAdminTabs();
});

function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem('settlespace_user') || 'null');
    
    if (!currentUser || currentUser.userType !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
}

function loadAdminDashboard() {
    updateAdminStats();
    loadPendingProperties();
    loadAllProperties();
    loadUsers();
    loadPayments();
}

function updateAdminStats() {
    const users = JSON.parse(localStorage.getItem('settlespace_users') || '[]');
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    const payments = JSON.parse(localStorage.getItem('settlespace_payments') || '[]');
    
    const totalUsers = users.length;
    const totalProperties = properties.length;
    const pendingApprovals = properties.filter(p => p.status === 'pending').length;
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-properties').textContent = totalProperties;
    document.getElementById('pending-approvals').textContent = pendingApprovals;
    document.getElementById('total-revenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    document.getElementById('pending-count').textContent = `${pendingApprovals} pending`;
}

function initializeAdminTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
            
            // Load data for specific tab
            switch (targetTab) {
                case 'pending-properties':
                    loadPendingProperties();
                    break;
                case 'all-properties':
                    loadAllProperties();
                    break;
                case 'users':
                    loadUsers();
                    break;
                case 'payments':
                    loadPayments();
                    break;
            }
        });
    });
}

function loadPendingProperties() {
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    const pendingProperties = properties.filter(p => p.status === 'pending');
    const container = document.getElementById('pending-properties-table');
    
    if (!container) return;
    
    if (pendingProperties.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h3>No pending approvals</h3>
                <p>All properties have been reviewed</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Owner</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${pendingProperties.map(property => `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <img src="${property.images[0]}" alt="${property.title}" 
                                     style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
                                <div>
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${property.title}</div>
                                    <div style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${property.location}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div>${property.ownerName}</div>
                            <div style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${property.ownerPhone}</div>
                        </td>
                        <td>${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</td>
                        <td>${formatPrice(property.price, property.transactionType)}</td>
                        <td>${formatDate(property.submittedAt)}</td>
                        <td>
                            <button class="action-btn btn-view" onclick="viewPropertyDetail('${property.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn btn-approve" onclick="approveProperty('${property.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="action-btn btn-reject" onclick="rejectProperty('${property.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function loadAllProperties() {
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    const container = document.getElementById('all-properties-table');
    
    if (!container) return;
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Owner</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${properties.map(property => `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <img src="${property.images[0]}" alt="${property.title}" 
                                     style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
                                <div>
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${property.title}</div>
                                    <div style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${property.location}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div>${property.ownerName}</div>
                            <div style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${property.ownerPhone}</div>
                        </td>
                        <td>${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</td>
                        <td>${formatPrice(property.price, property.transactionType)}</td>
                        <td>
                            <span class="status-badge status-${property.status}">${property.status.charAt(0).toUpperCase() + property.status.slice(1)}</span>
                        </td>
                        <td>${formatDate(property.submittedAt)}</td>
                        <td>
                            <button class="action-btn btn-view" onclick="viewPropertyDetail('${property.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${property.status === 'pending' ? `
                                <button class="action-btn btn-approve" onclick="approveProperty('${property.id}')">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="action-btn btn-reject" onclick="rejectProperty('${property.id}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            <button class="action-btn btn-delete" onclick="deleteProperty('${property.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('settlespace_users') || '[]');
    const container = document.getElementById('users-table');
    
    if (!container) return;
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Phone</th>
                    <th>Verified</th>
                    <th>Joined</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>
                            <div>
                                <div style="font-weight: 600; margin-bottom: 0.25rem;">${user.name}</div>
                                <div style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">${user.email}</div>
                            </div>
                        </td>
                        <td>
                            <span class="status-badge ${user.userType === 'admin' ? 'status-approved' : user.userType === 'seller' ? 'status-pending' : 'status-rejected'}">
                                ${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                            </span>
                        </td>
                        <td>${user.phone}</td>
                        <td>
                            <span class="status-badge ${user.verified ? 'status-approved' : 'status-rejected'}">
                                ${user.verified ? 'Verified' : 'Not Verified'}
                            </span>
                        </td>
                        <td>${formatDate(user.createdAt)}</td>
                        <td>
                            <button class="action-btn btn-edit" onclick="editUser('${user.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${user.userType !== 'admin' ? `
                                <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function loadPayments() {
    const payments = JSON.parse(localStorage.getItem('settlespace_payments') || '[]');
    const container = document.getElementById('payments-table');
    
    if (!container) return;
    
    if (payments.length === 0) {
        // Create sample payments for demo
        const samplePayments = [
            {
                id: 'pay-1',
                transactionId: 'TXN001',
                userName: 'Rajesh Kumar',
                amount: 50000,
                purpose: 'Property Listing Fee',
                status: 'completed',
                propertyId: 'prop-1',
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'pay-2',
                transactionId: 'TXN002',
                userName: 'Priya Sharma',
                amount: 30000,
                purpose: 'Premium Listing',
                status: 'completed',
                propertyId: 'prop-2',
                createdAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: 'pay-3',
                transactionId: 'TXN003',
                userName: 'Amit Patel',
                amount: 75000,
                purpose: 'Featured Listing',
                status: 'pending',
                propertyId: 'prop-3',
                createdAt: new Date(Date.now() - 43200000).toISOString()
            }
        ];
        localStorage.setItem('settlespace_payments', JSON.stringify(samplePayments));
    }
    
    const updatedPayments = JSON.parse(localStorage.getItem('settlespace_payments') || '[]');
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Transaction ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${updatedPayments.map(payment => `
                    <tr>
                        <td style="font-family: monospace;">${payment.transactionId}</td>
                        <td>${payment.userName}</td>
                        <td>₹${payment.amount.toLocaleString('en-IN')}</td>
                        <td>${payment.purpose}</td>
                        <td>
                            <span class="status-badge status-${payment.status === 'completed' ? 'approved' : 'pending'}">
                                ${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                        </td>
                        <td>${formatDate(payment.createdAt)}</td>
                        <td>
                            <button class="action-btn btn-view" onclick="viewPaymentDetail('${payment.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${payment.status === 'pending' ? `
                                <button class="action-btn btn-approve" onclick="approvePayment('${payment.id}')">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function approveProperty(propertyId) {
    if (!confirm('Are you sure you want to approve this property?')) {
        return;
    }
    
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    const propertyIndex = properties.findIndex(p => p.id === propertyId);
    
    if (propertyIndex > -1) {
        properties[propertyIndex].status = 'approved';
        properties[propertyIndex].paymentStatus = 'completed';
        properties[propertyIndex].approvedAt = new Date().toISOString();
        
        localStorage.setItem('settlespace_properties', JSON.stringify(properties));
        showNotification('Property approved successfully!', 'success');
        
        // Refresh dashboard
        loadAdminDashboard();
    }
}

function rejectProperty(propertyId) {
    const reason = prompt('Please enter reason for rejection (optional):');
    
    if (reason === null) return; // User cancelled
    
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    const propertyIndex = properties.findIndex(p => p.id === propertyId);
    
    if (propertyIndex > -1) {
        properties[propertyIndex].status = 'rejected';
        properties[propertyIndex].rejectionReason = reason;
        properties[propertyIndex].rejectedAt = new Date().toISOString();
        
        localStorage.setItem('settlespace_properties', JSON.stringify(properties));
        showNotification('Property rejected successfully!', 'success');
        
        // Refresh dashboard
        loadAdminDashboard();
    }
}

function deleteProperty(propertyId) {
    if (!confirm('Are you sure you want to permanently delete this property?')) {
        return;
    }
    
    const properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    const updatedProperties = properties.filter(p => p.id !== propertyId);
    localStorage.setItem('settlespace_properties', JSON.stringify(updatedProperties));
    
    showNotification('Property deleted successfully!', 'success');
    loadAdminDashboard();
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user account?')) {
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('settlespace_users') || '[]');
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('settlespace_users', JSON.stringify(updatedUsers));
    
    showNotification('User deleted successfully!', 'success');
    loadUsers();
}

function viewPropertyDetail(propertyId) {
    window.open(`property_detail.html?id=${propertyId}`, '_blank');
}

function editUser(userId) {
    showNotification('User editing functionality will be available in the next version', 'info');
}

function viewPaymentDetail(paymentId) {
    showNotification('Payment detail view will be available in the next version', 'info');
}

function approvePayment(paymentId) {
    const payments = JSON.parse(localStorage.getItem('settlespace_payments') || '[]');
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex > -1) {
        payments[paymentIndex].status = 'completed';
        payments[paymentIndex].approvedAt = new Date().toISOString();
        
        localStorage.setItem('settlespace_payments', JSON.stringify(payments));
        showNotification('Payment approved successfully!', 'success');
        
        loadPayments();
    }
}

function formatPrice(price, type) {
    if (type === 'rent') {
        return `₹${price.toLocaleString('en-IN')}/month`;
    } else {
        if (price >= 10000000) {
            return `₹${(price / 10000000).toFixed(2)} Cr`;
        } else if (price >= 100000) {
            return `₹${(price / 100000).toFixed(2)} L`;
        } else {
            return `₹${price.toLocaleString('en-IN')}`;
        }
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function initializeAdminNotifications() {
    // Check for admin notifications periodically
    setInterval(checkAdminNotifications, 5000);
    checkAdminNotifications();
}

function checkAdminNotifications() {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const pendingNotifications = notifications.filter(n => n.status === 'pending');
    
    if (pendingNotifications.length > 0) {
        displayAdminNotifications(pendingNotifications);
    }
}

function displayAdminNotifications(notifications) {
    // Remove existing notifications container
    const existingContainer = document.getElementById('admin-notifications-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    const container = document.createElement('div');
    container.id = 'admin-notifications-container';
    container.className = 'admin-notifications';
    
    notifications.forEach(notification => {
        const notificationEl = document.createElement('div');
        notificationEl.className = 'notification-item';
        notificationEl.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">User Communication Request</div>
                <div class="notification-time">${formatTime(notification.timestamp)}</div>
            </div>
            <div class="notification-message">
                <strong>${notification.userName}</strong> wants to communicate via chatbot
            </div>
            <div class="notification-actions">
                <button class="notification-btn btn-accept" onclick="acceptCommunication('${notification.id}')">
                    Accept
                </button>
                <button class="notification-btn btn-decline" onclick="declineCommunication('${notification.id}')">
                    Decline
                </button>
            </div>
        `;
        container.appendChild(notificationEl);
    });
    
    document.body.appendChild(container);
}

function acceptCommunication(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
        // Mark notification as accepted
        notification.status = 'accepted';
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
        
        // Enable admin communication for this user
        localStorage.setItem(`admin_chat_active_${notification.userId}`, 'true');
        
        showNotification('Communication accepted! You can now chat with the user.', 'success');
        
        // Remove notification from UI
        document.getElementById('admin-notifications-container').remove();
    }
}

function declineCommunication(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex > -1) {
        notifications[notificationIndex].status = 'declined';
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
        
        showNotification('Communication request declined.', 'info');
        
        // Remove notification from UI
        document.getElementById('admin-notifications-container').remove();
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}