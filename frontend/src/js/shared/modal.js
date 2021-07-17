import { byId } from '../shared/utils';
import * as template from '../../template/modal.html';

const MODAL_CLASS = 'modal';
const MODAL_SHOWN_CLASS = 'modal_shown';
const MODAL_HTML = template.default;

const TAG_TITLE = 'wfw-title';
const TAG_CONTENT = 'wfw-content';

export class Modal {

    get visible() {
        return this.element.classList.contains(MODAL_SHOWN_CLASS);
    }

    /**
     * @param {string} id id of DOM-element
     */
    constructor(id) {
        this.element = byId(id);
        this.element.classList.add(MODAL_CLASS);

        this._initDom();
        this._initCloseEvents();
    }

    hide() {
        this.element.classList.remove(MODAL_SHOWN_CLASS);
    }

    show() {
        this.element.classList.add(MODAL_SHOWN_CLASS);
    }

    _initCloseEvents() {
        this.element.addEventListener('click', e => {
            const classes = e.target.classList;
            if (classes.contains(MODAL_CLASS) || classes.contains('modal__times') || classes.contains('modal__ok-btn')) {
                this.hide();
            }
        });
    }

    _initDom() {
        const title = this._getTitle();
        const contentEl = this.element.querySelector(TAG_CONTENT);
        const contentHtml = contentEl ? contentEl.innerHTML : '';

        this.element.innerHTML = MODAL_HTML;
        this.element.querySelector('.modal__content').innerHTML = contentHtml;
        this.element.querySelector('.modal__h2').innerText = title;
    }

    _getTitle() {
        const titleEl = this.element.querySelector(TAG_TITLE);
        return titleEl ? titleEl.innerText : '';
    }
}
