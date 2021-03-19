import("jquery").then(m => m.default).then($ => {
    $(() => {
        displayXpInfo();
    });

    /**
     * Загружает и выводит мнформацию о рейтинге и уровне пользователя на верхнюю панель
     */
    function displayXpInfo() {
        $.get("/get_xp_info/").done(data => {
            $("#level").text(data["level"]);
            $("#xp-bar").attr("title", `Очков: ${data["points_current"]} / ${data["points_needed"]}`);

            const perc = data["points_current"] / data["points_needed"] * 100;
            $("#xp-bar__filled").css({width: `${perc}%`});
            $("#xp-bar__empty").css({width: `${100 - perc}%`});
        });
    }

});
