const crypto = require('crypto');
const prisma = require('../prismaClient');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended length for GCM

function getEncryptionKey() {
  // Prefer a dedicated key for settings encryption, fall back to JWT_SECRET if present
  return process.env.SETTINGS_ENCRYPTION_KEY || process.env.JWT_SECRET || null;
}

function encrypt(text) {
  const key = getEncryptionKey();
  if (!key) return text; // no encryption configured

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, crypto.createHash('sha256').update(key).digest(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(encryptedB64) {
  const key = getEncryptionKey();
  if (!key) return encryptedB64; // not encrypted

  try {
    const data = Buffer.from(encryptedB64, 'base64');
    const iv = data.slice(0, IV_LENGTH);
    const tag = data.slice(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = data.slice(IV_LENGTH + 16);

    const decipher = crypto.createDecipheriv(ALGORITHM, crypto.createHash('sha256').update(key).digest(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.error('Failed to decrypt setting:', err);
    return null;
  }
}

async function getAllSettings({ includeSecrets = false } = {}) {
  const rows = await prisma.setting.findMany();
  const settings = {};
  rows.forEach(r => {
    if (r.isSecret && !includeSecrets) {
      // mask secrets
      settings[r.key] = r.value ? `${r.value.slice(0, 6)}...${r.value.slice(-4)}` : '';
    } else if (r.isSecret) {
      const decrypted = decrypt(r.value);
      settings[r.key] = decrypted ?? '';
    } else {
      // try parse JSON otherwise return raw
      try {
        settings[r.key] = JSON.parse(r.value);
      } catch (e) {
        settings[r.key] = r.value;
      }
    }
  });
  return settings;
}

async function upsertSettings(newSettings = {}, options = { encryptSecrets: true }) {
  const whitelist = [
    'clientUrl',
    'backendUrl',
    'emailNotifications',
    'adminAlerts',
    'systemAlerts',
    'sessionTimeout',
    'maxLoginAttempts',
    'passwordMinLength',
    // optional API keys (will be marked as secret)
    'claudeApiKey',
    'pineconeApiKey',
    'stripeSecretKey',
    'stripeWebhookSecret'
  ];

  const results = {};

  for (const key of Object.keys(newSettings)) {
    if (!whitelist.includes(key)) continue;

    const rawVal = newSettings[key];
    const isSecret = ['claudeApiKey', 'pineconeApiKey', 'stripeSecretKey', 'stripeWebhookSecret'].includes(key);

    const storedValue = (isSecret && options.encryptSecrets && typeof rawVal === 'string') ? encrypt(rawVal) : (typeof rawVal === 'string' ? rawVal : JSON.stringify(rawVal));

    const upserted = await prisma.setting.upsert({
      where: { key },
      update: { value: storedValue, isSecret },
      create: { key, value: storedValue, isSecret }
    });

    results[key] = isSecret ? (options.returnPlainSecrets ? rawVal : `${rawVal?.slice?.(0,6) ?? ''}...${rawVal?.slice?.(-4) ?? ''}`) : rawVal;
  }

  return results;
}

module.exports = {
  getAllSettings,
  upsertSettings,
  encrypt,
  decrypt
};
