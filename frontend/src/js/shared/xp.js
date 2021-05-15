/**
 * Загружает и выводит мнформацию о рейтинге и уровне пользователя на верхнюю панель
 */
export function displayXpInfo() {
    body('/get_xp_info/').then(data => {
        document.getElementById('level').innerText = data.level;
        document.getElementById('xp-bar').setAttribute('title', `Очков: ${data['points_current']} / ${data['points_needed']}`);

        const perc = data['points_current'] / data['points_needed'] * 100;
        document.getElementById('xp-bar__filled').style.width = `${perc}%`;
        document.getElementById('xp-bar__empty').style.width = `${100 - perc}%`;
    });
}

/**
 * Get element by id
 * @param {string} id 
 * @returns DOM element
 */
export function byId(id) {
    return document.getElementById(id);
}

/**
 * Fetch-based request, returns body
 * @param {RequestInfo} input
 * @param {RequestInit} init
 * @returns {Promise<any>}
 */
export function body(input, init=null) {
    return fetch(input, init).then(response => response.json());
}
