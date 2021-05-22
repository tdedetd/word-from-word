import { Modal } from './shared/modal';
import { displayXpInfo } from './shared/xp';

document.addEventListener('DOMContentLoaded', () => {
    displayXpInfo();

    if (!localStorage.getItem('cookieModalShown')) {
        const cookieModal = new Modal('cookie-modal');
        setTimeout(() => {
            cookieModal.show();
            localStorage.setItem('cookieModalShown', true);
        }, 3000);
    }
});
