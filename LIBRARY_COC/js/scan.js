let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });

Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
        scanner.start(cameras[0]);
    } else {
        alert('No cameras found');
    }
}).catch(function (e) {
    console.error(e);
});

scanner.addListener('scan', function (STUDENTID) {
    document.getElementById('text').value = STUDENTID; // Set input value

    // Check if the same student is already displayed
    let currentStudentID = document.getElementById('studentInfo').getAttribute('data-student-id');

    if (currentStudentID === STUDENTID) {
        console.log("🔄 Same student ID scanned. No update needed.");
        return; // Stop execution if the same ID is scanned
    }

    processScan(STUDENTID); // Process scan
});

// Process Scan - Sends QR Code to insert1.php
function processScan(STUDENTID) {
    console.log("📤 Sending QR Code to insert1.php:", STUDENTID);

    axios.post('http://localhost/test/insert1.php', { text: STUDENTID }, {
        headers: { 'Content-Type': 'application/json' }
    })
    .then(function (response) {
        console.log("✅ API Response:", response.data);

        if (response.data.message) {
            showMessage(response.data.message, "success"); // Show success message
            fetchStudentDetails(STUDENTID); // Fetch student info from get_student.php
        } else if (response.data.error) {
            showMessage(response.data.error, "error");
            console.error("🚨 Insert Error:", response.data.error);
        }
    })
    .catch(function (error) {
        showMessage("Failed to insert data.", "error");
        console.error("❌ Error:", error);
    });
}


function fetchStudentDetails(STUDENTID) {
    axios.post('http://localhost/test/get_student.php', { STUDENTID: STUDENTID }, {
        headers: { 'Content-Type': 'application/json' }
    })
    .then(function (response) {
        console.log("📥 Student Details:", response.data);

        if (response.data.NAME) {
            let studentInfo = document.getElementById('studentInfo');
            studentInfo.setAttribute('data-student-id', STUDENTID);
            
            studentInfo.innerHTML = `
                <p><strong>Name:</strong> ${response.data.NAME}</p>
                <p><strong>Year Level:</strong> ${response.data.YEAR}</p>
                <p><strong>Course:</strong> ${response.data.COURSE}</p>
                <p><strong>Last Time In:</strong> ${response.data.TIMEIN || 'No Log Yet'}</p>
                <p><strong>Last Time Out:</strong> ${response.data.TIMEOUT || 'Still Inside'}</p>
            `;
        } else {
            showMessage("Student not found.", "error");
        }
    })
    .catch(function (error) {
        showMessage("Failed to fetch student details.", "error");
        console.error("❌ Error:", error);
    });
}


// Display success/error messages
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
