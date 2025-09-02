process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const xlsx = require("xlsx");
const readline = require("readline");

// ✅ fetch is built-in in Node.js v18+
const API_KEY = "0cf44d8fa6901f6eb0f686d6";

// Setup readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

// Function to convert salaries using exchange rates
async function convertSalaries(employees, targetCurrency) {
  try {
    // Fetch exchange rates
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${targetCurrency}`);
    const parsed = await response.json();

    if (parsed.result !== "success") {
      throw new Error(parsed["error-type"] || "API error");
    }

    const rates = parsed.conversion_rates;
    let results = [];

    for (const emp of employees) {
      let converted;
      if (emp.Currency === targetCurrency) {
        converted = emp.Salary;
      } else if (rates[emp.Currency]) {
        converted = emp.Salary / rates[emp.Currency];
      } else {
        throw new Error(`No exchange rate for ${emp.Currency}`);
      }

      results.push({
        ...emp,
        [`Salary in ${targetCurrency}`]: converted.toFixed(2)
      });
    }

    return results;
  } catch (err) {
    throw err;
  }
}

// Main function
async function run() {
  try {
    // Step 1: Load Excel file
    const workbook = xlsx.readFile("apiPractice_Project.xlsx");
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const employees = xlsx.utils.sheet_to_json(sheet);

    // Step 2: Ask user for target currency
    const targetCurrency = (await ask("Enter target currency (e.g., INR, USD, EUR): ")).toUpperCase();
    rl.close();

    // Step 3: Convert salaries
    const results = await convertSalaries(employees, targetCurrency);

    // Step 4: Save results to new Excel
    const newSheet = xlsx.utils.json_to_sheet(results);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Results");

    const now = new Date();
    const timestamp =
      now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0") + "_" +
      String(now.getHours()).padStart(2, "0") + "-" +
      String(now.getMinutes()).padStart(2, "0");

    const filename = `apiPractice_converted_${timestamp}.xlsx`;
    xlsx.writeFile(newWorkbook, filename);

    console.log(`📂 Results saved to ${filename}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// Run program
run();
