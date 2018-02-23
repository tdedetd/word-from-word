"use strict";

const LVL_CLASS = "col col-xs-12 col-sm-6 col-md-4 col-lg-4 col-xl-4";

let lvlHtml;
let levels;

$(document).ready(() => {
    lvlHtml = $("#level-sample").html();
    levels = $("#levels");
    displayLevels(130);
});

/**
 * 
 * @param {number} count 
 */
function displayLevels(count) {
    levels.empty();
    for (let i = 0; i < count; i++) {
        displayLevel(`Слово ${i + 1}`, 260, i + 1);
    }
}

/**
 * Выводит компонент уровня
 * @param {string} word слово
 * @param {number} wordsTotal общее количество слов
 * @param {number} wordsSolved количество отгаданных слов
 */
function displayLevel(word, wordsTotal, wordsSolved = 0) {
    let div = document.createElement("div");
    div.className = LVL_CLASS;
    let level = $(div);
    level.html(lvlHtml);
    
    level.find(".level__word").text(word);
    level.find(".level__words-solved").text(wordsSolved);
    level.find(".level__words-total").text(wordsTotal);

    const perc = wordsSolved / wordsTotal * 100;
    level.find(".level__bar-solved").css("width", `${perc}%`);
    level.find(".level__bar-unsolved").css("width", `${100 - perc}%`);

    console.log(`width: ${100 - perc}%;`);

    levels.append(level);
}
