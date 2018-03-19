
def send_verification_email():
    import smtplib
    from django.conf import settings

    smtp_server = 'smtp.gmail.com'
    sender = settings.EMAIL_LOGIN
    sender_pwd = settings.EMAIL_PASSWORD
    receivers = settings.TEST_RECIEVER_EMAIL

    subject = 'Test'
    content = 'This is test email'

    from smtplib import SMTPException
    from email.mime.text import MIMEText
    try:
        msg = MIMEText(content, 'text/html')
        msg['Subject'] = subject
        msg['From'] = sender

        server = smtplib.SMTP_SSL(smtp_server, 465)
        server.ehlo()
        server.login(sender, sender_pwd)
        try:
            server.sendmail(sender, receivers, msg.as_string())
        finally:
            server.quit()
    except SMTPException as e:
        print(e)
