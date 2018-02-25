"use strict";

const LVL_CLASS = "col col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4";

let lvlHtml, levels;
let lvlCount = 0,
    lvlLimit = 20,
    typeId = 1,
    dirId = 1;

$(document).ready(() => {
    lvlHtml = $("#level-sample").html();
    levels = $("#levels");
    loadLevels();
});

/** 
 * Загружает уровни
 */
function loadLevels() {
    $.get("/get_levels/", {
        "type_id": typeId,
        "dir_id": dirId,
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
function resetLevels() {
    levels.empty();
    lvlCount = 0;
}

/**
 * Выводит компонент уровня
 * @param {number} id id уровня
 * @param {string} word слово
 * @param {number} wordsTotal общее количество слов
 * @param {number} wordsSolved количество отгаданных слов
 * @param {*} lastActivity дата последней активности
 */
function displayLevel(id, word, wordsTotal, wordsSolved = 0, lastActivity=null) {
    let div = document.createElement("div");
    div.className = LVL_CLASS;
    let level = $(div);
    level.html(lvlHtml);
    
    level.find(".level__word").text(word.toUpperCase());
    level.find(".level__words-solved").text(wordsSolved);
    level.find(".level__words-total").text(wordsTotal);

    const perc = wordsSolved / wordsTotal * 100;
    level.find(".level__bar-solved").css("width", `${perc}%`);
    level.find(".level__bar-unsolved").css("width", `${100 - perc}%`);

    level.find(".level__bar").attr("title", perc.toFixed(2) + "%");
    level.find("a.level-link").attr("href", `/game/${id}/`);

    levels.append(level);
}