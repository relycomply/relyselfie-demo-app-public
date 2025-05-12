require('dotenv').config(); // Load environment variables

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5999;

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb', extended: true }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

app.post('/api/upload-images', async (req, res) => {
    console.log('Received request to upload images');
    const { image, customerId } = req.body;


    if (!image || !customerId) {
        return res.status(400).json({ error: 'Missing images or customerId' });
    }

    try {
        const token = process.env.AUTH_TOKEN;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Cookie: `csrftoken=${process.env.CSRF_TOKEN}`,
        };

        const results = [];
        const graphql = JSON.stringify({
            query: `mutation($input: CreateDocumentInput!) {
          createDocument(input: $input) {
            document {
              id
              created
              format
              presignedUrl
            }
          }
        }`,
            variables: {
                input: {
                    customer: customerId,
                    documentType: 'face_photo',
                    data: image.split(',')[1],
                },
            },
        });

        const response = await fetch(process.env.GRAPHQL_URL, {
            method: 'POST',
            headers,
            body: graphql,
        });

        const result = await response.json();
        results.push(result);

        res.status(200).json({ success: true, results });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});