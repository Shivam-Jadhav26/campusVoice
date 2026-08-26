const categorizeComplaint = async (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  
  let category = 'Academic';
  let priority = 'Medium';
  let confidence = 88;
  
  if (text.includes('electricity') || text.includes('power') || text.includes('water') || text.includes('light') || text.includes('switch') || text.includes('fan') || text.includes('ac')) {
    category = 'Infrastructure';
    priority = 'Critical';
    confidence = 94;
  } else if (text.includes('lab') || text.includes('projector') || text.includes('computer') || text.includes('workstation') || text.includes('hardware') || text.includes('equipment')) {
    category = 'Laboratory';
    priority = 'Medium';
    confidence = 90;
  } else if (text.includes('wifi') || text.includes('internet') || text.includes('network') || text.includes('server') || text.includes('login') || text.includes('portal')) {
    category = 'IT';
    priority = 'High';
    confidence = 92;
  } else if (text.includes('food') || text.includes('mess') || text.includes('canteen') || text.includes('hygiene') || text.includes('meal')) {
    category = 'Mess';
    priority = 'Medium';
    confidence = 89;
  } else if (text.includes('hostel') || text.includes('room') || text.includes('warden') || text.includes('bed')) {
    category = 'Hostel';
    priority = 'High';
    confidence = 91;
  } else if (text.includes('library') || text.includes('book') || text.includes('journal') || text.includes('reading')) {
    category = 'Library';
    priority = 'Low';
    confidence = 87;
  } else if (text.includes('bus') || text.includes('transport') || text.includes('driver') || text.includes('route')) {
    category = 'Transport';
    priority = 'Medium';
    confidence = 88;
  } else if (text.includes('teacher') || text.includes('faculty') || text.includes('professor') || text.includes('lecture') || text.includes('teaching')) {
    category = 'Faculty';
    priority = 'Medium';
    confidence = 86;
  } else if (text.includes('academic') || text.includes('exam') || text.includes('syllabus') || text.includes('marks') || text.includes('attendance')) {
    category = 'Academic';
    priority = 'High';
    confidence = 90;
  }

  return { 
    category, 
    priority, 
    confidence, 
    reasoning: 'Based on contextual keyword analysis' 
  };
};

const detectDuplicates = async (title = '', description = '', existingComplaints = []) => {
  if (!title && !description) return [];
  const words = `${title} ${description}`.toLowerCase().split(/\W+/).filter(w => w && w.length > 2);
  if (!words.length) return [];
  const duplicates = [];

  for (const complaint of (existingComplaints || [])) {
    if (!complaint) continue;
    const existingWords = `${complaint.title || ''} ${complaint.description || ''}`.toLowerCase().split(/\W+/).filter(w => w && w.length > 2);
    if (!existingWords.length) continue;
    
    const intersection = words.filter(word => existingWords.includes(word));
    const similarity = intersection.length / Math.max(words.length, existingWords.length);

    if (similarity > 0.45) {
      duplicates.push({
        complaintNumber: complaint.complaintNumber || 'CMP',
        title: complaint.title,
        description: complaint.description,
        status: complaint.status,
        similarity: Math.round(similarity * 100)
      });
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
