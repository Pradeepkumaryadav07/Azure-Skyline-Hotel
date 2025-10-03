// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser?.id);
    
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }
    
    // Update user info
    document.getElementById('userName').textContent = user.name;
    
    // Update rewards points
    const rewardsPoints = user.rewardsPoints || 0;
    document.getElementById('rewardsPoints').textContent = rewardsPoints;
    
    // Calculate progress to next reward (every 500 points)
    const pointsToNext = 500 - (rewardsPoints % 500);
    const progress = ((rewardsPoints % 500) / 500) * 100;
    
    document.getElementById('pointsToNext').textContent = pointsToNext;
    document.getElementById('rewardsProgress').style.width = `${progress}%`;
    
    // Display bookings
    displayBookings(user.bookings || []);
});

function displayBookings(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    
    if (!bookings || bookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="no-bookings">
                <i class="fas fa-calendar-alt" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>You don't have any bookings yet.</p>
                <a href="rooms.html" class="btn btn-primary" style="margin-top: 1rem;">Book a Room</a>
            </div>
        `;
        return;
    }
    
    // Sort bookings by date (newest first)
    const sortedBookings = [...bookings].sort((a, b) => 
        new Date(b.bookingDate) - new Date(a.bookingDate)
    );
    
    const bookingsHtml = sortedBookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <span class="booking-id">${booking.id}</span>
                <span class="booking-status">${booking.status}</span>
            </div>
            <h3>${booking.roomType}</h3>
            <div class="booking-details">
                <div class="detail-group">
                    <h4>Check-in</h4>
                    <p>${formatDate(booking.checkIn)}</p>
                </div>
                <div class="detail-group">
                    <h4>Check-out</h4>
                    <p>${formatDate(booking.checkOut)}</p>
                </div>
                <div class="detail-group">
                    <h4>Total Amount</h4>
                    <p>${booking.amount}</p>
                </div>
                <div class="detail-group">
                    <h4>Booking Date</h4>
                    <p>${formatDate(booking.bookingDate)}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    bookingsList.innerHTML = bookingsHtml;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
