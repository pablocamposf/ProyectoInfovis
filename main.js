const DATAS_URL = "https://raw.githubusercontent.com/pablocamposf/datainfovis/main/players_stats.csv";
const SVG1 = d3.select("#vis-1").append("svg");

const WIDTH_VIS_1 = 800;
const HEIGHT_VIS_1 = 600; // Aumentamos la altura para el mapa de burbujas

const MIN_PAR = 2

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);

createBubbleChart();

function createBubbleChart() {
    d3.csv(DATAS_URL, d3.autoType).then(series => {
        // Contar las apariciones de cada jugador independientemente de mayúsculas o minúsculas
        const playerCounts = series.reduce((acc, item) => {
            if (typeof item.player === 'string') {
                const playerName = item.player.toLowerCase(); // Convertir a minúsculas
                if (!acc[playerName]) {
                    acc[playerName] = { count: 0, originalNames: [] };
                }
                acc[playerName].count += 1;
                if (!acc[playerName].originalNames.includes(item.player)) {
                    acc[playerName].originalNames.push(item.player);
                }
            }
            return acc;
        }, {});

        // Convertir el objeto playerCounts a un array de objetos
        const countData = Object.keys(playerCounts).map(player => ({
            player: playerCounts[player].originalNames.join('/'),
            count: playerCounts[player].count
        }));

        const filteredData = countData.filter(d => d.count >= MIN_PAR);

        const rScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.count))
            .range([5, 40]);

        const colorScale = d3.scaleOrdinal()
            .domain(filteredData.map(d => d.player))
            .range(d3.schemeCategory10);

        if (filteredData.length > 0) {
            // Crear una simulación de fuerza para agrupar las burbujas
            const simulation = d3.forceSimulation(filteredData)
                .force("center", d3.forceCenter(WIDTH_VIS_1 / 2, HEIGHT_VIS_1 / 2))
                .force("charge", d3.forceManyBody().strength(5))
                .force("collision", d3.forceCollide().radius(d => rScale(d.count) + 2))
                .on("tick", ticked);

            // Crear elementos del gráfico de burbujas
            const dataPlayers = SVG1.selectAll(".serie")
                .data(filteredData)
                .enter()
                .append("g")
                .attr("class", "serie");

            dataPlayers
                .append("circle")
                .attr("r", d => rScale(d.count))
                .attr("fill", d => colorScale(d.player));

            // Agregar etiquetas para los nombres de los jugadores (opcional)
            dataPlayers
                .append("text")
                .attr("dy", ".3em")
                .style("text-anchor", "middle")
                .style("font-size", 10)
                .text(d => d.player);

            function ticked() {
                dataPlayers
                    .attr("transform", d => `translate(${d.x}, ${d.y})`);
            }
        } else {
            console.log("No data loaded");
            // Opcionalmente mostrar un mensaje en el HTML
        }
    }).catch(error => {
        console.error('Error loading the CSV data', error);
    });
}
