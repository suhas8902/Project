process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const xlsx = require("xlsx");
const moment = require("moment-timezone");
const fetch = require("node-fetch");
const fs = require("fs");
const mysql = require("mysql2");
const readline = require("readline");

// ✅ Your ExchangeRate API key
const API_KEY = "0cf44d8fa6901f6eb0f686d6";

// ✅ Setup MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", // change if needed
  database: "currency_database_Freelance"
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL Database");
});

// ✅ Setup readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

// ✅ Full country -> IANA timezone mapping (common countries)
const countryTimezones = {
  "USA": "America/New_York",
  "United States": "America/New_York",
  "India": "Asia/Kolkata",
  "Australia": "Australia/Sydney",
  "Germany": "Europe/Berlin",
  "UK": "Europe/London",
  "United Kingdom": "Europe/London",
  "Japan": "Asia/Tokyo",
  "China": "Asia/Shanghai",
  "Canada": "America/Toronto",
  "Dubai": "Asia/Dubai",
  "UAE": "Asia/Dubai"
  // Add more countries here as needed
};

// ✅ Load Excel
const fileName = "apiPractice.xlsx";
if (!fs.existsSync(fileName)) {
  console.error(`❌ File "${fileName}" not found.`);
  process.exit(1);
}
const workbook = xlsx.readFile(fileName);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const employees = xlsx.utils.sheet_to_json(sheet);

if (employees.length === 0) {
  console.error("❌ Excel sheet is empty.");
  process.exit(1);
}

// ✅ Convert salaries and add local time
async function convertSalaries(targetCurrency) {
  const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${targetCurrency}`);
  const data = await res.json();
  if (data.result !== "success") throw new Error("Failed to fetch exchange rates.");
  const rates = data.conversion_rates;

  let results = [];

  for (const emp of employees) {
    if (!emp.Salary || !emp.Currency || !emp.Country) {
      console.warn(`⚠️ Skipping incomplete row: ${JSON.stringify(emp)}`);
      continue;
    }

    // Salary conversion
    let converted;
    if (emp.Currency === targetCurrency) converted = emp.Salary;
    else if (rates[emp.Currency]) converted = emp.Salary / rates[emp.Currency];
    else throw new Error(`No exchange rate for ${emp.Currency}`);

    // Local time calculation
    const timezone = countryTimezones[emp.Country] || "UTC";
    const localTime = moment().tz(timezone).format("YYYY-MM-DD HH:mm:ss");

    // Build result row
    const resultRow = {
      Name: emp.Name,
      Company: emp.Company,
      Emp_ID: emp.id,
      Age: emp.age,
      Salary: emp.Salary,
      Currency: emp.Currency,
      Country: emp.Country,
      Target_Currency: targetCurrency,
      Converted_Salary: converted.toFixed(2),
      Local_Time: localTime
    };

    results.push(resultRow);

    // Insert into MySQL
    db.query(
      `INSERT INTO incomesfreelance 
        (name, company, emp_id, age, salary, currency, country, target_currency, converted_salary, local_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resultRow.Name,
        resultRow.Company,
        resultRow.Emp_ID,
        resultRow.Age,
        resultRow.Salary,
        resultRow.Currency,
        resultRow.Country,
        resultRow.Target_Currency,
        resultRow.Converted_Salary,
        resultRow.Local_Time
      ],
      err => { if (err) console.error("❌ Error inserting into DB:", err); }
    );
  }

  return results;
}

// ✅ Main function
async function main() {
  const targetCurrency = (await ask("Enter target currency (e.g., INR, USD, EUR): ")).toUpperCase();
  rl.close();

  const results = await convertSalaries(targetCurrency);

  // Save Excel + JSON
  const newSheet = xlsx.utils.json_to_sheet(results);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Results");
  const baseFile = "apiPractice_converted";
  xlsx.writeFile(newWorkbook, `${baseFile}.xlsx`);
  fs.writeFileSync(`${baseFile}.json`, JSON.stringify(results, null, 2));

  console.log(`\n✅ Results saved to:`);
  console.log(`📄 ${baseFile}.xlsx`);
  console.log(`📄 ${baseFile}.json`);
  console.log("💾 Results inserted into MySQL database.");

  db.end();
}

// ✅ Run
main();
