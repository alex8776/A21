document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    const payload = parseJwt(token);
    redirectBasedOnRole(payload);
  }

  const loginBtn = document.getElementById("login-btn");
  loginBtn.onclick = async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const feedback = document.getElementById("login-feedback");

    if (!username || !password) {
      feedback.textContent = "Tous les champs sont requis.";
      return;
    }

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
      localStorage.setItem("admin_token", data.access_token);

      const payload = parseJwt(data.access_token);
      redirectBasedOnRole(payload);
    } catch (err) {
      feedback.textContent = "Erreur réseau ou serveur.";
      console.error(err);
    }
  };
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

function redirectBasedOnRole(payload) {
  const feedback = document.getElementById("login-feedback");

  if (!payload) {
    localStorage.removeItem("admin_token");
    feedback.textContent = "Jeton invalide.";
    return;
  }

  if (payload.is_superadmin === true) {
    window.location.href = "/admin-interface/super-admin.html";
  } else {
    localStorage.removeItem("admin_token");
    feedback.textContent = "Accès refusé : vous n'êtes pas super admin.";
  }
}
