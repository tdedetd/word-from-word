import { byId, body, getParamsString } from './shared/utils';
import { Modal } from './shared/modal';

let tries = 0;

document.addEventListener('DOMContentLoaded', () => {
    /** @type {HTMLFormElement} */
    const form = byId('reg-item');
    const validators = getValidators(form);
    const csrfTocken = form.querySelector('[name=csrfmiddlewaretoken]').value;
    const loginExistsEl = byId('login-exists');

    form.querySelector('[name=username]').addEventListener('change', event => {
        body(`/auth/register/checklogin/${event.target.value}/`).then(data => {
            if (data.exists) {
                loginExistsEl.classList.remove('hidden');
            } else {
                loginExistsEl.classList.add('hidden');
            }
        });
    });

    updateCaptcha(csrfTocken);

    byId('refresh-captcha-btn').addEventListener('click', event => {
        updateCaptcha(csrfTocken);
        event.preventDefault();
    });

    form.addEventListener('submit', event => {
        event.preventDefault();

        const f = document.forms['reg-item'];
        const value = {
            csrfmiddlewaretoken: csrfTocken,
            username: f.elements['username'].value,
            password: f.elements['password'].value,
            passwordConf: f.elements['password-conf'].value,
            captcha: f.elements['captcha'].value,
            confirm: f.elements['confirm'].checked,
        };

        const errors = validators.filter(validator => !validator.fn());

        if (errors.length > 0) {
            updateErrorList(errors.map(err => err.message));
        } else {
            fetch('/auth/signup/', {
                method: 'POST',
                body: getParamsString(value),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }).then(response => {
                switch (response.status) {
                    case 200:
                        location.href = '/';
                        break;
                    case 400:
                        updateErrorList(['При регистрации произошла ошибка. Проверьте правильность введенных данных.']);
                        updateCaptcha(csrfTocken);
                        break;
                    case 403:
                        updateErrorList(['Неверный ответ с картинки']);
                        updateCaptcha(csrfTocken);
                        break;
                }
            });
        }
    });

    const rulesModal = new Modal('modal-rules');
    byId('reg-rules-link').addEventListener('click', () => {
        rulesModal.show();
    });

    // const privacyModal = new Modal('modal-privacy-policy');
    // $('#reg-privacy-link').on('click', () => {
    //     privacyModal.show();
    // });
});

/**
 * @param {HTMLFormElement} form 
 */
function getValidators(form) {

    /** @type {HTMLInputElement} */
    const username = form.querySelector('[name=username]');

    /** @type {HTMLInputElement} */
    const password = form.querySelector('[name=password]');

    /** @type {HTMLInputElement} */
    const passwordConfirm = form.querySelector('[name=password-conf]');

    /** @type {HTMLInputElement} */
    const captcha = form.querySelector('[name=captcha]');

    /** @type {HTMLInputElement} */
    const confirmCheckbox = form.querySelector('[name=confirm]');

    const loginPattern = /^([a-z]|[A-Z])([0-9]|[a-z]|[A-Z])*$/;
    const passwordPattern = /^([0-9]|[a-z]|[A-Z])+$/;

    return [
        {
            fn: () => username.value.trim().length > 0,
            message: 'Заполните поле "Логин"'
        },
        {
            fn: () => username.value.trim().length <= 40,
            message: 'Логин не должен превышать длину в 40 символов'
        },
        {
            fn: () => loginPattern.test(username.value.trim()),
            message: 'Логин не должен начинаться с цифры и может состоять только из латинских букв (заглавных и строчных), а также цифр.'
        },
        {
            fn: () => password.value.length > 0 && passwordConfirm.value.length > 0,
            message: 'Необходимо заполнить оба поля ввода пароля'
        },
        {
            fn: () => password.value === passwordConfirm.value,
            message: 'Пароли не совпадают'
        },
        {
            fn: () => password.value.length >= 4,
            message: 'Пароль должен быть длиной не менее 4-х символов'
        },
        {
            fn: () => passwordPattern.test(password.value),
            message: 'Пароль может состоять только из латинских букв (заглавных и строчных), а также цифр.'
        },
        {
            fn: () => captcha.value.trim().length > 0,
            message: 'Введите ответ картинки'
        },
        {
            fn: () => confirmCheckbox.checked,
            message: 'Необходимо принять условия пользования сайтом'
        }
    ];
}

function createCaptcha(csrfTocken) {
    fetch('/auth/create_captcha/', {
        method: 'POST',
        body: `csrfmiddlewaretoken=${csrfTocken}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).then(response => {
        return new Promise(resolve => {
            switch (response.status) {
                case 200:
                    resolve(response.json());
                    break;
                default:
                    throw 'Some error. Try again!';
            } 
        });
    }).then(data => onUpdateCaptchaSuccess(data))
    .catch(err => console.error(err));
}

function updateCaptcha(csrfTocken) {
    fetch('/auth/update_captcha/', {
        method: 'POST',
        body: `csrfmiddlewaretoken=${csrfTocken}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).then(response => {
        return new Promise(resolve => {
            switch (response.status) {
                case 200:
                    resolve(response.json());
                    break;
                case 403:
                    createCaptcha(csrfTocken);
                    throw response.status;
            } 
        });
    }).then(data => onUpdateCaptchaSuccess(data))
    .catch(() => {});
}

function onUpdateCaptchaSuccess(data) {
    updateCaptchaTask(data.message);
    updateCaptchaImage();
}

function updateCaptchaImage() {
    tries++;
    const elem = byId('chaptcha-img-container');
    elem.innerHTML = '';
    setTimeout(() => elem.innerHTML = `<img class="reg-item__img" src="/auth/captcha_image?t=${tries}" alt="img">`);
}

function updateCaptchaTask(message) {
    byId('chaptcha-task').innerText = message;
    document.querySelector('[name=captcha]').value = '';
}

function updateErrorList(errors) {
    const errorList = byId('reg-errors');
    errorList.innerHTML = '';
    errors.forEach(error => {
        const li = document.createElement('li');
        li.innerText = error;
        errorList.appendChild(li);
    });
}
