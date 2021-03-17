/** @type {TabPane} */
let personStatsTab;

let wordLengthChart;
let firstLetterChart;

import('jquery').then(m => m.default).then($ => {

    class TabPane {
        /**
         * Инициализирует tab pane
         * @param {string} id id таб пейна
         * @param {Object.<number, Function>} events события по нажатию на вкладку
         */
        constructor(id, events=undefined) {
            this.classTabSelected = "tab-pane__tab_selected";
            this.classTab = "tab-pane__tab";
            this.classContent = "tab-pane__content";

            this.pane = $("#" + id);
            this.tabs = this.pane.find("." + this.classTab);
            this.contents = this.pane.find("." + this.classContent);

            this.hideAll();

            if (this.tabs.length === 0)
                throw "Отсутствуют табы";
            if (this.contents.length === 0)
                throw "Отсутствует содержимое";

            if (this.tabs.length !== this.contents.length)
                throw `Количество табов (${this.tabs.length}) не соответствует количеству содержимого (${this.contents.length})`;

            for (let i = 0; i < this.tabs.length; i++) {
                $(this.tabs[i]).on("click", () => {
                    this.select(i);

                    if (events && events[i]) {
                        events[i]();
                    }
                });
            }

            this.select(0);
        }

        /**
         * Скрывает все табы
         */
        hideAll() {
            this.tabs.removeClass(this.classTabSelected);
            this.contents.css({"display": "none"});
        }

        /**
         * Выбирает таб с указанным индексом
         * @param {number} index 
         */
        select(index) {
            this.hideAll();
            this.selectedIndex = index;

            $(this.tabs[index]).addClass(this.classTabSelected);
            $(this.contents[index]).css({"display": "block"});
        }
    }

    $(() => {
        const events = {
            0: () => {
                if (wordLengthChart != undefined) {
                    wordLengthChart.resize();
                }
            },
            1: () => {
                if (firstLetterChart != undefined) {
                    firstLetterChart.resize();
                }
            }
        }

        personStatsTab = new TabPane("tab-person-stats", events);
        loadPersonalStats();
        loadPopularWords();
    });

    $(window).resize(() => {
        wordLengthChart.resize();
        firstLetterChart.resize();
    });

    /**
     * Загружает данные по персональной статистике и отображает их на графиках
     */
    function loadPersonalStats() {
        const colorBlue = "#005998";
        const colorDarkBlue = "#003357";
        const colorLightOrange = "#f6ba6d";

        $.get("get_personal_stats/").done(data => {

            wordLengthChart = echarts.init(document.getElementById("chart-word-length"));
            wordLengthChart.setOption({
                title: {
                    text: "Распределение количества отгаданных",
                    subtext: "слов по длине слова",
                    textStyle: {
                        color: colorDarkBlue,
                        fontSize: 18,
                        fontWeight: "bold"
                    },
                    subtextStyle: {
                        color: colorDarkBlue,
                        fontSize: 18,
                        fontWeight: "bold"
                    },
                    x: "center"
                },
                color: [colorBlue],
                tooltip : {
                    trigger: "axis",
                    axisPointer : {
                        type : "shadow",
                        label: {
                            formatter: "Длина слова: {value}"
                        }
                    }
                },
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    containLabel: true
                },
                xAxis : [
                    {
                        type : "category",
                        data : data.word_len_distrib.names,
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                yAxis : [
                    {
                        type : "value",
                        splitLine: {
                            lineStyle: {
                                color: colorLightOrange
                            }
                        }
                    }
                ],
                series : [
                    {
                        name: "Кол-во слов",
                        type: "bar",
                        barWidth: "60%",
                        data: data.word_len_distrib.vals
                    }
                ]
            });

            firstLetterChart = echarts.init(document.getElementById("chart-first-letter"));
            firstLetterChart.setOption({
                title: {
                    text: "Распределение количества отгаданных",
                    subtext: "слов по первой букве",
                    textStyle: {
                        color: colorDarkBlue,
                        fontSize: 18,
                        fontWeight: "bold"
                    },
                    subtextStyle: {
                        color: colorDarkBlue,
                        fontSize: 18,
                        fontWeight: "bold"
                    },
                    x: "center"
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow"
                    }
                },
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    containLabel: true
                },
                xAxis: {
                    type: "value",
                    boundaryGap: [0, 0.01],
                    splitLine: {
                        lineStyle: {
                            color: colorLightOrange
                        }
                    }
                },
                yAxis: {
                    type: "category",
                    data: data.first_letter.names.reverse()
                },
                series: [
                    {
                        name: "Кол-во слов",
                        type: "bar",
                        data: data.first_letter.vals.reverse()
                    }
                ],
                color: [colorBlue]
            });

            personStatsTab.select(0);
        });
    }

    function loadPopularWords() {
        $.get("get_popular_words/").done(data => {
            const tbody = $("#popular-words");
            data.words.forEach(word => {
                const row = $(document.createElement("div"));
                row.addClass("table__row");

                const cellWord = $(document.createElement("div"));
                cellWord.addClass("table__cell");
                cellWord.addClass("table__word");
                cellWord.text(word["word"]);

                const cellCount = $(document.createElement("div"));
                cellCount.addClass("table__cell");
                cellCount.addClass("table__count");
                cellCount.text(word["count"]);

                row.append(cellWord);
                row.append(cellCount);

                tbody.append(row);
            });
        });
    }    
});
