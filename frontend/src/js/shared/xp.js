import { body, byId } from './utils';

/**
 * Загружает и выводит мнформацию о рейтинге и уровне пользователя на верхнюю панель
 */
export function displayXpInfo() {
    body('/get_xp_info/').then(data => {
        byId('level').innerText = data.level;
        byId('xp-bar').setAttribute('title', `Очков: ${data['points_current']} / ${data['points_needed']}`);

        const perc = data['points_current'] / data['points_needed'] * 100;
        byId('xp-bar__filled').style.width = `${perc}%`;
        byId('xp-bar__empty').style.width = `${100 - perc}%`;
    });
}
