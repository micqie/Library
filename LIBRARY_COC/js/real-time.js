function updateClock() {
    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true
    });
    document.getElementById('realTimeClock').innerText = formattedTime;
}

// Update the clock every second
setInterval(updateClock, 1000);
updateClock(); // Run once immediately