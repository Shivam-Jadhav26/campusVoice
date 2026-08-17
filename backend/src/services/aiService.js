const categorizeComplaint = async (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  let category = 'Other';
  let priority = 'Low';
  
  if (text.includes('electricity') || text.includes('power') || text.includes('water')) {
    category = 'Infrastructure';
    priority = 'Critical';
  } else if (text.includes('lab') || text.includes('projector') || text.includes('computer')) {
    category = 'Laboratory';
    priority = 'Medium';
  } else if (text.includes('food') || text.includes('mess')) {
    category = 'Mess';
    priority = 'Low';
  } else if (text.includes('academic') || text.includes('exam') || text.includes('syllabus')) {
    category = 'Academic';
    priority = 'High';
  }

  return { 
    category, 
    priority, 
    confidence: 0.85, 
    reasoning: 'Based on keywords detected' 
  };
};

const detectDuplicates = async (title, description, existingComplaints) => {
  const words = `${title} ${description}`.toLowerCase().split(/\W+/);
  const duplicates = [];

  for (const complaint of existingComplaints) {
    const existingWords = `${complaint.title} ${complaint.description}`.toLowerCase().split(/\W+/);
    const intersection = words.filter(word => existingWords.includes(word));
    const similarity = intersection.length / Math.max(words.length, existingWords.length);

    if (similarity > 0.4) {
      duplicates.push({ complaint, similarity });
    }
  }

  return duplicates;
};

const analyzeSentiment = async (text) => {
  const lowerText = text.toLowerCase();
  let sentiment = 'Neutral';
  let urgencyLevel = 'Medium';
  let score = 0.5;
  const keywords = [];

  const negativeWords = ['poor', 'terrible', 'broken', 'worst', 'bad', 'issue'];
  const positiveWords = ['good', 'great', 'awesome', 'excellent', 'thanks'];

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) {
      sentiment = 'Negative';
      urgencyLevel = 'High';
      score -= 0.2;
      keywords.push(word);
    }
  });

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) {
      sentiment = 'Positive';
      urgencyLevel = 'Low';
      score += 0.2;
      keywords.push(word);
    }
  });

  return { sentiment, urgencyLevel, score: Math.max(0, Math.min(1, score)), keywords };
};

const generateReply = async (complaintTitle, description, category, priority) => {
  return `Thank you for raising the issue: "${complaintTitle}". Our team has categorized this under ${category} with ${priority} priority. We are looking into it and will provide an update soon.`;
};

const predictPriority = async (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('emergency') || text.includes('hazard') || text.includes('critical')) {
    return { priority: 'Critical', confidence: 0.9 };
  } else if (text.includes('broken') || text.includes('not working')) {
    return { priority: 'High', confidence: 0.8 };
  }
  
  return { priority: 'Medium', confidence: 0.7 };
};

module.exports = { 
  categorizeComplaint, 
  detectDuplicates, 
  analyzeSentiment, 
  generateReply, 
  predictPriority 
};
