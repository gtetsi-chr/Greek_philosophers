async function initGraph() {
    try {
        const response = await fetch('data.csv');
        const dataText = await response.text();
        const lines = dataText.split('\n').filter(l => l.trim() !== "");
        
        const nodes = [];
        const edges = [];
        const existingNodeIds = new Set();

        function parseYear(dateStr) {
            if (!dateStr) return 500;
            let year = parseInt(dateStr.replace(/[^0-9]/g, ''));
            return dateStr.includes('π.Χ.') ? -year : year;
        }

        // 1. Δημιουργία Κόμβων με τεράστιο κατακόρυφο κενό (y)
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(';');
            if (cols.length < 3) continue;

            const id = cols[0].trim();
            const name = cols[1].trim();
            const birthYear = parseYear(cols[2].trim());

            nodes.push({
                data: { id: id, label: name + '\n' + cols[2].trim() },
                // Πολλαπλασιάζουμε επί 15 για να δώσουμε "αέρα" κατακόρυφα
                position: { x: 400, y: (birthYear + 800) * 15 } 
            });
            existingNodeIds.add(id);
        }

        // 2. Συνδέσεις
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(';');
            const s = cols[0].trim();
            const rel = cols[12]?.trim() || "";
            const t = cols[13]?.trim() || "";

            if (t && t !== "-" && existingNodeIds.has(s) && existingNodeIds.has(t)) {
                edges.push({
                    data: { 
                        source: rel.includes("Μαθητής") ? t : s, 
                        target: rel.includes("Μαθητής") ? s : t,
                        label: rel 
                    }
                });
            }
        }

        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: { nodes: nodes, edges: edges },
            style: [
                { selector: 'node', style: {
                    'label': 'data(label)', 'text-wrap': 'wrap', 'text-valign': 'center',
                    'width': '140px', 'height': '50px', 'shape': 'round-rectangle',
                    'background-color': '#2c3e50', 'color': '#fff', 'font-size': '10px'
                }},
                { selector: 'edge', style: {
                    'width': 2, 'line-color': '#bdc3c7', 'curve-style': 'taxi',
                    'target-arrow-shape': 'triangle', 'taxi-direction': 'vertical'
                }}
            ],
            layout: { name: 'preset' } 
        });

        // 3. ΤΟ ΜΥΣΤΙΚΟ LOOP: Απωθητική δύναμη μόνο στον οριζόντιο άξονα (X)
        // Μετά την τοποθέτηση, τρέχουμε έναν αλγόριθμο που "ξεμπλέκει" τους κόμβους
        const layout = cy.layout({
            name: 'cola',
            infinite: false,
            fit: false,
            nodeSpacing: 100, // Τεράστιο κενό μεταξύ τους
            avoidOverlap: true,
            unconstrIter: 100, // Πόσες φορές θα προσπαθήσει να τους σπρώξει
            flow: { axis: 'y', minSeparation: 50 } // Κρατάει την κάθετη ροή
        });

        layout.run();
        cy.fit();

    } catch (e) { console.error(e); }
}
initGraph();
