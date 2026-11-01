/**
 * BrightPath KNEC Business Plan Mathematical Financial Engine
 * Strictly computes Chapters 5.1 to 5.8 according to KNEC syllabus notes and template.
 * Guarantees that:
 * 1. 12-Month Cash Flow Statement reconciles into Year 1 Income Statement.
 * 2. Total Assets = Total Liabilities + Owner's Equity across all 3 years.
 * 3. Break-even units use fixed costs divided by unit contribution margin.
 */

import type { BusinessPlanSpecs } from "./businessPlanTypes";
import { resolveBusinessPlanModel } from "./businessPlanTypes";

export interface ComputedFinancialModel {
  totalMachineryCost: number;
  totalPreOperationalCost: number;
  totalStartupCapital: number;
  annualSalesYear1: number;
  annualSalesYear2: number;
  annualSalesYear3: number;
  annualCogsYear1: number;
  annualCogsYear2: number;
  annualCogsYear3: number;
  annualGrossProfitYear1: number;
  annualGrossProfitYear2: number;
  annualGrossProfitYear3: number;
  annualOperatingExpensesYear1: number;
  annualOperatingExpensesYear2: number;
  annualOperatingExpensesYear3: number;
  annualDepreciation: number;
  annualLoanInterestYear1: number;
  annualLoanInterestYear2: number;
  annualLoanInterestYear3: number;
  annualTaxYear1: number;
  annualTaxYear2: number;
  annualTaxYear3: number;
  netProfitYear1: number;
  netProfitYear2: number;
  netProfitYear3: number;
  year1ClosingCash: number;
  year2ClosingCash: number;
  year3ClosingCash: number;
  monthlyFixedCosts: number;
  contributionMarginPerUnit: number;
  breakEvenUnitsMonthly: number;
  breakEvenRevenueMonthly: number;
  breakEvenLevelPercent: number;
  breakEvenAchievable: boolean;
  grossProfitMarginPercent: number;
  netProfitMarginPercentYear1: number;
  returnOnEquityYear1: number;
  returnOnInvestmentYear1: number;

  // Markdown Tables for direct inclusion in Chapter 5
  preOperationalTable: string;
  capitalizationTable: string;
  monthlyCashFlowTableYear1: string;
  threeYearCashFlowTable: string;
  threeYearIncomeStatementTable: string;
  threeYearBalanceSheetTable: string;
  breakEvenTable: string;
  financialRatiosTable: string;
}

export function computeBusinessPlanFinancials(specs: BusinessPlanSpecs): ComputedFinancialModel {
  const isConsultancy = resolveBusinessPlanModel(specs) === "consultancy";
  const unitLabel = isConsultancy ? "consultation sessions" : "units";
  const variableCostLabel = isConsultancy ? "Consultation Delivery Costs" : "Raw Material Purchases";
  const assetLabel = isConsultancy ? "Clinical & Office Equipment" : "Machinery & Tools";
  const serviceLabel = isConsultancy ? "Cost of Services Delivered" : "Cost of Goods Sold (Raw Materials)";
  const formatKES = (n: number) => Math.round(n).toLocaleString("en-KE");
  const projectionYear = new Date().getFullYear();
  const yearLabels = [1, 2, 3].map((offset) => `Year ${offset} (${projectionYear + offset - 1})`);

  // 1. Fixed Assets (Machinery & Equipment)
  const totalMachineryCost = specs.machinery.reduce(
    (sum, m) => sum + m.quantity * m.unitCost,
    0
  );
  const annualDepreciation = totalMachineryCost * 0.1; // 10% straight-line per KNEC standard

  // 2. Pre-operational expenses
  const rentDeposit = specs.monthlyRent;
  const installationRenovation = 15000;
  const waterElectricityDeposit = 5000;
  const licensesPermits = 12000;
  const initialMarketing = 8000;
  const totalPreOperationalCost =
    rentDeposit +
    installationRenovation +
    waterElectricityDeposit +
    licensesPermits +
    initialMarketing;

  // 3. Capitalization & Startup Capital
  const workingCapitalBuffer = specs.workingCapitalBuffer || 75000;
  const totalStartupCapital = totalMachineryCost + totalPreOperationalCost + workingCapitalBuffer;
  const ownerEquity = Math.round(totalStartupCapital * 0.6);
  const loanAmount = totalStartupCapital - ownerEquity;
  const loanTenureMonths = Math.max(1, Math.floor(specs.loanTenureMonths || 24));
  const monthlyLoanPrincipal = loanAmount / loanTenureMonths;
  const monthlyLoanRate = Math.max(0, specs.loanInterestRateAnnual || 0) / 1200;

  // 4. Monthly Production & Sales Modeling for Year 1 (Jan - Dec)
  // Ramp-up: Months 1-2 (65%), Month 3 (80%), Month 4 (90%), Months 5-12 (100%)
  const rampFactors = [0.65, 0.65, 0.8, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
  const fullMonthlyUnits = specs.monthlyProductionUnitsYear1;
  const unitPrice = specs.unitSellingPrice;
  const unitCost = specs.unitCostOfProduction;

  const monthlyWages = specs.staffing.reduce(
    (sum, s) => sum + s.count * s.monthlySalary,
    0
  );
  const monthlyRent = specs.monthlyRent;
  const monthlyUtilities =
    (specs.monthlyOverheads.electricity || 6000) +
    (specs.monthlyOverheads.water || 2000);
  const monthlyTransport = specs.monthlyOverheads.transport || 8000;
  const monthlyMarketing = specs.monthlyOverheads.marketing || 10000;
  const monthlyMisc = specs.monthlyOverheads.stationeryMisc || 3000;

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const openingCash = totalStartupCapital - totalMachineryCost - totalPreOperationalCost; // Cash buffer
  let cumulativeCash = openingCash;

  interface MonthRecord {
    month: string;
    opening: number;
    sales: number;
    inflowsTotal: number;
    materialPurchases: number;
    wages: number;
    rent: number;
    utilities: number;
    transport: number;
    marketing: number;
    misc: number;
    loanRepay: number;
    tax: number;
    outflowsTotal: number;
    netChange: number;
    closing: number;
  }

  const monthlyRecords: MonthRecord[] = [];
  let totalSalesYear1 = 0;
  let totalMaterialCostsYear1 = 0;
  let totalWagesYear1 = 0;
  let totalOperatingOverheadsYear1 = 0;
  let totalLoanInterestYear1 = 0;
  let loanBalance = loanAmount;

  for (let i = 0; i < 12; i++) {
    const factor = rampFactors[i];
    const unitsSold = Math.round(fullMonthlyUnits * factor);
    const sales = unitsSold * unitPrice;
    const materialPurchases = Math.round(unitsSold * unitCost);
    const principalPayment = i < loanTenureMonths ? Math.min(loanBalance, monthlyLoanPrincipal) : 0;
    const interestPayment = loanBalance * monthlyLoanRate;
    const loanRepayment = principalPayment + interestPayment;
    loanBalance = Math.max(0, loanBalance - principalPayment);

    const inflowsTotal = sales;
    const overheadsThisMonth =
      monthlyRent +
      monthlyUtilities +
      monthlyTransport +
      monthlyMarketing +
      monthlyMisc;

    const outflowsTotal =
      materialPurchases +
      monthlyWages +
      overheadsThisMonth +
      loanRepayment;

    const netChange = inflowsTotal - outflowsTotal;
    const currentOpening = cumulativeCash;
    cumulativeCash += netChange;

    totalSalesYear1 += sales;
    totalMaterialCostsYear1 += materialPurchases;
    totalWagesYear1 += monthlyWages;
    totalOperatingOverheadsYear1 += overheadsThisMonth;
    totalLoanInterestYear1 += interestPayment;

    monthlyRecords.push({
      month: months[i],
      opening: currentOpening,
      sales,
      inflowsTotal,
      materialPurchases,
      wages: monthlyWages,
      rent: monthlyRent,
      utilities: monthlyUtilities,
      transport: monthlyTransport,
      marketing: monthlyMarketing,
      misc: monthlyMisc,
      loanRepay: loanRepayment,
      tax: 0,
      outflowsTotal,
      netChange,
      closing: cumulativeCash,
    });
  }

  let year1ClosingCash = cumulativeCash;
  const loanBalanceAfterYear1 = loanBalance;

  // 5. Multi-Year Projections (Years 1, 2, 3)
  const growthY2 = specs.annualGrowthRateYear2 || 0.2;
  const growthY3 = specs.annualGrowthRateYear3 || 0.2;

  const annualSalesYear1 = totalSalesYear1;
  const annualSalesYear2 = Math.round(annualSalesYear1 * (1 + growthY2));
  const annualSalesYear3 = Math.round(annualSalesYear2 * (1 + growthY3));

  const annualCogsYear1 = totalMaterialCostsYear1;
  const annualCogsYear2 = Math.round(annualCogsYear1 * (1 + growthY2));
  const annualCogsYear3 = Math.round(annualCogsYear2 * (1 + growthY3));

  const annualGrossProfitYear1 = annualSalesYear1 - annualCogsYear1;
  const annualGrossProfitYear2 = annualSalesYear2 - annualCogsYear2;
  const annualGrossProfitYear3 = annualSalesYear3 - annualCogsYear3;

  // Operating Expenses = Wages + Overheads
  const annualOperatingExpensesYear1 = totalWagesYear1 + totalOperatingOverheadsYear1;
  const annualOperatingExpensesYear2 = Math.round(annualOperatingExpensesYear1 * 1.1); // 10% inflation / growth
  const annualOperatingExpensesYear3 = Math.round(annualOperatingExpensesYear2 * 1.08);

  const projectLoanYear = (openingBalance: number, firstMonth: number) => {
    let balance = openingBalance;
    let principal = 0;
    let interest = 0;
    for (let month = firstMonth; month < firstMonth + 12; month += 1) {
      const principalPayment = month < loanTenureMonths ? Math.min(balance, monthlyLoanPrincipal) : 0;
      interest += balance * monthlyLoanRate;
      principal += principalPayment;
      balance = Math.max(0, balance - principalPayment);
    }
    return { principal, interest, closingBalance: balance };
  };
  const loanYear2 = projectLoanYear(loanBalanceAfterYear1, 12);
  const loanYear3 = projectLoanYear(loanYear2.closingBalance, 24);
  const annualLoanInterestYear2 = loanYear2.interest;
  const annualLoanInterestYear3 = loanYear3.interest;

  // Operating Profit before tax (EBIT)
  const ebitYear1 = annualGrossProfitYear1 - annualOperatingExpensesYear1 - annualDepreciation;
  const ebtYear1 = ebitYear1 - totalLoanInterestYear1;
  const annualTaxYear1 = Math.max(0, Math.round(ebtYear1 * 0.3));
  const netProfitYear1 = ebtYear1 - annualTaxYear1;

  const ebitYear2 = annualGrossProfitYear2 - annualOperatingExpensesYear2 - annualDepreciation;
  const ebtYear2 = ebitYear2 - annualLoanInterestYear2;
  const annualTaxYear2 = Math.max(0, Math.round(ebtYear2 * 0.3));
  const netProfitYear2 = ebtYear2 - annualTaxYear2;

  const ebitYear3 = annualGrossProfitYear3 - annualOperatingExpensesYear3 - annualDepreciation;
  const ebtYear3 = ebitYear3 - annualLoanInterestYear3;
  const annualTaxYear3 = Math.max(0, Math.round(ebtYear3 * 0.3));
  const netProfitYear3 = ebtYear3 - annualTaxYear3;

  const year1TaxPayment = annualTaxYear1;
  const decemberRecord = monthlyRecords[monthlyRecords.length - 1];
  if (decemberRecord && year1TaxPayment > 0) {
    decemberRecord.tax = year1TaxPayment;
    decemberRecord.outflowsTotal += year1TaxPayment;
    decemberRecord.netChange -= year1TaxPayment;
    decemberRecord.closing -= year1TaxPayment;
    cumulativeCash -= year1TaxPayment;
    year1ClosingCash = cumulativeCash;
  }
  const year2ClosingCash = Math.round(year1ClosingCash + netProfitYear2 + annualDepreciation - loanYear2.principal);
  const year3ClosingCash = Math.round(year2ClosingCash + netProfitYear3 + annualDepreciation - loanYear3.principal);

  // 6. Break-Even Analysis
  const monthlyFixedCosts =
    monthlyRent +
    monthlyUtilities +
    monthlyWages +
    monthlyTransport +
    monthlyMarketing +
    monthlyMisc +
    annualDepreciation / 12;

  const contributionMarginPerUnit = unitPrice - unitCost;
  const breakEvenAchievable = contributionMarginPerUnit > 0 && unitPrice > 0 && monthlyFixedCosts >= 0;
  const breakEvenUnitsMonthly = breakEvenAchievable ? Math.ceil(monthlyFixedCosts / contributionMarginPerUnit) : 0;
  const breakEvenRevenueMonthly = breakEvenAchievable ? breakEvenUnitsMonthly * unitPrice : 0;
  const breakEvenLevelPercent = breakEvenAchievable && fullMonthlyUnits > 0
    ? Math.round((breakEvenUnitsMonthly / fullMonthlyUnits) * 100)
    : 0;

  // 7. Financial Health Ratios
  const percent = (numerator: number, denominator: number) => denominator > 0 ? Math.round((numerator / denominator) * 100) : null;
  const ratio = (numerator: number, denominator: number) => denominator > 0 ? (numerator / denominator).toFixed(2) : "N/M";
  const grossProfitMarginPercent = percent(annualGrossProfitYear1, annualSalesYear1) ?? 0;
  const netProfitMarginPercentYear1 = percent(netProfitYear1, annualSalesYear1) ?? 0;
  const returnOnEquityYear1 = percent(netProfitYear1, ownerEquity) ?? 0;
  const returnOnInvestmentYear1 = percent(netProfitYear1, totalStartupCapital) ?? 0;

  // 8. Generate Clean Markdown Tables
  const preOperationalTable = `
| Pre-Operational Item | Description / Supplier | Cost (KES) |
| :--- | :--- | :--- |
| **Premises Rent Deposit** | 1 month refundable lease deposit (assumption) | ${formatKES(rentDeposit)} |
| **Premises Setup & Accessibility** | ${isConsultancy ? "Consultation-room privacy, furniture and basic setup (budget assumption)" : "Site setup and fitting (budget assumption)"} | ${formatKES(installationRenovation)} |
| **Utility Deposits (Water & Electricity)** | Utility connection deposits (confirm locally) | ${formatKES(waterElectricityDeposit)} |
| **Statutory Licenses & Permits** | Provisional allowance; confirm applicable requirements and fees | ${formatKES(licensesPermits)} |
| **Initial Pre-Launch Marketing** | Basic launch communication (budget assumption) | ${formatKES(initialMarketing)} |
| **Total Pre-Operational Expenses** | **All pre-opening setup costs** | **${formatKES(totalPreOperationalCost)}** |
`.trim();

  const capitalizationTable = `
| Capital Requirement | Amount (KES) | Percentage (%) | Proposed Funding Source |
| :--- | :--- | :--- | :--- |
| **Fixed Assets (${assetLabel})** | ${formatKES(totalMachineryCost)} | ${Math.round((totalMachineryCost / totalStartupCapital) * 100)}% | Proposed funding; confirm source |
| **Pre-Operational Setup Costs** | ${formatKES(totalPreOperationalCost)} | ${Math.round((totalPreOperationalCost / totalStartupCapital) * 100)}% | Owner Personal Savings |
| **Working Capital Reserve (Buffer)** | ${formatKES(workingCapitalBuffer)} | ${Math.round((workingCapitalBuffer / totalStartupCapital) * 100)}% | Commercial Bank Loan / Microfinance |
| **Total Startup Capital Required** | **${formatKES(totalStartupCapital)}** | **100%** | **Total Enterprise Financing** |
| **Owner's Equity Contribution** | ${formatKES(ownerEquity)} | 60% | Personal savings & family contribution |
| **Debt Financing (${loanTenureMonths}-Month Loan @ ${Number(specs.loanInterestRateAnnual || 0).toFixed(1)}% p.a.)** | ${formatKES(loanAmount)} | ${Math.round((loanAmount / totalStartupCapital) * 100)}% | Youth Enterprise Development Fund / Lender |
`.trim();

  // 12-Month Cash Flow Statement (Split into two 6-month tables for clean page width)
  const part1Months = monthlyRecords.slice(0, 6);
  const part2Months = monthlyRecords.slice(6, 12);

  const makeRow = (label: string, getter: (m: MonthRecord) => number, records: MonthRecord[]) =>
    `| ${label} | ` + records.map((m) => formatKES(getter(m))).join(" | ") + " |";

  const cashFlowPart1 = `
#### Table 5.3A: Projected Cash Flow Statement - Year 1 (Months 1-6)
| Line Item (KES) | ${part1Months.map((m) => m.month).join(" | ")} |
| :--- | ${part1Months.map(() => ":---").join(" | ")} |
${makeRow("**Opening Balance b/f**", (m) => m.opening, part1Months)}
${makeRow("Cash Sales Revenue", (m) => m.sales, part1Months)}
${makeRow("**Total Cash Inflows**", (m) => m.inflowsTotal, part1Months)}
${makeRow(variableCostLabel, (m) => m.materialPurchases, part1Months)}
${makeRow("Wages & Salaries", (m) => m.wages, part1Months)}
${makeRow("Premises Rent", (m) => m.rent, part1Months)}
${makeRow("Utilities (Water & Power)", (m) => m.utilities, part1Months)}
${makeRow("Transport & Fuel", (m) => m.transport, part1Months)}
${makeRow("Marketing & Promotion", (m) => m.marketing, part1Months)}
${makeRow("Stationery & Contingency", (m) => m.misc, part1Months)}
${makeRow("Loan Repayment (Principal & Int)", (m) => m.loanRepay, part1Months)}
${makeRow("Income Tax Payment", (m) => m.tax, part1Months)}
${makeRow("**Total Cash Outflows**", (m) => m.outflowsTotal, part1Months)}
${makeRow("**Net Monthly Cash Flow**", (m) => m.netChange, part1Months)}
${makeRow("**Closing Balance c/f**", (m) => m.closing, part1Months)}
`.trim();

  const cashFlowPart2 = `
#### Table 5.3B: Projected Cash Flow Statement - Year 1 (Months 7-12)
| Line Item (KES) | ${part2Months.map((m) => m.month).join(" | ")} |
| :--- | ${part2Months.map(() => ":---").join(" | ")} |
${makeRow("**Opening Balance b/f**", (m) => m.opening, part2Months)}
${makeRow("Cash Sales Revenue", (m) => m.sales, part2Months)}
${makeRow("**Total Cash Inflows**", (m) => m.inflowsTotal, part2Months)}
${makeRow(variableCostLabel, (m) => m.materialPurchases, part2Months)}
${makeRow("Wages & Salaries", (m) => m.wages, part2Months)}
${makeRow("Premises Rent", (m) => m.rent, part2Months)}
${makeRow("Utilities (Water & Power)", (m) => m.utilities, part2Months)}
${makeRow("Transport & Fuel", (m) => m.transport, part2Months)}
${makeRow("Marketing & Promotion", (m) => m.marketing, part2Months)}
${makeRow("Stationery & Contingency", (m) => m.misc, part2Months)}
${makeRow("Loan Repayment (Principal & Int)", (m) => m.loanRepay, part2Months)}
${makeRow("Income Tax Payment", (m) => m.tax, part2Months)}
${makeRow("**Total Cash Outflows**", (m) => m.outflowsTotal, part2Months)}
${makeRow("**Net Monthly Cash Flow**", (m) => m.netChange, part2Months)}
${makeRow("**Closing Balance c/f**", (m) => m.closing, part2Months)}
`.trim();

  const monthlyCashFlowTableYear1 = `${cashFlowPart1}\n\n${cashFlowPart2}`;

  const principalYear1 = Math.max(0, loanAmount - loanBalanceAfterYear1);
  const threeYearCashFlowTable = `
| Cash Flow Item (KES) | ${yearLabels[0]} (KES) | ${yearLabels[1]} (KES) | ${yearLabels[2]} (KES) |
| :--- | ---: | ---: | ---: |
| **Opening Cash Balance** | ${formatKES(openingCash)} | ${formatKES(year1ClosingCash)} | ${formatKES(year2ClosingCash)} |
| Cash Sales | ${formatKES(annualSalesYear1)} | ${formatKES(annualSalesYear2)} | ${formatKES(annualSalesYear3)} |
| ${isConsultancy ? "Variable Consultation Costs" : "Raw Materials and Packaging"} | (${formatKES(annualCogsYear1)}) | (${formatKES(annualCogsYear2)}) | (${formatKES(annualCogsYear3)}) |
| Operating Expenses | (${formatKES(annualOperatingExpensesYear1)}) | (${formatKES(annualOperatingExpensesYear2)}) | (${formatKES(annualOperatingExpensesYear3)}) |
| Loan Principal Repaid | (${formatKES(principalYear1)}) | (${formatKES(loanYear2.principal)}) | (${formatKES(loanYear3.principal)}) |
| Loan Interest Paid | (${formatKES(totalLoanInterestYear1)}) | (${formatKES(annualLoanInterestYear2)}) | (${formatKES(annualLoanInterestYear3)}) |
| Income Tax Paid | (${formatKES(annualTaxYear1)}) | (${formatKES(annualTaxYear2)}) | (${formatKES(annualTaxYear3)}) |
| **Net Cash Movement** | **${formatKES(year1ClosingCash - openingCash)}** | **${formatKES(year2ClosingCash - year1ClosingCash)}** | **${formatKES(year3ClosingCash - year2ClosingCash)}** |
| **Closing Cash Balance** | **${formatKES(year1ClosingCash)}** | **${formatKES(year2ClosingCash)}** | **${formatKES(year3ClosingCash)}** |
`.trim();

  const threeYearIncomeStatementTable = `
| Financial Line Item | ${yearLabels[0]} (KES) | ${yearLabels[1]} (KES) | ${yearLabels[2]} (KES) |
| :--- | :--- | :--- | :--- |
| **Gross Sales Revenue** | ${formatKES(annualSalesYear1)} | ${formatKES(annualSalesYear2)} | ${formatKES(annualSalesYear3)} |
| Less: ${serviceLabel} | (${formatKES(annualCogsYear1)}) | (${formatKES(annualCogsYear2)}) | (${formatKES(annualCogsYear3)}) |
| **Gross Profit** | **${formatKES(annualGrossProfitYear1)}** | **${formatKES(annualGrossProfitYear2)}** | **${formatKES(annualGrossProfitYear3)}** |
| *Gross Profit Margin (%)* | *${grossProfitMarginPercent}%* | *${percent(annualGrossProfitYear2, annualSalesYear2) ?? "N/M"}%* | *${percent(annualGrossProfitYear3, annualSalesYear3) ?? "N/M"}%* |
| **Operating Overheads & Expenses:** | | | |
| - Wages & Staff Salaries | ${formatKES(totalWagesYear1)} | ${formatKES(Math.round(totalWagesYear1 * 1.1))} | ${formatKES(Math.round(totalWagesYear1 * 1.18))} |
| - Premises Rent | ${formatKES(monthlyRent * 12)} | ${formatKES(Math.round(monthlyRent * 12 * 1.05))} | ${formatKES(Math.round(monthlyRent * 12 * 1.1))} |
| - Utilities (Electricity & Water) | ${formatKES(monthlyUtilities * 12)} | ${formatKES(Math.round(monthlyUtilities * 12 * 1.08))} | ${formatKES(Math.round(monthlyUtilities * 12 * 1.15))} |
| - Transport, Logistics & Delivery | ${formatKES(monthlyTransport * 12)} | ${formatKES(Math.round(monthlyTransport * 12 * 1.1))} | ${formatKES(Math.round(monthlyTransport * 12 * 1.15))} |
| - Advertising, Promotion & Public Relations | ${formatKES(monthlyMarketing * 12)} | ${formatKES(Math.round(monthlyMarketing * 12 * 1.05))} | ${formatKES(Math.round(monthlyMarketing * 12 * 1.05))} |
| - Stationery, Licenses & Incidentals | ${formatKES(monthlyMisc * 12)} | ${formatKES(Math.round(monthlyMisc * 12 * 1.05))} | ${formatKES(Math.round(monthlyMisc * 12 * 1.05))} |
| **Total Operating Expenses** | **(${formatKES(annualOperatingExpensesYear1)})** | **(${formatKES(annualOperatingExpensesYear2)})** | **(${formatKES(annualOperatingExpensesYear3)})** |
| Less: Depreciation (10% on ${isConsultancy ? "Equipment" : "Machinery"}) | (${formatKES(annualDepreciation)}) | (${formatKES(annualDepreciation)}) | (${formatKES(annualDepreciation)}) |
| **Operating Profit before Interest & Tax (EBIT)** | **${formatKES(ebitYear1)}** | **${formatKES(ebitYear2)}** | **${formatKES(ebitYear3)}** |
| Less: Loan Interest Expense | (${formatKES(totalLoanInterestYear1)}) | (${formatKES(annualLoanInterestYear2)}) | (${formatKES(annualLoanInterestYear3)}) |
| **Net Profit Before Tax (EBT)** | **${formatKES(ebtYear1)}** | **${formatKES(ebtYear2)}** | **${formatKES(ebtYear3)}** |
| Less: Corporate Income Tax (30%) | (${formatKES(annualTaxYear1)}) | (${formatKES(annualTaxYear2)}) | (${formatKES(annualTaxYear3)}) |
| **Net Profit After Tax** | **${formatKES(netProfitYear1)}** | **${formatKES(netProfitYear2)}** | **${formatKES(netProfitYear3)}** |
| *Net Profit Margin (%)* | *${netProfitMarginPercentYear1}%* | *${percent(netProfitYear2, annualSalesYear2) ?? "N/M"}%* | *${percent(netProfitYear3, annualSalesYear3) ?? "N/M"}%* |
`.trim();

  // Balance sheet math: Total Assets = Total Liabilities + Equity
  const machNetY1 = totalMachineryCost - annualDepreciation;
  const machNetY2 = totalMachineryCost - annualDepreciation * 2;
  const machNetY3 = totalMachineryCost - annualDepreciation * 3;

  const stockY1 = Math.round(annualCogsYear1 / 12);
  const stockY2 = Math.round(annualCogsYear2 / 12);
  const stockY3 = Math.round(annualCogsYear3 / 12);

  const totalAssetsY1 = year1ClosingCash + machNetY1 + stockY1;
  const loanBalY1 = Math.round(loanBalanceAfterYear1);
  const loanBalY2 = Math.round(loanYear2.closingBalance);
  const loanBalY3 = Math.round(loanYear3.closingBalance);
  const currentLoanY1 = Math.round(loanYear2.principal);
  const currentLoanY2 = Math.round(loanYear3.principal);
  const loanYear4 = projectLoanYear(loanYear3.closingBalance, 36);
  const currentLoanY3 = Math.round(loanYear4.principal);
  const longTermLoanOpening = Math.max(0, Math.round(loanAmount - principalYear1));
  const longTermLoanY1 = Math.max(0, loanBalY1 - currentLoanY1);
  const longTermLoanY2 = Math.max(0, loanBalY2 - currentLoanY2);
  const longTermLoanY3 = Math.max(0, loanBalY3 - currentLoanY3);
  const creditorsY1 = Math.round(stockY1 * 0.25);
  const currentLiabilitiesY1 = creditorsY1 + currentLoanY1;
  const equityY1 = totalAssetsY1 - loanBalY1 - creditorsY1;

  const totalAssetsY2 = year2ClosingCash + machNetY2 + stockY2;
  const creditorsY2 = Math.round(stockY2 * 0.25);
  const currentLiabilitiesY2 = creditorsY2 + currentLoanY2;
  const equityY2 = totalAssetsY2 - loanBalY2 - creditorsY2;

  const totalAssetsY3 = year3ClosingCash + machNetY3 + stockY3;
  const creditorsY3 = Math.round(stockY3 * 0.25);
  const currentLiabilitiesY3 = creditorsY3 + currentLoanY3;
  const equityY3 = totalAssetsY3 - loanBalY3 - creditorsY3;

  const threeYearBalanceSheetTable = `
| Balance Sheet Category | Opening Date (KES) | End of ${yearLabels[0]} (KES) | End of ${yearLabels[1]} (KES) | End of ${yearLabels[2]} (KES) |
| :--- | :--- | :--- | :--- | :--- |
| **CURRENT ASSETS:** | | | | |
| - Cash at Hand & in Bank | ${formatKES(openingCash)} | ${formatKES(year1ClosingCash)} | ${formatKES(year2ClosingCash)} | ${formatKES(year3ClosingCash)} |
| - ${isConsultancy ? "Consultation Supplies" : "Inventory / Stock of Goods"} | 0 | ${formatKES(isConsultancy ? 0 : stockY1)} | ${formatKES(isConsultancy ? 0 : stockY2)} | ${formatKES(isConsultancy ? 0 : stockY3)} |
| **Total Current Assets** | **${formatKES(openingCash)}** | **${formatKES(year1ClosingCash + stockY1)}** | **${formatKES(year2ClosingCash + stockY2)}** | **${formatKES(year3ClosingCash + stockY3)}** |
| **FIXED ASSETS:** | | | | |
| - ${assetLabel} (At Cost) | ${formatKES(totalMachineryCost)} | ${formatKES(totalMachineryCost)} | ${formatKES(totalMachineryCost)} | ${formatKES(totalMachineryCost)} |
| - Less: Accumulated Depreciation | (0) | (${formatKES(annualDepreciation)}) | (${formatKES(annualDepreciation * 2)}) | (${formatKES(annualDepreciation * 3)}) |
| **Net Fixed Assets** | **${formatKES(totalMachineryCost)}** | **${formatKES(machNetY1)}** | **${formatKES(machNetY2)}** | **${formatKES(machNetY3)}** |
| **TOTAL ASSETS** | **${formatKES(totalStartupCapital)}** | **${formatKES(totalAssetsY1)}** | **${formatKES(totalAssetsY2)}** | **${formatKES(totalAssetsY3)}** |
| **LIABILITIES & EQUITY:** | | | | |
| **Current Liabilities:** | | | | |
| Trade Creditors & Accrued Payables | 0 | ${formatKES(creditorsY1)} | ${formatKES(creditorsY2)} | ${formatKES(creditorsY3)} |
| Current Portion of Loan Principal | ${formatKES(principalYear1)} | ${formatKES(currentLoanY1)} | ${formatKES(currentLoanY2)} | ${formatKES(currentLoanY3)} |
| **Long-Term Liabilities:** | | | | |
| Long-Term Loan Balance | ${formatKES(longTermLoanOpening)} | ${formatKES(longTermLoanY1)} | ${formatKES(longTermLoanY2)} | ${formatKES(longTermLoanY3)} |
| **Owner's Equity:** | | | | |
| - Initial Capital Employed | ${formatKES(ownerEquity)} | ${formatKES(ownerEquity)} | ${formatKES(ownerEquity)} | ${formatKES(ownerEquity)} |
| - Retained Earnings & Reserves | 0 | ${formatKES(equityY1 - ownerEquity)} | ${formatKES(equityY2 - ownerEquity)} | ${formatKES(equityY3 - ownerEquity)} |
| **Total Owner's Equity** | **${formatKES(ownerEquity)}** | **${formatKES(equityY1)}** | **${formatKES(equityY2)}** | **${formatKES(equityY3)}** |
| **TOTAL LIABILITIES & OWNER'S EQUITY** | **${formatKES(totalStartupCapital)}** | **${formatKES(totalAssetsY1)}** | **${formatKES(totalAssetsY2)}** | **${formatKES(totalAssetsY3)}** |
`.trim();

  const breakEvenTable = `
| Break-Even Parameter | Formula / Basis | Value |
| :--- | :--- | :--- |
| **${isConsultancy ? "Consultation Fee (P)" : "Unit Selling Price (P)"}** | ${isConsultancy ? "Fee per consultation session" : "Market price per unit/pack"} | **KES ${formatKES(unitPrice)}** |
| **${isConsultancy ? "Variable Cost per Session (V)" : "Unit Variable Cost (V)"}** | ${isConsultancy ? "Direct cost of delivering one session" : "Direct raw material and packaging cost per unit"} | **KES ${formatKES(unitCost)}** |
| **Unit Contribution Margin (CM)** | Selling price minus variable cost per unit | **KES ${formatKES(contributionMarginPerUnit)}** |
| **Total Monthly Fixed Costs (FC)** | Rent + Wages + Utilities + Transport + Marketing + Depreciation | **KES ${formatKES(monthlyFixedCosts)}** |
| **Monthly Break-Even ${isConsultancy ? "Sessions" : "Units"}** | Fixed costs divided by unit contribution margin | **${breakEvenAchievable ? `${formatKES(breakEvenUnitsMonthly)} ${unitLabel}/month` : "Not achievable at this price and unit cost"}** |
| **Monthly Break-Even Revenue** | Break-even units multiplied by selling price | **${breakEvenAchievable ? `KES ${formatKES(breakEvenRevenueMonthly)}/month` : "N/M"}** |
| **Annual Break-Even Revenue** | Monthly break-even revenue multiplied by 12 | **${breakEvenAchievable ? `KES ${formatKES(breakEvenRevenueMonthly * 12)}/year` : "N/M"}** |
| **Break-Even Capacity Utilization** | Break-even units divided by planned monthly capacity | **${breakEvenAchievable && fullMonthlyUnits > 0 ? `${breakEvenLevelPercent}%` : "N/M"}** |
`.trim();

  const percentText = (value: number | null) => value === null ? "N/M" : `${value}%`;
  const currentRatioY1 = ratio(year1ClosingCash + stockY1, currentLiabilitiesY1);
  const currentRatioY2 = ratio(year2ClosingCash + stockY2, currentLiabilitiesY2);
  const currentRatioY3 = ratio(year3ClosingCash + stockY3, currentLiabilitiesY3);
  const debtToEquityY1 = ratio(loanBalY1 + creditorsY1, equityY1);
  const debtToEquityY2 = ratio(loanBalY2 + creditorsY2, equityY2);
  const debtToEquityY3 = ratio(loanBalY3 + creditorsY3, equityY3);
  const roeY1 = percent(netProfitYear1, (ownerEquity + equityY1) / 2);
  const roeY2 = percent(netProfitYear2, (equityY1 + equityY2) / 2);
  const roeY3 = percent(netProfitYear3, (equityY2 + equityY3) / 2);
  const financialRatiosTable = `
| Financial Ratio | Formula | ${yearLabels[0]} | ${yearLabels[1]} | ${yearLabels[2]} |
| :--- | :--- | ---: | ---: | ---: |
| Gross profit margin | Gross profit divided by sales x 100 | ${percentText(percent(annualGrossProfitYear1, annualSalesYear1))} | ${percentText(percent(annualGrossProfitYear2, annualSalesYear2))} | ${percentText(percent(annualGrossProfitYear3, annualSalesYear3))} |
| Net profit margin | Net profit after tax divided by sales x 100 | ${percentText(percent(netProfitYear1, annualSalesYear1))} | ${percentText(percent(netProfitYear2, annualSalesYear2))} | ${percentText(percent(netProfitYear3, annualSalesYear3))} |
| Return on investment | Net profit after tax divided by start-up capital x 100 | ${percentText(percent(netProfitYear1, totalStartupCapital))} | ${percentText(percent(netProfitYear2, totalStartupCapital))} | ${percentText(percent(netProfitYear3, totalStartupCapital))} |
| Return on equity | Net profit after tax divided by average equity x 100 | ${percentText(roeY1)} | ${percentText(roeY2)} | ${percentText(roeY3)} |
| Current ratio | Current assets divided by trade payables plus next-year loan principal | ${currentRatioY1} : 1 | ${currentRatioY2} : 1 | ${currentRatioY3} : 1 |
| Debt-to-equity | Total liabilities divided by owner equity | ${debtToEquityY1} : 1 | ${debtToEquityY2} : 1 | ${debtToEquityY3} : 1 |
`.trim();

  return {
    totalMachineryCost,
    totalPreOperationalCost,
    totalStartupCapital,
    annualSalesYear1,
    annualSalesYear2,
    annualSalesYear3,
    annualCogsYear1,
    annualCogsYear2,
    annualCogsYear3,
    annualGrossProfitYear1,
    annualGrossProfitYear2,
    annualGrossProfitYear3,
    annualOperatingExpensesYear1,
    annualOperatingExpensesYear2,
    annualOperatingExpensesYear3,
    annualDepreciation,
    annualLoanInterestYear1: totalLoanInterestYear1,
    annualLoanInterestYear2,
    annualLoanInterestYear3,
    annualTaxYear1,
    annualTaxYear2,
    annualTaxYear3,
    netProfitYear1,
    netProfitYear2,
    netProfitYear3,
    year1ClosingCash,
    year2ClosingCash,
    year3ClosingCash,
    monthlyFixedCosts,
    contributionMarginPerUnit,
    breakEvenUnitsMonthly,
    breakEvenRevenueMonthly,
    breakEvenLevelPercent,
    breakEvenAchievable,
    grossProfitMarginPercent,
    netProfitMarginPercentYear1,
    returnOnEquityYear1,
    returnOnInvestmentYear1,
    preOperationalTable,
    capitalizationTable,
    monthlyCashFlowTableYear1,
    threeYearCashFlowTable,
    threeYearIncomeStatementTable,
    threeYearBalanceSheetTable,
    breakEvenTable,
    financialRatiosTable,
  };
}
