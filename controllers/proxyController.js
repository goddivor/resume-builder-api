import axios from 'axios';

// Proxy pour servir les PDFs (contourner CORS)
export const proxyPDF = async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ message: 'URL parameter is required' });
        }

        // Récupérer le PDF depuis ImageKit
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'application/pdf'
            }
        });

        // Renvoyer le PDF avec les bons headers
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': response.data.length,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400'
        });

        res.send(response.data);

    } catch (error) {
        console.error('Error proxying PDF:', error.message);
        return res.status(500).json({ message: 'Failed to fetch PDF' });
    }
};
