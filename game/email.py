
def send_verification_email(request, reciever_email, token):
    """
    Отправлет письмо с потверждением на указанный адрес
    """
    import smtplib
    from django.conf import settings

    smtp_server = 'smtp.gmail.com'
    sender = settings.EMAIL_LOGIN
    sender_pwd = settings.EMAIL_PASSWORD
    receivers = reciever_email

    subject = 'Word From Word: подтверждение электронной почты'

    context = {
        'token': token,
        'host': settings.HOST,
    }

    from django.shortcuts import render
    content = render(request, 'email_verify.html', context).getvalue().decode('utf-8')

    from smtplib import SMTPException
    from email.mime.text import MIMEText
    try:
        msg = MIMEText(content, 'html')
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
