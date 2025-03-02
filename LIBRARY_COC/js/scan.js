let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });

Instascan.Camera.getCameras().then(function(cameras) {
    if (cameras.length > 0) {
        scanner.start(cameras[0]);
    } else {
        alert('No cameras found');
    }
}).catch(function(e) {
    console.error(e);
});

scanner.addListener('scan', function(c) {
    document.getElementById('text').value = c; // Set input value
    checkTimeIn(c); // Check if at least 1 minute has passed
});

function checkTimeIn(qrCode) {
    axios.post('http://localhost/test/check_timein.php', { text: qrCode }, {
        headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response) {
        if (response.data.canTimeout) {
            sendData(qrCode);
        } else {
            showMessage("Timeout must be at least 1 minute after time in.", "error");
        }
    })
    .catch(function(error) {
        showMessage("Error checking time in.", "error");
        console.error("Error:", error);
    });
}

// Function to send data for time in or time out
function sendData(qrCode) {
    axios.post('http://localhost/test/insert1.php', { text: qrCode }, {
        headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response) {
        showMessage("Scanned Data Successfully!", "success");
    })
    .catch(function(error) {
        showMessage("Failed to insert data.", "error");
        console.error("Error:", error);
    });
}

// Function to display success/error message
function showMessage(message, type) {
    let messageDiv = document.getElementById('message');

    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'message';
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '10px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.fontSize = '16px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.zIndex = '1000';
        document.body.appendChild(messageDiv);
    }

    messageDiv.style.backgroundColor = type === "success" ? "green" : "red";
    messageDiv.style.color = "white";
    messageDiv.innerText = message;

    setTimeout(() => { messageDiv.remove(); }, 3000);
}
