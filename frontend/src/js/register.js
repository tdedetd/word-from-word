import $ from 'jquery';

$(() => {
    /** @type {JQuery<HTMLFormElement>} */
    const form = $('#reg-item');
    const validators = getValidators(form);
    const errorList = $('#reg-errors');

    form.find('[name=username]').on('change', event => {
        $.get(`/auth/register/checklogin/${event.originalEvent.target.value}/`).done(data => {
            if (data.exists) {
                $('#login-exists').removeClass('hidden');
            } else {
                $('#login-exists').addClass('hidden');
            }
        });
    });

    form.on('submit', event => {
        const errors = validators.filter(validator => !validator.fn());

        errorList.empty();
        if (errors.length > 0) {
            errors.forEach(error => {
                errorList.append(`<li>${error.message}</li>`);
            });

            event.preventDefault();
        }
    });
});

function getValidators(form) {

    /** @type {JQuery<HTMLInputElement>} */
    const username = form.find('[name=username]');
    /** @type {JQuery<HTMLInputElement>} */
    const password = form.find('[name=password]');
    /** @type {JQuery<HTMLInputElement>} */
    const passwordConfirm = form.find('[name=password-conf]');

    const loginPattern = /^([a-z]|[A-Z])([0-9]|[a-z]|[A-Z])*$/;
    const passwordPattern = /^([0-9]|[a-z]|[A-Z])+$/;

    return [
        {
            fn: () => username.val().trim().length > 0,
            message: 'Заполните поле "Логин"'
        },
        {
            fn: () => username.val().trim().length <= 40,
            message: 'Логин не должен превышать длину в 40 символов'
        },
        {
            fn: () => loginPattern.test(username.val().trim()),
            message: 'Логин не должен начинаться с цифры и может состоять только из латинских букв (заглавных и строчных), а также цифр.'
        },
        {
            fn: () => password.val().length > 0 && passwordConfirm.val().length > 0,
            message: 'Необходимо заполнить оба поля ввода пароля'
        },
        {
            fn: () => password.val() === passwordConfirm.val(),
            message: 'Пароли не совпадают'
        },
        {
            fn: () => password.val().length >= 4,
            message: 'Пароль должен быть длиной не менее 4-х символов'
        },
        {
            fn: () => passwordPattern.test(password.val()),
            message: 'Пароль может состоять только из латинских букв (заглавных и строчных), а также цифр.'
        }
    ];
}
