let token = null;


window.onload = () => {
  const savedToken = localStorage.getItem("admin_token");
  console.log("Token détecté au chargement :", savedToken);
  if (savedToken) {
    token = savedToken;
    document.getElementById("login-section").style.display = "none";
    document.getElementById("pending-section").style.display = "block";
    fetchPendingUsers();
  }
};

function logout() {
  token = null;
  localStorage.removeItem("admin_token"); 

  // Nettoyage éventuel de l'interface
  const loginSection = document.getElementById("login-section");
  const pendingSection = document.getElementById("pending-section");
  const pendingUsers = document.getElementById("pending-users");

  if (loginSection) loginSection.style.display = "block";
  if (pendingSection) pendingSection.style.display = "none";
  if (pendingUsers) pendingUsers.innerHTML = "";

  // ✅ Redirection vers la page de login
  window.location.href = "/admin-interface/login.html";
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
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    if (!response.ok) {
      feedback.textContent = "Échec de la connexion.";
      return;
    }

    const data = await response.json();
    token = data.access_token;
    console.log("Connexion réussie. Token reçu :", token);

    localStorage.setItem("admin_token", token);
    console.log("Token sauvegardé dans localStorage");

    document.getElementById("login-section").style.display = "none";
    document.getElementById("pending-section").style.display = "block";

    fetchPendingUsers();
  } catch (error) {
    feedback.textContent = "Erreur de connexion.";
    console.error(error);
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
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
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
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const card = document.querySelector(`.user-card[data-user-id="${userId}"]`);
      const badge = card.querySelector(".badge");
      badge.textContent = "Validé";
      badge.className = "badge badge-valide";
      console.log("Utilisateur validé visuellement.");
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
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const card = document.querySelector(`.user-card[data-user-id="${userId}"]`);
      const badge = card.querySelector(".badge");
      badge.textContent = "Refusé";
      badge.className = "badge badge-refuse";
      console.log("Utilisateur refusé visuellement.");
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
  if (!token) {
    alert("Vous devez être connecté.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/admin/capture/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
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

document.getElementById("modal-close").onclick = function () {
  const modal = document.getElementById("capture-modal");
  modal.style.display = "none";
  document.getElementById("capture-image").src = "";
};

window.onclick = function (event) {
  const modal = document.getElementById("capture-modal");
  if (event.target === modal) {
    modal.style.display = "none";
    document.getElementById("capture-image").src = "";
  }
};
