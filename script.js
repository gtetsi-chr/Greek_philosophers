// Ενεργοποίηση του Dagre
cytoscape.use(cytoscapeDagre);

async function initGraph() {
    try {
        const response = await fetch('data.csv');
        const dataText = await response.text();
        const lines = dataText.split('\n');
        
        let rawNodes = [];
        const edges = [];
        const existingNodeIds = new Set();

        function parseYear(dateStr) {
            if (!dateStr) return 2000; // Αν δεν έχει ημερομηνία, το βάζουμε στο τέλος
            let year = parseInt(dateStr.replace(/[^0-9]/g, ''));
            if (dateStr.includes('π.Χ.')) return -year;
            return year;
        }

        // 1. Συλλογή Δεδομένων
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.split(';').length < 2) continue;
            
            const cols = line.split(';');
            const id = cols[0].trim();
            const name = cols[1].trim();
            const birthStr = cols[2] ? cols[2].trim() : "";
            const birthYear = parseYear(birthStr);

            rawNodes.push({
                data: { id: id, label: name + '\n(' + birthStr + ')', year: birthYear }
            });
            existingNodeIds.add(id);
        }

        // ΤΑΞΙΝΟΜΗΣΗ: Βάζουμε τους φιλοσόφους στη σειρά βάσει έτους γέννησης
        rawNodes.sort((a, b) => a.data.year - b.data.year);

        // 2. Δημιουργία Συνδέσεων
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(';');
            const sourceId = cols[0].trim();
            const relType = cols[12]?.trim() || "";
            const targetId = cols[13]?.trim() || "";

            if (targetId && targetId !== "-" && existingNodeIds.has(sourceId) && existingNodeIds.has(targetId)) {
                // Η ροή είναι ΠΑΝΤΑ από τον παλαιότερο (μικρότερο έτος) στον νεότερο
                // Ανεξάρτητα αν το CSV λέει "Δάσκαλος" ή "Μαθητής"
                let s = sourceId;
                let t = targetId;

                // Βρίσκουμε τα έτη για να σιγουρέψουμε τη φορά του βέλους (Πάνω -> Κάτω)
                const nodeA = rawNodes.find(n => n.data.id === s);
                const nodeB = rawNodes.find(n => n.data.id === t);
                
                if (nodeA && nodeB && nodeA.data.year > nodeB.data.year) {
                    s = targetId;
                    t = sourceId;
                }

                edges.push({
                    data: { source: s, target: t, label: relType }
                });
            }
        }

        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: { nodes: rawNodes, edges: edges },
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
                        'font-size': '12px',
                        'width': '140px',
                        'height': '60px',
                        'shape': 'round-rectangle',
                        'border-width': 2,
                        'border-color': '#34495e'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#bdc3c7',
                        'target-arrow-color': '#bdc3c7',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'taxi', // Ορθογώνιες γραμμές για να μη μπλέκονται
                        'taxi-direction': 'vertical',
                        'taxi-turn': '50px',
                        'edge-distances': 'node-position'
                    }
                }
            ],
            layout: {
                name: 'dagre',
                rankDir: 'TB',    // Top to Bottom
                nodeSep: 100,     // Μεγάλη οριζόντια απόσταση
                rankSep: 150,     // Μεγάλη κάθετη απόσταση (χρονικά επίπεδα)
                directed: true,
                padding: 50
            }
        });

        cy.fit();

    } catch (error) {
        console.error('Σφάλμα:', error);
    }
}
initGraph();
