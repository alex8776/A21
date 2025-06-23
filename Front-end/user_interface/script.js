document.addEventListener("DOMContentLoaded", () => {
  // Limite de saisie à 9 chiffres pour le numéro de téléphone
  const numero = document.getElementById("numero");
  numero.addEventListener("input", () => {
    numero.value = numero.value.replace(/[^0-9]/g, '').slice(0, 9);
  });

  // Gestion de l'inscription
  document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const feedback = document.getElementById("feedback");
    feedback.textContent = "";
    feedback.style.color = "";

    // Validation simple (à adapter selon ton formulaire)
    const prenom = form.prenom.value.trim();
    const nom = form.nom.value.trim();
    const email = form.email.value.trim();
    const numeroVal = form.numero.value.trim();

    if (!prenom || !nom || !email || !numeroVal) {
      feedback.style.color = "red";
      feedback.textContent = "Tous les champs sont obligatoires.";
      return;
    }

    // Optionnel : validation format email simple
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      feedback.style.color = "red";
      feedback.textContent = "Email invalide.";
      return;
    }

    try {
      // Construire un FormData propre (ou JSON si tu préfères)
      const formData = new FormData(form);

      const response = await fetch("http://localhost:8000/user/register", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        feedback.style.color = "green";
        feedback.textContent = "Inscription réussie ! Merci de patienter jusqu'à validation. Un email vous sera envoyé.";
        form.reset();
      } else {
        feedback.style.color = "red";
        feedback.textContent = result.detail || "Une erreur est survenue.";
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      feedback.style.color = "red";
      feedback.textContent = "Erreur réseau ou serveur.";
    }
  });
});
