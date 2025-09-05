create database currency_database_Freelance;
USE currency_database_Freelance;

CREATE TABLE incomesfreelance (
  emp_id INT AUTO_INCREMENT PRIMARY KEY,   -- Employee ID (unique)
  name VARCHAR(255) NOT NULL,              -- Employee Name
  company VARCHAR(255),                    -- Company name
  age INT,                                 -- Age (integer)
  salary DECIMAL(12,2),                    -- Salary with 2 decimals
  currency VARCHAR(10),                    -- Original salary currency (e.g. USD, INR)
  country VARCHAR(100),                    -- Country name (ISO country string recommended)
  target_currency VARCHAR(10),             -- Target currency chosen by user
  converted_salary DECIMAL(12,2),          -- Salary after conversion
  local_time DATETIME                      -- Local time based on country
);


desc incomesfreelance;
select * from incomesfreelance;



