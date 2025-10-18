import jwt from 'jsonwebtoken';

// Generate a JWT token for local Supabase development
export function generateLocalJWT() {
  const payload = {
    iss: 'supabase',
    ref: 'local',
    role: 'service_role',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
  };

  // Use a simple secret for local development
  const secret = 'your-super-secret-jwt-token-with-at-least-32-characters-long';
  
  return jwt.sign(payload, secret);
}

// Alternative: Create a simple JWT without external dependencies
export function createSimpleJWT() {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    iss: 'supabase',
    ref: 'local',
    role: 'service_role',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
  };

  // Simple base64 encoding (not secure, but works for local dev)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  // Create a simple signature (not cryptographically secure)
  const signature = Buffer.from('local-dev-signature').toString('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
