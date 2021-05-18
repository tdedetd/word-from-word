/**
 * Get element by id
 * @param {string} id 
 * @returns DOM element
 */
export function byId(id) {
    return document.getElementById(id);
}

/**
 * Based on fetch, returns body
 * @param {RequestInfo} input
 * @param {RequestInit} init
 * @returns {Promise<any>}
 */
export function body(input, init=null) {
    return fetch(input, init).then(response => response.json());
}

/**
 * Returns GET-params string (without "?")
 * @param {object} obj
 * @returns {string}
 */
export function getParamsString(obj) {
    return Object.entries(obj)
                 .map(param => `${param[0]}=${param[1]}`)
                 .join('&');
}
