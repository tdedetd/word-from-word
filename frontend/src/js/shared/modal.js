import { byId } from '../shared/utils';
import * as template from '../../template/modal.html';

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
        this.element.classList.add('modal');

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
            if (classes.contains('modal') || classes.contains('modal__times') || classes.contains('modal__ok-btn')) {
                this.hide();
            }
        });
    }

    _initDom() {
        const title = this._getTitle();
        const contentEl = this.element.getElementsByTagName(TAG_CONTENT)[0];
        const contentHtml = contentEl ? contentEl.innerHTML : '';

        this.element.innerHTML = MODAL_HTML;
        this.element.getElementsByClassName('modal__content')[0].innerHTML = contentHtml;
        this.element.getElementsByClassName('modal__h2')[0].innerText = title;
    }

    _getTitle() {
        const titleEl = this.element.getElementsByTagName(TAG_TITLE)[0];
        return titleEl ? titleEl.innerText : '';
    }
}
