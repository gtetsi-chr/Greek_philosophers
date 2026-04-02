/**
 * Η κύρια λειτουργία ξεκινά όταν φορτωθεί η σελίδα.
 * Χρησιμοποιούμε τη 'fetch' για να διαβάσουμε το αρχείο data.csv.
 */

// Καταχώρηση του πρόσθετου Dagre για να μπορούμε να φτιάξουμε ιεραρχικό δέντρο
cytoscape.use(cytoscapeDagre);

async function initGraph() {
    try {
        // 1. Φόρτωση του CSV αρχείου
        const response = await fetch('data.csv');
        const dataText = await response.text();

        // 2. Επεξεργασία των γραμμών του CSV
        const lines = dataText.split('\n');
        const elements = { nodes: [], edges: [] };

        // Προσπερνάμε την πρώτη γραμμή (επικεφαλίδες)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Διαχωρισμός των πεδίων με βάση το ελληνικό ερωτηματικό
            const cols = line.split(';');

            // Αντιστοίχιση των πεδίων βάσει της δομής του αρχείου σου
            const id = cols[0];
            const name = cols[1];
            const birth = cols[2];
            const relType = cols[12]; // RelationType
            const personB = cols[13]; // PersonB_ID

            // Προσθήκη του Φιλοσόφου ως Κόμβου (Node)
            elements.nodes.push({
                data: { 
                    id: id, 
                    label: name + '\n(' + birth + ')' 
                }
            });

            // Αν υπάρχει σύνδεση, προσθήκη της Γραμμής (Edge)
            if (personB && personB !== "" && personB !== "-") {
                let sourceId = id;
                let targetId = personB;

                // Αν η σχέση είναι "Μαθητής", αντιστρέφουμε τη φορά 
                // ώστε το βέλος να δείχνει πάντα από τον παλαιότερο στον νεότερο
                if (relType.includes("Μαθητής")) {
                    sourceId = personB;
                    targetId = id;
                }

                elements.edges.push({
                    data: { 
                        source: sourceId, 
                        target: targetId, 
                        label: relType 
                    }
                });
            }
        }

        // 3. Δημιουργία του γραφήματος με το Cytoscape
        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#3498db',
                        'label': 'data(label)',
                        'text-wrap': 'wrap',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': '#fff',
                        'font-size': '10px',
                        'width': '80px',
                        'height': '40px',
                        'shape': 'round-rectangle'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'label': 'data(label)',
                        'font-size': '8px'
                    }
                }
            ],
            layout: {
                name: 'dagre',
                rankDir: 'TB', // Top to Bottom (Πάνω προς Κάτω)
                nodeSep: 50,   // Απόσταση μεταξύ των κόμβων
                rankSep: 100   // Απόσταση μεταξύ των επιπέδων (χρονικά)
            }
        });

    } catch (error) {
        console.error('Σφάλμα κατά τη φόρτωση των δεδομένων:', error);
    }
}

// Εκκίνηση της διαδικασίας
initGraph();
