import puppeteer from 'puppeteer';
import { PineconeClient } from '@pinecone-database/client';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'localhost:3000' });
    }

    try {
 
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);


      const professorData = await page.evaluate(() => {
        const name = document.querySelector('.professor-name').innerText;
        const rating = document.querySelector('.professor-rating').innerText;
        const department = document.querySelector('.professor-department').innerText;
        return { name, rating, department };
      });

      await browser.close();

    
      const pinecone = new PineconeClient({
        apiKey: process.env.IEJRNN2RkmrkmK2MMEL35546_KEKNI489FMFndieqKR,
        environment: 'us-west1-gcp',
      });

      
      const index = pinecone.Index('rate-professor');
      await index.upsert([
        {
          id: `professor-${Date.now()}`,
          values: embeddings[0],
          metadata: professorData, 
        },
      ]);

      res.status(200).json({ message: 'Data successfully scraped and inserted into Pinecone' });
    } catch (error) {
      console.error('Error in scraping or Pinecone insertion:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
