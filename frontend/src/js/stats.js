import { Chart, BarController, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { byId, body } from './shared/utils';

/** @type {TabPane} */
let personStatsTab;

class TabPane {
    /**
     * Инициализирует tab pane
     * @param {string} id id таб пейна
     */
    constructor(id) {
        this.classTabSelected = 'tab-pane__tab_selected';
        this.classTab = 'tab-pane__tab';
        this.classContent = 'tab-pane__content';

        this.pane = byId(id);

        if (!this.pane) throw `Не удалось создать tab-панель: элемент с id "${id}" не найден`;

        /** @type {HTMLDivElement[]} */
        this.tabs = Array.from(this.pane.getElementsByClassName(this.classTab));

        /** @type {HTMLDivElement[]} */
        this.contents = Array.from(this.pane.getElementsByClassName(this.classContent));

        this.hideAll();

        if (this.tabs.length === 0) throw 'Отсутствуют табы';
        if (this.contents.length === 0) throw 'Отсутствует содержимое';

        for (let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].addEventListener('click', () => {
                this.select(i);
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
    Chart.register(BarController, CategoryScale, LinearScale, BarElement);

    try {
        personStatsTab = new TabPane('tab-person-stats');
        loadPersonalStats();
        loadPopularWords();
    } catch {}
});

/**
 * Загружает данные по персональной статистике и отображает их на графиках
 */
function loadPersonalStats() {
    const colorBlue = '#005998';
    const colorDarkBlue = '#003357';
    const colorLines = '#b4b4b4';

    body('get_personal_stats/').then(data => {

        new Chart(byId('chart-word-length'), {
            type: 'bar',
            data: {
                labels: data['word_len_distrib'].names,
                datasets: [{
                    data: data['word_len_distrib'].vals,
                    backgroundColor: [ colorBlue ],
                    borderColor: [ colorLines ]
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        display: false,
                    }]
                }
            }
        });

        new Chart(byId('chart-first-letter'), {
            type: 'bar',
            data: {
                labels: data['first_letter'].names,
                datasets: [{
                    data: data['first_letter'].vals,
                    backgroundColor: [ colorBlue ],
                    borderColor: [ colorLines ]
                }]
            },
            options: {
                indexAxis: 'y'
            }
        });

        personStatsTab.select(0);
    });
}

function loadPopularWords() {
    body('get_popular_words/').then(data => {
        const tbody = byId('popular-words');
        data.forEach(word => {
            const row = document.createElement('div');
            row.classList.add('table__row');

            const cellWord = document.createElement('div');
            cellWord.classList.add('table__cell', 'table__word');
            cellWord.innerText = word.word;

            const cellCount = document.createElement('div');
            cellCount.classList.add('table__cell', 'table__count');
            cellCount.innerText = word.count;

            row.appendChild(cellWord);
            row.appendChild(cellCount);

            tbody.appendChild(row);
        });
    });
}
