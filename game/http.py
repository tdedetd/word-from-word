STATUSES = {
    200: 'OK',
    400: 'Bad request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    500: 'Internal server error',
}

HEADERS = {
    'User-Agent': 'Word from Word application, python',
    'Content-Type': 'application/x-www-form-urlencoded',
}


def template(request, status, message=None):
    """
    Возвращает страницу, содержащую код ошибки и сообщение
    """
    from django.shortcuts import render

    if message is None:
        message = STATUSES.get(status)

    context = {
        'status': status,
        'message': message,
    }

    return render(request, 'error.html', context, status=status)


def json(request, status, message=None):
    """
    Возвращает json-ответ с кодом состояния и сообщением
    """
    from django.http import JsonResponse

    if message is None:
        message = STATUSES.get(status)

    return JsonResponse({'status': status, 'response': message}, status=status)


def get(host, url, params=None):
    return request('GET', host, url, params)


def post(host, url, params=None):
    return request('POST', host, url, params)


def request(method, host, url, params=None):
    params = params if params else {}
