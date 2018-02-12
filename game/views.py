from django.shortcuts import render
from django.http import HttpResponse, JsonResponse


def login(request):
    """
    Авторизует пользователя
    """
    username = request.POST.get('username')
    password = request.POST.get('password')

    from django.contrib.auth import authenticate
    user = authenticate(request, username=username, password=password)
    if user is None:
        pass
    else:
        from django.contrib.auth import login
        login(request, user)

    from django.shortcuts import redirect, reverse
    return redirect(reverse('home'))


def logout(request):
    """
    Деавторизует пользователя
    """
    from django.contrib.auth import logout
    logout(request)
    from django.shortcuts import redirect, reverse
    return redirect(reverse('home'))
    

def signup(request):
    """
    Регистрирует пользователя, предварительно проводя валидацию логина и пароля
    """
    username = request.POST.get('username')
    password1 = request.POST.get('password')
    password2 = request.POST.get('password-conf')

    # validators
    from .http import template
    fail = template(request, 400, 'При попытке регистрации произошла ошибка. Попробуйте пройти регистрацию повторно.')

    if not (bool(username) and bool(password1) and bool(password2)):
        return fail

    if len(username) > 40:
        return fail

    import re
    if re.match(r'^([a-z]|[A-Z])([0-9]|[a-z]|[A-Z])*$', username) is None:
        return fail

    if password1 != password2:
        return fail

    if len(password1) < 5:
        return fail

    if re.match(r'^([0-9]|[a-z]|[A-Z])+$', password1) is None:
        return fail

    if if_login_exists(username):
        return fail

    # success
    from django.contrib.auth.models import User
    User.objects.create_user(username=username, password=password1)
    return login(request)


def register(request):
    """
    Возвращает страницу регистрации
    """
    return render(request, 'register.html')


def checklogin(request, login):
    """
    Проверяет, присутствует ли пользователь с указанным именем в базе
    и возвращает json-ответ.
    """
    return JsonResponse({'response': if_login_exists(login)})


def if_login_exists(login):
    """
    Проверяет, присутствует ли пользователь с указанным именем в базе
    """
    login = login.lower()
    check_sql = '''
                SELECT EXISTS (
                    SELECT FROM auth_user WHERE lower(username) = %s
                )
                '''
    from django.db import connection
    cursor = connection.cursor()
    cursor.execute(check_sql, [login])
    exists = cursor.fetchone()[0]
    return exists


def home(request):
    return render(request, 'home.html')


def lvl_select(request):
    if request.user.is_anonymous():
        from django.shortcuts import redirect, reverse
        return redirect(reverse('register'))
    
    return render(request, 'lvl_select.html')


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]
