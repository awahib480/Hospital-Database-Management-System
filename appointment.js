document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });


    // Book Appointment
    document.getElementById('bookForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;

    // Constraints
    // Name validation: letters and spaces only
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(f.name.value)) {
        alert("Name must contain only letters and spaces.");
        return;
    }
    // Age validation: non-negative
    if (parseInt(f.age.value) < 0) {
        alert("Age cannot be negative.");
        return;
    }
    // Email validation: must include @
    if (!f.email.value.includes('@')) {
        alert("Email must contain '@'.");
        return;
    }
    // Date validation: must be after today
    const selectedDate = new Date(f.date.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    if (selectedDate <= today) {
        alert("Please select a date after today.");
        return;
    }

    const payload = {
        name: f.name.value,
        age: f.age.value,
        gender: f.gender.value,
        phoneno: f.phoneno.value,
        email: f.email.value,
        doctor: f.doctor.value,
        date: f.date.value
    };

    const resp = await fetch('http://localhost:5000/book', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (resp.ok) {
        const { appointment_id } = await resp.json();
        // Formatted ID
        const formattedId = `TMH-A-${String(appointment_id).padStart(4, '0')}`;

        // Show modal
        document.getElementById('apptIdDisplay').textContent = formattedId;
        document.getElementById('appointmentModal').style.display = 'block';

        // Copy to clipboard option
        navigator.clipboard.writeText(formattedId).catch(console.error);

        f.reset();
    }
    });


    // Check Status
    document.getElementById('statusForm').addEventListener('submit', async e => {
        e.preventDefault();
        const input = e.target.appointment_id.value.trim();
        const match = input.match(/^TMH-A-(\d{1,})$/i);

        let numericId;
        if (match) {
            numericId = match[1]; // Extracted number from formatted ID
        } else if (/^\d+$/.test(input)) {
            numericId = input; // Allow raw numeric ID as fallback
        } else {
            alert("Please enter a valid appointment ID (e.g., TMH-A-0023 or 23).");
            return;
        }

        const resp = await fetch(`http://localhost:5000/status/${encodeURIComponent(numericId)}`);

        const resultEl = document.getElementById('statusResult');
        resultEl.innerHTML = '';

        if (resp.ok) {
            const data = await resp.json();

            // Format the ID to display
            const formattedId = `TMH-A-${String(data.appointment_id).padStart(4, '0')}`;

            // Color select based on status
            let statusColor;
            switch (data.status.toLowerCase()) {
                case 'pending':
                    statusColor = 'orange';
                    break;
                case 'scheduled':
                    statusColor = 'blue';
                    break;
                case 'completed':
                    statusColor = 'green';
                    break;
                case 'cancelled':
                    statusColor = 'red';
                    break;
                default:
                    statusColor = 'gray';
            }
        
            resultEl.innerHTML = `
                <p class="text"><strong>Appointment ID:</strong> ${formattedId}</p>
                <p class="text"><strong>Patient Name:</strong> ${data.patient_name}</p>
                <p class="text"><strong>Doctor:</strong> ${data.doctor_name}</p>
                <p class="text"><strong>Department:</strong> ${data.department_name}</p>
                <p class="text"><strong>Date:</strong> ${data.appointment_date}</p>
                <p class="text"><strong>Status:</strong> <span style="color:${statusColor}; font-weight:bold;">${data.status}</span></p>
            `;
        }
        else {
            resultEl.innerHTML = `<p class="text">No appointment found with ID ${id}</p>`;
        }
    });


    // Close modal
    document.querySelector('.close-btn').onclick = () => {
    document.getElementById('appointmentModal').style.display = 'none';
    };

    document.getElementById('copyBtn').onclick = () => {
    const text = document.getElementById('apptIdDisplay').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
        }).catch(console.error);
    };

    // Close modal if clicked outside
    window.onclick = e => {
    if (e.target.id === 'appointmentModal') {
    document.getElementById('appointmentModal').style.display = 'none';
    }
    };
});