STATUSES = {
    200: 'OK',
    400: 'Bad request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    500: 'Internal server error',
}


def template(request, status, message=None):
    """
    Возвращает страницу, содержащую код ошибки и сообщение
    """
    if message is None:
        message = STATUSES.get(status)

    context = {
        'status': status,
        'message': message,
    }

    from django.shortcuts import render
    return render(request, 'error.html', context, status=status)


def json(request, status, message=None):
    """
    Возвращает json-ответ с кодом состояния и сообщением
    """
    if message is None:
        message = STATUSES.get(status)

    from django.http import JsonResponse
    return JsonResponse({'status': status, 'response': message}, status=status)
