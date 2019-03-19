# library imports
from flask_mail import Message

def send_verification_email(mail_instance, recipient, verification_key):
    msg = Message(
        subject="Email Verification",
        sender="cse356.tictactoe@gmail.com",
        recipients=[recipient],
        html="<p>Your verification key is: " + verification_key + "</p>")

    mail_instance.send(msg)