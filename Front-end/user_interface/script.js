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
    const formData = new FormData(form);

    try {
      const response = await fetch("http://localhost:8000/user/register", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      const feedback = document.getElementById("feedback");

      if (response.ok) {
        feedback.style.color = "green";
        feedback.textContent = "Inscription réussie ! Vous recevrez un email après validation.";
        form.reset();
      } else {
        feedback.style.color = "red";
        feedback.textContent = result.detail || "Une erreur est survenue.";
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      document.getElementById("feedback").textContent = "Erreur réseau ou serveur.";
      document.getElementById("feedback").style.color = "red";
    }
  });
});
