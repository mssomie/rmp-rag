'use client'
import { Typography, Box, TextField, Stack, Button } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

export default function Home() {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I'm the Rate My Professor Assistant, how can I help you today?"
    }
   ]);

   const [message, setMessage]=useState('')

   const sendMessage = async () => {
    // Prevent sending empty messages
    if (!message.trim()) return;
    
    const userMessage = {role: 'user', content: message};

    setMessage('');
    
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
  
    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({messages: [...messages, {role: 'user', content: message}]}),
      });
  
      // Read and decode the message gotten from the server-side
      const reader = response.body.getReader()
      const decoder = new TextDecoder();

      let result='';
      reader.read().then(function processText({done, value}){
        if (done){
          return result;
        }

        const text = decoder.decode(value || new unit8Array(), {stream: true});
        result+=text;
      

        
          console.log("received text chunk:", text)
          result+= text;
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (!lastMessage.content.includes(text)){
              lastMessage.content+=text;

            }
            return updatedMessages;
          });

    
     
      return reader.read().then(processText);

    });

    setMessage('')
  
    } catch (error) {
      console.error("Error in sendMessage:", error);
      
    }
  };
  
  
   

  return (
  <Box 
    width="100vw"
    height= "100vh"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center">
      <Stack 
        direction ="column"
        width="500px"
        height="700px"
        border = "1px solid black"
        p={2}
        spacing = {3}>
          <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%" >
          {messages.map((message, index)=>(
            <Box key={index} display="flex" justifyContent={message.role==="assistant"? "flex-start": "flex-end"}>
              <Box bgcolor={message.role==="assistant"? "primary.main": "secondary.main"} borderRadius={16} p={3}>
              
                <Typography style={{whiteSpace: 'pre-line'}}>{message.content}</Typography>
              </Box>

            </Box>
          ))}


          </Stack>
          <Stack direction= "row"
          spacing ={2}
          >
            <TextField label="message"
            fullWidth
            value={message}
            onChange={(e)=>{
              setMessage(e.target.value)
            }}/>
            
            <Button variant="contained" onClick={sendMessage}>Send</Button>
            </Stack>


          </Stack>
         

  </Box>
  )
}