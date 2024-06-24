const DATAS2_URL = "https://raw.githubusercontent.com/pablocamposf/ProyectoInfovis/comparacion/champions_stats.csv";

const SVG3 = d3.select("#vis-3").append("svg");
const WIDTH_VIS_3 = 900;
const HEIGHT_VIS_3 = 500;
SVG3.attr("width", WIDTH_VIS_3).attr("height", HEIGHT_VIS_3);

const margin = {top: 20, right: 30, bottom: 200, left: 40};
const width = WIDTH_VIS_3 - margin.left - margin.right;
const height = HEIGHT_VIS_3 - margin.top - margin.bottom;

const xScale = d3.scaleBand().range([0, width]).padding(0.1);
const yScale = d3.scaleLinear().range([height, 0]);

const g = SVG3.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const seasonColorScale = d3.scaleOrdinal()
    .domain(d3.range(1, 13))
    .range(d3.schemeCategory10);

function createScatterPlot(role, stat) {
    d3.csv(DATAS2_URL, d3.autoType).then(data => {
        const filteredData = role === "all" ? data : data.filter(d => d.rol === role);

        xScale.domain(filteredData.map(d => `${d.season} ${d.player} ${d.team}`));
        yScale.domain([0, d3.max(filteredData, d => d[stat])]);

        g.selectAll("*").remove();

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start")
            .text(function(d) {
                const parts = d.split(" ");
                return `S${parts[0]} ${parts[1]}\n${parts[2]}`;
            });

        g.append("g")
            .call(d3.axisLeft(yScale));

        g.append("text")
            .attr("transform", `translate(${width / 2},${height + margin.bottom - 80})`)
            .style("text-anchor", "middle")
            .text("Jugador Campeón");

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(stat);

        g.selectAll(".dot")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(`${d.season} ${d.player} ${d.team}`) + xScale.bandwidth() / 2)
            .attr("cy", d => yScale(d[stat]))
            .attr("r", 5)
            .style("fill", d => seasonColorScale(d.season))
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${stat}: ${d[stat]}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });
}

createScatterPlot("all", "kill_death_assist_ratio");

function updateScatterPlot() {
    const selectedRole = d3.select("#role-select").property("value");
    const selectedStat = d3.select("#stat-select").property("value");
    createScatterPlot(selectedRole, selectedStat);
}

d3.select("#role-select").on("change", updateScatterPlot);
d3.select("#stat-select").on("change", updateScatterPlot);