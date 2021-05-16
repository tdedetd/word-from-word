import { byId, body } from './shared/utils';
import * as echarts from 'echarts';

/** @type {TabPane} */
let personStatsTab;

/** @type {echarts.ECharts} */
let wordLengthChart;

/** @type {echarts.ECharts} */
let firstLetterChart;

class TabPane {
    /**
     * Инициализирует tab pane
     * @param {string} id id таб пейна
     * @param {Object.<number, Function>} events события по нажатию на вкладку
     */
    constructor(id, events=null) {
        this.classTabSelected = "tab-pane__tab_selected";
        this.classTab = "tab-pane__tab";
        this.classContent = "tab-pane__content";

        this.pane = byId(id);

        if (!this.pane) throw `Не удалось создать tab-панель: элемент с id "${id}" не найден`;

        /** @type {HTMLDivElement[]} */
        this.tabs = Array.from(this.pane.getElementsByClassName(this.classTab));

        /** @type {HTMLDivElement[]} */
        this.contents = Array.from(this.pane.getElementsByClassName(this.classContent));

        this.hideAll();

        if (this.tabs.length === 0) throw "Отсутствуют табы";
        if (this.contents.length === 0) throw "Отсутствует содержимое";

        for (let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].addEventListener("click", () => {
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
        this.tabs.forEach(tab => tab.classList.remove(this.classTabSelected));
        this.contents.forEach(content => content.style.display = 'none');
    }

    /**
     * Выбирает таб с указанным индексом
     * @param {number} index индекс таба
     */
    select(index) {
        this.hideAll();
        this.selectedIndex = index;

        this.tabs[index].classList.add(this.classTabSelected);
        this.contents[index].style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const events = {
        0: () => {
            if (typeof wordLengthChart !== 'undefined') {
                wordLengthChart.resize();
            }
        },
        1: () => {
            if (typeof firstLetterChart !== 'undefined') {
                firstLetterChart.resize();
            }
        }
    }

    try {
        personStatsTab = new TabPane("tab-person-stats", events);
        loadPersonalStats();
        loadPopularWords();
    } catch {}
});

document.addEventListener("resize", () => {
    wordLengthChart.resize();
    firstLetterChart.resize();
});

/**
 * Загружает данные по персональной статистике и отображает их на графиках
 */
function loadPersonalStats() {
    const colorBlue = "#005998";
    const colorDarkBlue = "#003357";
    const colorLines = "#b4b4b4";

    body("get_personal_stats/").then(data => {

        wordLengthChart = echarts.init(byId("chart-word-length"));
        wordLengthChart.setOption({
            title: {
                text: "Распределение количества отгаданных",
                subtext: "слов по длине слова",
                textStyle: {
                    color: colorDarkBlue,
                    fontSize: 18,
                    fontWeight: "lighter"
                },
                subtextStyle: {
                    color: colorDarkBlue,
                    fontSize: 18,
                    fontWeight: "lighter"
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
                            color: colorLines
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

        firstLetterChart = echarts.init(byId("chart-first-letter"));
        firstLetterChart.setOption({
            title: {
                text: "Распределение количества отгаданных",
                subtext: "слов по первой букве",
                textStyle: {
                    color: colorDarkBlue,
                    fontSize: 18,
                    fontWeight: "lighter"
                },
                subtextStyle: {
                    color: colorDarkBlue,
                    fontSize: 18,
                    fontWeight: "lighter"
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
                        color: colorLines
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
    body("get_popular_words/").then(data => {
        const tbody = byId('popular-words');
        data.forEach(word => {
            const row = document.createElement("div");
            row.classList.add("table__row");

            const cellWord = document.createElement("div");
            cellWord.classList.add("table__cell", "table__word");
            cellWord.innerText = word.word;

            const cellCount = document.createElement("div");
            cellCount.classList.add("table__cell", "table__count");
            cellCount.innerText = word.count;

            row.appendChild(cellWord);
            row.appendChild(cellCount);

            tbody.appendChild(row);
        });
    });
}
