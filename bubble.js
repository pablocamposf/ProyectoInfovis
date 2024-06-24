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
    console.log("data: ", playerData);
    createSeasonDropdown(playerName, playerData);
}

// VISUALIZACION 2
const SVG2 = d3.select("#vis-2").append("svg");

const WIDTH_VIS_2 = 800;
const HEIGHT_VIS_2 = 400;

SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);

function createSeasonDropdown(playerName, playerData) {
    // Limpiar y crear opciones en el menú desplegable
    const dropdown = d3.select("#seasonDropdown").html("");

    const seasons = [...new Set(playerData.map(d => d.season))];

    dropdown.selectAll("option")
        .data(seasons)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => `Season ${d}`);

    // Evento de cambio del menú desplegable
    dropdown.on("change", function() {
        const selectedSeason = parseInt(this.value);
        const seasonData = playerData.filter(d => d.season === selectedSeason);
        createRingChart(playerName, seasonData);
    });

    // Llamar a createRingChart con la primera temporada por defecto
    if (seasons.length > 0) {
        const initialSeason = seasons[0];
        dropdown.property("value", initialSeason);
        const initialSeasonData = playerData.filter(d => d.season === initialSeason);
        createRingChart(playerName, initialSeasonData);
    }
}

function createRingChart(playerName, playerData) {
    if (playerData.length === 0) return;

    SVG2.selectAll("*").remove();

    const radius = Math.min(WIDTH_VIS_2, HEIGHT_VIS_2) / 2 - 50;
    const g = SVG2.append("g")
        .attr("transform", `translate(${WIDTH_VIS_2 / 2 - 100}, ${HEIGHT_VIS_2 / 2})`);

    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);
    const pie = d3.pie().value(d => d.value);

    // Datos para el gráfico de anillo
    const ringData = getRingData(playerData[0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Crear un tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("border", "1px solid #ddd")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.1)")
        .text("");

    const path = g.selectAll("path")
        .data(pie(ringData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label))
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", d3.color(color(d.data.label)).brighter(1));
            tooltip.text(`${d.data.label}: ${d.data.value}`)
                .style("visibility", "visible");
        })
        .on("mousemove", function (event) {
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", color(d.data.label));  // Restaurar el color original
            tooltip.style("visibility", "hidden");
        });

    g.selectAll("text")
        .data(pie(ringData))
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(d => d.data.label);

    // Mostrar el nombre del jugador
    SVG2.append("text")
        .attr("x", WIDTH_VIS_2 / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text(playerName);

    // Mostrar la información de temporada, evento y equipo a la izquierda
    const infoGroup = SVG2.append("g")
    .attr("transform", `translate(20, 40)`);

    // Reemplazar "_" por " " en playerData[0].team
    const teamName = playerData[0].team.replace(/_/g, " ");

    infoGroup.append("text")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(`Temporada: ${playerData[0].season}`);

    infoGroup.append("text")
        .attr("font-size", "14px")
        .attr("dy", "1.2em")
        .text(`Evento: ${playerData[0].event}`);

    infoGroup.append("text")
        .attr("font-size", "14px")
        .attr("dy", "2.4em")
        .text(`Equipo: ${teamName}`);

    // Crear tarjetas para otras estadísticas
    const cardData = getCardData(playerData[0]);

    const cardWidth = 100;
    const cardHeight = 80;
    const cardSpacing = 20;
    const startX = WIDTH_VIS_2 / 2 + 150;
    const startY = HEIGHT_VIS_2 / 2 - 100; // Ajustar la posición inicial para distribuir en una cuadrícula 2x2

    const cards = SVG2.selectAll(".card")
        .data(cardData)
        .enter()
        .append("g")
        .attr("class", "card")
        .attr("transform", (d, i) => {
            const x = startX + (i % 2) * (cardWidth + cardSpacing); // Distribuir en 2 columnas
            const y = startY + Math.floor(i / 2) * (cardHeight + cardSpacing); // Distribuir en 2 filas
            return `translate(${x}, ${y})`;
        });

    cards.append("rect")
        .attr("width", cardWidth)
        .attr("height", cardHeight)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", "#f0f0f0")
        .attr("stroke", "#d0d0d0");

    cards.append("text")
        .attr("x", cardWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(d => d.label);

    cards.append("text")
        .attr("x", cardWidth / 2)
        .attr("y", cardHeight / 2 + 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text(d => d.value);

    // Verificar si hay más de un evento para el mismo jugador y temporada
    const uniqueEvents = [...new Set(playerData.map(d => d.event))];
    if (uniqueEvents.length > 1) {
        const buttonGroup = SVG2.append("g")
            .attr("transform", `translate(${WIDTH_VIS_2 - 100}, 20)`);

        uniqueEvents.forEach((event, index) => {
            buttonGroup.append("rect")
                .attr("x", 0)
                .attr("y", index * 30)
                .attr("width", 80)
                .attr("height", 25)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("fill", "#007bff")
                .attr("stroke", "#0056b3")
                .attr("class", "event-button")
                .style("cursor", "pointer")
                .on("click", () => updateChart(event));

            buttonGroup.append("text")
                .attr("x", 40)
                .attr("y", index * 30 + 17)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("fill", "#fff")
                .style("pointer-events", "none")
                .text(event);
        });
    }

    function updateChart(selectedEvent) {
        const filteredData = playerData.filter(d => d.event === selectedEvent);
        updateRingChart(filteredData[0]);
        updateCardData(filteredData[0]);
        updateInfo(filteredData[0]);
    }

    function updateRingChart(data) {
        const newRingData = getRingData(data);
        const path = g.selectAll("path").data(pie(newRingData));
        path.enter().append("path")
            .merge(path)
            .attr("d", arc)
            .attr("fill", d => color(d.data.label));
        path.exit().remove();

        const texts = g.selectAll("text").data(pie(newRingData));
        texts.enter().append("text")
            .merge(texts)
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .text(d => d.data.label);
        texts.exit().remove();
    }

    function updateCardData(data) {
        const newCardData = getCardData(data);
        const cards = SVG2.selectAll(".card").data(newCardData);
        cards.select("text:nth-child(2)").text(d => d.label);
        cards.select("text:nth-child(3)").text(d => d.value);
    }

    function updateInfo(data) {
        infoGroup.select("text:nth-child(2)").text(`Evento: ${data.event}`);
        infoGroup.select("text:nth-child(3)").text(`Equipo: ${data.team}`);
    }

    function getRingData(data) {
        const ringData = [];
        if (data.wins !== 0) {
            ringData.push({ label: "Wins", value: data.wins });
        }
        if (data.loses !== 0) {
            ringData.push({ label: "Loses", value: data.loses });
        }
        return ringData;
    }

    function getCardData(data) {
        const cardData = [
            { label: "KDA", value: data.kill_death_assist_ratio },
            { label: "Gold/min", value: data["gold/min"] }
        ];
        if (data.kill_participation !== null) {
            cardData.push({ label: "Kill Participation", value: data.kill_participation });
        }
        if (data["damage/min"] !== null) {
            cardData.push({ label: "Damage/min", value: data["damage/min"] });
        }
        return cardData;
    }
}

