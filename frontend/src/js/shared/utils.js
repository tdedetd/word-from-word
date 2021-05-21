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

/**
 * Reshuffles elements of array
 * @param {T} array
 * @returns {T} new array with shuffled elements
 */
export function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;
    let temp;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }

    return array;
}
