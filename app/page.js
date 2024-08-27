import { useState } from 'react';
import { Typography, Box, TextField, Stack, Button } from '@mui/material';

export default function Home() {
  const [url, setUrl] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi, I'm the Rate My Professor Assistant, how can I help you today?",
    },
  ]);

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: 'Professor data scraped and saved successfully!' },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: 'Failed to scrape professor data.' },
        ]);
      }
    } catch (error) {
      console.error('Error in handleUrlSubmit:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'An error occurred while processing your request.' },
      ]);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                borderRadius={16}
                p={3}
              >
                <Typography style={{ whiteSpace: 'pre-line' }}>{message.content}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <TextField
          label="Rate My Professor URL"
          fullWidth
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button variant="contained" onClick={handleUrlSubmit}>
          Submit URL
        </Button>
      </Stack>
    </Box>
  );
}
