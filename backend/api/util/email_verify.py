import os
from dotenv import load_dotenv
from mailjet_rest import Client

load_dotenv()

MAILJET_API_KEY = os.getenv("MAILJET_API_KEY")
MAILJET_API_SECRET = os.getenv("MAILJET_API_SECRET")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")

def send_verification_email(email, code):
  mailjet = Client(auth=(MAILJET_API_KEY, MAILJET_API_SECRET), version="v3.1")
  data = {
    "Messages": [
      {
        "From": {"Email": SENDER_EMAIL, "Name": "Mailjet Pilot"},
        "To": [{"Email": email, "Name": "passenger 1"}],
        "Subject": "Your email verification code",
        "TextPart": code,
      }
    ]
  }
  result = mailjet.send.create(data=data)
  print(result.status_code)
  print(result.json())
