// Χρησιμοποιούμε το Dagre για την ιεραρχική στοίχιση
cytoscape.use(cytoscapeDagre);

async function initGraph() {
    try {
        const response = await fetch('data.csv');
        const dataText = await response.text();
        const lines = dataText.split('\n');
        
        const nodes = [];
        const edges = [];
        const existingNodeIds = new Set();

        // 1ο Πέρασμα: Κόμβοι
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(';');
            if (cols.length < 2) continue;

            const id = cols[0].trim();
            const name = cols[1].trim();
            const birth = cols[2] ? cols[2].trim() : "";

            nodes.push({
                data: { id: id, label: name + '\n' + birth }
            });
            existingNodeIds.add(id);
        }

        // 2ο Πέρασμα: Συνδέσεις
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(';');
            const sourceId = cols[0].trim();
            const relType = cols[12] ? cols[12].trim() : "";
            const targetId = cols[13] ? cols[13].trim() : "";

            if (targetId && targetId !== "-" && existingNodeIds.has(sourceId) && existingNodeIds.has(targetId)) {
                let s = sourceId;
                let t = targetId;
                
                // ΠΑΝΤΑ από τον μικρότερο κωδικό (παλιό) στον μεγαλύτερο (νέο) 
                // ή βάσει του RelationType για να διατηρηθεί η κάθετη ροή
                if (relType.includes("Μαθητής")) {
                    s = targetId; t = sourceId;
                }

                edges.push({
                    data: { source: s, target: t, label: relType }
                });
            }
        }

        // 3ο Βήμα: Ρύθμιση Γραφήματος
        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: { nodes: nodes, edges: edges },
            
            // Ρυθμίσεις αλληλεπίδρασης
            zoomingEnabled: true,
            userZoomingEnabled: true,
            panningEnabled: true,
            userPanningEnabled: true,
            wheelSensitivity: 0.2, // Μαλακό ζουμ με τη ροδέλα

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
                        'width': '120px',
                        'height': '60px',
                        'shape': 'round-rectangle',
                        'padding': '10px'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 3,
                        'line-color': '#bdc3c7',
                        'target-arrow-color': '#bdc3c7',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'taxi', // Κάνει τις γραμμές πιο "ορθογώνιες" σαν οργανόγραμμα
                        'taxi-direction': 'vertical',
                        'label': 'data(label)',
                        'font-size': '10px',
                        'edge-text-rotation': 'autorotate'
                    }
                }
            ],
            layout: {
                name: 'dagre',
                rankDir: 'TB',    // ΑΥΣΤΗΡΑ Top to Bottom
                nodeSep: 80,      // Περισσότερο πλάτος ανάμεσα στους φιλοσόφους
                rankSep: 200,     // Πολύ μεγαλύτερο κενό ανάμεσα στις εποχές (κάθετα)
                animate: true     // Ομαλή εμφάνιση
            }
        });

    } catch (error) {
        console.error('Σφάλμα:', error);
    }
}

initGraph();
