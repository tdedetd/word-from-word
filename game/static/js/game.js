"use strict";

$(document).ready(() => {
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

    let csrfToken = $(document.getElementsByName("csrfmiddlewaretoken")[0]).val();

    $.post("submit_word/", {
        "word": word,
        "csrfmiddlewaretoken": csrfToken
    }).done(data => {
        console.log(data["response"]);
    });
}
