export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return formatDate(dateString);
};

export const formatDeadline = (dateString) => {
  if (!dateString) return 'No deadline';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (date - now) / (1000 * 60 * 60);
  
  if (diffInHours < 0) return 'OVERDUE';
  if (diffInHours < 24) return `${Math.ceil(diffInHours)} hours remaining`;
  if (diffInHours < 48) return '1 day remaining';
  
  const diffInDays = Math.ceil(diffInHours / 24);
  return `${diffInDays} days remaining`;
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const formatRole = (role) => {
  if (!role) return '';
  
  const roleMap = {
    'class_incharge': 'Class Incharge',
    'tg': 'Teacher Guardian',
    'hod': 'HOD',
  };
  
  if (roleMap[role]) return roleMap[role];
  
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getRoleDashboardPath = (role) => {
  const paths = { 
    student: '/student/dashboard', 
    teacher: '/teacher/dashboard', 
    tg: '/tg/dashboard', 
    class_incharge: '/class-incharge/dashboard', 
    hod: '/hod/dashboard', 
    admin: '/admin/dashboard' 
  };
  return paths[role] || '/login';
};
