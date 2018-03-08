"use strict";

$(document).ready(() => {
    displayXpInfo();
});

/**
 * Загружает и выводит мнформацию о рейтинге и уровне пользователя на верхнюю панель
 */
function displayXpInfo() {
    $.get("/get_xp_info/").done(data => {
        const response = data["xp_info"];
        $("#level").text(response["level"]);
        $("#xp-bar").attr("title", `Очков: ${response["points_current"]} / ${response["points_needed"]}`);

        const perc = response["points_current"] / response["points_needed"] * 100;
        $("#xp-bar__filled").css({"width": `${perc}%`});
        $("#xp-bar__empty").css({"width": `${100 - perc}%`});
    });
}
