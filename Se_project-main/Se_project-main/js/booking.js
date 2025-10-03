// Import auth functions
if (typeof addBooking === 'undefined') {
    document.write('<script src="js/auth.js"><\/script>');
}

document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roomType = urlParams.get('room');
    const roomPrice = urlParams.get('price');
    
    // Set room details in the form
    if (roomType && roomPrice) {
        document.getElementById('roomType').value = roomType;
        document.getElementById('roomPrice').value = roomPrice;
        document.getElementById('summaryRoomType').textContent = roomType;
        document.getElementById('summaryTotal').textContent = `$${roomPrice}`;
    }
    
    // Set minimum date for check-in (today)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkIn').min = today;
    
    // Update check-out date minimum based on check-in date
    document.getElementById('checkIn').addEventListener('change', function() {
        document.getElementById('checkOut').min = this.value;
        calculateTotal();
    });
    
    // Update total when check-out date changes
    document.getElementById('checkOut').addEventListener('change', calculateTotal);
    
    // Calculate total amount
    function calculateTotal() {
        const checkIn = new Date(document.getElementById('checkIn').value);
        const checkOut = new Date(document.getElementById('checkOut').value);
        const price = parseFloat(document.getElementById('roomPrice').value) || 0;
        
        if (checkIn && checkOut && !isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
            const timeDiff = checkOut.getTime() - checkIn.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
            const total = nights * price;
            
            document.getElementById('summaryNights').textContent = nights > 0 ? nights : 0;
            document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
        }
    }
    
    // Razorpay Payment Integration
    document.getElementById('rzp-button').addEventListener('click', function(e) {
        e.preventDefault();
        
        const form = document.getElementById('bookingForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const roomType = document.getElementById('roomType').value;
        const amount = parseFloat(document.getElementById('summaryTotal').textContent.replace('$', '')) * 100; // Convert to paise
        
        // For demonstration purposes, we're using a test key
        // In production, you should use your actual Razorpay key and create orders on your server
        const options = {
            key: 'rzp_test_1DP5mmOlF5G5ag', // Test key - replace with your actual key in production
            amount: amount, // Amount is in currency subunits (e.g., paise for INR)
            currency: 'INR',
            name: 'Azure Skyline Hotel',
            description: `Booking for ${roomType}`,
            image: 'https://via.placeholder.com/150', // Add your logo URL
            handler: function(response) {
                // Create booking details
                const bookingDetails = {
                    name: name,
                    roomType: roomType,
                    checkIn: document.getElementById('checkIn').value,
                    checkOut: document.getElementById('checkOut').value,
                    amount: document.getElementById('summaryTotal').textContent,
                    bookingId: 'AZURE-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                    guests: {
                        adults: document.getElementById('adults').value,
                        children: document.getElementById('children').value
                    },
                    specialRequests: document.getElementById('specialRequests').value || 'None'
                };
                
                // Save booking to user's account
                const bookingSaved = addBooking(bookingDetails);
                
                if (bookingSaved) {
                    // Store in session storage for confirmation page
                    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
                    // Redirect to confirmation page
                    window.location.href = `booking-confirmation.html?booking=${bookingDetails.bookingId}`;
                } else {
                    alert('Error saving your booking. Please try again or contact support.');
                }
            },
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            notes: {
                room_type: roomType,
                check_in: document.getElementById('checkIn').value,
                check_out: document.getElementById('checkOut').value,
                address: 'Azure Skyline Hotel, 123 Luxury Avenue, Boston, MA 02108'
            },
            theme: {
                color: '#3399cc',
                hide_topbar: false
            },
            modal: {
                ondismiss: function() {
                    console.log('Payment window closed');
                }
            }
        };
        
        // For test mode, we're using direct checkout
        // In production, you should create an order on your server first
        const rzp = new Razorpay(options);
        
        // Handle payment errors
        rzp.on('payment.failed', function(response) {
            console.error('Payment failed:', response.error);
            alert('Payment failed: ' + (response.error.description || 'Unknown error occurred'));
            
            // Log the error to your analytics or error tracking service
            if (window.ga) {
                ga('send', 'event', 'Payment', 'Failed', response.error.code);
            }
        });
        
        // Open the payment window
        rzp.open();
    });
});
