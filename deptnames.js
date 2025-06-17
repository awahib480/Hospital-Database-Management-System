const departments = [
    {
        name: "Cardiology",
        image: "assets/images/department_pictures/cardiology.jpeg",
        doctors: ["Dr. John Smith", "Dr. Alan Cooper", "Dr. Rachel Adams"]
    },
    {
        name: "Dermatology",
        image: "assets/images/department_pictures/dermatology.jpeg",
        doctors: ["Dr. Sophia Davis", "Dr. Mark Allen", "Dr. Olivia Clark"]
    },
    {
        name: "General Surgery",
        image: "assets/images/department_pictures/general_surgery.jpeg",
        doctors: ["Dr. James Miller", "Dr. Sarah King", "Dr. William Scott"]
    },
    {
        name: "Neurology",
        image: "assets/images/department_pictures/neurology.jpeg",
        doctors: ["Dr. Emily Johnson", "Dr. Henry Lee", "Dr. Natalie Thomas"]
    },
    {
        name: "Oncology",
        image: "assets/images/department_pictures/oncology.jpeg",
        doctors: ["Dr. Carlos Garcia", "Dr. Maria Perez", "Dr. Thomas Walker"]
    },
    {
        name: "Orthopedics",
        image: "assets/images/department_pictures/orthopedics.jpeg",
        doctors: ["Dr. David Williams", "Dr. Megan Clark", "Dr. Brain Lee"]
    },
    {
        name: "Pediatrics",
        image: "assets/images/department_pictures/pediatrics.jpeg",
        doctors: ["Dr. Laura Brown", "Dr. Jessica White", "Dr. Kevin Harris"]
    },
    {
        name: "Psychiatry",
        image: "assets/images/department_pictures/psychiatry.jpeg",
        doctors: ["Dr. Danial Robinson", "Dr. Laura Evans", "Dr. Brian Mitchell"]
    },
    {
        name: "Radiology",
        image: "assets/images/department_pictures/radiology.jpeg",
        doctors: ["Dr. Maria Martinez", "Dr. Joseph Lewis", "Dr. Emily Harris"]
    },
    {
        name: "Urology",
        image: "assets/images/department_pictures/urology.jpeg",
        doctors: ["Dr. Linda Clark", "Dr. Kevin Moore", "Dr. Jessica White"]
    }
];

const departmentGrid = document.getElementById('departmentGrid');

departments.forEach(dept => {
    const card = document.createElement('div');
    card.className = 'department-card';
    card.innerHTML = `
        <img src="${dept.image}" alt="${dept.name}">
        <div class="department-info">
            <h2>${dept.name}</h2>
            <p><strong>Doctors:</strong></p>
            <ul>
                ${dept.doctors.map(doc => `<li>${doc}</li>`).join('')}
            </ul>
        </div>
    `;
    departmentGrid.appendChild(card);
});
