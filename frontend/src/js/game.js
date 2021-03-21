import $ from 'jquery';
"use strict";

class SolvedWord {

    /**
     * @param {string} word 
     * @param {boolean} isNew 
     */
    constructor(word, isNew) {
        this.word = word;
        this.isNew = isNew;
    }
}

/**
 * Элемент с буквами слова
 * @type {HTMLDivElement}
 */
let letters;

/**
 * @type {JQuery<HTMLDivElement>}
 */
let solvedWordsContainer;

/**
 * Jquery-объект поля ввода слова
 * @type {JQuery<HTMLInputElement>}
 */
 let wordInput;

/**
 * Список разгаданных слов
 * @type {SolvedWord[]}
 */
const words = [];

/** @type {string} */
let csrfToken;

$(() => {
    csrfToken = $(document.getElementsByName("csrfmiddlewaretoken")[0]).val();

    wordInput = $("#word-input");
    letters = document.getElementById("letters");
    wordInput.val("");
    solvedWordsContainer = $("#solved-words");

    solvedWordsContainer.children().each((curWordNumber, curWordName) => {
        words.push(new SolvedWord(curWordName.innerText, false));
    });

    $("#submit-word-button").on("click", () => {
        submitWord();
    });

    $("#backspace-button").on("click", () => {
        backspace();
        filterWords();
    });

    $("#clear-button").on("click", () => {
        wordInput.val("");
        enableAllLetters();
        filterWords();
    });

    wordInput.on("keydown", e => {
        if (e.key === "Enter") {
            submitWord();
        } else if (e.key === "Backspace") {
            e.preventDefault();
            backspace();
            setTimeout(() => filterWords());
        } else {
            disableLetter(e.key);
            setTimeout(() => filterWords());
        }
    });

    $("body").on("keydown", e => {
        if (e.key === "Enter") {
            submitWord();
        }
    });

    $(".letters__item").on("click", e => {
        const letterBlock = $(e.originalEvent.target);

        if (!letterBlock.hasClass("letters__item_disabled")) {
            letterBlock.addClass("letters__item_disabled");
            wordInput.val(wordInput.val() + letterBlock.text().toLowerCase());
            filterWords();
        }
    });

    $("#shuffle-words-button").on("click", () => {
        shuffleLetters();
    });

    setInterval(clearLabels, 10000);
    $("#word-input").trigger("focus");
});

/**
 * Разоблокирует последнюю букву в поле ввода.
 */
function backspace() {
    if (wordInput.val() === "") {
        return;
    }

    /** @type {string} */
    let word = wordInput.val();
    let lastLetter = word.slice(-1);
    if (lastLetter === "ё" || lastLetter === "Ё") {
        lastLetter = "е";
    }
    enableLetter(lastLetter);

    word = word.slice(0, -1);
    wordInput.val(word);
}

/**
 * Фильтрует слова в списке отгаданных в соответствии с заданным фильтром
 */
function filterWords() {
    const filter = wordInput.val().toLowerCase().trim();
    solvedWordsContainer.html("");
    words.forEach(solvedWord => {
        if (solvedWord.word.indexOf(filter) === 0) {
            insertSolvedWord(solvedWord);
        }
    });
}

function submitWord() {
    const word = wordInput.val().toLowerCase().trim();
    wordInput.val("");
    enableAllLetters();
    filterWords();

    if (word === "") return;
    if (wordExists(word)) {
        spawnLabel("Уже отгадано!", "label-neutral");
        return;
    }

    $.post("submit_word/", {
        word,
        csrfmiddlewaretoken: csrfToken
    }).done(data => {
        if (data.success === 1) {
            const solvedWord = new SolvedWord(word, true);
            insertSolvedWord(solvedWord);
            words.push(solvedWord);
            $("#words-solved").text(words.length);
            spawnLabel(`+${data.reward}`, "label-success");
        } else {
            spawnLabel("cross", "label-fail");
        }
    });
}

/**
 * @param {string} word
 */
function wordExists(word) {
    for (let solvedWord of words) {
        if (solvedWord.word === word) return true;
    }

    return false;
}

/**
 * Добавляет указанное слово в список отгаданных слов
 * в алфавитном порядке
 * @param {SolvedWord} solvedWord
 */
function insertSolvedWord(solvedWord) {
    const word = solvedWord.word;
    const div = $(document.createElement("div"));
    div.addClass("solved-words__item");

    if (solvedWord.isNew) div.addClass("solved-words__item_new");
    div.text(word);

    const wordsJquery = solvedWordsContainer.children();

    if (wordsJquery.length === 0 || word > wordsJquery[wordsJquery.length - 1].innerText) {
        solvedWordsContainer.append(div);
    } else {
        let wordCount = 0;
        while (word > wordsJquery[wordCount].innerText) {
            wordCount++;
        }

        if (wordCount === 0) {
            solvedWordsContainer.prepend(div);
        } else {
            div.insertBefore($(wordsJquery[wordCount]));
        }
    }
}

function enableAllLetters() {
    $(".letters__item").removeClass("letters__item_disabled");
}

/**
 * Активирует первый втретившийся неактивный блок с указанной буквой.
 * В последствии этого он станет кликабельным.
 * Возаращает признак успешности.
 * @param {string} letter буква
 * @returns {boolean} признак успешности активации буквы
 */
function enableLetter(letter) {
    return toggleLetter(true, letter);
}

/**
 * Деактивирует первый втретившийся активный блок с указанной буквой.
 * В последствии этого он станет некликабельным.
 * Возаращает признак успешности.
 * @param {string} letter буква
 * @returns {boolean} признак успешности деактивации буквы
 */
function disableLetter(letter) {
    return toggleLetter(false, letter);
}

/**
 * Меняет состояние блока с первой встретившейся указанной буквой на указанное.
 * Возаращает признак успешности.
 * @param {boolean} enable true - активировать, false - деактивировать
 * @param {string} letter буква
 * @returns {boolean} признак успешности смены состояния буквы
 */
function toggleLetter(enable, letter) {
    try {
        letter = letter.toLowerCase();
    } catch (e) {
        if (e instanceof TypeError) return false;
        else throw e;
    }

    if (letter === "ё") letter = "е";

    const letters = $(".letters__item");
    let letterBlock, letterDisabled, letterSuits;

    for (let i = 0; i < letters.length; i++) {
        letterBlock = $(letters[i]);

        letterDisabled = letterBlock.hasClass("letters__item_disabled");
        letterSuits = letterBlock.text().toLowerCase() === letter;

        if (enable === letterDisabled && letterSuits) {

            if (enable) {
                letterBlock.removeClass("letters__item_disabled");
            } else {
                letterBlock.addClass("letters__item_disabled");
            }
            return true;
        }
    }
    return false;
}

/**
 * Спавнит всплывающую надпись
 * @param {string} text текст сообщения
 * @param {boolean} cssClass cssClass
 */
function spawnLabel(text, cssClass) {
    const div = $(document.createElement("div"));
    div.addClass("label");

    if (text === "cross") div.html(`<i class="fa fa-times" aria-hidden="true"></i>`);
    else div.text(text);

    div.addClass(cssClass);

    $("#labels").append(div);
    div.addClass("label-anim");

    const width = $(window).width(),
            height = $(window).height(),
            top = height / 2 * Math.random() + height / 2,
            left = width / 4 * 3 * Math.random();

    div.css({
        top: top + "px",
        left: left + "px"
    });

    setTimeout(animateLabel.bind(null, div), 10);
}

/**
 * Меняет свойства прозрачности и высоты выбранноо блока
 * @param {object} div jquery-объект элемента
 */
function animateLabel(div) {
    div.css({
        top: "-50px",
        opacity: 0
    });
}

/**
 * Очищает всплывающие лейблы с нулевой прозрачностью
 */
function clearLabels() {
    const labelsElem = document.getElementById("labels");
    const labels = $(labelsElem).children();
    let labelsToRemove = [];

    for (let i = 0; i < labels.length; i++) {
        if ($(labels[i]).css("opacity") == 0)
            labelsToRemove.push(labels[i]);
    }

    labelsToRemove.forEach(label => {
        labelsElem.removeChild(label);
    });
}

function shuffleLetters() {
    const letterElements = Array.from(letters.children);
    letters.innerHTML = "";
    shuffle(letterElements).forEach(letter => letters.appendChild(letter));
}

/**
 * @param {T} array
 * @returns {T}
 */
function shuffle(array) {
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
