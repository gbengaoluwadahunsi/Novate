const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = './screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// List of all pages to screenshot
const pages = [
  { name: '01-homepage', url: 'http://localhost:3001' },
  { name: '02-login', url: 'http://localhost:3001/login' },
  { name: '03-register', url: 'http://localhost:3001/register' },
  { name: '04-pricing', url: 'http://localhost:3001/pricing' },
  { name: '05-about', url: 'http://localhost:3001/about' },
  { name: '06-contact', url: 'http://localhost:3001/contact' },
  { name: '07-privacy-policy', url: 'http://localhost:3001/privacy-policy' },
  { name: '08-terms-of-service', url: 'http://localhost:3001/terms-of-service' },
  { name: '09-refund-policy', url: 'http://localhost:3001/refund-policy' },
  { name: '10-forgot-password', url: 'http://localhost:3001/forgot-password' },
  { name: '11-reset-password', url: 'http://localhost:3001/reset-password' },
  { name: '12-profile', url: 'http://localhost:3001/profile' },
  { name: '13-payment-success', url: 'http://localhost:3001/payment/success' },
  { name: '14-payment-cancelled', url: 'http://localhost:3001/payment/cancelled' },
  // Dashboard pages (these will redirect to login if not authenticated)
  { name: '15-dashboard', url: 'http://localhost:3001/dashboard' },
  { name: '16-dashboard-transcribe', url: 'http://localhost:3001/dashboard/transcribe' },
  { name: '17-dashboard-notes', url: 'http://localhost:3001/dashboard/notes' },
  { name: '18-dashboard-novategpt', url: 'http://localhost:3001/dashboard/novategpt' },
  { name: '19-dashboard-settings', url: 'http://localhost:3001/dashboard/settings' },
  { name: '20-dashboard-patients', url: 'http://localhost:3001/dashboard/patients' },
  { name: '21-dashboard-appointments', url: 'http://localhost:3001/dashboard/appointments' },
  { name: '22-dashboard-records', url: 'http://localhost:3001/dashboard/records' },
  { name: '23-dashboard-analytics', url: 'http://localhost:3001/dashboard/analytics' },
  { name: '24-dashboard-organization', url: 'http://localhost:3001/dashboard/organization' },
  { name: '25-dashboard-ai-agents', url: 'http://localhost:3001/dashboard/ai-agents' },
  { name: '26-dashboard-clinical-support', url: 'http://localhost:3001/dashboard/clinical-support' },
  { name: '27-dashboard-documents', url: 'http://localhost:3001/dashboard/documents' },
  { name: '28-dashboard-languages', url: 'http://localhost:3001/dashboard/languages' },
  { name: '29-dashboard-scanner', url: 'http://localhost:3001/dashboard/scanner' },
  { name: '30-dashboard-support', url: 'http://localhost:3001/dashboard/support' },
];

async function takeScreenshots() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  console.log('Starting screenshot process...');
  
  for (const page of pages) {
    try {
      console.log(`Taking screenshot of ${page.name}...`);
      const pageObj = await browser.newPage();
      
      // Set a longer timeout for pages that might take time to load
      await pageObj.setDefaultTimeout(30000);
      
      await pageObj.goto(page.url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait a bit more for any dynamic content
      await pageObj.waitForTimeout(2000);
      
      const screenshotPath = path.join(screenshotsDir, `${page.name}.png`);
      await pageObj.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      console.log(`✓ Screenshot saved: ${screenshotPath}`);
      await pageObj.close();
      
    } catch (error) {
      console.error(`✗ Failed to screenshot ${page.name}:`, error.message);
    }
  }
  
  await browser.close();
  console.log('Screenshot process completed!');
}

takeScreenshots().catch(console.error);
