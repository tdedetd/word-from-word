$(document).ready(() => {
    // Инициализация всех элементов как модальных окон с классом modal
    let modalObj, modalJquery;
    $(".modal").each((index, item) => {
        modalJquery = $(item);
        modalObj = new Modal(modalJquery);
        $("#" + modalJquery.attr("modal-for")).on("click", () => {
            modalObj.show();
        });
    });
});

class Modal {
    /**
     * Инициализирует модальное окно
     * @param {*} object jquery-объект на котором нужно создать диалоговое окно
     * @param {boolean} isShown показывать ли окно изначально
     */
    constructor(object, isShown=false) {

        this.isShown = isShown;

        this.window = $(object).find("div:first-child");
        this.window.addClass("modal__win");
        
        this.bg = $(document.createElement("div"));
        this.bg.addClass("modal__bg");
        $(object).append(this.bg);

        // Тут проверка на наличие window

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
