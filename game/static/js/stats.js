// "use strict";

let
    tabPersonStats,
    chartWordLength,
    chartFirstLetter;

$(document).ready(() => {
    tabPersonStats = new TabPane("tab-person-stats");
    loadPersonalStats();
});

$(document).resize(() => {
    chartWordLength.resize();
    chartFirstLetter.resize();
});

function loadPersonalStats() {
    const colorBlue = "#005998",
          colorDarkBlue = "#003357",
          colorLightOrange = "#f6ba6d";

    $.get("get_personal_stats/").done(data => {

        chartWordLength = echarts.init(document.getElementById("chart-word-length"));
        chartWordLength.setOption({
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
        chartWordLength.resize();
        
        tabPersonStats.select(1);
        
        chartFirstLetter = echarts.init(document.getElementById("chart-first-letter"));
        chartFirstLetter.setOption({
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
                boundaryGap: [0, 0.01]
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
        chartFirstLetter.resize();

        tabPersonStats.select(0);
    });
}
