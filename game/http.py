STATUSES = {
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
    if message == None:
        message = STATUSES.get(status)

    context = {
        'status': status,
        'message': message,
    }

    from django.shortcuts import render
    return render(request, 'error.html', context, status=status)
