from datetime import datetime, timedelta
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.db import connection
from django.conf import settings
from .models import Captcha, Updates
from .captcha.captcha import generate as generate_captcha, delete_captcha_image, get_captcha_image, hash_answer


def login(request):
    from django.contrib.auth import authenticate, login
    from django.shortcuts import redirect, reverse

    if request.method != 'POST':
        return HttpResponse(status=405)

    username = request.POST.get('username')
    password = request.POST.get('password')

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)

    return redirect(reverse('home'))


def logout(request):
    from django.contrib.auth import logout
    from django.shortcuts import redirect, reverse

    logout(request)
    return redirect(reverse('home'))


def signup(request):
    """
    Регистрирует пользователя, предварительно проводя валидацию логина и пароля
    """
    import re
    from .models import User

    if request.method != 'POST':
        return HttpResponse(status=405)

    captcha_id = request.COOKIES.get('captchaid', None)
    if captcha_id is None:
        return HttpResponse(status=403)

    username = request.POST.get('username')
    password = request.POST.get('password')
    password_conf = request.POST.get('passwordConf')
    captcha_answer = request.POST.get('captcha')
    confirm = request.POST.get('confirm')

    captcha_answer_hash = hash_answer(captcha_answer)
    captcha = None
    try:
        captcha = Captcha.objects.get(id=captcha_id)
    except Captcha.DoesNotExist:
        return HttpResponse(status=403)

    captcha_passed = datetime.now() < captcha.expires and captcha_answer_hash == captcha.answer
    captcha.delete()
    delete_captcha_image(captcha_id)
    if not captcha_passed:
        return HttpResponse(status=403)

    # validators

    if not confirm == 'true':
        return HttpResponse(status=400)

    if not (username and password and password_conf):
        return HttpResponse(status=400)

    if len(username) > 40:
        return HttpResponse(status=400)

    if re.match(r'^([a-z]|[A-Z])([0-9]|[a-z]|[A-Z])*$', username) is None:
        return HttpResponse(status=400)

    if password != password_conf:
        return HttpResponse(status=400)

    if len(password) < 4:
        return HttpResponse(status=400)

    if re.match(r'^([0-9]|[a-z]|[A-Z])+$', password) is None:
        return HttpResponse(status=400)

    if if_login_exists(username):
        return HttpResponse(status=400)

    # success
    User.objects.create_user(username=username, password=password)
    return login(request)


def register(request):
    return render(request, 'register.html')


def redirect_to_register(request):
    from django.shortcuts import redirect, reverse
    return redirect(reverse('register'))


def checklogin(request, login):
    """
    Проверяет, присутствует ли пользователь с указанным именем в базе.
    """
    return JsonResponse({'exists': if_login_exists(login)})


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


def new_captcha(request):
    words_sql = '''
        select word from words
        where length(word) between 8 and 11 and language_id = 1 and status_id = 1
        order by random()
        limit 3
    '''
    cursor = connection.cursor()
    cursor.execute(words_sql)
    words = list(map(lambda w: w['word'], dictfetchall(cursor)))

    captcha_id, answer_hash, message = generate_captcha(words)
    expires = datetime.now() + timedelta(seconds=settings.CAPTHCA_EXPIRATION_INTERVAL)

    new_captcha = Captcha(id=captcha_id,
                          answer=answer_hash,
                          expires=expires)
    new_captcha.save(force_insert=True)
    response = JsonResponse({ 'message': message })
    response.set_cookie('captchaid', captcha_id, expires=expires)

    return response


def create_captcha(request):
    if request.method != 'POST':
        return HttpResponse(status=405)

    return new_captcha(request)


def update_captcha(request):
    if request.method != 'POST':
        return HttpResponse(status=405)

    captcha_id = request.COOKIES.get('captchaid', None)
    if captcha_id is None:
        return HttpResponse(status=403)

    captcha = None
    try:
        captcha = Captcha.objects.get(id=captcha_id)
    except Captcha.DoesNotExist:
        return HttpResponse(status=403)

    if datetime.now() > captcha.expires:
        return HttpResponse(status=403)

    captcha.delete()
    delete_captcha_image(captcha_id)
    return new_captcha(request)


def captcha_image(request):
    captcha_id = request.COOKIES.get('captchaid', None)
    if captcha_id is None:
        return HttpResponse(status=403)

    captcha = None
    try:
        captcha = Captcha.objects.get(id=captcha_id)
    except Captcha.DoesNotExist:
        return HttpResponse(status=404)

    if datetime.now() > captcha.expires:
        return HttpResponse(status=403)

    img = get_captcha_image(captcha_id)
    if img is None:
        return HttpResponse(status=404)

    response = HttpResponse(content_type='image/png')
    img.save(response, 'PNG')
    return response


def send_verification_email(request):
    from django.utils.crypto import get_random_string
    from .http import json
    from .models import User
    from .models import EmailToken
    from .email import send_verification_email

    if request.user.is_anonymous:
        return HttpResponse(status=401)

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
    from django.core.exceptions import ObjectDoesNotExist
    from .http import json
    from .models import EmailToken, User

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
    return render(request, 'home.html')


def get_xp_info(request):
    """
    Возвращает информацию о рейтинге и уровне пользователя
    """
    from .xp import get_xp_info
    from .models import User

    if request.user.is_anonymous:
        return HttpResponse(status=401)

    xp_info = get_xp_info(User.objects.get(id=request.user.id).rating)
    return JsonResponse(xp_info)


def news(request):
    """
    Возвращает страницу новостей
    """

    updates = Updates.objects.all().order_by('-created_on')
    return render(request, 'news.html', context={'updates': updates})


def levels(request, isCanonical):
    """
    Окно с выбором уровня
    """
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

    context = {'order_types': order_types, 'order_dirs': order_dirs, 'canonical': 'https://wordfromword.com/game/guest/'}

    if isCanonical:
        levels_sql = '''
            SELECT id, word, word_count, solved, last_activity
            FROM get_levels(null, 1, 1)
        '''
        cursor = connection.cursor()
        cursor.execute(levels_sql)
        levels = dictfetchall(cursor)
        context.update({'levels': levels, 'canonical': None})

    return render(request, 'levels.html', context)


def get_levels(request):
    """
    Возвращает список уровней
    """
    user_id = request.user.id
    type_id = request.GET.get("typeId")
    dir_id = request.GET.get("dirId")
    offset = request.GET.get("offset")
    limit = request.GET.get("limit")
    filter_text = request.GET.get("filter")

    params = [type_id, dir_id, offset, limit]

    for param in params:
        try:
            int(param)
        except ValueError:
            return HttpResponse(status=400)

    params = [user_id] + params + [filter_text]

    levels_sql = '''
        SELECT id, word, word_count, solved, last_activity
        FROM get_levels(%s, %s, %s, %s, %s, %s)
    '''

    cursor = connection.cursor()
    cursor.execute(levels_sql, params)
    levels = dictfetchall(cursor)

    end_of_list = len(levels) < int(limit)

    return JsonResponse({'levels': levels, 'end': end_of_list})


def redirect_to_random_level(request):
    import random
    from django.shortcuts import redirect, reverse

    if request.user.is_anonymous:
        return  redirect_to_register(request)

    unplayed_levels_sql = '''
        SELECT l.id as level_id
        FROM levels l
            LEFT JOIN (SELECT lw.level_id
            FROM user_solution us
                join level_word lw on us.level_word_id = lw.id
            WHERE us.user_id = %s
            GROUP BY lw.level_id) played_levels on l.id = played_levels.level_id
        WHERE played_levels.level_id is null
    '''

    cursor = connection.cursor()
    cursor.execute(unplayed_levels_sql, [request.user.id])
    levels = dictfetchall(cursor)
    levels_ids = list(map(lambda level: level['level_id'], levels))

    if (len(levels_ids) > 0):
        level_id = random.choice(levels_ids)
        return redirect(reverse('game', args=(level_id,)))

    from .models import Level
    levels = Level.objects.all()
    levels_ids = list(map(lambda level: level.id, levels))
    level_id = random.choice(levels_ids)

    return redirect(reverse('game', args=(level_id,)))


def game(request, level_id):
    """
    Окно игры
    """
    from .http import template
    from .models import Level

    word_sql = '''
        SELECT upper(words.word), levels.available_for_guests
        FROM levels, words
        WHERE levels.id = %s and levels.word_id = words.id
    '''

    cursor = connection.cursor()
    cursor.execute(word_sql, [level_id])
    word_result = cursor.fetchone()

    if word_result is None:
        return template(request, 404, 'Указанного уровня не существует')

    word, available_for_guests = word_result
    if request.user.is_anonymous and not available_for_guests:
        return render(request,
                      'error.html',
                      status=403,
                      context={ 'status': 403, 'message': 'Для доступа ко всем уровням необходимо зарегистрироваться' })

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
        ORDER BY us.created_on::date desc
    '''

    cursor.execute(solve_history_sql, [request.user.id, level_id])
    solve_history = dictfetchall(cursor)

    leaders_sql = '''
        SELECT au.username, lu.count FROM auth_user au, (
            SELECT us.user_id, count(*)
            FROM user_solution us, level_word lw
            WHERE us.level_word_id = lw.id and lw.level_id = %s
            GROUP BY us.user_id) lu
        WHERE au.id = lu.user_id
        ORDER BY count desc
        LIMIT 10
    '''
    cursor.execute(leaders_sql, [level_id])
    leaders = dictfetchall(cursor)

    context = {
        'level_id': level_id,
        'letters': letters,
        'solved_words': solved_words,
        'word_count': word_count,
        'solve_history': solve_history,
        'leaders': leaders,
        'title': 'WFW - %s' % ''.join(letters).lower()
    }
    return render(request, 'game.html', context)


def submit_word(request, level_id):
    """
    Отправляет слово на проверку.
    Возвращает результат с признаком успешности и текущим уровнем пользователя.
    """

    word = request.POST.get('word')

    if word is None or word.strip() == '':
        return HttpResponse(status=400)

    if request.user.is_anonymous:
        submit_word_sql = 'SELECT key, val FROM submit_word_guest(%s, %s)'
        params = [int(level_id), word]
    else:
        submit_word_sql = 'SELECT key, val FROM submit_word(%s, %s, %s)'
        params = [request.user.id, int(level_id), word]

    cursor = connection.cursor()
    cursor.execute(submit_word_sql, params)
    submit_result = cursor.fetchall()

    submit_result_dict = {}

    for row in submit_result:
        submit_result_dict.update({row[0]: row[1]})

    return JsonResponse(submit_result_dict)


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

    context = {'profile_info_dict': profile_info_dict,
               'title': 'Профиль - %s' % target_user}

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

    if request.user.is_anonymous:
        return HttpResponse(staatus=401)

    offset = request.GET.get('offset')
    limit = request.GET.get('limit')
    limit = 20

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
            lw.word_id = w.id and
            length(w.word) >= 4
        GROUP BY w.id
        ORDER BY 3 desc
        OFFSET %s LIMIT %s
    '''

    cursor = connection.cursor()
    cursor.execute(words_sql, [request.user.id, offset, limit])
    words = dictfetchall(cursor)

    return JsonResponse(words, safe=False)


def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]
