
// ========================
// ROLE SELECTION UI
// ========================
const roleOptions = document.querySelectorAll('.role-option');

if (roleOptions.length > 0) {
    roleOptions.forEach(option => {
        option.addEventListener('click', function () {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;

            roleOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// ========================
// PASSWORD TOGGLE
// ========================
const passwordField = document.getElementById('password');

if (passwordField) {
    passwordField.addEventListener('dblclick', function () {
        this.type = this.type === 'password' ? 'text' : 'password';
    });
}

// ========================
// REMEMBER ME (LOAD DATA)
// ========================
const usernameInput = document.getElementById('username');
const rememberCheckbox = document.getElementById('remember');
const studentRole = document.getElementById('student');
const adminRole = document.getElementById('admin');

window.addEventListener('load', function () {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const rememberedRole = localStorage.getItem('rememberedRole');

    if (usernameInput && rememberedUser) {
        usernameInput.value = rememberedUser;
    }

    if (rememberCheckbox && rememberedUser) {
        rememberCheckbox.checked = true;
    }

    if (rememberedRole === 'admin' && adminRole) {
        adminRole.checked = true;
    } else if (rememberedRole === 'student' && studentRole) {
        studentRole.checked = true;
    }
});

// ========================
// REMEMBER ME (SAVE ON FORM SUBMIT)
// ========================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function () {

        const username = usernameInput ? usernameInput.value : "";
        const role = studentRole && studentRole.checked ? "student" : "admin";
        const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;

        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
            localStorage.setItem('rememberedRole', role);
        } else {
            localStorage.removeItem('rememberedUser');
            localStorage.removeItem('rememberedRole');
        }
    });
}

// ========================
// ANIMATIONS (OPTIONAL)
// ========================
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-10px); }
    40%,80% { transform: translateX(10px); }
}
`;
document.head.appendChild(style);





// ========================
// STORE COURSE + SEATS (MAIN SYSTEM)
// ========================
function setCourseAndSeats() {

    const course = document.getElementById("courseSelect").value;
    const seats = document.getElementById("seatInput").value;

    console.log(course, seats); // debug

    fetch("/set-config/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            course: course,
            seats: seats
        })
    })
    .then(async res => {
        const data = await res.json();
        console.log(data); // debug response

        document.getElementById("msg").innerText = data.message;
    })
    .catch(err => {
        console.error(err);
        document.getElementById("msg").innerText = "Configuration error";
    });
}


// ========================
// ALLOCATE STUDENTS
// ========================
function allocateStudents() {

    fetch("/allocate/", {
        method: "GET",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        }
    })
    .then(res => res.json())
    .then(data => {

        let html = "<h3>Allocated Students</h3>";
        html += "<table border='1' cellpadding='8'>";
        html += "<tr><th>Name</th><th>Marks</th><th>Course</th></tr>";

        data.allocated.forEach(s => {
            html += `
                <tr>
                    <td>${s.name}</td>
                    <td>${s.marks}</td>
                    <td>${s.course}</td>
                </tr>
            `;
        });

        html += "</table>";

        document.getElementById("allocationResult").innerHTML = html;
    })
    .catch(() => {
        document.getElementById("allocationResult").innerHTML = "Error loading allocation";
    });
}


// ========================
// CSRF HELPER (KEEP ONLY ONCE)
// ========================
function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();

            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}


// // ========================
// // SET TOTAL SEATS (ADMIN)
// // ========================
// function setSeats() {
//     const seats = document.getElementById("seatInput").value;

//     fetch("/set-seats/", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "X-CSRFToken": getCookie("csrftoken")
//         },
//         body: JSON.stringify({
//             seats: seats
//         })
//     })
//     .then(res => res.json())
//     .then(data => {
//         document.getElementById("seatMsg").innerText = data.message;
//     })
//     .catch(() => {
//         document.getElementById("seatMsg").innerText = "Error saving seats";
//     });
// }

// // CSRF helper (ADD THIS ONLY ONCE in your file)
// function getCookie(name) {
//     let cookieValue = null;

//     if (document.cookie && document.cookie !== '') {
//         const cookies = document.cookie.split(';');

//         for (let cookie of cookies) {
//             cookie = cookie.trim();

//             if (cookie.startsWith(name + '=')) {
//                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                 break;
//             }
//         }
//     }

//     return cookieValue;
// }



// // ========================
// // ALLOCATION (ADMIN)
// // ========================

// function allocateStudents() {
//     fetch("/allocate/", {
//         method: "GET",
//         headers: {
//             "X-CSRFToken": getCookie("csrftoken")
//         }
//     })
//     .then(res => res.json())
//     .then(data => {

//         let html = "<h3>Allocated Students</h3><table border='1'>";
//         html += "<tr><th>Name</th><th>Marks</th><th>Course</th></tr>";

//         data.allocated.forEach(s => {
//             html += `
//                 <tr>
//                     <td>${s.name}</td>
//                     <td>${s.marks}</td>
//                     <td>${s.course}</td>
//                 </tr>
//             `;
//         });

//         html += "</table>";

//         document.getElementById("allocationResult").innerHTML = html;
//     });
// }


// // ========================
// // STORE COURSE AND SEAT (ADMIN)
// // ========================


// function setCourseAndSeats() {

//     const course = document.getElementById("courseSelect").value;
//     const seats = document.getElementById("seatInput").value;

//     fetch("/set-config/", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "X-CSRFToken": getCookie("csrftoken")
//         },
//         body: JSON.stringify({
//             course: course,
//             seats: seats
//         })
//     })
//     .then(res => res.json())
//     .then(data => {
//         document.getElementById("msg").innerText = data.message;
//     });
// }