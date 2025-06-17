function fetchDoctors(url, displayElementId) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const displayElement = document.getElementById(displayElementId);
            if (Array.isArray(data) && data.length > 0) {
                const headers = ["id", "name", "contactno", "email", "specialization", "expyears", "deptname"];
                let table = `<table border="1" cellpadding="5" cellspacing="0">
                                <thead><tr>`;
                headers.forEach(header => {
                    const label = header.charAt(0).toUpperCase() + header.slice(1);
                    table += `<th>${label}</th>`;
                });
                table += `</tr></thead><tbody>`;

                data.forEach(item => {
                    table += `<tr>`;
                    headers.forEach(header => {
                        table += `<td>${item[header]}</td>`;
                    });
                    table += `</tr>`;
                });

                table += `</tbody></table>`;
                displayElement.innerHTML = table;
            } else {
                displayElement.innerHTML = "No doctor data available.";
            }
        })
        .catch(error => {
            console.error("Doctor Fetch Error:", error);
            document.getElementById(displayElementId).innerHTML = "Error loading doctor data.";
        });
}


function fetchPatients(url, displayElementId) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const displayElement = document.getElementById(displayElementId);
            if (Array.isArray(data) && data.length > 0) {
                const headers = ["id", "name", "age", "gender", "phoneno", "email"];
                let table = `<table border="1" cellpadding="5" cellspacing="0">
                                <thead><tr>`;
                headers.forEach(header => {
                    const label = header.charAt(0).toUpperCase() + header.slice(1);
                    table += `<th>${label}</th>`;
                });
                table += `</tr></thead><tbody>`;

                data.forEach(item => {
                    table += `<tr>`;
                    headers.forEach(header => {
                        table += `<td>${item[header]}</td>`;
                    });
                    table += `</tr>`;
                });

                table += `</tbody></table>`;
                displayElement.innerHTML = table;
            } else {
                displayElement.innerHTML = "No patient data available.";
            }
        })
        .catch(error => {
            console.error("Patient Fetch Error:", error);
            document.getElementById(displayElementId).innerHTML = "Error loading patient data.";
        });
}


function fetchAppointments(url, displayElementId) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const displayElement = document.getElementById(displayElementId);
            if (Array.isArray(data) && data.length > 0) {
                const headers = ["displayid", "patientname", "doctorname", "deptname", "date", "status"];
                let table = `<table border="1" cellpadding="5" cellspacing="0">
                                <thead><tr>`;
                headers.forEach(header => {
                    const capitalized = header.charAt(0).toUpperCase() + header.slice(1);
                    table += `<th>${capitalized}</th>`;
                });
                table += `</tr></thead><tbody>`;

                data.forEach(item => {
                    table += `<tr>`;
                    headers.forEach(header => {
                        if (header === "status") {
                            table += `<td>
                                <select onchange="updateAppointmentStatus('${item.id}', this.value)">
                                    <option value="Pending" ${item.status === "Pending" ? "selected" : ""}>Pending</option>
                                    <option value="Scheduled" ${item.status === "Scheduled" ? "selected" : ""}>Scheduled</option>
                                    <option value="Completed" ${item.status === "Completed" ? "selected" : ""}>Completed</option>
                                    <option value="Cancelled" ${item.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                                </select>
                            </td>`;
                        } else if (header === "date") {
                            const rawDate = new Date(item[header]);
                            const options = { year: 'numeric', month: 'short', day: '2-digit' };
                            const formattedDate = rawDate.toLocaleDateString('en-GB', options);
                            table += `<td>${formattedDate}</td>`;
                        } else {
                            table += `<td>${item[header]}</td>`;
                        }
                    });
                    table += `</tr>`;
                });

                table += `</tbody></table>`;
                displayElement.innerHTML = table;
            } else {
                displayElement.innerHTML = "No appointments available.";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById(displayElementId).innerHTML = "Error fetching appointments.";
        });
}


function updateAppointmentStatus(appointmentId, newStatus) {
    console.log("Updating ID:", appointmentId, "to:", newStatus); // ✅ DEBUG
    fetch(`http://localhost:5000/appointment/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server response:", data); // ✅ DEBUG
        alert("Status updated successfully!");
        fetchAppointments('/appointment', 'appointmentDisplayDiv');
    })
    .catch(error => {
        console.error("Error updating status:", error);
    });
}
