// Ενεργοποίηση των απαραίτητων πρόσθετων
cytoscape.use(cytoscapeCola);

async function initGraph() {
    try {
        const response = await fetch('data.csv');
        const dataText = await response.text();
        const lines = dataText.split('\n');
        
        const nodes = [];
        const edges = [];
        const constraints = []; // Περιορισμοί για να μένουν οι παλιοί πάνω
        const existingNodeIds = new Set();

        function parseYear(dateStr) {
            if (!dateStr) return 0;
            let year = parseInt(dateStr.replace(/[^0-9]/g, ''));
            if (dateStr.includes('π.Χ.')) return -year;
            return year;
        }

        // 1. Δημιουργία Κόμβων
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.split(';').length < 2) continue;
            
            const cols = line.split(';');
            const id = cols[0].trim();
            const name = cols[1].trim();
            const birthStr = cols[2] ? cols[2].trim() : "";
            const birthYear = parseYear(birthStr);

            nodes.push({
                data: { id: id, label: name + '\n' + birthStr, year: birthYear }
            });
            existingNodeIds.add(id);
        }

        // 2. Δημιουργία Συνδέσεων
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(';');
            const sourceId = cols[0].trim();
            const relType = cols[12]?.trim() || "";
            const targetId = cols[13]?.trim() || "";

            if (targetId && targetId !== "-" && existingNodeIds.has(sourceId) && existingNodeIds.has(targetId)) {
                const s = relType.includes("Μαθητής") ? targetId : sourceId;
                const t = relType.includes("Μαθητής") ? sourceId : targetId;

                edges.push({ data: { source: s, target: t, label: relType } });

                // Προσθήκη περιορισμού: Ο δάσκαλος (source) ΠΡΕΠΕΙ να είναι πιο πάνω από τον μαθητή (target)
                constraints.push({ axis: 'y', left: s, right: t, gap: 100 });
            }
        }

        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: { nodes: nodes, edges: edges },
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
                        'font-size': '11px',
                        'width': '120px',
                        'height': '50px',
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
                        'curve-style': 'bezier', // Καμπύλες για να φαίνονται οι παράλληλες συνδέσεις
                        'control-point-step-size': 40,
                        'label': 'data(label)',
                        'font-size': '9px',
                        'color': '#7f8c8d',
                        'text-background-opacity': 1,
                        'text-background-color': '#ffffff'
                    }
                }
            ],
            layout: {
                name: 'cola',
                animate: true,
                refresh: 1,
                maxSimulationTime: 4000,
                ungrabifyWhileSimulating: false,
                fit: true,
                padding: 50,
                nodeSpacing: 40, // Ελάχιστη απόσταση μεταξύ κόμβων (για να μη συμπίπτουν)
                flow: { axis: 'y', minSeparation: 150 }, // Επιβολή ροής από πάνω προς τα κάτω
                alignment: { y: [] }, // Θα μπορούσαμε να ευθυγραμμίσουμε ανά έτος εδώ
                gapInequalities: constraints // Χρήση των περιορισμών δασκάλου-μαθητή
            }
        });

    } catch (error) {
        console.error('Σφάλμα:', error);
    }
}
initGraph();
