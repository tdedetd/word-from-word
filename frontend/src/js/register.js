"use strict";

const loginValidators = [
    {
        message: "Пожалуйста, введите логин",
        validate: (login) => login.length !== 0
    },
    {
        message: "Логин не должен превышать длину в 40 символов",
        validate: (login) => login.length <= 40
    },
    {
        message: "Логин не должен начинаться с цифры и может состоять только из латинских букв (заглавных и строчных), а также цифр.",
        validate: (login) => {
            const pattern = /^([a-z]|[A-Z])([0-9]|[a-z]|[A-Z])*$/;
            return pattern.test(login);
        }
    }
];

const passValidators = [
    {
        message: "Пожалуйста, заполните оба поля ввода пароля",
        validate: (password, passwordConfirm) => password.length > 0 && passwordConfirm.length > 0
    },
    {
        message: "Пароли не совпадают",
        validate: (password, passwordConfirm) => password === passwordConfirm
    },
    {
        message: "Пароль должен быть длиной не менее 4-х символов",
        validate: (password) => password.length >= 4
    },
    {
        message: "Пароль может состоять только из латинских букв (заглавных и строчных), а также цифр.",
        validate: (password) => {
            const pattern = /^([0-9]|[a-z]|[A-Z])+$/;
            return pattern.test(password);
        }
    }
];

const checkHtml = `<i class="fa fa-check" aria-hidden="true"></i>`;

let loginReady = false;
let passReady = false;

import("jquery").then(m => m.default).then($ => {

    $("#reg-user").on("change", e => {
        const loginOutput = $("#login-text");
        loginOutput.removeClass("text-fail");
        loginOutput.removeClass("text-success");

        const login = $(e.originalEvent.target).val();

        for (const validator of loginValidators) {
            if (!validator.validate(login)) {
                loginOutput.text(validator.message);
                loginOutput.addClass("text-fail");
                loginReady = false;
                updateSubmitEnabled();
                return;
            }
        }
        $.get(`/auth/register/checklogin/${login}/`).done(data => {
            if (data["response"]) {
                loginOutput.text("Пользователь с таким именем уже зарегистрирован");
                loginOutput.addClass("text-fail");
                loginReady = false;
            } else {
                loginOutput.html(checkHtml);
                loginOutput.addClass("text-success");
                loginReady = true;
            }
            updateSubmitEnabled();
        });
    });

    $(document).on("change", "#reg-pass", () => {
        if ($("#reg-pass-conf").val() != "") {
            validatePassword();
        }
    });

    $(document).on("change", "#reg-pass-conf", validatePassword);

    function validatePassword() {
        const passOutput = $("#pass-text");
        passOutput.removeClass("text-fail");
        passOutput.removeClass("text-success");

        const password = $("#reg-pass").val();
        const passwordConfirm = $("#reg-pass-conf").val();

        for (const validator of passValidators) {
            if (!validator.validate(password, passwordConfirm)) {
                passOutput.text(validator.message);
                passOutput.addClass("text-fail");
                passReady = false;
                updateSubmitEnabled();
                return;
            }
        }

        passOutput.html(checkHtml);
        passOutput.addClass("text-success");
        passReady = true;
        updateSubmitEnabled();
    }

    function updateSubmitEnabled() {
        $("#reg-submit").prop("disabled", !(loginReady && passReady));
    }
});
