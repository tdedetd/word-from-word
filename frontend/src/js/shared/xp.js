import { byId } from './utils';

/**
 * Загружает и выводит мнформацию о рейтинге и уровне пользователя на верхнюю панель
 */
export function displayXpInfo() {
    fetch('/get_xp_info/').then(response => {
        return new Promise((resolve) => {
            if (response.status !== 200) throw response.status;
            resolve(response.json());
        });
    }).then(data => {
        byId('level').innerText = data.level;
        byId('xp-bar').setAttribute('title', `Очков: ${data['points_current']} / ${data['points_needed']}`);

        const perc = data['points_current'] / data['points_needed'] * 100;
        byId('xp-bar__filled').style.width = `${perc}%`;
        byId('xp-bar__empty').style.width = `${100 - perc}%`;
    }).catch(() => {});
}
