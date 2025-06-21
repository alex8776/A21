let token = null;
let isSuperadmin = false;


window.onload = () => {
  const savedToken = localStorage.getItem("admin_token");
  if (savedToken) {
    token = savedToken;
    const payload = parseJwt(token);
    isSuperadmin = payload?.is_superadmin || false;

    // Si c'est un superadmin, on redirige directement vers la page super-admin
    if (isSuperadmin) {
      if (window.location.pathname !== "/super-admin") {
        window.location.href = "/super-admin";
        return;
      }
      // Si on est déjà sur la page super-admin, afficher la section correspondante

      const loginSection = document.getElementById("login-section");
      if (loginSection) loginSection.style.display = "none";

      const pendingSection = document.getElementById("pending-section");
      if (pendingSection) pendingSection.style.display = "none";

      const adminSection = document.getElementById("admin-management");
      if (adminSection) adminSection.style.display = "block";

      fetchAdminList();
      return;
    }


    // Sinon pour un admin "normal"
    if (window.location.pathname !== "/admin/pending") {
      window.location.href = "/admin/pending";
      return;
    }

    document.getElementById("login-section").style.display = "none";
    document.getElementById("pending-section").style.display = "block";
    document.getElementById("admin-management").style.display = "none";

    fetchPendingUsers();

  } else {
    // Pas de token, on va vers la page login
    if (window.location.pathname !== "/admin-login") {
      window.location.href = "/admin-login";
    }
  }
};

// Le reste de ton code (logout, login, parseJwt, etc.) reste inchangé.

function logout() {
  token = null;
  isSuperadmin = false;
  localStorage.removeItem("admin_token");
  document.getElementById("login-section").style.display = "block";
  document.getElementById("pending-section").style.display = "none";
  document.getElementById("admin-management").style.display = "none";
  document.getElementById("pending-users").innerHTML = "";
  document.getElementById("admin-list").innerHTML = "";
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const feedback = document.getElementById("login-feedback");

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);
  formData.append("grant_type", "password");

  try {
    const response = await fetch("http://localhost:8000/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });

    if (!response.ok) {
      feedback.textContent = "Échec de la connexion.";
      return;
    }

    const data = await response.json();
    token = data.access_token;
    localStorage.setItem("admin_token", token);

    const payload = parseJwt(token);
    isSuperadmin = payload?.is_superadmin || false;

    document.getElementById("login-section").style.display = "none";
    document.getElementById("pending-section").style.display = "block";

    if (isSuperadmin) {
      document.getElementById("admin-management").style.display = "block";
      fetchAdminList();
    }

    fetchPendingUsers();
  } catch (error) {
    feedback.textContent = "Erreur de connexion.";
    console.error(error);
  }
}

function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function fetchPendingUsers() {
  try {
    const response = await fetch("http://localhost:8000/admin/pending", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const users = await response.json();
    const container = document.getElementById("pending-users");
    container.innerHTML = "";

    users.forEach(user => {
      const div = document.createElement("div");
      div.className = "user-card";
      div.setAttribute("data-user-id", user.id);
      div.innerHTML = `
        <p><strong>${escapeHTML(user.prenom)} ${escapeHTML(user.nom)}</strong>
        <span class="badge badge-attente">En attente</span></p>
        <p>Email : ${escapeHTML(user.email)}</p>
        <p>Téléphone : ${escapeHTML(user.numero)}</p>
        <p>Date d'inscription : ${new Date(user.date_inscription).toLocaleString()}</p>
        <p><a href="#" onclick="showCapture('${user.id}'); return false;">📷 Voir la capture</a></p>
      `;

      const validerBtn = document.createElement("button");
      validerBtn.textContent = "Valider";
      validerBtn.onclick = () => valider(user.id);

      const refuserBtn = document.createElement("button");
      refuserBtn.textContent = "Refuser";
      refuserBtn.onclick = () => refuser(user.id);

      div.appendChild(validerBtn);
      div.appendChild(refuserBtn);
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
  }
}

async function valider(userId) {
  try {
    const response = await fetch(`http://localhost:8000/admin/validate/${userId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const card = document.querySelector(`.user-card[data-user-id="${userId}"]`);
      const badge = card.querySelector(".badge");
      badge.textContent = "Validé";
      badge.className = "badge badge-valide";
    } else {
      const data = await response.json();
      alert("Erreur : " + data.detail);
    }
  } catch (err) {
    console.error("Erreur validation:", err);
  }
}

async function refuser(userId) {
  try {
    const response = await fetch(`http://localhost:8000/admin/refuse/${userId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const card = document.querySelector(`.user-card[data-user-id="${userId}"]`);
      const badge = card.querySelector(".badge");
      badge.textContent = "Refusé";
      badge.className = "badge badge-refuse";
    } else {
      const data = await response.json();
      alert("Erreur : " + data.detail);
    }
  } catch (err) {
    console.error("Erreur refus:", err);
  }
}

// Voir capture
async function showCapture(userId) {
  try {
    const response = await fetch(`http://localhost:8000/admin/capture/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      alert("Erreur lors de la récupération de la capture.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const img = document.getElementById("capture-image");
    img.src = url;

    const modal = document.getElementById("capture-modal");
    modal.style.display = "flex";

    modal.onclose = () => URL.revokeObjectURL(url);
  } catch (err) {
    alert("Erreur réseau ou serveur.");
    console.error(err);
  }
}

document.getElementById("modal-close").onclick = () => {
  document.getElementById("capture-modal").style.display = "none";
  document.getElementById("capture-image").src = "";
};

window.onclick = event => {
  const modal = document.getElementById("capture-modal");
  if (event.target === modal) {
    modal.style.display = "none";
    document.getElementById("capture-image").src = "";
  }
};

// 👉 Fonctions spécifiques au super admin
async function createAdmin() {
  const username = document.getElementById("new-admin-username").value;
  const password = document.getElementById("new-admin-password").value;

  if (!username || !password) {
    alert("Tous les champs sont requis.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/admin/superadmin/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.detail || "Erreur création.");
    } else {
      alert("Admin créé.");
      fetchAdminList();
    }
  } catch (error) {
    console.error("Erreur création admin:", error);
  }
}

async function fetchAdminList() {
  try {
    const response = await fetch("http://localhost:8000/admin/superadmin/list", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const admins = await response.json();
    const list = document.getElementById("admin-list");
    list.innerHTML = "";

    admins.forEach(admin => {
      const li = document.createElement("li");
      li.textContent = `${admin.username}${admin.is_superadmin ? " (superadmin)" : ""} `;

      if (!admin.is_superadmin) {
        const btn = document.createElement("button");
        btn.textContent = "❌ Supprimer";
        btn.onclick = () => deleteAdmin(admin.id);
        li.appendChild(btn);
      }

      list.appendChild(li);
    });
  } catch (err) {
    console.error("Erreur liste admins:", err);
  }
}

async function deleteAdmin(adminId) {
  if (!confirm("Confirmer la suppression ?")) return;

  try {
    const response = await fetch(`http://localhost:8000/admin/superadmin/delete/${adminId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.detail || "Erreur suppression.");
    } else {
      alert("Admin supprimé.");
      fetchAdminList();
    }
  } catch (error) {
    console.error("Erreur suppression:", error);
  }
}
