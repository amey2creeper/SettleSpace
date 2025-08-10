// Global variables and utility functions
let currentUser = null;
let properties = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    initializeSlider();
    initializeNavigation();
    loadProperties();
    updateStats();
});

// Authentication functions
function initializeAuth() {
    const userData = localStorage.getItem('settlespace_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateNavigation();
    }
    
    // Create default users if they don't exist
    createDefaultUsers();
}

function createDefaultUsers() {
    let users = JSON.parse(localStorage.getItem('settlespace_users') || '[]');
    
    if (users.length === 0) {
        const defaultUsers = [
            {
                id: 'admin-1',
                name: 'Admin User',
                email: 'admin@settlespace.com',
                phone: '+91-9999999999',
                password: hashPassword('admin123'),
                userType: 'admin',
                verified: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'seller-1',
                name: 'Demo Seller',
                email: 'seller@demo.com',
                phone: '+91-9876543210',
                password: hashPassword('seller123'),
                userType: 'seller',
                upiId: 'seller@upi',
                verified: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'buyer-1',
                name: 'Demo Buyer',
                email: 'buyer@demo.com',
                phone: '+91-9876543211',
                password: hashPassword('buyer123'),
                userType: 'buyer',
                verified: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('settlespace_users', JSON.stringify(defaultUsers));
    }
}

function hashPassword(password) {
    // Simple hash function for demo purposes
    // In production, use proper hashing libraries
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

function updateNavigation() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const dashboardLink = document.getElementById('dashboard-link');
    
    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) {
            logoutLink.style.display = 'block';
            logoutLink.addEventListener('click', logout);
        }
        if (dashboardLink) {
            dashboardLink.style.display = 'block';
            dashboardLink.textContent = currentUser.userType === 'admin' ? 'Admin Panel' : 
                                      currentUser.userType === 'seller' ? 'Dashboard' : 'Profile';
            dashboardLink.href = currentUser.userType === 'admin' ? 'admin_panel.html' : 
                               currentUser.userType === 'seller' ? 'seller_dashboard.html' : 'profile.html';
        }
    }
}

function logout() {
    localStorage.removeItem('settlespace_user');
    currentUser = null;
    window.location.href = 'index.html';
}

// Navigation functions
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Handle navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        }
    });
}

// Hero slider functions
function initializeSlider() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    let currentSlide = 0;
    
    if (slides.length === 0) return;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Auto-advance slides
    setInterval(nextSlide, 5000);
    
    // CTA button functionality
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = 'properties.html';
        });
    });
}

// Property functions
function loadProperties() {
    properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    
    if (properties.length === 0) {
        createSampleProperties();
        properties = JSON.parse(localStorage.getItem('settlespace_properties') || '[]');
    }
    
    // Load featured properties on homepage
    const featuredContainer = document.getElementById('featured-properties');
    if (featuredContainer) {
        displayFeaturedProperties();
    }
    
    // Load all properties on properties page
    const propertiesContainer = document.getElementById('properties-grid');
    if (propertiesContainer && window.location.pathname.includes('properties.html')) {
        displayAllProperties();
        initializeFilters();
    }
}

function createSampleProperties() {
    const sampleProperties = [
        {
            id: 'prop-' + Date.now() + Math.random(),
            title: 'Luxury 3BHK Apartment in Bandra West',
            description: 'Spacious 3BHK apartment with sea view, modern amenities, and prime location in Bandra West, Mumbai. This property features high-end finishes, a fully equipped modular kitchen, and premium fixtures throughout.',
            propertyType: 'apartment',
            transactionType: 'sale',
            price: 25000000,
            area: 1200,
            bedrooms: 3,
            bathrooms: 2,
            location: 'Bandra West, Mumbai',
            amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden', 'Elevator', 'Power Backup'],
            images: [
                'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            ],
            ownerId: 'seller-1',
            ownerName: 'Rajesh Kumar',
            ownerPhone: '+91-9876543210',
            status: 'approved',
            paymentStatus: 'completed',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            approvedAt: new Date().toISOString(),
            featured: true
        },
        {
            id: 'prop-' + Date.now() + Math.random() + 1,
            title: '2BHK Modern Apartment in Koramangala',
            description: 'Well-designed 2BHK apartment with modern fixtures and excellent connectivity in Koramangala, Bangalore. Perfect for young professionals with all necessary amenities nearby.',
            propertyType: 'apartment',
            transactionType: 'rent',
            price: 35000,
            area: 800,
            bedrooms: 2,
            bathrooms: 2,
            location: 'Koramangala, Bangalore',
            amenities: ['Parking', 'Security', 'Power Backup', 'Internet', 'Elevator'],
            images: [
                'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            ],
            ownerId: 'seller-1',
            ownerName: 'Priya Sharma',
            ownerPhone: '+91-9876543211',
            status: 'approved',
            paymentStatus: 'completed',
            submittedAt: new Date(Date.now() - 172800000).toISOString(),
            approvedAt: new Date(Date.now() - 86400000).toISOString(),
            featured: true
        },
        {
            id: 'prop-' + Date.now() + Math.random() + 2,
            title: 'Independent House in Sector 45, Gurgaon',
            description: 'Spacious 4BHK independent house with garden, parking, and modern amenities in prime location of Gurgaon. Perfect for families looking for space and comfort.',
            propertyType: 'house',
            transactionType: 'sale',
            price: 18000000,
            area: 2400,
            bedrooms: 4,
            bathrooms: 3,
            location: 'Sector 45, Gurgaon',
            amenities: ['Garden', 'Parking', 'Security', 'Power Backup', 'Water Supply'],
            images: [
                'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            ],
            ownerId: 'seller-1',
            ownerName: 'Amit Patel',
            ownerPhone: '+91-9876543212',
            status: 'approved',
            paymentStatus: 'completed',
            submittedAt: new Date(Date.now() - 259200000).toISOString(),
            approvedAt: new Date(Date.now() - 172800000).toISOString(),
            featured: true
        },
        {
            id: 'prop-' + Date.now() + Math.random() + 3,
            title: 'Commercial Office Space in Connaught Place',
            description: 'Prime commercial office space in the heart of Delhi. Ideal for businesses looking for a prestigious address with excellent connectivity.',
            propertyType: 'commercial',
            transactionType: 'rent',
            price: 80000,
            area: 1500,
            location: 'Connaught Place, Delhi',
            amenities: ['Elevator', 'Parking', 'Security', 'Power Backup', 'Reception'],
            images: [
                'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            ],
            ownerId: 'seller-1',
            ownerName: 'Sunita Gupta',
            ownerPhone: '+91-9876543213',
            status: 'approved',
            paymentStatus: 'completed',
            submittedAt: new Date(Date.now() - 345600000).toISOString(),
            approvedAt: new Date(Date.now() - 259200000).toISOString(),
            featured: false
        },
        {
            id: 'prop-' + Date.now() + Math.random() + 4,
            title: 'Luxury Villa with Pool in Whitefield',
            description: 'Stunning 5BHK villa with private swimming pool and landscaped garden in Whitefield, Bangalore. Perfect for luxury living with all modern amenities.',
            propertyType: 'villa',
            transactionType: 'sale',
            price: 45000000,
            area: 3500,
            bedrooms: 5,
            bathrooms: 4,
            location: 'Whitefield, Bangalore',
            amenities: ['Swimming Pool', 'Garden', 'Parking', 'Security', 'Power Backup', 'Gymnasium'],
            images: [
                'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/323775/pexels-photo-323775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            ],
            ownerId: 'seller-1',
            ownerName: 'Ravi Krishnan',
            ownerPhone: '+91-9876543214',
            status: 'pending',
            paymentStatus: 'pending',
            submittedAt: new Date(Date.now() - 43200000).toISOString(),
            featured: false
        }
    ];
    
    localStorage.setItem('settlespace_properties', JSON.stringify(sampleProperties));
}

function displayFeaturedProperties() {
    const container = document.getElementById('featured-properties');
    if (!container) return;
    
    const approvedProperties = properties.filter(p => 
        p.status === 'approved' && p.paymentStatus === 'completed' && p.featured
    );
    
    if (approvedProperties.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-home"></i><h3>No featured properties available</h3></div>';
        return;
    }
    
    container.innerHTML = approvedProperties.slice(0, 3).map(property => createPropertyCard(property)).join('');
    
    // Add click handlers
    container.querySelectorAll('.property-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = `property_detail.html?id=${approvedProperties[index].id}`;
        });
    });
}

function displayAllProperties(filteredProperties = null) {
    const container = document.getElementById('properties-grid');
    const resultsCount = document.getElementById('results-count');
    
    if (!container) return;
    
    const propertesToShow = filteredProperties || properties.filter(p => 
        p.status === 'approved' && p.paymentStatus === 'completed'
    );
    
    if (resultsCount) {
        resultsCount.textContent = `${propertesToShow.length} properties found`;
    }
    
    if (propertesToShow.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-home"></i><h3>No properties found</h3><p>Try adjusting your search criteria</p></div>';
        return;
    }
    
    container.innerHTML = propertesToShow.map(property => createPropertyCard(property)).join('');
    
    // Add click handlers
    container.querySelectorAll('.property-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = `property_detail.html?id=${propertesToShow[index].id}`;
        });
    });
}

function createPropertyCard(property) {
    const formatPrice = (price, type) => {
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
    };
    
    const bedroomText = property.bedrooms ? `${property.bedrooms} BHK` : '';
    const areaText = property.area ? `${property.area} sq ft` : '';
    const bathroomText = property.bathrooms ? `${property.bathrooms} Bath` : '';
    
    return `
        <div class="property-card glass-card">
            <div class="property-image" style="background-image: url('${property.images[0]}')">
                <div class="property-badge">${property.transactionType === 'sale' ? 'For Sale' : 'For Rent'}</div>
                <div class="property-price">${formatPrice(property.price, property.transactionType)}</div>
            </div>
            <div class="property-content">
                <h3 class="property-title">${property.title}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${property.location}
                </div>
                <div class="property-details">
                    ${bedroomText ? `<div class="property-detail"><i class="fas fa-bed"></i> ${bedroomText}</div>` : ''}
                    ${bathroomText ? `<div class="property-detail"><i class="fas fa-bath"></i> ${bathroomText}</div>` : ''}
                    ${areaText ? `<div class="property-detail"><i class="fas fa-ruler-combined"></i> ${areaText}</div>` : ''}
                </div>
                <div class="property-amenities">
                    ${property.amenities.slice(0, 3).map(amenity => 
                        `<span class="amenity-tag">${amenity}</span>`
                    ).join('')}
                    ${property.amenities.length > 3 ? `<span class="amenity-tag">+${property.amenities.length - 3} more</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Filter functions
function initializeFilters() {
    const filterForm = document.getElementById('property-filters');
    const quickSearchForm = document.getElementById('quick-search-form');
    const resetButton = document.getElementById('reset-filters');
    
    if (filterForm) {
        filterForm.addEventListener('change', applyFilters);
        filterForm.addEventListener('input', debounce(applyFilters, 500));
    }
    
    if (quickSearchForm) {
        quickSearchForm.addEventListener('submit', handleQuickSearch);
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
    
    // Initialize view toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            const container = document.getElementById('properties-grid');
            if (container) {
                container.className = view === 'list' ? 'properties-list' : 'properties-grid';
            }
        });
    });
}

function handleQuickSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const filters = Object.fromEntries(formData.entries());
    
    // Store filters in URL params and redirect to properties page
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
    });
    
    window.location.href = `properties.html?${params.toString()}`;
}

function applyFilters() {
    const transactionType = document.getElementById('filter-transaction-type')?.value;
    const propertyType = document.getElementById('filter-property-type')?.value;
    const location = document.getElementById('filter-location')?.value.toLowerCase();
    const priceRange = document.getElementById('filter-price-range')?.value;
    const bedrooms = document.getElementById('filter-bedrooms')?.value;
    const sortBy = document.getElementById('filter-sort')?.value;
    
    let filtered = properties.filter(p => 
        p.status === 'approved' && p.paymentStatus === 'completed'
    );
    
    // Apply filters
    if (transactionType) {
        filtered = filtered.filter(p => p.transactionType === transactionType);
    }
    
    if (propertyType) {
        filtered = filtered.filter(p => p.propertyType === propertyType);
    }
    
    if (location) {
        filtered = filtered.filter(p => 
            p.location.toLowerCase().includes(location) ||
            p.title.toLowerCase().includes(location)
        );
    }
    
    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }
    
    if (bedrooms) {
        const bedroomCount = parseInt(bedrooms);
        if (bedroomCount === 4) {
            filtered = filtered.filter(p => p.bedrooms >= 4);
        } else {
            filtered = filtered.filter(p => p.bedrooms === bedroomCount);
        }
    }
    
    // Apply sorting
    if (sortBy) {
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                break;
            case 'price_low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'area_large':
                filtered.sort((a, b) => b.area - a.area);
                break;
        }
    }
    
    displayAllProperties(filtered);
}

function resetFilters() {
    const form = document.getElementById('property-filters');
    if (form) {
        form.reset();
        displayAllProperties();
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Statistics update
function updateStats() {
    const totalPropertiesEl = document.getElementById('total-properties');
    const totalUsersEl = document.getElementById('total-users');
    const totalDealsEl = document.getElementById('total-deals');
    
    const users = JSON.parse(localStorage.getItem('settlespace_users') || '[]');
    const approvedProperties = properties.filter(p => p.status === 'approved');
    
    if (totalPropertiesEl) {
        totalPropertiesEl.textContent = `${approvedProperties.length}+`;
    }
    
    if (totalUsersEl) {
        totalUsersEl.textContent = `${users.length}+`;
    }
    
    if (totalDealsEl) {
        totalDealsEl.textContent = `${Math.floor(approvedProperties.length * 0.7)}+`;
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
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
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
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

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);