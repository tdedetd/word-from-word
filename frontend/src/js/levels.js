import * as levelTemplateModule from '../template/level.html';
import { byId, body } from './shared/utils';
"use strict";

const LVL_CLASS = "col col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4";

/** Количество прогружаемых уровней за раз */
const LVL_LIMIT = 20;

let lvlCount = 0;

/**
 * Html-код уровня
 * @type {string}
 */
let lvlHtml;

/** @type {HTMLDivElement} */
let levels;

/** @type {HTMLDivElement} */
let moreLevelsContainer;

/** @type {HTMLButtonElement} */
let btnTop;

/** @type {HTMLSelectElement} */
let selectOrderTypes;

/** @type {HTMLSelectElement} */
let selectOrderDirs;

/** @type {HTMLInputElement} */
let inputSearch;

/** @type {HTMLDivElement} */
let loadingContainer;

document.addEventListener('DOMContentLoaded', () => {
    lvlHtml = levelTemplateModule.default;
    levels = byId('levels');
    moreLevelsContainer = byId('container-more-levels');
    btnTop = byId('btn-top');
    selectOrderTypes = byId('select-order-types');
    selectOrderDirs = byId('select-order-dirs');
    inputSearch = byId('input-search');
    loadingContainer = byId('container-loading');

    if (sessionStorage.getItem("selectOrderType") !== null &&
        sessionStorage.getItem("selectOrderDir") !== null &&
        sessionStorage.getItem("searchFilter") !== null) {

        selectOrderTypes.value = sessionStorage.getItem("selectOrderType");
        selectOrderDirs.value = sessionStorage.getItem("selectOrderDir");
        inputSearch.value = sessionStorage.getItem("searchFilter");
    }

    selectOrderTypes.addEventListener("change", resetLevels);
    selectOrderDirs.addEventListener("change", resetLevels);
    inputSearch.addEventListener("keyup", resetLevels);
    byId('btn-more-levels').addEventListener("click", loadLevels);

    btnTop.addEventListener("click", () => {
        window.scrollTo(0, 0);
    });

    window.addEventListener("scroll", () => {
        updateOntopButton(window.scrollY);
    });

    byId('btn-reset-filters').addEventListener('click', () => {
        resetSelect(selectOrderTypes);
        resetSelect(selectOrderDirs);
        inputSearch.value = '';
        resetLevels();
    });

    updateOntopButton(0);
    loadLevels();
});

function loadLevels() {
    moreLevelsContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';
    const url = new URL(`${location.origin}/get_levels/`);
    const params = {
        typeId: selectOrderTypes.value,
        dirId: selectOrderDirs.value,
        offset: lvlCount,
        limit: LVL_LIMIT,
        filter: inputSearch.value.trim()
    };
    url.search = new URLSearchParams(params).toString();
    body(url).then(data => {
        lvlCount += LVL_LIMIT;
        if (data.levels.length !== 0 && !data.end) {
            moreLevelsContainer.style.display = 'flex';
            loadingContainer.style.display = 'none';
        }

        data["levels"].forEach(level => {
            displayLevel(
                level["id"],
                level["word"],
                level["word_count"],
                level["solved"],
                level["last_activity"]
            );
        });
    });
}

/** Очищает окно со списком уровней */
function clearLevels() {
    levels.innerHTML = '';
    lvlCount = 0;
}

/** Сбрасывает окно уровней до состояния, соотвествующем выбранным параметрам */
function resetLevels() {
    sessionStorage.setItem("selectOrderType", selectOrderTypes.value);
    sessionStorage.setItem("selectOrderDir", selectOrderDirs.value);
    sessionStorage.setItem("searchFilter", inputSearch.value.trim());

    clearLevels();
    moreLevelsContainer.style.display = 'flex';
    loadLevels();
}

/**
 * Выводит уровень
 * @param {number} id id уровня
 * @param {string} word слово
 * @param {number} wordsTotal общее количество слов
 * @param {number} wordsSolved количество отгаданных слов
 * @param {string} lastActivity дата последней активности
 */
function displayLevel(id, word, wordsTotal, wordsSolved=0, lastActivity="-") {
    const level = document.createElement("div");
    level.className = LVL_CLASS;
    level.innerHTML = lvlHtml;

    /** @type {HTMLDivElement} */
    const wordEl = level.getElementsByClassName('level__word')[0];
    const wordUpperCase = word.toUpperCase();

    wordEl.innerText = wordUpperCase;
    wordEl.setAttribute('title', wordUpperCase);
    level.getElementsByClassName('level__words-solved')[0].innerText = wordsSolved;
    level.getElementsByClassName('level__words-total')[0].innerText = wordsTotal;
    level.getElementsByClassName('level__last-activity')[0].innerText = "Активность: " + lastActivity;

    const perc = wordsSolved / wordsTotal * 100;
    level.getElementsByClassName('level__bar-solved')[0].style.width = `${perc}%`;
    level.getElementsByClassName('level__bar-unsolved')[0].style.width = `${100 - perc}%`;

    level.getElementsByClassName('level__bar')[0].setAttribute('title', perc.toFixed(2) + "%");
    level.getElementsByTagName('a')[0].setAttribute('href', `/game/${id}/`);

    levels.appendChild(level);
}

function updateOntopButton(pageY) {
    if (pageY > 200) btnTop.style.display = 'block';
    else btnTop.style.display = 'none';
}

// TODO: move out into common module
/**
 * Сбрасывает значение select'а на первый в списке
 * @param {HTMLSelectElement} select
 */
function resetSelect(select) {
    select.selectedIndex = 0;
}
