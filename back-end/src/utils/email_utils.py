import smtplib
from email.message import EmailMessage


from src.config import Config


def send_validation_email(to_email: str, prenom: str, access_token: str):
    msg = EmailMessage()
    msg["Subject"] = "Confirmation d'inscription"
    msg["From"] = Config.SMTP_USER
    msg["To"] = to_email

    lien = f"http://localhost:8000/attente?token={access_token}"


    msg.set_content(f"""
Bonjour {prenom},

Votre inscription a été validée. Cliquez sur ce lien pour accéder à la page du forum :

{lien}

Merci.

L'équipe organisatrice 
""")

    with smtplib.SMTP("smtp.gmail.com", Config.SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
        smtp.send_message(msg)



def send_refusal_email(to_email: str, prenom: str):
    msg = EmailMessage()
    msg["Subject"] = "Inscription refusée"
    msg["From"] = Config.SMTP_USER
    msg["To"] = to_email

    msg.set_content(f"""
Bonjour {prenom},

Nous vous informons que votre demande d'inscription a été refusée après vérification de la capture d'écran de votre payement.
Veuillez vérifier si votre payement a été effectué correctement, et réessayer !
Merci de votre compréhension.


l'équipe organisatrice 
""")

    with smtplib.SMTP("smtp.gmail.com", Config.SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(Config.SMTP_USER,Config.SMTP_PASSWORD)
        smtp.send_message(msg)
