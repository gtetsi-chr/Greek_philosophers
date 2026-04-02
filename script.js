/**
 * Διορθωμένη έκδοση: Δημιουργούμε πρώτα όλους τους κόμβους 
 * και μετά τις συνδέσεις για να αποφύγουμε το σφάλμα "nonexistant target".
 */

// Ενεργοποίηση του εργαλείου αυτόματης διάταξης (Dagre)
cytoscape.use(cytoscapeDagre);

async function initGraph() {
    try {
        // Φόρτωση του αρχείου data.csv
        const response = await fetch('data.csv');
        const dataText = await response.text();

        // Διαχωρισμός του αρχείου σε γραμμές
        const lines = dataText.split('\n');
        
        // Εδώ θα αποθηκεύσουμε προσωρινά τους κόμβους και τις συνδέσεις
        const nodes = [];
        const edges = [];

        // --- 1ο ΠΕΡΑΣΜΑ: Δημιουργία όλων των Κόμβων (Φιλόσοφοι) ---
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(';');
            const id = cols[0].trim();
            const name = cols[1].trim();
            const birth = cols[2].trim();

            // Προσθήκη του φιλοσόφου στη λίστα κόμβων
            nodes.push({
                data: { 
                    id: id, 
                    label: name + '\n(' + birth + ')' 
                }
            });
        }

        // --- 2ο ΠΕΡΑΣΜΑ: Δημιουργία όλων των Συνδέσεων (Σχέσεις) ---
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(';');
            const id = cols[0].trim();         // PersonID
            const relType = cols[12]?.trim(); // RelationType
            const personB = cols[13]?.trim(); // PersonB_ID

            // Έλεγχος αν υπάρχει έγκυρη σύνδεση με άλλον φιλόσοφο
            if (personB && personB !== "" && personB !== "-") {
                let sourceId = id;
                let targetId = personB;

                // Αν η σχέση δηλώνει μαθητή, αντιστρέφουμε τη φορά της γραμμής
                // ώστε το βέλος να δείχνει πάντα προς το μέλλον (νεότερος)
                if (relType.includes("Μαθητής")) {
                    sourceId = personB;
                    targetId = id;
                }

                // Προσθήκη της σύνδεσης στη λίστα
                edges.push({
                    data: { 
                        source: sourceId, 
                        target: targetId, 
                        label: relType 
                    }
                });
            }
        }

        // --- 3ο ΒΗΜΑ: Σχεδίαση του Γραφήματος ---
        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: { nodes: nodes, edges: edges },
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
                        'width': '100px',
                        'height': '50px',
                        'shape': 'round-rectangle',
                        'border-width': 1,
                        'border-color': '#2980b9'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#bdc3c7',
                        'target-arrow-color': '#bdc3c7',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'label': 'data(label)',
                        'font-size': '8px',
                        'text-background-color': '#ffffff',
                        'text-background-opacity': 1,
                        'text-background-padding': '2px'
                    }
                }
            ],
            layout: {
                name: 'dagre',
                rankDir: 'TB', // Top to Bottom (Από πάνω προς τα κάτω)
                nodeSep: 50,
                rankSep: 100
            }
        });

    } catch (error) {
        // Εμφάνιση σφάλματος στην κονσόλα αν κάτι πάει στραβά
        console.error('Σφάλμα κατά τη φόρτωση των δεδομένων:', error);
    }
}

// Εκκίνηση της συνάρτησης
initGraph();
