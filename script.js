// Ενεργοποίηση του Dagre για ιεραρχική διάταξη
cytoscape.use(cytoscapeDagre);

async function initGraph() {
    try {
        // 1. Φόρτωση του αρχείου
        const response = await fetch('data.csv');
        const dataText = await response.text();

        // 2. Προετοιμασία δεδομένων
        const lines = dataText.split('\n');
        const nodes = [];
        const edges = [];
        
        // Χρησιμοποιούμε ένα Set για να ξέρουμε ποια IDs έχουμε δημιουργήσει πραγματικά
        const existingNodeIds = new Set();

        // --- 1ο ΠΕΡΑΣΜΑ: Δημιουργία Κόμβων ---
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(';');
            if (cols.length < 2) continue;

            // trim() για να φύγουν κενά, αντικατάσταση περίεργων χαρακτήρων
            const id = cols[0].trim();
            const name = cols[1].trim();
            const birth = cols[2] ? cols[2].trim() : "";

            // Αποθήκευση του ID ώστε να ξέρουμε ότι υπάρχει
            nodes.push({
                data: { 
                    id: id, 
                    label: name + '\n' + birth 
                }
            });
            existingNodeIds.add(id);
        }

        // --- 2ο ΠΕΡΑΣΜΑ: Δημιουργία Συνδέσεων (με αυστηρό έλεγχο) ---
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(';');
            if (cols.length < 14) continue;

            const sourceId = cols[0].trim();
            const relType = cols[12] ? cols[12].trim() : "";
            const targetId = cols[13] ? cols[13].trim() : "";

            // ΕΛΕΓΧΟΣ: Φτιάξε τη σύνδεση ΜΟΝΟ αν υπάρχουν και τα δύο IDs στη λίστα μας
            if (targetId && targetId !== "-" && existingNodeIds.has(sourceId) && existingNodeIds.has(targetId)) {
                
                let s = sourceId;
                let t = targetId;

                // Αντιστροφή αν είναι μαθητής για να πηγαίνει το βέλος προς τα κάτω (νεότερος)
                if (relType.includes("Μαθητής")) {
                    s = targetId;
                    t = sourceId;
                }

                edges.push({
                    data: { 
                        source: s, 
                        target: t, 
                        label: relType 
                    }
                });
            } else {
                // Αν δεν βρει το ID, απλά το καταγράφει στην κονσόλα χωρίς να "κρασάρει"
                if (targetId && targetId !== "-") {
                    console.warn(`Παράλειψη σύνδεσης: Το ID ${targetId} δεν βρέθηκε στους φιλοσόφους.`);
                }
            }
        }

        // --- 3ο ΒΗΜΑ: Σχεδίαση ---
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
                        'font-size': '10px',
                        'width': '110px',
                        'height': '50px',
                        'shape': 'round-rectangle'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#95a5a6',
                        'target-arrow-color': '#95a5a6',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'label': 'data(label)',
                        'font-size': '8px',
                        'color': '#7f8c8d'
                    }
                }
            ],
            layout: {
                name: 'dagre',
                rankDir: 'TB',
                nodeSep: 60,
                rankSep: 120
            }
        });

    } catch (error) {
        console.error('Σφάλμα:', error);
    }
}

initGraph();
