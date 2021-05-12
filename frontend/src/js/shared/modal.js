import $ from 'jquery';
import * as template from '../../template/modal.html';

const MODAL_SHOWN_CLASS = 'modal_shown';
const MODAL_HTML = template.default;

const TAG_TITLE = 'wfw-title';
const TAG_CONTENT = 'wfw-content';

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

        this._initDom();
        this._initCloseEvents();
    }

    hide() {
        this.element.removeClass(MODAL_SHOWN_CLASS);
    }

    show() {
        this.element.addClass(MODAL_SHOWN_CLASS);
    }

    _initCloseEvents() {
        this.element.on('click', e => {
            const classes = e.target.classList;
            if (classes.contains('modal') || classes.contains('modal__times')) {
                this.hide();
            }
        });
    }

    _initDom() {
        const title = this._getTitle();
        const contentHtml = this.element.find(TAG_CONTENT).html();

        this.element.html(MODAL_HTML);
        this.element.find('.modal__content').html(contentHtml);
        this.element.find('.modal__h2').text(title);
    }

    _getTitle() {
        const titleEl = $(TAG_TITLE);
        return titleEl ? titleEl.text() : '';
    }
}
