
// ======================================
// STUDENT MANAGEMENT SYSTEM
// ======================================

// Get HTML elements
const studentForm = document.getElementById("studentForm");
const studentModal = document.getElementById("studentModal");
const studentTableBody = document.getElementById("studentTableBody");

const addStudentBtn = document.getElementById("addStudentBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");
const yearFilter = document.getElementById("yearFilter");

const emptyMessage = document.getElementById("emptyMessage");

// Input fields
const rollNumber = document.getElementById("rollNumber");
const studentName = document.getElementById("studentName");
const email = document.getElementById("email");
const department = document.getElementById("department");
const year = document.getElementById("year");
const gender = document.getElementById("gender");
const marks = document.getElementById("marks");

// Toast Notification Function
function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}


// Track which student is being edited
let editingRoll = null;

// ======================================
// 1. LOAD DATA FROM LOCAL STORAGE
// ======================================

let students = [];

try {
    const savedStudents = localStorage.getItem("students");
    const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];

    if (Array.isArray(parsedStudents)) {
        students = parsedStudents;
    }
} catch (error) {
    console.error("Unable to load student data:", error);
    students = [];
}

// Save student data
function saveToLocalStorage() {
    localStorage.setItem("students", JSON.stringify(students));
}

// ======================================
// 2. OPEN AND CLOSE MODAL
// ======================================

function openModal() {
    studentModal.classList.add("show");
}

function closeModal() {
    studentModal.classList.remove("show");
    studentForm.reset();
    editingRoll = null;

    document.getElementById("modalTitle").textContent =
        "Add New Student";

    document.getElementById("saveBtn").textContent =
        "Save Student";
}

addStudentBtn.addEventListener("click", function () {
    closeModal();
    openModal();
});

closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

// Close popup when clicking outside
studentModal.addEventListener("click", function (event) {
    if (event.target === studentModal) {
        closeModal();
    }
});

// ======================================
// 3. ADD OR UPDATE STUDENT
// ======================================

studentForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const student = {
        roll: rollNumber.value.trim(),
        name: studentName.value.trim(),
        email: email.value.trim(),
        department: department.value,
        year: year.value,
        gender: gender.value,
        marks: Number(marks.value)
    };

    // Check for duplicate roll numbers
    const duplicate = students.some(function (s) {
        return s.roll.toLowerCase() === student.roll.toLowerCase()
            && s.roll !== editingRoll;
    });

    if (duplicate) {
        alert("This roll number already exists!");
        return;
    }

    // Update existing student
    if (editingRoll !== null) {

        students = students.map(function (s) {
            if (s.roll === editingRoll) {
                return student;
            }
            return s;
        });

        alert("Student details updated successfully!");

    } else {

        // Add new student
        students.push(student);

        alert("Student added successfully!");
    }

    saveToLocalStorage();
    displayStudents();
    updateStatistics();
    closeModal();

});

// ======================================
// 4. DISPLAY STUDENTS IN TABLE
// ======================================

function displayStudents() {

    studentTableBody.innerHTML = "";

    const searchValue = searchInput.value.toLowerCase().trim();
    const selectedDepartment = departmentFilter.value;
    const selectedYear = yearFilter.value;

    // Search and filter students
    const filteredStudents = students.filter(function (student) {

        const matchesSearch =
            student.name.toLowerCase().includes(searchValue) ||
            student.roll.toLowerCase().includes(searchValue);

        const matchesDepartment =
            selectedDepartment === "" ||
            student.department === selectedDepartment;

        const matchesYear =
            selectedYear === "" ||
            student.year === selectedYear;

        return matchesSearch && matchesDepartment && matchesYear;

    });

    // Show empty message if no records exist
    emptyMessage.style.display =
        filteredStudents.length === 0 ? "block" : "none";

    // Create table rows
    filteredStudents.forEach(function (student) {

        const row = document.createElement("tr");

        // Escape user-entered text before adding it to HTML
        function safe(value) {
            return String(value).replace(/[&<>"']/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                }[char];
            });
        }

        row.innerHTML = `
            <td>${safe(student.roll)}</td>

            <td class="student-name">
                ${safe(student.name)}
            </td>

            <td>${safe(student.email)}</td>

            <td>${safe(student.department)}</td>

            <td>${safe(student.year)}</td>

            <td>${safe(student.gender)}</td>

            <td>
                <span class="marks-badge">
                    ${safe(student.marks)}%
                </span>
            </td>

            <td>
                <button class="action-btn edit-btn"
                    data-action="edit"
                    data-roll="${encodeURIComponent(student.roll)}">
                    Edit
                </button>

                <button class="action-btn delete-btn"
                    data-action="delete"
                    data-roll="${encodeURIComponent(student.roll)}">
                    Delete
                </button>
            </td>
        `;

        studentTableBody.appendChild(row);

    });

}

// ======================================
// 5. EDIT STUDENT
// ======================================

function editStudent(roll) {

    const student = students.find(function (s) {
        return s.roll === roll;
    });

    if (!student) return;

    editingRoll = student.roll;

    rollNumber.value = student.roll;
    studentName.value = student.name;
    email.value = student.email;
    department.value = student.department;
    year.value = student.year;
    gender.value = student.gender;
    marks.value = student.marks;

    document.getElementById("modalTitle").textContent =
        "Edit Student Details";

    document.getElementById("saveBtn").textContent =
        "Update Student";

    openModal();
}

// ======================================
// 6. DELETE STUDENT
// ======================================

function deleteStudent(roll) {

    const confirmation = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmation) return;

    students = students.filter(function (student) {
        return student.roll !== roll;
    });

    saveToLocalStorage();
    displayStudents();
    updateStatistics();

    showToast("Student deleted successfully!");

}

// Handle Edit and Delete button clicks
studentTableBody.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const roll = decodeURIComponent(button.dataset.roll);

    if (button.dataset.action === "edit") {
        editStudent(roll);
    }

    if (button.dataset.action === "delete") {
        deleteStudent(roll);
    }

});

// ======================================
// 7. SEARCH AND FILTER
// ======================================

searchInput.addEventListener("input", displayStudents);

departmentFilter.addEventListener("change", displayStudents);

yearFilter.addEventListener("change", displayStudents);

// ======================================
// 8. UPDATE DASHBOARD STATISTICS
// ======================================

function updateStatistics() {

    // Total students
    document.getElementById("totalStudents").textContent =
        students.length;

    // Total unique departments
    const departments = new Set(
        students.map(function (s) {
            return s.department;
        })
    );

    document.getElementById("totalDepartments").textContent =
        departments.size;

    // Average marks
    let average = 0;

    if (students.length > 0) {

        const totalMarks = students.reduce(function (sum, s) {
            return sum + Number(s.marks);
        }, 0);

        average = totalMarks / students.length;
    }

    document.getElementById("averageMarks").textContent =
        average.toFixed(1) + "%";

    // Female students
    const femaleCount = students.filter(function (s) {
        return s.gender === "Female";
    }).length;

    document.getElementById("femaleStudents").textContent =
        femaleCount;

}

// ======================================
// 9. INITIALIZE DASHBOARD
// ======================================

displayStudents();
updateStatistics();
// ======================================
// 10. EXPORT STUDENT DATA TO CSV
// ======================================

const exportBtn = document.getElementById("exportBtn");

exportBtn.addEventListener("click", function () {

    if (students.length === 0) {
        alert("No student records available to export!");
        return;
    }

    const headers = [
        "Roll Number",
        "Student Name",
        "Email",
        "Department",
        "Year",
        "Gender",
        "Marks"
    ];

    const rows = students.map(function (student) {

        return [
            student.roll,
            student.name,
            student.email,
            student.department,
            student.year,
            student.gender,
            student.marks
        ];
    });

    // Escape CSV values
    function escapeCSV(value) {

        let text = String(value ?? "");

        // Prevent spreadsheet formula injection
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }

    const csvContent = [
        headers,
        ...rows
    ].map(function (row) {
        return row.map(escapeCSV).join(",");
    }).join("\r\n");

    // Create downloadable CSV file
    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "student_records.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    alert("Student records exported successfully!");

});

// ======================================
// RESET SEARCH AND FILTERS
// ======================================

const resetFiltersBtn = document.getElementById("resetFiltersBtn");

resetFiltersBtn.addEventListener("click", function () {

    // Get existing search and filter elements
    const searchInput = document.getElementById("searchInput");
    const departmentFilter = document.getElementById("departmentFilter");
    const yearFilter = document.getElementById("yearFilter");

    // Clear search
    searchInput.value = "";

    // Reset department filter
    departmentFilter.value = "";

    // Reset academic year filter
    yearFilter.value = "";

    // Trigger existing filtering functions
    searchInput.dispatchEvent(new Event("input", {
        bubbles: true
    }));

    departmentFilter.dispatchEvent(new Event("change", {
        bubbles: true
    }));

    yearFilter.dispatchEvent(new Event("change", {
        bubbles: true
    }));

});
// Toast Notification Function

function showToast(message, type = "success") {

    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");

    toast.className = "toast";

    if (type === "error") {
        toast.classList.add("error");
    }

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, 3000);
}