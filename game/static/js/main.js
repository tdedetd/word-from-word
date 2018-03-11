// "use strict";

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

class TabPane {
    /**
     * Инициализирует tab pane
     * @param {string} id id таб пейна
     */
    constructor(id) {
        this.classTabSelected = "tab-pane__tab_selected";
        this.classTab = "tab-pane__tab";
        this.classContent = "tab-pane__content";

        this.pane = $("#" + id);
        this.tabs = this.pane.find("." + this.classTab);
        this.contents = this.pane.find("." + this.classContent);

        this.hideAll();

        if (this.tabs.length == 0) throw "Отсутствуют табы";
        if (this.contents.length == 0) throw "Отсутствует содержимое";

        if (this.tabs.length != this.contents.length)
            throw `Количество табов (${this.tabs.length}) не соответствует количеству содержимого (${this.contents.length})`;

        for (let i = 0; i < this.tabs.length; i++) {
            $(this.tabs[i]).on("click", () => {
                this.select(i);
            });
        }

        this.select(0);
    }

    /**
     * Скрывает все табы
     */
    hideAll() {
        this.tabs.removeClass(this.classTabSelected);
        this.contents.css({"display": "none"});
    }

    /**
     * Выбирает таб с указанным индексом
     * @param {number} index 
     */
    select(index) {
        this.hideAll();
        
        $(this.tabs[index]).addClass(this.classTabSelected);
        $(this.contents[index]).css({"display": "block"});
    }
}
