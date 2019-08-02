(function() {
    "use strict";

    const CYRILLIC = {
        1072: "а", 1073: "б", 1074: "в", 1075: "г", 1076: "д", 1077: "е", 1105: "е", 1078: "ж", 1079: "з", 1080: "и", 1081: "й", 1082: "к",
        1083: "л", 1084: "м", 1085: "н", 1086: "о", 1087: "п", 1088: "р", 1089: "с", 1090: "т", 1091: "у", 1092: "ф", 1093: "х", 1094: "ц",
        1095: "ч", 1096: "ш", 1097: "щ", 1098: "ъ", 1099: "ы", 1100: "ь", 1101: "э", 1102: "ю", 1103: "я",
        1040: "А", 1041: "Б", 1042: "В", 1043: "Г", 1044: "Д", 1045: "Е", 1025: "Е", 1046: "Ж", 1047: "З", 1048: "И", 1049: "Й", 1050: "К",
        1051: "Л", 1052: "М", 1053: "Н", 1054: "О", 1055: "П", 1056: "Р", 1057: "С", 1058: "Т", 1059: "У", 1060: "Ф", 1061: "Х", 1062: "Ц",
        1063: "Ч", 1064: "Ш", 1065: "Щ", 1066: "Ъ", 1067: "Ы", 1068: "Ь", 1069: "Э", 1070: "Ю", 1071: "Я"
    };

    /** Кол-во разгаданных слов */
    let wordsSolved;
    /** Jquery-объект поля ввода слова */ 
    let wordInput; 
    /** Jquery-объект контейнера с отгаданными словами */
    let solvedWords;
    /** Список разгаданных слов */ 
    let words = [];

    $(document).ready(() => {
        wordsSolved = +$("#words-solved").text();
        wordInput = $("#word-input");
        solvedWords = $("#solved-words");
        wordInput.val("");

        solvedWords.children().each((curWordNumber, curWordName) => {
            words.push(curWordName.innerText);
        });

        $("#submit-word-button").on("click", () => {
            submitWord();
        });

        $("#backspace-button").on("click", () => {
            backspace(true);
        });

        $("#clear-button").on("click", () => {
            wordInput.val("");
            enableAllLetters();
        });

        wordInput.keypress(function(e) {
            if (e.keyCode === 13) {
                submitWord();
            } else if (e.keyCode === 8) {
                backspace(false);
            } else {
                disableLetter(CYRILLIC[e.which]);
            }
        });

        $("body").keypress(function(e) {
            if (e.keyCode === 13) {
                submitWord();
            }
        });

        $(".letters__item").on("click", function() {
            let letterBlock = $(this);

            if (!letterBlock.hasClass("letters__item_disabled")) {
                letterBlock.addClass("letters__item_disabled");
                wordInput.val(wordInput.val() + letterBlock.text().toLowerCase());
            }
        });

        setInterval(clearLabels, 10000);
        $('#word-input').focus();
    });

    /**
     * Разоблокирует последнюю букву в поле ввода.
     * @param {boolean} removeLastLetter нужно ли удалять последнюю букву слова
     */
    function backspace(removeLastLetter) {
        if (wordInput.val() === "") {
            return;
        }

        let word = wordInput.val();
        let lastLetter = word[word.length - 1];
        if (lastLetter === "ё" || lastLetter === "Ё") {
            lastLetter = "е";
        }
        enableLetter(lastLetter);

        if (removeLastLetter) {
            word = word.substr(0, word.length - 1);
        }

        wordInput.val(word);
    }

    function submitWord() {
        let word = wordInput.val().toLowerCase();
        wordInput.val("");
        enableAllLetters();

        if (word.trim() === "") return;

        let csrfToken = $(document.getElementsByName("csrfmiddlewaretoken")[0]).val();

        $.post("submit_word/", {
            "word": word,
            "csrfmiddlewaretoken": csrfToken
        }).done(data => {
            const response = data["response"];
            if (response["success"] === 1) {
                wordsSolved++;
                $("#words-solved").text(wordsSolved);
                insertSolvedWord(word);
                displayXpInfo();
            }

            spawnRewardLabel(response["reward"]);
        });
    }

    /**
     * Добавляет указанное слово в список отгаданных слов
     * @param {string} word слово
     */
    function insertSolvedWord(word) {
        let div = $(document.createElement("div"));
        div.addClass("solved-words__item");
        div.addClass("solved-words__item_new");
        div.text(word);

        let words = $("#solved-words").children();

        if (words.length === 0 || word > words[words.length - 1].innerText) {
            $("#solved-words").append(div);
        } else {
            let wordCount = 0;
            while (word > words[wordCount].innerText) {
                wordCount++;
            }

            if (wordCount === 0) {
                $("#solved-words").prepend(div);
            } else {
                div.insertBefore($(words[wordCount]));
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

        let letters = $(".letters__item");
        let letterBlock, letterDisabled, letterSuits;

        for (let i = 0; i < letters.length; i++) {
            letterBlock = $(letters[i]);

            letterDisabled = letterBlock.hasClass("letters__item_disabled");
            letterSuits = letterBlock.text().toLowerCase() == letter;

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
     * @param {number} reward награда за отгаданное слово
     */
    function spawnRewardLabel(reward) {
        let div = $(document.createElement("div"));
        div.addClass("label");

        if (reward) {
            div.text(`+${reward}`);
            div.addClass("label-success");
        } else {
            div.html(`<i class="fa fa-times" aria-hidden="true"></i>`);
            div.addClass("label-fail");
        }

        $("#labels").append(div);
        div.addClass("label-anim");

        const x = $(window).width(),
              y = $(window).height();

        div.css({
            top: `${y / 2 * Math.random() + y / 2}px`,
            left: `${x / 4 * 3 * Math.random()}px`
        });

        setTimeout(animateLabel.bind(null, div), 10);
    }

    /**
     * Меняет свойства прозрачности и высоты выбранноо блока
     * @param {*} div jquery-объект элемента
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

    /**
     * Добавляет указанное слово в контейнер отгаданных слов
     * @param {string} word слово
     */
    function displayWord(word) {
        let wordElem = $(document.createElement("div"));
        wordElem.addClass("solved-words__item");
        wordElem.text(word);
        solvedWords.append(wordElem);
    }    
})();
