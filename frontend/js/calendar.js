// ===== REAL-TIME CLOCK =====
let clockInterval;

function initializeClock() {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('clockTime');
    const dateElement = document.getElementById('clockDate');
    
    if (timeElement && dateElement) {
        // Format time
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        
        // Format date
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// ===== CALENDAR FUNCTIONALITY =====
let currentDate = new Date();
let selectedDate = null;
let transactionDates = new Set();

function initializeCalendar() {
    setupCalendarEventListeners();
    renderCalendar();
    loadTransactionDates();
}

function setupCalendarEventListeners() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
}

function renderCalendar() {
    const calendarTitle = document.getElementById('calendarTitle');
    const calendarDays = document.getElementById('calendarDays');
    
    if (!calendarTitle || !calendarDays) return;
    
    // Update title
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    calendarTitle.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Clear calendar
    calendarDays.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate calendar days
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = date.getDate();
        
        // Check if it's today
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Check if it's in current month
        if (date.getMonth() !== currentDate.getMonth()) {
            dayElement.classList.add('other-month');
        } else {
            // Check if it has transactions
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            if (transactionDates.has(dateString)) {
                dayElement.classList.add('has-transactions');
            }
            
            // Add click event
            dayElement.addEventListener('click', () => selectDate(date));
        }
        
        calendarDays.appendChild(dayElement);
    }
}

async function loadTransactionDates() {
    try {
        const response = await fetch(`${API_BASE}/api/portfolio/transactions`);
        if (response.ok) {
            const transactions = await response.json();
            
            // Extract unique dates
            transactionDates.clear();
            transactions.forEach(transaction => {
                const date = new Date(transaction.transaction_date);
                const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                transactionDates.add(dateString);
            });
            
            // Re-render calendar to show transaction indicators
            renderCalendar();
        }
    } catch (error) {
        console.error('Failed to load transaction dates:', error);
    }
}

function selectDate(date) {
    // Remove previous selection
    const prevSelected = document.querySelector('.calendar-day.selected');
    if (prevSelected) {
        prevSelected.classList.remove('selected');
    }
    
    // Add selection to clicked date
    const clickedDay = event.target;
    clickedDay.classList.add('selected');
    
    selectedDate = date;
    
    // Load transactions for selected date
    loadTransactionsForDate(date);
}

async function loadTransactionsForDate(date) {
    const historyContainer = document.getElementById('transactionHistory');
    
    // Show loading state
    historyContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-gray);">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
            <p>Loading transactions for ${date.toLocaleDateString()}...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/api/portfolio/transactions`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        
        const allTransactions = await response.json();
        
        // Filter transactions for selected date
        const selectedYear = date.getFullYear();
        const selectedMonth = date.getMonth();
        const selectedDay = date.getDate();
        
        const filteredTransactions = allTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.transaction_date);
            return transactionDate.getFullYear() === selectedYear &&
                   transactionDate.getMonth() === selectedMonth &&
                   transactionDate.getDate() === selectedDay;
        });
        
        // Transform the data to match the expected format
        const transformedTransactions = filteredTransactions.map(transaction => ({
            id: transaction.id,
            type: transaction.transaction_type,
            asset: transaction.asset_name,
            symbol: transaction.symbol,
            quantity: transaction.quantity,
            price: transaction.price,
            date: transaction.transaction_date,
            total: transaction.total_value,
            asset_type: transaction.asset_type
        }));
        
        displayTransactionHistory(transformedTransactions);
        
    } catch (error) {
        console.error('Error loading transactions for date:', error);
        historyContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-gray);">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>Failed to load transactions</p>
                <p style="font-size: 14px; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

function displayTransactionHistory(transactions) {
    const historyContainer = document.getElementById('transactionHistory');
    
    if (transactions.length === 0) {
        historyContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-gray);">
                <i class="fas fa-calendar-times" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p>No transactions found for this date</p>
                <p style="font-size: 14px; margin-top: 10px;">Select another date to view transactions</p>
            </div>
        `;
        return;
    }
    
    const transactionList = document.createElement('div');
    transactionList.className = 'transaction-list';
    
    transactions.forEach((transaction, index) => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        transactionItem.style.animationDelay = `${index * 0.1}s`;
        transactionItem.style.animation = 'slideInFromLeft 0.5s ease-out forwards';
        transactionItem.style.opacity = '0';
        
        const isBuy = transaction.type === 'buy';
        const typeClass = isBuy ? 'buy' : 'sell';
        const typeIcon = isBuy ? 'fas fa-plus' : 'fas fa-minus';
        const typeColor = isBuy ? 'var(--success-green)' : 'var(--danger-red)';
        
        transactionItem.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${typeClass}" style="background: ${typeColor};">
                    <i class="${typeIcon}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.asset} (${transaction.symbol})</h4>
                    <p>${transaction.quantity} ${(transaction.asset_type === 'stock') ? 'shares' : (transaction.asset_type === 'bond') ? 'bonds' : ''} @ $${transaction.price}</p>
                    <small>${new Date(transaction.date).toLocaleDateString()}</small>
                </div>
            </div>
            <div class="transaction-value">
                                    <h4>$${transaction.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</h4>
                <p class="${typeClass}">${isBuy ? 'BUY' : 'SELL'}</p>
            </div>
        `;
        
        transactionList.appendChild(transactionItem);
        setTimeout(() => {
            transactionItem.style.opacity = '1';
        }, index * 100);
    });
    
    historyContainer.innerHTML = '';
    historyContainer.appendChild(transactionList);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeClock();
    initializeCalendar();
});

// Clean up interval when page unloads
window.addEventListener('beforeunload', function() {
    if (clockInterval) {
        clearInterval(clockInterval);
    }
});

// Export functions for other modules
window.CalendarManager = {
    initializeCalendar,
    loadTransactionDates,
    selectDate,
    loadTransactionsForDate
}; 