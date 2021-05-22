import { Modal } from './shared/modal';
import { displayXpInfo } from './shared/xp';

document.addEventListener('DOMContentLoaded', () => {
    displayXpInfo();

    const cookieModal = new Modal('cookie-modal');
    if (!localStorage.getItem('cookieModalShown')) {
        setTimeout(() => {
            cookieModal.show();
            localStorage.setItem('cookieModalShown', true);
        }, 3000);
    }
});
