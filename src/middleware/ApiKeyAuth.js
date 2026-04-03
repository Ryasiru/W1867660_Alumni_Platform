const ApiKey = require('../models/APIKey');

const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    const clientId = req.header('X-Client-ID');

    if (!apiKey || !clientId) {
      return res.status(401).json({ error: 'API key and Client ID required' });
    }

    const keyRecord = await ApiKey.findOne({ 
      key: apiKey, 
      clientId: clientId,
      isActive: true 
    });

    if (!keyRecord || (keyRecord.expiresAt && keyRecord.expiresAt < new Date())) {
      return res.status(401).json({ error: 'Invalid or expired API key' });
    }

    await keyRecord.logUsage(req.path, req.ip);
    req.apiKey = keyRecord;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiKey.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { apiKeyAuth, requirePermission };