// "use strict";

let feedbackModal;

$(document).ready(() => {
    displayXpInfo();

    feedbackModal = new Modal("feedback-modal");

    $("#feedback-button").on("click", () => {
        feedbackModal.show();
    });
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
        $("#xp-bar__filled").css({width: `${perc}%`});
        $("#xp-bar__empty").css({width: `${100 - perc}%`});
    });
}

class TabPane {
    /**
     * Инициализирует tab pane
     * @param {string} id id таб пейна
     * @param {*} events события по нажатию на вкладку
     */
    constructor(id, events=undefined) {
        this.classTabSelected = "tab-pane__tab_selected";
        this.classTab = "tab-pane__tab";
        this.classContent = "tab-pane__content";

        this.pane = $("#" + id);
        this.tabs = this.pane.find("." + this.classTab);
        this.contents = this.pane.find("." + this.classContent);

        this.hideAll();

        if (this.tabs.length == 0)
            throw "Отсутствуют табы";
        if (this.contents.length == 0)
            throw "Отсутствует содержимое";

        if (this.tabs.length != this.contents.length)
            throw `Количество табов (${this.tabs.length}) не соответствует количеству содержимого (${this.contents.length})`;

        for (let i = 0; i < this.tabs.length; i++) {
            $(this.tabs[i]).on("click", () => {
                this.select(i);

                if (events != undefined && events[i] != undefined) {
                    events[i]();
                }
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
        this.selectedIndex = index;
        
        $(this.tabs[index]).addClass(this.classTabSelected);
        $(this.contents[index]).css({"display": "block"});
    }
}

class Modal {
    /**
     * Инициализирует модальное окно
     * @param {string} id id DOM'а
     * @param {boolean} isShown показывать ли окно изначально
     */
    constructor(id, isShown=false) {

        this.id = id;
        this.isShown = isShown;

        const object = $(`#${this.id}`);
        if (object.get(0) == undefined)
            throw `Объект с id "${this.id}" не найден.`;

        this.bg = $(object).find(".modal__bg");
        this.window = $(object).find(".modal__win");

        // Тут проверка на наличие bg или window

        this.width = this.window.outerWidth();
        this.height = this.window.outerHeight();
        this.calcCoords();

        $(window).resize(() => {
            this.calcCoords();
        });

        this.bg.on("click", () => {
            this.hide();
        });

        if (this.isShown) this.show();
        else this.hide();
    }

    calcCoords() {
        this.x = $(window).outerWidth() / 2 - this.width / 2;

        this.hiddenY = -this.height - 100;
        this.shownY = $(window).outerHeight() / 2 - this.height / 2;

        this.updatePosition();
    }

    updatePosition() {
        const y = this.isShown ? this.shownY : this.hiddenY;

        this.window.css({
            top: y,
            left: this.x
        });
    }

    show() {
        this.isShown = true;
        this.updatePosition();
        this.bg.css({display: "block"});
    }

    hide() {
        this.isShown = false;
        this.updatePosition();
        this.bg.css({display: "none"});
    }

    toggle() {
        this.isShown = !this.isShown;

        if (this.isShown) this.show();
        else this.hide();
    }
}
