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
    password = request.POST.get('password')
    password_conf = request.POST.get('password-conf')

    # validators
    from .http import template
    fail = template(request, 400, 'При попытке регистрации произошла ошибка. Попробуйте пройти регистрацию повторно.')

    if not (username and password and password_conf):
        return fail

    if len(username) > 40:
        return fail

    import re
    if re.match(r'^([a-z]|[A-Z])([0-9]|[a-z]|[A-Z])*$', username) is None:
        return fail

    if password != password_conf:
        return fail

    if len(password) < 4:
        return fail

    if re.match(r'^([0-9]|[a-z]|[A-Z])+$', password) is None:
        return fail

    if if_login_exists(username):
        return fail

    # success
    from django.contrib.auth.models import User
    User.objects.create_user(username=username, password=password)
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


def get_levels(request):
    """
    Возвращает список уровней
    """
    from .http import template, json

    if not request.is_ajax():
        return template(request, 404)

    if request.user.is_anonymous():
        return json(request, 401)

    user_id = request.user.id
    type_id = request.GET.get("type_id")
    dir_id = request.GET.get("dir_id")
    offset = request.GET.get("offset")
    limit = request.GET.get("limit")

    params = [type_id, dir_id, offset, limit]

    for param in params:
        try:
            int(param)
        except ValueError:
            return json(request, 400, 'Wrong parameter(s)')

    params = [user_id] + params

    levels_sql = '''
        SELECT id, word, word_count, solved, last_activity
        FROM get_levels(%s, %s, %s, %s, %s)
    '''

    from django.db import connection
    cursor = connection.cursor()
    cursor.execute(levels_sql, params)
    levels = dictfetchall(cursor)

    from django.http import JsonResponse
    return JsonResponse({'levels': levels})


def game(request, level_id):
    """
    Окно игры
    """
    if request.user.is_anonymous():
        from django.shortcuts import redirect, reverse
        return redirect(reverse('register'))

    word_sql = '''
        SELECT upper(word)
        FROM levels, words
        WHERE levels.id = %s and levels.word_id = words.id
    '''

    from django.db import connection
    cursor = connection.cursor()
    cursor.execute(word_sql, [level_id])
    word_result = cursor.fetchone()

    if word_result is None:
        from .http import template
        return template(request, 404, 'Указанного уровня не существует')
    else:
        word = word_result[0]

    letters = list(word)

    words_sql = '''
        SELECT word
        FROM
            user_solution us,
            level_word lw,
            words
        WHERE
            us.user_id = %s and
            lw.level_id = %s and
            us.level_word_id = lw.id and
            lw.word_id = words.id
        ORDER BY words.word asc
    '''

    cursor.execute(words_sql, [request.user.id, level_id])
    solved_words = cursor.fetchall()

    from game.models import Levels
    word_count = Levels.objects.get(id=level_id).word_count

    context = {
        'level_id': level_id,
        'letters': letters,
        'solved_words': solved_words,
        'word_count': word_count,
    }
    return render(request, 'game.html', context)


def submit_word(request, level_id):
    """
    Отправляет слово на проверку. Возвращает результат с признаком успешности и текущим уровнем пользователя.
    """
    from .http import template, json

    if not request.is_ajax():
        return template(request, 404)

    if request.user.is_anonymous():
        return json(request, 401)

    word = request.POST.get('word')

    if word is None or word.strip() == '':
        return json(request, 400)

    submit_word_sql = '''
        SELECT key, val FROM submit_word(%s, %s, %s)
    '''

    params = [request.user.id, int(level_id), word]

    from django.db import connection
    cursor = connection.cursor()
    cursor.execute(submit_word_sql, params)
    submit_result = cursor.fetchall()

    submit_result_dict = {}

    for row in submit_result:
        submit_result_dict.update({row[0]: row[1]})

    return json(request, 200, submit_result_dict)


def profile(request, user_id):
    """
    Страница профиля
    """
    if request.user.is_anonymous():
        from django.shortcuts import redirect, reverse
        return redirect(reverse('register'))

    from django.contrib.auth.models import User
    target_user = User.objects.get(id=user_id)

    profile_info_sql = '''
        SELECT name, val from public.get_profile_info(%s, %s)
    '''

    from django.db import connection
    cursor = connection.cursor()
    cursor.execute(profile_info_sql, [request.user.id, user_id])
    profile_info = cursor.fetchall()

    profile_info_dict = []
    for profile_param in profile_info:
        profile_info_dict.append({'name': profile_param[0], 'val': profile_param[1]})

    context = {
        'target_user': target_user,
        'profile_info_dict': profile_info_dict,
    }
    
    return render(request, 'profile.html', context)


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]
