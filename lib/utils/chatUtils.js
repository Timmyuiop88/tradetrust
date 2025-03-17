/**
 * Deduplicate messages from different sources
 * @param {Array} serverMessages - Messages from the server
 * @param {Array} pendingMessages - Pending messages from the client
 * @returns {Array} - Deduplicated messages
 */
export function deduplicateMessages(serverMessages = [], pendingMessages = []) {
  // Create a map for tracking unique messages
  const uniqueMessages = new Map();
  
  // Process all messages
  const allMessages = [
    ...(serverMessages || []).map(msg => ({
      ...msg,
      _source: 'server',
      _key: `server-${msg.id}`
    })),
    ...(pendingMessages || []).map(msg => ({
      ...msg,
      _source: 'pending',
      _key: `pending-${msg.id}`
    }))
  ];
  
  // Sort by creation time
  allMessages.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  // First pass: identify and mark duplicates
  const messageMap = new Map();
  
  allMessages.forEach(message => {
    // For messages with images, extract the text content for comparison
    let compareContent = message.content;
    let hasImage = false;
    
    if (message.content && message.content.includes('[IMAGE]')) {
      hasImage = true;
      compareContent = message.content.replace(/\[IMAGE\].*?\[\/IMAGE\]/, '').trim();
    }
    
    // Create a key that ignores the image URL but considers the text and sender
    const key = `${compareContent}-${message.senderId}-${hasImage}`;
    
    if (!messageMap.has(key)) {
      messageMap.set(key, []);
    }
    
    messageMap.get(key).push(message);
  });
  
  // Second pass: select the best message from each group
  messageMap.forEach((messages, key) => {
    // If there's only one message with this key, use it
    if (messages.length === 1) {
      uniqueMessages.set(messages[0]._key, messages[0]);
      return;
    }
    
    // If we have multiple messages, prefer server messages over pending ones
    const serverMessages = messages.filter(m => m._source === 'server');
    if (serverMessages.length > 0) {
      // Use the most recent server message
      const mostRecentServerMessage = serverMessages.reduce((latest, current) => 
        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
      );
      uniqueMessages.set(mostRecentServerMessage._key, mostRecentServerMessage);
    } else {
      // If no server messages, use the most recent pending message
      const mostRecentPendingMessage = messages.reduce((latest, current) => 
        new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
      );
      uniqueMessages.set(mostRecentPendingMessage._key, mostRecentPendingMessage);
    }
  });
  
  // Convert back to array and sort
  return Array.from(uniqueMessages.values())
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Extract image URLs from message content
 * @param {string} content - Message content
 * @returns {Array} - Array of image URLs
 */
export function extractImageUrls(content) {
  if (!content) return [];
  
  const imageRegex = /\[IMAGE\](.*?)\[\/IMAGE\]/g;
  const matches = [];
  let match;
  
  while ((match = imageRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
}

/**
 * Format message content for display
 * @param {string} content - Message content
 * @returns {Object} - Formatted content with text and images
 */
export function formatMessageContent(content) {
  if (!content) return { text: '', images: [] };
  
  const images = extractImageUrls(content);
  const text = content.replace(/\[IMAGE\].*?\[\/IMAGE\]/g, '').trim();
  
  return { text, images };
}

/**
 * Group messages by date
 * @param {Array} messages - Messages to group
 * @returns {Object} - Messages grouped by date
 */
export function groupMessagesByDate(messages) {
  const groups = {};
  
  messages.forEach(message => {
    const date = new Date(message.createdAt).toLocaleDateString();
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(message);
  });
  
  return groups;
} 