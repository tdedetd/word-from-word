import $ from 'jquery';
"use strict";

const LVL_CLASS = "col col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4";

/** Количество прогружаемых уровней за раз */
const lvlLimit = 20;

let lvlCount = 0;

/**
 * Html-код уровня
 * @type {string}
 */
let lvlHtml;

/** Jquery-контейнер с уровнями */
let levels;

/** Jquery-контейнер more levels */
let moreLevelsContainer;

/** Jquery-элемент */
let btnTop;

/** Jquery-элемент */
let selectOrderTypes;

/** Jquery-элемент */
let selectOrderDirs;

/** Jquery-элемент */
let inputSearch;

/** Jquery-элемент */
let loadingContainer;

$(() => {
    lvlHtml = $("#level-template").html();
    levels = $("#levels");
    moreLevelsContainer = $("#container-more-levels");
    btnTop = $("#btn-top");
    selectOrderTypes = $("#select-order-types");
    selectOrderDirs = $("#select-order-dirs");
    inputSearch = $("#input-search");
    loadingContainer = $("#container-loading");

    if (sessionStorage.getItem("selectOrderType") !== null &&
        sessionStorage.getItem("selectOrderDir") !== null &&
        sessionStorage.getItem("searchFilter") !== null) {

        selectOrderTypes.val(sessionStorage.getItem("selectOrderType"));
        selectOrderDirs.val(sessionStorage.getItem("selectOrderDir"));
        inputSearch.val(sessionStorage.getItem("searchFilter"));
    }

    selectOrderTypes.on("change", resetLevels);
    selectOrderDirs.on("change", resetLevels);
    inputSearch.on("keyup", resetLevels);
    $("#btn-more-levels").on("click", loadLevels);

    btnTop.on("click", () => {
        $("html, body").animate({ scrollTop: 0 }, "fast");
    });

    window.addEventListener("scroll", () => {
        updateOntopButton(window.scrollY);
    });

    $("#btn-reset-filters").click(() => {
        resetSelect(selectOrderTypes);
        resetSelect(selectOrderDirs);
        inputSearch.val("");
        resetLevels();
    });

    updateOntopButton(0);
    loadLevels();
});

function loadLevels() {
    moreLevelsContainer.hide();
    loadingContainer.show();
    $.get("/get_levels/", {
        typeId: selectOrderTypes.val(),
        dirId: selectOrderDirs.val(),
        offset: lvlCount,
        limit: lvlLimit,
        filter: inputSearch.val().trim()
    }).done(data => {
        lvlCount += lvlLimit;
        if (data.levels.length !== 0 && !data.end) {
            moreLevelsContainer.show();
            loadingContainer.hide();
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
    levels.empty();
    lvlCount = 0;
}

/** Сбрасывает окно уровней до состояния, соотвествующем выбранным параметрам */
function resetLevels() {
    sessionStorage.setItem("selectOrderType", selectOrderTypes.val());
    sessionStorage.setItem("selectOrderDir", selectOrderDirs.val());
    sessionStorage.setItem("searchFilter", inputSearch.val().trim());

    clearLevels();
    moreLevelsContainer.show();
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
    const div = document.createElement("div");
    div.className = LVL_CLASS;
    const level = $(div);
    level.html(lvlHtml);

    const wordEl = level.find(".level__word");
    const wordUpperCase = word.toUpperCase();

    wordEl.text(wordUpperCase);
    wordEl.prop("title", wordUpperCase);
    level.find(".level__words-solved").text(wordsSolved);
    level.find(".level__words-total").text(wordsTotal);
    level.find(".level__last-activity").text("Активность: " + lastActivity);

    const perc = wordsSolved / wordsTotal * 100;
    level.find(".level__bar-solved").css("width", `${perc}%`);
    level.find(".level__bar-unsolved").css("width", `${100 - perc}%`);

    level.find(".level__bar").attr("title", perc.toFixed(2) + "%");
    level.find("a").attr("href", `/game/${id}/`);

    levels.append(level);
}

function updateOntopButton(pageY) {
    if (pageY > 200) btnTop.show();
    else btnTop.hide();
}

// TODO: move out into common module
/**
 * Сбрасывает значение select'а на первый в списке
 * @param {object} selectJquery 
 */
function resetSelect(selectJquery) {
    const value = selectJquery.get()[0].children[0].value;
    selectJquery.val(value);
}
