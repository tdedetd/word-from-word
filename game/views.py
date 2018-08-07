from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection


def login(request):
    """
    Авторизует пользователя
    """
    from django.contrib.auth import authenticate, login
    from django.shortcuts import redirect, reverse

    username = request.POST.get('username')
    password = request.POST.get('password')

    user = authenticate(request, username=username, password=password)
    if user is None:
        pass
    else:
        login(request, user)

    return redirect(reverse('home'))


def logout(request):
    """
    Деавторизует пользователя
    """
    from django.contrib.auth import logout
    from django.shortcuts import redirect, reverse

    logout(request)
    return redirect(reverse('home'))


def signup(request):
    """
    Регистрирует пользователя, предварительно проводя валидацию логина и пароля
    """
    import re
    from django.conf import settings
    from .http import template, post
    from .models import User

    username = request.POST.get('username')
    password = request.POST.get('password')
    password_conf = request.POST.get('password-conf')

    recaptcha_params = {'secret': settings.RECAPTCHA_TOKEN,
                        'response': 'g-recaptcha-response'}

    post('https://google.com', '/recaptcha/api/siteverify', params=recaptcha_params)

    # validators
    fail = template(request, 400,
        'При попытке регистрации произошла ошибка. Пожалуйста, попробуйте пройти регистрацию повторно.')

    if not (username and password and password_conf):
        return fail

    if len(username) > 40:
        return fail

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
    User.objects.create_user(username=username, password=password)
    return login(request)


def register(request):
    """
    Возвращает страницу регистрации
    """
    return render(request, 'register.html')


def redirect_to_register(request):
    from django.shortcuts import redirect, reverse
    return redirect(reverse('register'))


def checklogin(request, login):
    """
    Проверяет, присутствует ли пользователь с указанным именем в базе
    и возвращает json-ответ.
    """
    return JsonResponse({'response': if_login_exists(login)})


def if_login_exists(login):
    """
    Проверяет, присутствует ли пользователь с указанным логином в базе
    """

    login = login.lower()
    check_sql = '''
        SELECT EXISTS (
            SELECT FROM auth_user WHERE lower(username) = %s
        )
    '''
    cursor = connection.cursor()
    cursor.execute(check_sql, [login])
    exists = cursor.fetchone()[0]
    return exists


def send_verification_email(request):
    from django.utils.crypto import get_random_string
    from .http import json, template
    from .models import User
    from .models import EmailToken
    from .email import send_verification_email

    if not request.is_ajax():
        return template(request, 404)

    if request.user.is_anonymous:
        return json(request, 401)

    email = request.POST.get('email')

    if not email:
        return json(request, 400, 'Email is not specified')
    else:
        email = email.lower()

    user = User.objects.get(id=request.user.id)
    if user.is_verified:
        return json(request, 400, 'You have been already verified')

    user_email = User.objects.filter(email=email)
    if len(user_email) > 0:
        return json(request, 400, 'The specified email already used')

    token = get_random_string(length=64)

    email_token = EmailToken(
        user_id=request.user.id,
        token=token,
        email=email
    )
    email_token.save(force_insert=True)

    send_verification_email(request, email, token)

    return json(request, 200)


def verify_email(request):
    from datetime import datetime
    from django.core.exceptions import ObjectDoesNotExist
    from .http import json, template
    from .models import EmailToken, User

    if not request.is_ajax():
        return template(request, 404)

    if request.user.is_anonymous:
        return json(request, 401)

    token = request.GET.get('token')
    if not token:
        return json(request, 400, 'Token is not specified')

    # проверка на наличие указанного токена в базе
    try:
        token_record = EmailToken.objects.get(token=token)
    except ObjectDoesNotExist:
        return json(request, 400, 'Invalid token')

    # проверка на то, что токен еще не истек
    if datetime.now() > token_record.expires:
        return json(request, 400, 'Token expired')

    # проверка на то, что указанный ящик не используется
    user_email = User.objects.filter(email=token_record.email)
    if len(user_email) > 0:
        return json(request, 400, 'The specified email already used')

    # подтверждение
    user = User.objects.get(id=token_record.user_id)
    user.email = token_record.email
    user.is_verified = True
    user.save(force_update=True)

    token_record.delete()

    return json(request, 200)


# other

def home(request):
    activity_sql = '''
        SELECT
            to_char(us.created_on::date, 'dd.mm.yyyy') as "date",
            count(*)
        FROM user_solution us, level_word lw
        WHERE
            us.user_id = %s and
            us.created_on > current_date::date - interval '1 week' and
            us.level_word_id = lw.id
        GROUP BY us.created_on::date
        ORDER BY us.created_on::date desc
    '''
    cursor = connection.cursor()
    cursor.execute(activity_sql, [request.user.id])
    activity = dictfetchall(cursor)

    return render(request, 'home.html', {'activity': activity})


def get_xp_info(request):
    """
    Возвращает информацию о рейтинге и уровне пользователя
    """
    from .http import template, json
    from .xp import get_xp_info
    from .models import User

    if not request.is_ajax():
        return template(request, 404)

    if request.user.is_anonymous:
        return json(request, 401)

    xp_info = get_xp_info(User.objects.get(id=request.user.id).rating)

    return JsonResponse({'xp_info': xp_info})


def levels(request):
    """
    Окно с выбором уровня
    """
    if request.user.is_anonymous:
        return  redirect_to_register(request)

    # from models
    order_types_sql = '''
        SELECT id, name FROM level_order_types ORDER BY nio
    '''
    cursor = connection.cursor()
    cursor.execute(order_types_sql)
    order_types = dictfetchall(cursor)

    # from models
    order_dirs_sql = '''
        SELECT id, name FROM level_order_dirs ORDER BY id
    '''
    cursor = connection.cursor()
    cursor.execute(order_dirs_sql)
    order_dirs = dictfetchall(cursor)

    context = {'order_types': order_types, 'order_dirs': order_dirs}

    return render(request, 'levels.html', context)


def get_levels(request):
    """
    Возвращает список уровней
    """
    from .http import template, json

    if not request.is_ajax():
        return template(request, 404)

    if request.user.is_anonymous:
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

    cursor = connection.cursor()
    cursor.execute(levels_sql, params)
    levels = dictfetchall(cursor)

    return JsonResponse({'levels': levels})


def game(request, level_id):
    """
    Окно игры
    """
    from .http import template
    from .models import Level

    if request.user.is_anonymous:
        return redirect_to_register(request)

    word_sql = '''
        SELECT upper(word)
        FROM levels, words
        WHERE levels.id = %s and levels.word_id = words.id
    '''

    cursor = connection.cursor()
    cursor.execute(word_sql, [level_id])
    word_result = cursor.fetchone()

    if word_result is None:
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

    word_count = Level.objects.get(id=level_id).word_count

    solve_history_sql = '''
        SELECT
            to_char(us.created_on::date, 'dd.mm.yyyy') as "date",
            count(*)
        FROM user_solution us, level_word lw
        WHERE
            us.user_id = %s and
            lw.level_id = %s and
            us.level_word_id = lw.id
        GROUP BY us.created_on::date
        HAVING us.created_on::date != current_date
        ORDER BY us.created_on::date desc
    '''

    cursor.execute(solve_history_sql, [request.user.id, level_id])
    solve_history = dictfetchall(cursor)

    context = {
        'level_id': level_id,
        'letters': letters,
        'solved_words': solved_words,
        'word_count': word_count,
        'solve_history': solve_history,
    }
    return render(request, 'game.html', context)


def submit_word(request, level_id):
    """
    Отправляет слово на проверку.
    Возвращает результат с признаком успешности и текущим уровнем пользователя.
    """
    from .http import template, json

    if not request.is_ajax():
        return template(request, 404)

    if request.user.is_anonymous:
        return json(request, 401)

    word = request.POST.get('word')

    if word is None or word.strip() == '':
        return json(request, 400)

    submit_word_sql = '''
        SELECT key, val FROM submit_word(%s, %s, %s)
    '''

    params = [request.user.id, int(level_id), word]

    cursor = connection.cursor()
    cursor.execute(submit_word_sql, params)
    submit_result = cursor.fetchall()

    submit_result_dict = {}

    for row in submit_result:
        submit_result_dict.update({row[0]: row[1]})

    return json(request, 200, submit_result_dict)


def get_solved_words(request, level_id):
    """
    Возвращает список отгаданных слов указанного пользователя за указанную дату
    """
    from .http import template, json

    if not request.is_ajax():
        return template(request, 404)

    if request.user.is_anonymous:
        return json(request, 401)

    date = request.GET.get('date')

    words_sql = '''
        SELECT
            to_char(us.created_on, 'hh24:mi') as "time",
            w.word
        FROM
            user_solution us,
            level_word lw,
            words w
        WHERE
            us.user_id = %s and
            lw.level_id = %s and
            us.created_on::date = %s and
            us.level_word_id = lw.id and
            lw.word_id = w.id
        ORDER BY us.created_on desc
    '''

    cursor = connection.cursor()
    cursor.execute(words_sql, [request.user.id, level_id, date])
    words = cursor.fetchall()

    return JsonResponse({'words': words})


def profile(request, user_id):
    """
    Страница профиля
    """
    from .models import User
    from .xp import get_xp_info

    if request.user.is_anonymous:
        return redirect_to_register(request)

    target_user = User.objects.get(id=user_id)

    profile_info_sql = '''
        SELECT name, val from public.get_profile_info(%s)
    '''

    cursor = connection.cursor()
    cursor.execute(profile_info_sql, [user_id])
    profile_info = cursor.fetchall()

    profile_info_dict = {}
    for profile_param in profile_info:
        profile_info_dict.update({profile_param[0]: profile_param[1]})

    xp_info = get_xp_info(User.objects.get(id=user_id).rating)

    profile_info_dict.update(xp_info)

    context = {'target_user': target_user,
                'profile_info_dict': profile_info_dict}

    return render(request, 'profile.html', context)


def stats(request):
    """
    Экран глобальной статистики по всем игрокам
    """

    cursor = connection.cursor()
    
    top_rating_sql = '''
        SELECT
            row_number() OVER (ORDER BY rating DESC, username ASC) as place,
            id,
            username,
            rating::int as rating
        FROM auth_user
        LIMIT 10
    '''

    cursor.execute(top_rating_sql)
    top_rating = dictfetchall(cursor)

    top_words_sql = '''
        SELECT
            row_number() OVER (ORDER BY count(*) DESC, u.username) as place,
            u.id,
            u.username,
            count(*) as words
        FROM user_solution us, auth_user u
        WHERE us.user_id = u.id
        GROUP BY u.id
        LIMIT 10
    '''
    cursor.execute(top_words_sql)
    top_words = dictfetchall(cursor)

    return render(request, 'stats.html', {'top_rating': top_rating,
                                          'top_words': top_words})


def get_personal_stats(request):

    if not request.user.is_anonymous:
        cursor = connection.cursor()

        # word length

        word_len_distrib_sql = '''
            SELECT
                length(w.word),
                count(*)
            FROM
                user_solution us,
                level_word lw,
                words w
            WHERE
                us.user_id = %s and
                us.level_word_id = lw.id and
                lw.word_id = w.id
            GROUP BY length(w.word)
            ORDER BY 1 ASC
        '''

        cursor.execute(word_len_distrib_sql, [request.user.id])
        word_len_distrib_res = cursor.fetchall()

        word_len_distrib_names = []
        word_len_distrib_vals = []
        for current in word_len_distrib_res:
            word_len_distrib_names.append(current[0])
            word_len_distrib_vals.append(current[1])

        word_len_distrib = {'names': word_len_distrib_names,
                            'vals': word_len_distrib_vals}

        # first letter

        first_letter_sql = '''
            SELECT
                substring(w.word, 1, 1),
                count(*)
            FROM
                user_solution us,
                level_word lw,
                words w
            WHERE
                us.user_id = %s and
                us.level_word_id = lw.id and
                lw.word_id = w.id
            GROUP BY substring(w.word, 1, 1)
            ORDER BY 1 ASC
        '''

        cursor.execute(first_letter_sql, [request.user.id])
        first_letter_res = cursor.fetchall()

        first_letter_names = []
        first_letter_vals = []
        for current in first_letter_res:
            first_letter_names.append(current[0])
            first_letter_vals.append(current[1])

        first_letter = {
            'names': first_letter_names,
            'vals': first_letter_vals,
        }

    return JsonResponse({'word_len_distrib': word_len_distrib,
                            'first_letter': first_letter})


def get_popular_words(request):
    from .http import template, json

    if not request.is_ajax():
        return template(request, 404)

    if request.user.is_anonymous:
        return json(request, 401)

    offset = request.GET.get('offset')
    limit = request.GET.get('limit')

    words_sql = '''
        SELECT
            w.id,
            w.word,
            count(*)
        FROM
            user_solution us,
            level_word lw,
            words w
        WHERE
            us.user_id = %s and
            us.level_word_id = lw.id and
            lw.word_id = w.id
        GROUP BY w.id
        ORDER BY 3 desc
        OFFSET %s LIMIT %s
    '''

    cursor = connection.cursor()
    cursor.execute(words_sql, [request.user.id, offset, limit])
    words = dictfetchall(cursor)

    return JsonResponse({'words': words})


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]
