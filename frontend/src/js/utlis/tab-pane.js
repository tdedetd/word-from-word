export class TabPane {
    /**
     * Инициализирует tab pane
     * @param {string} id id таб пейна
     * @param {Object.<number, Function>} events события по нажатию на вкладку
     */
    constructor(id, events=undefined) {
        this.classTabSelected = "tab-pane__tab_selected";
        this.classTab = "tab-pane__tab";
        this.classContent = "tab-pane__content";

        this.pane = $("#" + id);
        this.tabs = this.pane.find("." + this.classTab);
        this.contents = this.pane.find("." + this.classContent);

        this.hideAll();

        if (this.tabs.length === 0)
            throw "Отсутствуют табы";
        if (this.contents.length === 0)
            throw "Отсутствует содержимое";

        if (this.tabs.length !== this.contents.length)
            throw `Количество табов (${this.tabs.length}) не соответствует количеству содержимого (${this.contents.length})`;

        for (let i = 0; i < this.tabs.length; i++) {
            $(this.tabs[i]).on("click", () => {
                this.select(i);

                if (events && events[i]) {
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
