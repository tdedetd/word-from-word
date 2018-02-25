"use strict";

let wordsSolved;

$(document).ready(() => {
    wordsSolved = +$("#words-solved").text();

    $("#submit-word-button").on("click", () => {
        submitWord();
    });

    $("body").keypress(function(e) {
        if (e.keyCode == 13) {
            submitWord();
        }
    });
});

function submitWord() {
    let wordInput = $("#word-input");
    let word = wordInput.val().toLowerCase();
    wordInput.val("");

    if (word.trim() == "") {
        return;
    }

    let csrfToken = $(document.getElementsByName("csrfmiddlewaretoken")[0]).val();

    $.post("submit_word/", {
        "word": word,
        "csrfmiddlewaretoken": csrfToken
    }).done(data => {
        const response = data["response"];
        if (response["success"] == 1) {
            wordsSolved++;
            $("#words-solved").text(wordsSolved);

            insertSolvedWord(word);
        }
    });
}

/**
 * Добавляет указанное слово в список отгаданных слов
 * @param {string} word 
 */
function insertSolvedWord(word) {
    let div = $(document.createElement("div"));
    div.addClass("solved-words__item");
    div.addClass("solved-words__item_new");
    div.text(word);

    let words = $("#solved-words").children();

    if (words.length == 0 || word > words[words.length - 1].innerText) {
        $("#solved-words").append(div);
    } else {
        let wordCount = 0;
        while (word > words[wordCount].innerText) {
            wordCount++;
        }

        if (wordCount == 0) {
            $("#solved-words").prepend(div);
        } else {
            div.insertBefore($(words[wordCount]));
        }
    }
}
