import $ from 'jquery';
import { Modal } from './shared/modal';

let tries = 0;

$(() => {
    /** @type {JQuery<HTMLFormElement>} */
    const form = $('#reg-item');
    const validators = getValidators(form);
    const csrfTocken = form.find('[name=csrfmiddlewaretoken]').val();

    form.find('[name=username]').on('change', event => {
        $.get(`/auth/register/checklogin/${event.originalEvent.target.value}/`).done(data => {
            if (data.exists) {
                $('#login-exists').removeClass('hidden');
            } else {
                $('#login-exists').addClass('hidden');
            }
        });
    });

    updateCaptcha(csrfTocken);

    $('#refresh-captcha-btn').on('click', event => {
        updateCaptcha(csrfTocken);
        event.preventDefault();
    });

    form.on('submit', event => {
        event.preventDefault();

        const f = document.forms['reg-item'];
        const value = {
            csrfmiddlewaretoken: csrfTocken,
            username: f.elements['username'].value,
            password: f.elements['password'].value,
            passwordConf: f.elements['password-conf'].value,
            captcha: f.elements['captcha'].value,
        }

        const errors = validators.filter(validator => !validator.fn());

        if (errors.length > 0) {
            updateErrorList(errors.map(err => err.message));
        } else {
            $.ajax({
                data: value,
                error: (jqXHR, exception) => {
                    console.log('error', jqXHR.status);
                    if (jqXHR.status === 403) {
                        updateErrorList(['Неверный ответ с картинки']);
                    } else if (jqXHR.status === 400) {
                        updateErrorList(['При регистрации произошла ошибка. Проверьте правильность введенных данных.']);
                    }
                    updateCaptcha(csrfTocken);
                },
                type: 'POST',
                url: '/auth/signup/',
                success: () => location.href = '/',
            });
        }
    });

    const modal = new Modal('modal-rules');
    $('#reg-rules-link').on('click', () => {
        modal.show();
    })
});

function getValidators(form) {

    /** @type {JQuery<HTMLInputElement>} */
    const username = form.find('[name=username]');
    /** @type {JQuery<HTMLInputElement>} */
    const password = form.find('[name=password]');
    /** @type {JQuery<HTMLInputElement>} */
    const passwordConfirm = form.find('[name=password-conf]');
    /** @type {JQuery<HTMLInputElement>} */
    const captcha = form.find('[name=captcha]');

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
        },
        {
            fn: () => captcha.val().trim().length > 0,
            message: 'Введите ответ картинки'
        }
    ];
}

function createCaptcha(csrfTocken) {
    $.ajax({
        data: {
            csrfmiddlewaretoken: csrfTocken
        },
        error: (jqXHR, exception) => console.log('Some error. Try again!'),
        type: 'POST',
        url: '/auth/create_captcha/',
        success: data => onUpdateCaptchaSuccess(data, csrfTocken),
    });
}

function updateCaptcha(csrfTocken) {
    $.ajax({
        data: {
            csrfmiddlewaretoken: csrfTocken
        },
        error: (jqXHR, exception) => {
            if (jqXHR.status === 403) {
                createCaptcha(csrfTocken);
            }
        },
        type: 'POST',
        url: '/auth/update_captcha/',
        success: data => onUpdateCaptchaSuccess(data, csrfTocken),
    });
}

function onUpdateCaptchaSuccess(data, csrfTocken) {
    updateCaptchaTask(data.message);
    updateCaptchaImage(csrfTocken);
}

function updateCaptchaImage(csrfTocken) {
    tries++;
    const elem = $('#chaptcha-img-container');
    elem.empty();
    setTimeout(() => elem.html(`<img class="reg-item__img" src="/auth/captcha_image?t=${tries}" alt="img">`));
}

function updateCaptchaTask(message) {
    $('#chaptcha-task').text(message);
    $('[name=captcha]').val('');
}

function updateErrorList(errors) {
    const errorList = $('#reg-errors');
    errorList.empty();
    errors.forEach(error => {
        errorList.append(`<li>${error}</li>`);
    });
}
