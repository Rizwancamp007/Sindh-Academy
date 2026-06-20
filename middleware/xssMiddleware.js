const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  // Remove script tags and standard HTML elements
  return str
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      sanitized[key] = typeof val === 'object' ? sanitizeObject(val) : sanitizeString(val);
    }
  }
  return sanitized;
};

const xssSanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

module.exports = xssSanitize;
