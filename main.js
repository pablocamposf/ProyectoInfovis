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
            console.log(item.player)
        
        // Create bubble chart elements
        const data_players = SVG1.selectAll(".serie")
            .data(filteredData)
            .enter()
            .append("g")
            .attr("class", "serie")
            .attr("transform", (d, i) => `translate(${i * 260}, 0)`);
    
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


