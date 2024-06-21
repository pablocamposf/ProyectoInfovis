const DATAS_URL = "https://api.kaggle.com/v1/datasets/pedrocsar/league-of-legends-worlds-20112022-stats/download/players_stats.csv?token=3a81b96e1dad45c51846f55ba0dab858";
const SVG1 = d3.select("#vis-1").append("svg");

const WIDTH_VIS_1 = 800;
const HEIGHT_VIS_1 = 250;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);


createBubbleChart();

function createBubbleChart() {
    d3.csv(DATAS_URL, d3.autoType).then(series => {
        const data_players = SVG1.selectAll(".serie")
            .data(series)
            .enter()
            .append("g")
            .attr("class", "serie")
            .attr("transform", (d, i) => `translate(${i * 260}, 0)`);
            
        const width = 900;
        const height = 600;

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const bubble = d3.pack()
            .size([width, height])
            .padding(1.5);

        const nodes = d3.hierarchy({ children: data })
            .sum(d => d.count);

        const node = svg.selectAll(".node")
            .data(bubble(nodes).leaves())
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        node.append("circle")
            .attr("class", "bubble")
            .attr("r", d => d.r)
            .style("fill", d => d3.interpolateViridis(d.data.count / d3.max(data, d => d.count)));

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(d => d.data.player.substring(0, d.r / 3));

        node.append("title")
            .text(d => `${d.data.player}: ${d.data.count}`);

    });
}


