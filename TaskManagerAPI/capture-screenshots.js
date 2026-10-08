const puppeteer = require("puppeteer-core");
const path = require("path");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173";
const OUTPUT_DIR = "c:\\Documents\\COLLEGE DOCUMENTS\\Semester 5\\AWDF\\Practical 7";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
    console.log("Launching Edge via puppeteer-core...");
    const browser = await puppeteer.launch({
        executablePath: EDGE_PATH,
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,840"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 840, deviceScaleFactor: 1.5 });

    // 1. Screenshot Login Screen
    console.log("1. Capturing Sign In view...");
    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle0" });
    await sleep(600);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "01_sign_in_ui.png") });

    // 2. Screenshot Register Tab
    console.log("2. Capturing Register view...");
    await page.click(".auth-tabs .auth-tab:last-child");
    await sleep(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "02_register_ui.png") });

    // 3. Register a new user and log in to capture Dashboard
    console.log("3. Registering account to capture Dashboard...");
    const uniqueEmail = `samarth_${Date.now()}@charusat.edu.in`;
    await page.type("#reg-name", "Samarth Kalavadia");
    await page.type("#auth-email", uniqueEmail);
    await page.type("#auth-password", "SecurePass123!");
    await page.click(".auth-submit-btn");
    await sleep(1500);

    // Add sample tasks
    console.log("Adding sample tasks...");
    await page.type("#task-title", "Implement JWT Authentication Middleware");
    await page.type("#task-desc", "Extract Bearer token and decode user payload via jwt.verify()");
    await page.click(".task-form button[type='submit']");
    await sleep(800);

    await page.type("#task-title", "Add Server-side Input Validation");
    await page.type("#task-desc", "Reject malformed requests before they reach the MongoDB database");
    await page.click(".task-form button[type='submit']");
    await sleep(800);

    await page.type("#task-title", "Create /me Profile Endpoint");
    await page.type("#task-desc", "Return logged-in user details excluding sensitive password hash");
    await page.click(".task-form button[type='submit']");
    await sleep(800);

    // Toggle completion on the first task
    const checkboxes = await page.$$(".btn-checkbox");
    if (checkboxes.length > 0) {
        await checkboxes[0].click();
        await sleep(500);
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, "03_dashboard_tasks.png") });

    // 4. Test Server-side Validation Error by submitting empty title
    console.log("4. Capturing Server-side Validation Error...");
    await page.click(".task-form button[type='submit']");
    await sleep(700);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "04_server_validation_rejection.png") });

    // 5. Test 401 Expiry Simulation
    console.log("5. Capturing 401 Expiry & Redirection to Login...");
    await page.click(".btn-outline-danger");
    await sleep(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "05_token_expiry_401_redirect.png") });

    await browser.close();
    console.log("All screenshots successfully captured in Practical 7 directory!");
}

capture().catch(err => {
    console.error("Capture failed:", err);
    process.exit(1);
});
