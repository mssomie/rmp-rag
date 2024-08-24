import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";
import { pipeline } from '@xenova/transformers';

const systemPrompt = `
You are a virtual assistant designed to help students find and evaluate professors based on their queries...
 return in JSON format`;
 
const axios = require("axios");
const modelId= "sentence-transformers/all-MiniLM-L6-v2";
const apiUrl = `https://api-inference.huggingface.co/pipeline/feature-extraction/${modelId}`;



async function query(texts){
    try{
        console.log("prints here ")
        const response = await axios.post(apiUrl, 
            {
            inputs: texts,
            options: {wait_for_model: true},
            },
            {
                headers: {Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`}
            },
        );
        return response.data;
        }
    
    catch(error){
        console.error("Error querying model: ", error)

    }
}

export async function POST(req) {
    // try {
        console.log("First things first")
        const data = await req.json();
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        const index = pc.Index("rmp-rag").namespace("ns1");

        // Load the transformers pipeline
        
        const text = data[data.length - 1].content;

        const embedding = await query(text);

        const results = await index.query({
            topK: 3,
            includeMetadata: true,
            vector: embedding,
        });
       

        let resultString = '\n \n Returned result from vector db';
        results.matches.forEach((match) => {
            resultString += `
                professor: ${match.id}
                Review: ${match.metadata.review}
                Subject: ${match.metadata.subject}
                Stars: ${match.metadata.stars}
                \n\n
            `;
        });

        console.log(resultString)
        console.log('data: ', data)
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const lastMessage = data[data.length - 1];
        const lastMessageContent = lastMessage.content + resultString;
        const lastDataWithoutLastMessage = data.slice(0, data.length - 1);
        
        try{
            const completion = await groq.chat.completions.create({
                messages: [{
                    role: 'system', content: systemPrompt
                }, ...lastDataWithoutLastMessage,
                { role: 'user', content: lastMessageContent }],
                model: 'llama3-70b-8192',
                response_format: { type: 'json_object' }
            });
            console.log('Completion content:', JSON.parse(completion.choices[0].message.content));
             // const result = JSON.parse(completion.choices[0].message.content); // Ensure this content is valid JSON
            const result = JSON.parse(completion.choices[0].message.content);
            
    
        console.log(result);

        return  NextResponse.json(result);
            
        }catch(err){

            console.error('Error generating flashcards:', err);
            return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
        }
       

       

    // } catch (error) {
    //     console.error("Error in /api/chat:", error);
    //     return NextResponse.json({
    //         message: "Error",
    //         error: error.message || "An unknown error occurred.",
    //     }, {
    //         status: 500,
    //     });
    // }
}
