export async function getChatResponse(message: string, history: { role: 'user' | 'model', text: string }[] = []) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting chat response:', error);
    return { 
      success: false, 
      text: 'Sorry, I encountered an error. Please try again.' 
    };
  }
} 