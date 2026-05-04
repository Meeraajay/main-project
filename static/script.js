console.log("script.js loaded successfully");


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
// REMEMBER ME (SAVE ON LOGIN)
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
// CSRF HELPER
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


// ========================
// SET COURSE + SEATS
// ========================
function setCourseAndSeats() {

    const course = document.getElementById("courseSelect").value;
    const seats = document.getElementById("seatInput").value;

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
    .then(res => res.json())
    .then(data => {
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

        let html = "";

        if (data.message) {
            html += `<p style="color:blue;"><b>${data.message}</b></p>`;
        }

        if (!data.allocated || data.allocated.length === 0) {
            document.getElementById("allocationResult").innerHTML = html;
            return;
        }

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
    .catch(err => {
        console.log(err);
        document.getElementById("allocationResult").innerHTML =
            "<p style='color:red;'>Error loading allocation</p>";
    });
}


// ========================
// PHASE CONTROL
// ========================
window.setPhase = function(phase){

    fetch("/set-phase/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: "phase=" + phase
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("phaseMsg").innerText =
            "Current Phase: " + data.phase;
    })
    .catch(err => console.log(err));
};


// ========================
// LOAD PENDING CASES
// ========================
window.loadPending = function () {

    fetch("/pending-candidates/")
    .then(res => res.json())
    .then(data => {

        let box = document.getElementById("pendingBox");
        box.innerHTML = "";

        let pendingList = data.pending || [];
        let cutoff = data.cutoff || 0;

        if (pendingList.length === 0) {
            box.innerHTML = "<p>No pending cases</p>";
            return;
        }

        pendingList.forEach(s => {

            box.innerHTML += `
                <div style="
                    border:1px solid #ccc;
                    padding:15px;
                    margin:10px;
                    border-radius:8px;
                ">

                    <h3>
                        ${s.name}
                        ${s.priority === "HIGH" ? "🟢 HIGH PRIORITY" : "🔴 NORMAL"}
                    </h3>

                    <p><b>Marks:</b> ${s.marks}</p>
                    <p><b>Cutoff:</b> ${cutoff}</p>

                    ${s.suggestion ? `
                        <p style="color:green;">
                            💡 Suggestion: Higher than cutoff student
                        </p>
                    ` : ""}

                    <button onclick="decide(${s.id}, 'accept')">Accept</button>
                    <button onclick="decide(${s.id}, 'reject')">Reject</button>
                    <button onclick="decide(${s.id}, 'replace')">Replace Lowest</button>

                </div>
            `;
        });

    })
    .catch(err => {
        console.log("Pending error:", err);
        document.getElementById("pendingBox").innerHTML =
            "<p>Error loading pending cases</p>";
    });
};


// ========================
// ADMIN DECISION
// ========================
function decide(id, action) {

    fetch("/admin-decision/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            student_id: id,
            action: action
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.message) {
            alert(data.message);
        }

        loadPending();
    })
    .catch(err => console.log(err));
}


window.addEventListener("load", function () {

    fetch("/system-state/")
    .then(res => res.json())
    .then(data => {

        console.log("Restored state:", data);

        // restore phase text
        document.getElementById("phaseMsg").innerText =
            "Current Phase: " + data.phase;

        // restore course
        if (data.course) {
            document.getElementById("courseSelect").value = data.course;
        }

        // restore seats
        if (data.seats) {
            document.getElementById("seatInput").value = data.seats;
        }
    });
});