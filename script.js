cytoscape.use(cytoscapeDagre);

async function initGraph() {
    try {
        const response = await fetch('data.csv');
        const dataText = await response.text();
        const lines = dataText.split('\n');
        
        const elements = [];
        const existingNodeIds = new Set();
        const yearGroups = {}; // Για να μετράμε πόσοι είναι στην ίδια χρονιά

        function parseYear(dateStr) {
            if (!dateStr) return 0;
            let year = parseInt(dateStr.replace(/[^0-9]/g, ''));
            if (dateStr.includes('π.Χ.')) return -year;
            return year;
        }

        // --- 1. Δημιουργία Χρονικού Άξονα (Χάρακας αριστερά) ---
        for (let y = -700; y <= 500; y += 100) {
            elements.push({
                group: 'nodes',
                data: { id: 'year-' + y, label: (y < 0 ? Math.abs(y) + ' π.Χ.' : y + ' μ.Χ.') },
                position: { x: 50, y: (y + 1000) * 5 },
                classes: 'timeline-mark',
                selectable: false
            });
        }

        // --- 2. Επεξεργασία Φιλοσόφων ---
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(';');
            if (cols.length < 2) continue;

            const id = cols[0].trim();
            const name = cols[1].trim();
            const birthStr = cols[2] ? cols[2].trim() : "";
            const birthYear = parseYear(birthStr);

            // Υπολογισμός οριζόντιας θέσης για να μην συμπίπτουν
            if (!yearGroups[birthYear]) yearGroups[birthYear] = 0;
            yearGroups[birthYear]++;
            
            // Το X αυξάνεται όσο υπάρχουν περισσότεροι στην ίδια χρονιά
            const offsetX = 200 + (yearGroups[birthYear] * 150); 
            const offsetY = (birthYear + 1000) * 5;

            elements.push({
                group: 'nodes',
                data: { id: id, label: name + '\n(' + birthStr + ')', year: birthYear },
                position: { x: offsetX, y: offsetY }
            });
            existingNodeIds.add(id);
        }

        // --- 3. Συνδέσεις ---
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(';');
            const sourceId = cols[0].trim();
            const relType = cols[12]?.trim() || "";
            const targetId = cols[13]?.trim() || "";

            if (targetId && targetId !== "-" && existingNodeIds.has(sourceId) && existingNodeIds.has(targetId)) {
                elements.push({
                    group: 'edges',
                    data: { 
                        source: relType.includes("Μαθητής") ? targetId : sourceId, 
                        target: relType.includes("Μαθητής") ? sourceId : targetId, 
                        label: relType 
                    }
                });
            }
        }

        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#2c3e50',
                        'label': 'data(label)',
                        'text-wrap': 'wrap',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': '#fff',
                        'font-size': '10px',
                        'width': '100px',
                        'height': '45px',
                        'shape': 'round-rectangle'
                    }
                },
                {
                    selector: '.timeline-mark',
                    style: {
                        'background-color': '#e74c3c',
                        'width': '60px',
                        'shape': 'rectangle',
                        'font-weight': 'bold',
                        'font-size': '12px'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#bdc3c7',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'taxi',
                        'taxi-direction': 'vertical'
                    }
                }
            ],
            layout: { name: 'preset' }
        });

        // Αυτόματη εστίαση στα δεδομένα
        cy.fit();
        cy.zoom(0.8); // Ελαφρύ zoom out για να βλέπουμε το περιθώριο

    } catch (error) {
        console.error('Σφάλμα:', error);
    }
}
initGraph();
