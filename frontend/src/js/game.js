import { byId, shuffle } from './shared/utils';
import { displayXpInfo } from './shared/xp';
"use strict";

class SolvedWord {

    /**
     * @param {string} word 
     * @param {boolean} isNew 
     */
    constructor(word, isNew=false) {
        this.word = word;
        this.isNew = isNew;
    }
}

const DISABLED_LETTER_CLASS = "letters__item_disabled";

/**
 * Элемент с буквами слова
 * @type {HTMLDivElement}
 */
let letters;

/**
 * @type {HTMLDivElement}
 */
let solvedWordsContainer;

/**
 * @type {HTMLInputElement}
 */
 let wordInput;

/**
 * Список разгаданных слов
 * @type {SolvedWord[]}
 */
const words = [];

/** @type {string} */
let csrfToken;

document.addEventListener('DOMContentLoaded', () => {
    csrfToken = document.getElementsByName("csrfmiddlewaretoken")[0].value;

    wordInput = byId('word-input');
    letters = byId("letters");
    solvedWordsContainer = byId('solved-words');

    Array.from(solvedWordsContainer.children).forEach(wordEl => {
        words.push(new SolvedWord(wordEl.innerText));
    });

    byId('submit-word-button').addEventListener("click", () => {
        submitWord();
    });

    byId('backspace-button').addEventListener("click", () => {
        backspace();
        filterWords();
    });

    byId('clear-button').addEventListener("click", () => {
        wordInput.value = '';
        enableAllLetters();
        filterWords();
    });

    wordInput.addEventListener("keydown", e => {
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

    document.body.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            submitWord();
        }
    });

    Array.from(document.getElementsByClassName('letters__item')).forEach(letterEl => {
        letterEl.addEventListener('click', e => {
            /** @type {HTMLDivElement} */
            const letterBlock = e.target;

            if (!letterBlock.classList.contains(DISABLED_LETTER_CLASS)) {
                letterBlock.classList.add(DISABLED_LETTER_CLASS);
                wordInput.value += letterBlock.innerText.toLowerCase();
                filterWords();
            }
        });
    });

    byId('shuffle-words-button').addEventListener("click", () => {
        shuffleLetters();
    });

    setInterval(clearLabels, 10000);
    byId('word-input').focus();
});

/**
 * Разоблокирует последнюю букву в поле ввода.
 */
function backspace() {
    if (wordInput.value === "") {
        return;
    }

    /** @type {string} */
    let word = wordInput.value;
    let lastLetter = word.slice(-1);
    if (lastLetter === "ё" || lastLetter === "Ё") {
        lastLetter = "е";
    }
    enableLetter(lastLetter);

    word = word.slice(0, -1);
    wordInput.value = word;
}

/**
 * Фильтрует слова в списке отгаданных в соответствии с заданным фильтром
 */
function filterWords() {
    const filter = wordInput.value.toLowerCase().trim();
    solvedWordsContainer.innerHTML = '';
    words.forEach(solvedWord => {
        if (solvedWord.word.indexOf(filter) === 0) {
            insertSolvedWord(solvedWord);
        }
    });
}

function submitWord() {
    const word = wordInput.value.toLowerCase().trim();
    wordInput.value = '';
    enableAllLetters();
    filterWords();

    if (word === "") return;
    if (wordExists(word)) {
        spawnLabel("Уже отгадано!", "label-neutral");
        return;
    }

    fetch('submit_word/', {
        method: 'POST',
        body: `csrfmiddlewaretoken=${csrfToken}&word=${word}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).then(response => response.json())
    .then(data => {
        if (data.success === 1) {
            const solvedWord = new SolvedWord(word, true);
            insertSolvedWord(solvedWord);
            words.push(solvedWord);
            byId('words-solved').innerText = words.length;
            spawnLabel(`+${data.reward}`, "label-success");
            displayXpInfo();
        } else {
            spawnLabel("cross", "label-neutral");
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
    const div = document.createElement("div");
    div.classList.add("solved-words__item");
    div.innerText = word;

    if (solvedWord.isNew) div.classList.add("solved-words__item_new");

    const wordsElements = solvedWordsContainer.children;

    if (wordsElements.length === 0 || word > wordsElements[wordsElements.length - 1].innerText) {
        solvedWordsContainer.appendChild(div);
    } else {
        let wordCount = 0;
        while (word > wordsElements[wordCount].innerText) {
            wordCount++;
        }

        if (wordCount === 0) {
            solvedWordsContainer.prepend(div);
        } else {
            solvedWordsContainer.insertBefore(div, wordsElements[wordCount]);
        }
    }
}

function enableAllLetters() {
    Array.from(document.getElementsByClassName('letters__item')).forEach(letterEl => {
        letterEl.classList.remove(DISABLED_LETTER_CLASS);
    });
}

/**
 * Активирует первый втретившийся неактивный блок с указанной буквой.
 * В последствии этого он станет кликабельным.
 * Возаращает признак успешности.
 * @param {string} letter буква
 * @returns {boolean} признак успешности активации буквы
 */
function enableLetter(letter) {
    return setLetterState('enable', letter);
}

/**
 * Деактивирует первый втретившийся активный блок с указанной буквой.
 * В последствии этого он станет некликабельным.
 * Возаращает признак успешности.
 * @param {string} letter буква
 * @returns {boolean} признак успешности деактивации буквы
 */
function disableLetter(letter) {
    return setLetterState('disable', letter);
}

/**
 * Меняет состояние блока с первой встретившейся указанной буквой на указанное.
 * Возаращает признак успешности.
 * @param {'enable' | 'disable'} mode
 * @param {string} letter буква
 * @returns {boolean} признак успешности смены состояния буквы
 */
function setLetterState(mode, letter) {
    try {
        letter = letter.toLowerCase();
    } catch (e) {
        if (e instanceof TypeError) return false;
        else throw e;
    }

    if (letter === "ё") letter = "е";

    /** @type {HTMLDivElement[]} */
    const letters = Array.from(document.getElementsByClassName('letters__item'));
    let letterBlock, letterDisabled, letterSuits;

    for (let i = 0; i < letters.length; i++) {
        letterBlock = letters[i];

        letterDisabled = letterBlock.classList.contains(DISABLED_LETTER_CLASS);
        letterSuits = letterBlock.innerText.toLowerCase() === letter;

        if (letterSuits) {
            if (mode === 'enable') {
                letterBlock.classList.remove(DISABLED_LETTER_CLASS);
            } else if (mode === 'disable') {
                letterBlock.classList.add(DISABLED_LETTER_CLASS);
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
    const div = document.createElement("div");
    div.classList.add("label");

    if (text === "cross") div.innerHTML = `<i class="fa fa-times" aria-hidden="true"></i>`;
    else div.innerText = text;

    div.classList.add(cssClass);

    byId('labels').appendChild(div);
    div.classList.add("label-anim");

    const width = window.innerWidth,
            height = window.innerHeight,
            top = height / 2 * Math.random() + height / 2,
            left = width / 4 * 3 * Math.random();

    div.style.top = top + "px";
    div.style.left = left + "px";

    setTimeout(() => {
        div.style.top = "-50px";
        div.style.opacity = 0;
    }, 10);
}

/**
 * Очищает всплывающие лейблы с нулевой прозрачностью
 */
function clearLabels() {
    const labelsEl = byId("labels");

    /** @type {HTMLDivElement[]} */
    const labels = labelsEl.children;
    const labelsToRemove = [];

    for (const label of labels) {
        if (window.getComputedStyle(label).getPropertyValue('opacity') < 0.001) {
            labelsToRemove.push(label);
        }
    }

    labelsToRemove.forEach(label => {
        labelsEl.removeChild(label);
    });
}

function shuffleLetters() {
    const letterElements = Array.from(letters.children);
    letters.innerHTML = "";
    shuffle(letterElements).forEach(letter => letters.appendChild(letter));
}
