const DATAS_URL = "https://raw.githubusercontent.com/pablocamposf/datainfovis/main/players_stats.csv";
const SVG1 = d3.select("#vis-1").append("svg");

const WIDTH_VIS_1 = 800;
const HEIGHT_VIS_1 = 250;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);

createBubbleChart();

function createBubbleChart() {
    d3.csv(DATAS_URL, d3.autoType).then(series => {
        // Filter data for players appearing at least twice
        const filteredData = series.filter(d => {
            const playerCounts = {}; // Object to store player counts
            series.forEach(item => { // Loop through all data
              if (playerCounts[item.player]) { // Check if player exists in object
                playerCounts[item.player]++; // Increment count
              } else {
                playerCounts[item.player] = 1; // Initialize count for new player
              }
            });
            return playerCounts[d.player] >= 2; // Check if count for current player is >= 2
          });
    
        const rScale = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => d.points))
        .range([5, 40]);
  
        const colorScale = d3.scaleOrdinal()
            .domain(d3.map(filteredData, d => d.team))
            .range(d3.schemeCategory10);
    
        if (series.length > 0) {
            console.log()               //probar para ver como pasan los datos
        
        // Create bubble chart elements
        const data_players = SVG1.selectAll(".serie")
            .data(filteredData)
            .enter()
            .append("g")
            .attr("class", "serie")
            //.attr("transform", (d, i) => `translate(${i * 260}, 0)`);
    
        data_players
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", d => rScale(d.points))
            .attr("fill", d => colorScale(d.team));
    
        // Add labels for player names (optional)
        data_players
            .append("text")
            .attr("x", 0)
            .attr("y", -20)
            .text(d => d.player)
            .style("text-anchor", "middle")
            .style("font-size", 10);
        } else {
            console.log("No data loaded");
            // Optionally display a message in the HTML
        }
    });
}

// Constants for the second visualization
const DATAS2_URL = "https://raw.githubusercontent.com/pablocamposf/ProyectoInfovis/comparacion/champions_stats.csv";
const SVG2 = d3.select("#vis-2").append("svg");
const WIDTH_VIS_2 = 900;
const HEIGHT_VIS_2 = 500;
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);

const margin = {top: 20, right: 30, bottom: 200, left: 40}; // Increase bottom margin for text
const width = WIDTH_VIS_2 - margin.left - margin.right;
const height = HEIGHT_VIS_2 - margin.top - margin.bottom;

const xScale = d3.scaleBand().range([0, width]).padding(0.1);
const yScale = d3.scaleLinear().range([height, 0]);

const g = SVG2.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Scale for seasons color
const seasonColorScale = d3.scaleOrdinal()
    .domain(d3.range(1, 13)) // Assuming seasons 1 to 12
    .range(d3.schemeCategory10);

function createScatterPlot(role) {
    d3.csv(DATAS2_URL, d3.autoType).then(data => {
        // Use kill_death_assist_ratio directly
        data.forEach(d => {
            d.kda = d.kill_death_assist_ratio;
        });

        // Filter data based on the selected role
        const filteredData = role === "all" ? data : data.filter(d => d.rol === role);

        // Update scales
        xScale.domain(filteredData.map(d => `${d.season} ${d.player} ${d.team}`));
        yScale.domain([0, d3.max(filteredData, d => d.kda)]);

        // Remove previous elements
        g.selectAll("*").remove();

        // Add x-axis
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

        // Add y-axis
        g.append("g")
            .call(d3.axisLeft(yScale));

        // Add x-axis label
        g.append("text")
            .attr("transform", `translate(${width / 2},${height + margin.bottom - 80})`)
            .style("text-anchor", "middle")
            .text("Jugador Campeón");

        // Add y-axis label
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("KDA");

        // Add dots
        g.selectAll(".dot")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(`${d.season} ${d.player} ${d.team}`) + xScale.bandwidth() / 2)
            .attr("cy", d => yScale(d.kda))
            .attr("r", 5)
            .style("fill", d => seasonColorScale(d.season))
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`KDA: ${d.kda}`)
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

// Initial rendering of scatter plot with all roles
createScatterPlot("all");

// Add event listener to the role selector
d3.select("#role-select").on("change", function() {
    const selectedRole = d3.select(this).property("value");
    createScatterPlot(selectedRole);
});
