export const REPLIT_URL = process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.${process.env.REPLIT_DOMAINS?.split(',')[0]}`
  : "http://localhost:5000";
