
// Helper to capitalize
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function groupBySpecialty(doctors) {
    const grouped = {};
    for (const doctor of doctors) {
        if (!grouped[doctor.specialty]) {
            grouped[doctor.specialty] = [];
        }
        grouped[doctor.specialty].push(doctor);
    }
    return grouped;
}

function createDoctorCard(doctor, index) {
    const isMale = doctor.gender === "male";
    const imageClass = isMale ? "rowbox11" : "rowbox12";
    const buttonClass = `button${(index % 3) + 1}`;

    return `
        <div class="rowbox">
            <div class="${imageClass}"></div>
            <div class="row1box12" style="padding: 20px; border-radius: 8px;">
                <div class="text" style="font-family:sans-serif">
                    <div style="color:#23408E;"><b>${doctor.name}</b></div>
                    <div>${doctor.specialty}</div>
                </div>
                <button onclick="searchDoctor('${doctor.name}')" class="button ${buttonClass}" style="margin-top: 20px">
                    View Details
                </button>
            </div>
        </div>
    `;
}

function renderDoctors(doctors) {
    const grouped = groupBySpecialty(doctors);
    const container = document.createElement('div');

    let count = 0;
    for (const specialty in grouped) {
        const doctorsInGroup = grouped[specialty];
        for (let i = 0; i < doctorsInGroup.length; i += 3) {
            const row = document.createElement('div');
            row.className = "row1";
            const batch = doctorsInGroup.slice(i, i + 3);
            batch.forEach((doc, idx) => {
                row.innerHTML += createDoctorCard(doc, idx);
            });
            container.appendChild(row);
        }
    }

    // Insert after slide section
    const slideSection = document.querySelector(".slide");
    slideSection.insertAdjacentElement('afterend', container);
}


function searchDoctor(name) {
    fetch('http://127.0.0.1:5000/search_doctor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
    })
    .then(response => response.json())
    .then(data => {
        const popupBg = document.getElementById('popup-background');
        const infoPopup = document.getElementById('doctor-info-popup');
        const alertPopup = document.getElementById('alert-popup');

        if (data.error) {
            popupBg.style.display = "block";
            infoPopup.style.display = "none";
            alertPopup.style.display = "block";
        } else {
            document.getElementById('doctor-info-content').innerHTML = `
                <h3>${data.doctor_name}</h3>
                <p><strong>Specialty:</strong> ${data.specialization}</p>
                <p><strong>Experience Years:</strong> ${data.experienceyears}</p>
                <p><strong>Contact:</strong> ${data.contact_no}</p>
                <p><strong>Email:</strong> ${data.email}</p>
            `;
            popupBg.style.display = "block";
            infoPopup.style.display = "block";
            alertPopup.style.display = "none";
        }
    })
    .catch(error => {
        console.error('Error fetching doctor:', error);
    });
}


function closePopup() {
    document.getElementById('popup-background').style.display = 'none';
    document.getElementById('doctor-info-popup').style.display = 'none';
    document.getElementById('alert-popup').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", () => {
    renderDoctors(doctorsList);
});
