(function() {
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
            validate: (pass1, pass2) => pass1.length > 0 && pass2.length > 0
        },
        {
            message: "Пароли не совпадают",
            validate: (pass1, pass2) => pass1 === pass2
        },
        {
            message: "Пароль должен быть длиной не менее 4-х символов",
            validate: (pass) => pass.length >= 4
        },
        {
            message: "Пароль может состоять только из латинских букв (заглавных и строчных), а также цифр.",
            validate: (pass) => {
                const pattern = /^([0-9]|[a-z]|[A-Z])+$/;
                return pattern.test(pass);
            }
        }
    ];

    const check = "<i class=\"fa fa-check\" aria-hidden=\"true\"></i>";

    let loginReady = false,
        passReady = false;

    $(document).on("change", "#reg-user", function() {
        let loginOutput = $("#login-text");
        loginOutput.removeClass("text-fail");
        loginOutput.removeClass("text-success");

        let login = $(this).val();

        for (let validator of loginValidators) {
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
                loginOutput.html(check);
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
        let passOutput = $("#pass-text");
        passOutput.removeClass("text-fail");
        passOutput.removeClass("text-success");

        let pass1 = $("#reg-pass").val(),
            pass2 = $("#reg-pass-conf").val();

        for (let validator of passValidators) {
            if (!validator.validate(pass1, pass2)) {
                passOutput.text(validator.message);
                passOutput.addClass("text-fail");
                passReady = false;
                updateSubmitEnabled();
                return;
            }
        }

        passOutput.html(check);
        passOutput.addClass("text-success");
        passReady = true;
        updateSubmitEnabled();
    }

    function updateSubmitEnabled() {
        $("#reg-submit").prop("disabled", !(loginReady && passReady));
    }    
})();
