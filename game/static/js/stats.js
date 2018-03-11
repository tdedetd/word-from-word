// "use strict";

let chartWordLength;

$(document).ready(() => {
    const tabPersonStats = new TabPane("tab-person-stats");
    loadPersonalStats();
});

$(document).resize(() => {
    chartWordLength.resize();
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
    });
}
