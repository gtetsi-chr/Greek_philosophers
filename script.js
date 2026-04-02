async function initGraph() {
    try {
        const response = await fetch('data.csv');
        const dataText = await response.text();
        const lines = dataText.split('\n');
        
        const elements = [];
        const existingNodeIds = new Set();

        // Βοηθητική συνάρτηση: Μετατρέπει το "400 π.Χ." σε -400 και το "50 μ.Χ." σε 50
        function parseYear(dateStr) {
            if (!dateStr) return 0;
            let year = parseInt(dateStr.replace(/[^0-9]/g, ''));
            if (dateStr.includes('π.Χ.')) return -year;
            return year;
        }

        // 1. Δημιουργία Κόμβων
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(';');
            
            const id = cols[0].trim();
            const name = cols[1].trim();
            const birthStr = cols[2] ? cols[2].trim() : "";
            const birthYear = parseYear(birthStr);

            elements.push({
                group: 'nodes',
                data: { 
                    id: id, 
                    label: name + '\n' + birthStr,
                    year: birthYear 
                },
                // Υπολογίζουμε τη θέση Y: το 2000 π.Χ. είναι στην κορυφή (0)
                // Κάθε έτος ισούται με 2 pixels απόσταση
                position: { x: 500, y: (birthYear + 2000) * 2 }
            });
            existingNodeIds.add(id);
        }

        // 2. Δημιουργία Συνδέσεων
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(';');
            const sourceId = cols[0].trim();
            const relType = cols[12]?.trim();
            const targetId = cols[13]?.trim();

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

        // 3. Σχεδίαση
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
                        'text-halign': 'right', // Το όνομα στα δεξιά του κόμβου
                        'color': '#333',
                        'font-size': '12px',
                        'width': '15px',
                        'height': '15px',
                        'shape': 'ellipse'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 1.5,
                        'line-color': '#95a5a6',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'opacity': 0.6
                    }
                }
            ],
            layout: { 
                name: 'preset' // ΣΗΜΑΝΤΙΚΟ: Χρησιμοποιεί τις θέσεις X,Y που δώσαμε εμείς
            }
        });

    } catch (error) {
        console.error('Σφάλμα:', error);
    }
}
initGraph();
