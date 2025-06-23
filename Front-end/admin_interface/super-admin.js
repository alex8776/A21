document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("admin_token");
    const feedback = document.getElementById("admin-feedback");

    if (!token) {
        window.location.href = "/admin-interface/super-admin-login.html";
        return;
    }

    const payload = parseJwt(token);

    if (!payload || payload.is_superadmin !== true) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin-interface/super-admin-login.html";
        return;
    }

    // Afficher la section de gestion
    document.getElementById("admin-management").style.display = "block";

    // Charger la liste des admins
    fetchAdmins();
});

function parseJwt(token) {
    try {
        const base64Payload = token.split('.')[1];
        const jsonPayload = atob(base64Payload);
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

function logout() {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin-interface/super-admin-login.html";
}

async function fetchAdmins() {
    const token = localStorage.getItem("admin_token");
    const adminList = document.getElementById("admin-list");
    adminList.innerHTML = "";

    try {
        const response = await fetch("http://localhost:8000/admin/superadmin/list", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            adminList.textContent = "Impossible de charger la liste des administrateurs.";
            return;
        }

        const admins = await response.json();

        admins.forEach(admin => {
            const div = document.createElement("div");
            div.textContent = admin.username;

            // Empêche de supprimer un super admin
            if (!admin.is_superadmin) {
                const delBtn = document.createElement("button");
                delBtn.textContent = "Supprimer";
                delBtn.style.marginLeft = "10px";
                delBtn.onclick = () => deleteAdmin(admin.id);
                div.appendChild(delBtn);
            } else {
                const label = document.createElement("span");
                label.textContent = " (super admin)";
                label.style.marginLeft = "10px";
                label.style.color = "gray";
                div.appendChild(label);
            }

            adminList.appendChild(div);
        });


    } catch (err) {
        console.error("Erreur lors du chargement des admins :", err);
        adminList.textContent = "Erreur réseau.";
    }
}

async function createAdmin() {
    const username = document.getElementById("new-admin-username").value.trim();
    const password = document.getElementById("new-admin-password").value.trim();
    const feedback = document.getElementById("admin-feedback");
    const token = localStorage.getItem("admin_token");

    if (!username || !password) {
        feedback.textContent = "Nom d'utilisateur et mot de passe requis.";
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/admin/superadmin/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            feedback.textContent = "Erreur lors de la création de l'admin.";
            return;
        }

        feedback.textContent = "Administrateur créé avec succès.";
        document.getElementById("new-admin-username").value = "";
        document.getElementById("new-admin-password").value = "";
        fetchAdmins();

    } catch (err) {
        console.error("Erreur création admin :", err);
        feedback.textContent = "Erreur réseau.";
    }
}

async function deleteAdmin(adminId) {
    const token = localStorage.getItem("admin_token");
    const confirmed = confirm("Voulez-vous vraiment supprimer cet administrateur ?");
    if (!confirmed) return;

    try {
        const response = await fetch(`http://localhost:8000/admin/superadmin/delete/${adminId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            alert("Échec de la suppression.");
            return;
        }

        fetchAdmins();
    } catch (err) {
        console.error("Erreur suppression admin :", err);
        alert("Erreur réseau.");
    }
}
