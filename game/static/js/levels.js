"use strict";

const LVL_CLASS = "col col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4";

let lvlHtml;
let levels;
let lvlCount = 0;
let lvlLimit = 30;

$(document).ready(() => {
    lvlHtml = $("#level-sample").html();
    levels = $("#levels");

    $("#select-order-types").on("change", resetLevels);
    $("#select-order-dirs").on("change", resetLevels);

    loadLevels();
});

/** 
 * Загружает уровни
 */
function loadLevels() {
    $.get("/get_levels/", {
        "type_id": $("#select-order-types").val(),
        "dir_id": $("#select-order-dirs").val(),
        "offset": lvlCount,
        "limit": lvlLimit
    }).done(data => {
        lvlCount += lvlLimit;
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

/** 
 * Очищает окно со списком уровней
 */
function clearLevels() {
    levels.empty();
    lvlCount = 0;
}

/** Сбрасывает окно уровней до состояния, соотвествующем выбранным параметрам */
function resetLevels() {
    clearLevels();
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
    level.find("a.level-link").attr("href", `/game/${id}/`);

    levels.append(level);
}
