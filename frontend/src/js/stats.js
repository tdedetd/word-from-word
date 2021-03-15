import { TabPane } from './utlis/tab-pane';

/** @type {TabPane} */
let personStatsTab;

let wordLengthChart;
let firstLetterChart;

$(document).ready(() => {
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