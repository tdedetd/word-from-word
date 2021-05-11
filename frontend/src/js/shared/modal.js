import $ from 'jquery';

const MODAL_SHOWN_CLASS = 'modal_shown';

const MODAL_HTML = `
    <div class="modal__bg"></div>    
    <div class="modal__container">
        <div class="modal__header">
            <h2 class="modal__h2"></h2>
            <i class="fa fa-times modal__times" aria-hidden="true"></i>
        </div>
        <div class="modal__content"></div>
    </div>
`;

export class Modal {

    get visible() {
        return this.element.hasClass(MODAL_SHOWN_CLASS);
    }

    /**
     * @param {string} id id of DOM-element
     */
    constructor(id) {
        this.element = $(`#${id}`);
        this.element.addClass('modal');

        const contentHtml = this.element.html();
        this.element.html(MODAL_HTML);
        this.element.find('.modal__content').html(contentHtml);

        this._initCloseEvents();
    }

    hide() {
        this.element.removeClass(MODAL_SHOWN_CLASS);
    }

    show() {
        this.element.addClass(MODAL_SHOWN_CLASS);
    }

    _initCloseEvents() {
        this.element.find('.modal__bg').on('click', () => this.hide());
        this.element.find('.modal__times').on('click', () => this.hide());
    }
}
