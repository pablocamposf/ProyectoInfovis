const DATAS_URL = "https://raw.githubusercontent.com/pablocamposf/datainfovis/main/players_stats.csv";
const SVG1 = d3.select("#vis-1").append("svg");

const WIDTH_VIS_1 = 800;
const HEIGHT_VIS_1 = 600;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);

// Inicializar el valor mínimo del slider
let minCount = 2;
let allData = [];

createBubbleChart();

// Agregar evento al slider
d3.select("#countSlider").on("input", function() {
    minCount = +this.value;
    d3.select("#countValue").text(minCount);
    updateBubbleChart();
});

function createBubbleChart() {
    d3.csv(DATAS_URL, d3.autoType).then(series => {
        const playerCounts = {};
        allData = series;

        // Agrupar y seleccionar el primer nombre de cada jugador
        series.forEach(item => {
            if (typeof item.player === 'string') {
                const playerName = item.player.toLowerCase();
                const season = item.season;

                if (!playerCounts[playerName]) {
                    playerCounts[playerName] = { count: 0, originalName: item.player, seasons: new Set() };
                }

                if (!playerCounts[playerName].seasons.has(season)) {
                    playerCounts[playerName].seasons.add(season);
                    playerCounts[playerName].count += 1;
                }
            }
        });

        const countData = Object.keys(playerCounts).map(player => ({
            player: playerCounts[player].originalName,
            count: playerCounts[player].count
        }));

        updateVisualization(countData);
    }).catch(error => {
        console.error('Error loading the CSV data', error);
    });
}

function updateBubbleChart() {
    d3.csv(DATAS_URL, d3.autoType).then(series => {
        const playerCounts = {};
        allData = series;

        // Agrupar y seleccionar el primer nombre de cada jugador
        series.forEach(item => {
            if (typeof item.player === 'string') {
                const playerName = item.player.toLowerCase();
                const season = item.season;

                if (!playerCounts[playerName]) {
                    playerCounts[playerName] = { count: 0, originalName: item.player, seasons: new Set() };
                }

                if (!playerCounts[playerName].seasons.has(season)) {
                    playerCounts[playerName].seasons.add(season);
                    playerCounts[playerName].count += 1;
                }
            }
        });

        const countData = Object.keys(playerCounts).map(player => ({
            player: playerCounts[player].originalName,
            count: playerCounts[player].count
        }));

        updateVisualization(countData);
    }).catch(error => {
        console.error('Error loading the CSV data', error);
    });
}

function updateVisualization(countData) {
    const filteredData = countData.filter(d => d.count >= minCount);

    const rScale = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => d.count))
        .range([10, 40]);

    const colorScale = d3.scaleOrdinal()
        .domain(filteredData.map(d => d.player))
        .range(d3.schemeCategory10);

    // Limpiar elementos existentes
    SVG1.selectAll("*").remove();

    // Crear grupo de zoom
    const zoomGroup = SVG1.call(d3.zoom()
        .scaleExtent([0.85, 4]) // Limites de zoom (mínimo 0.85x y máximo 4x)
        .translateExtent([[-75, -100], [WIDTH_VIS_1 + 75, HEIGHT_VIS_1 + 100]])
        .on("zoom", (event) => {
            zoomGroup.attr("transform", event.transform);
        })).append("g");

    // Crear una simulación de fuerza para agrupar las burbujas
    const simulation = d3.forceSimulation(filteredData)
        .force("center", d3.forceCenter(WIDTH_VIS_1 / 2, HEIGHT_VIS_1 / 2))
        .force("charge", d3.forceManyBody().strength(5))
        .force("collision", d3.forceCollide().radius(d => rScale(d.count) + 2))
        .on("tick", ticked);

    // Crear elementos del gráfico de burbujas
    const dataPlayers = zoomGroup.selectAll(".serie")
        .data(filteredData, d => d.player)
        .enter()
        .append("g")
        .attr("class", "serie")
        .on("click", function(event, d) {
            onBubbleClick(d);
        });

    dataPlayers
        .append("circle")
        .attr("r", d => rScale(d.count))
        .attr("fill", "white")
        .attr("stroke", d => colorScale(d.player))
        .attr("stroke-width", 2)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", d => d3.color(colorScale(d.player)).brighter(1));
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", "white");
        });

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
}

function onBubbleClick(d) {
    const playerName = d.player;
    const playerData = allData.filter(item => item.player === playerName);
    console.log("Bubble clicked with data: ", playerData);
    createRingChart(playerName, playerData);
}

// VISUALIZACION 2
const SVG2 = d3.select("#vis-2").append("svg");

const WIDTH_VIS_2 = 800;
const HEIGHT_VIS_2 = 400;

SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);

function createRingChart(playerName, playerData) {
    SVG2.selectAll("*").remove();  // Limpiar el SVG para nueva visualización

    // Agregar nombre del jugador en el centro arriba
    SVG2.append("text")
        .attr("x", WIDTH_VIS_2 / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text(playerName);

    // Crear contenedor para la información de la izquierda
    const infoGroup = SVG2.append("g")
        .attr("transform", "translate(50, 50)");

    // Mostrar datos de season, event, team a la izquierda
    playerData.forEach((d, i) => {
        infoGroup.append("text")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("font-size", "12px")
            .text(`Season: ${d.season}, Event: ${d.event}, Team: ${d.team}`);
    });

    // Crear datos para el gráfico de anillos
    const ringData = [
        { label: "Wins", value: d3.sum(playerData, d => d.wins) },
        { label: "Loses", value: d3.sum(playerData, d => d.loses) },
        { label: "Kills", value: d3.sum(playerData, d => d.kills) },
        { label: "Kill Participation", value: d3.sum(playerData, d => d.kill_participation) },
        { label: "Gold/min", value: d3.sum(playerData, d => d.gold_min) },
        { label: "Damage/min", value: d3.sum(playerData, d => d.damage_min) }
    ];

    const radius = Math.min(WIDTH_VIS_2, HEIGHT_VIS_2) / 4;
    const arc = d3.arc().innerRadius(radius - 50).outerRadius(radius);
    const pie = d3.pie().value(d => d.value);

    const ringGroup = SVG2.append("g")
        .attr("transform", `translate(${WIDTH_VIS_2 / 2 + 200}, ${HEIGHT_VIS_2 / 2})`);

    const arcs = ringGroup.selectAll(".arc")
        .data(pie(ringData))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => d3.schemeCategory10[i]);

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(d => d.data.label);
}
