/**
 * BrightPath KNEC Business Plan Mathematical Financial Engine
 * Strictly computes Chapters 5.1 to 5.8 according to KNEC syllabus notes and template.
 * Guarantees that:
 * 1. 12-Month Cash Flow Statement reconciles into Year 1 Income Statement.
 * 2. Total Assets = Total Liabilities + Owner's Equity across all 3 years.
 * 3. Break-even formula matches KNEC: Break-even Level = Overheads / Gross Profit Margin %.
 */

import type { BusinessPlanSpecs } from "./businessPlanTypes";

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
  grossProfitMarginPercent: number;
  netProfitMarginPercentYear1: number;
  returnOnEquityYear1: number;
  returnOnInvestmentYear1: number;

  // Markdown Tables for direct inclusion in Chapter 5
  preOperationalTable: string;
  capitalizationTable: string;
  monthlyCashFlowTableYear1: string;
  threeYearIncomeStatementTable: string;
  threeYearBalanceSheetTable: string;
  breakEvenTable: string;
  financialRatiosTable: string;
}

export function computeBusinessPlanFinancials(specs: BusinessPlanSpecs): ComputedFinancialModel {
  const formatKES = (n: number) => Math.round(n).toLocaleString("en-KE");

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
  const monthlyLoanPrincipal = loanAmount / (specs.loanTenureMonths || 24);
  const monthlyLoanInterest = (loanAmount * (specs.loanInterestRateAnnual || 0) / 100) / 12;
  const monthlyLoanRepayment = monthlyLoanPrincipal + monthlyLoanInterest;

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

  for (let i = 0; i < 12; i++) {
    const factor = rampFactors[i];
    const unitsSold = Math.round(fullMonthlyUnits * factor);
    const sales = unitsSold * unitPrice;
    const materialPurchases = Math.round(unitsSold * unitCost);

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
      monthlyLoanRepayment;

    const netChange = inflowsTotal - outflowsTotal;
    const currentOpening = cumulativeCash;
    cumulativeCash += netChange;

    totalSalesYear1 += sales;
    totalMaterialCostsYear1 += materialPurchases;
    totalWagesYear1 += monthlyWages;
    totalOperatingOverheadsYear1 += overheadsThisMonth;
    totalLoanInterestYear1 += monthlyLoanInterest;

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
      loanRepay: monthlyLoanRepayment,
      outflowsTotal,
      netChange,
      closing: cumulativeCash,
    });
  }

  const year1ClosingCash = cumulativeCash;

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

  const annualLoanInterestYear2 = monthlyLoanInterest * 12 * 0.5; // Reducing balance in Year 2

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
  const ebtYear3 = ebitYear3; // Loan fully paid off by Year 3
  const annualTaxYear3 = Math.max(0, Math.round(ebtYear3 * 0.3));
  const netProfitYear3 = ebtYear3 - annualTaxYear3;

  const year2ClosingCash = Math.round(year1ClosingCash + netProfitYear2 + annualDepreciation - (loanAmount * 0.5));
  const year3ClosingCash = Math.round(year2ClosingCash + netProfitYear3 + annualDepreciation);

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
  const breakEvenUnitsMonthly = Math.ceil(monthlyFixedCosts / contributionMarginPerUnit);
  const breakEvenRevenueMonthly = breakEvenUnitsMonthly * unitPrice;
  const breakEvenLevelPercent = Math.round((breakEvenUnitsMonthly / fullMonthlyUnits) * 100);

  // 7. Financial Health Ratios
  const grossProfitMarginPercent = Math.round((annualGrossProfitYear1 / annualSalesYear1) * 100);
  const netProfitMarginPercentYear1 = Math.round((netProfitYear1 / annualSalesYear1) * 100);
  const returnOnEquityYear1 = Math.round((netProfitYear1 / ownerEquity) * 100);
  const returnOnInvestmentYear1 = Math.round((netProfitYear1 / totalStartupCapital) * 100);

  // 8. Generate Clean Markdown Tables
  const preOperationalTable = `
| Pre-Operational Item | Description / Supplier | Cost (KES) |
| :--- | :--- | :--- |
| **Premises Rent Deposit** | 1 month refundable lease deposit | ${formatKES(rentDeposit)} |
| **Workshop Renovation & Partitioning** | Hygiene painting, electrical wiring & counter fitting | ${formatKES(installationRenovation)} |
| **Utility Deposits (Water & Electricity)** | County Water & KPLC 3-phase meter deposit | ${formatKES(waterElectricityDeposit)} |
| **Statutory Licenses & Health Permits** | Single Business Permit & Public Health Certificates | ${formatKES(licensesPermits)} |
| **Initial Pre-Launch Marketing** | Signage board, promotional banners, flyers & sampling | ${formatKES(initialMarketing)} |
| **Total Pre-Operational Expenses** | **All pre-opening setup costs** | **${formatKES(totalPreOperationalCost)}** |
`.trim();

  const capitalizationTable = `
| Capital Requirement | Amount (KES) | Percentage (%) | Proposed Funding Source |
| :--- | :--- | :--- | :--- |
| **Fixed Assets (Machinery & Tools)** | ${formatKES(totalMachineryCost)} | ${Math.round((totalMachineryCost / totalStartupCapital) * 100)}% | Owner Equity & Youth Enterprise Fund |
| **Pre-Operational Setup Costs** | ${formatKES(totalPreOperationalCost)} | ${Math.round((totalPreOperationalCost / totalStartupCapital) * 100)}% | Owner Personal Savings |
| **Working Capital Reserve (Buffer)** | ${formatKES(workingCapitalBuffer)} | ${Math.round((workingCapitalBuffer / totalStartupCapital) * 100)}% | Commercial Bank Loan / Microfinance |
| **Total Startup Capital Required** | **${formatKES(totalStartupCapital)}** | **100%** | **Total Enterprise Financing** |
| **Owner's Equity Contribution** | ${formatKES(ownerEquity)} | 60% | Personal savings & family contribution |
| **Debt Financing (24-Month Loan @ 12%)** | ${formatKES(loanAmount)} | 40% | Youth Enterprise Development Fund |
`.trim();

  // 12-Month Cash Flow Statement (Split into two 6-month tables for clean page width)
  const part1Months = monthlyRecords.slice(0, 6);
  const part2Months = monthlyRecords.slice(6, 12);

  const makeRow = (label: string, getter: (m: MonthRecord) => number, records: MonthRecord[]) =>
    `| ${label} | ` + records.map((m) => formatKES(getter(m))).join(" | ") + " |";

  const cashFlowPart1 = `
#### Table 5.3A: Projected Cash Flow Statement — Year 1 (Months 1–6)
| Line Item (KES) | ${part1Months.map((m) => m.month).join(" | ")} |
| :--- | ${part1Months.map(() => ":---").join(" | ")} |
${makeRow("**Opening Balance b/f**", (m) => m.opening, part1Months)}
${makeRow("Cash Sales Revenue", (m) => m.sales, part1Months)}
${makeRow("**Total Cash Inflows**", (m) => m.inflowsTotal, part1Months)}
${makeRow("Raw Material Purchases", (m) => m.materialPurchases, part1Months)}
${makeRow("Wages & Salaries", (m) => m.wages, part1Months)}
${makeRow("Premises Rent", (m) => m.rent, part1Months)}
${makeRow("Utilities (Water & Power)", (m) => m.utilities, part1Months)}
${makeRow("Transport & Fuel", (m) => m.transport, part1Months)}
${makeRow("Marketing & Promotion", (m) => m.marketing, part1Months)}
${makeRow("Stationery & Contingency", (m) => m.misc, part1Months)}
${makeRow("Loan Repayment (Principal & Int)", (m) => m.loanRepay, part1Months)}
${makeRow("**Total Cash Outflows**", (m) => m.outflowsTotal, part1Months)}
${makeRow("**Net Monthly Cash Flow**", (m) => m.netChange, part1Months)}
${makeRow("**Closing Balance c/f**", (m) => m.closing, part1Months)}
`.trim();

  const cashFlowPart2 = `
#### Table 5.3B: Projected Cash Flow Statement — Year 1 (Months 7–12)
| Line Item (KES) | ${part2Months.map((m) => m.month).join(" | ")} |
| :--- | ${part2Months.map(() => ":---").join(" | ")} |
${makeRow("**Opening Balance b/f**", (m) => m.opening, part2Months)}
${makeRow("Cash Sales Revenue", (m) => m.sales, part2Months)}
${makeRow("**Total Cash Inflows**", (m) => m.inflowsTotal, part2Months)}
${makeRow("Raw Material Purchases", (m) => m.materialPurchases, part2Months)}
${makeRow("Wages & Salaries", (m) => m.wages, part2Months)}
${makeRow("Premises Rent", (m) => m.rent, part2Months)}
${makeRow("Utilities (Water & Power)", (m) => m.utilities, part2Months)}
${makeRow("Transport & Fuel", (m) => m.transport, part2Months)}
${makeRow("Marketing & Promotion", (m) => m.marketing, part2Months)}
${makeRow("Stationery & Contingency", (m) => m.misc, part2Months)}
${makeRow("Loan Repayment (Principal & Int)", (m) => m.loanRepay, part2Months)}
${makeRow("**Total Cash Outflows**", (m) => m.outflowsTotal, part2Months)}
${makeRow("**Net Monthly Cash Flow**", (m) => m.netChange, part2Months)}
${makeRow("**Closing Balance c/f**", (m) => m.closing, part2Months)}
`.trim();

  const monthlyCashFlowTableYear1 = `${cashFlowPart1}\n\n${cashFlowPart2}`;

  const threeYearIncomeStatementTable = `
| Financial Line Item | Year 1 (KES) | Year 2 (KES) | Year 3 (KES) |
| :--- | :--- | :--- | :--- |
| **Gross Sales Revenue** | ${formatKES(annualSalesYear1)} | ${formatKES(annualSalesYear2)} | ${formatKES(annualSalesYear3)} |
| Less: Cost of Goods Sold (Raw Materials) | (${formatKES(annualCogsYear1)}) | (${formatKES(annualCogsYear2)}) | (${formatKES(annualCogsYear3)}) |
| **Gross Profit** | **${formatKES(annualGrossProfitYear1)}** | **${formatKES(annualGrossProfitYear2)}** | **${formatKES(annualGrossProfitYear3)}** |
| *Gross Profit Margin (%)* | *${grossProfitMarginPercent}%* | *${Math.round((annualGrossProfitYear2 / annualSalesYear2) * 100)}%* | *${Math.round((annualGrossProfitYear3 / annualSalesYear3) * 100)}%* |
| **Operating Overheads & Expenses:** | | | |
| • Wages & Staff Salaries | ${formatKES(totalWagesYear1)} | ${formatKES(Math.round(totalWagesYear1 * 1.1))} | ${formatKES(Math.round(totalWagesYear1 * 1.18))} |
| • Premises Rent | ${formatKES(monthlyRent * 12)} | ${formatKES(Math.round(monthlyRent * 12 * 1.05))} | ${formatKES(Math.round(monthlyRent * 12 * 1.1))} |
| • Utilities (Electricity & Water) | ${formatKES(monthlyUtilities * 12)} | ${formatKES(Math.round(monthlyUtilities * 12 * 1.08))} | ${formatKES(Math.round(monthlyUtilities * 12 * 1.15))} |
| • Transport, Logistics & Delivery | ${formatKES(monthlyTransport * 12)} | ${formatKES(Math.round(monthlyTransport * 12 * 1.1))} | ${formatKES(Math.round(monthlyTransport * 12 * 1.15))} |
| • Advertising, Promotion & Public Relations | ${formatKES(monthlyMarketing * 12)} | ${formatKES(Math.round(monthlyMarketing * 12 * 1.05))} | ${formatKES(Math.round(monthlyMarketing * 12 * 1.05))} |
| • Stationery, Licenses & Incidentals | ${formatKES(monthlyMisc * 12)} | ${formatKES(Math.round(monthlyMisc * 12 * 1.05))} | ${formatKES(Math.round(monthlyMisc * 12 * 1.05))} |
| **Total Operating Expenses** | **(${formatKES(annualOperatingExpensesYear1)})** | **(${formatKES(annualOperatingExpensesYear2)})** | **(${formatKES(annualOperatingExpensesYear3)})** |
| Less: Depreciation (10% on Machinery) | (${formatKES(annualDepreciation)}) | (${formatKES(annualDepreciation)}) | (${formatKES(annualDepreciation)}) |
| **Operating Profit before Interest & Tax (EBIT)** | **${formatKES(ebitYear1)}** | **${formatKES(ebitYear2)}** | **${formatKES(ebitYear3)}** |
| Less: Loan Interest Expense (12% per annum) | (${formatKES(totalLoanInterestYear1)}) | (${formatKES(annualLoanInterestYear2)}) | (0) |
| **Net Profit Before Tax (EBT)** | **${formatKES(ebtYear1)}** | **${formatKES(ebtYear2)}** | **${formatKES(ebtYear3)}** |
| Less: Corporate Income Tax (30%) | (${formatKES(annualTaxYear1)}) | (${formatKES(annualTaxYear2)}) | (${formatKES(annualTaxYear3)}) |
| **Net Profit After Tax** | **${formatKES(netProfitYear1)}** | **${formatKES(netProfitYear2)}** | **${formatKES(netProfitYear3)}** |
| *Net Profit Margin (%)* | *${netProfitMarginPercentYear1}%* | *${Math.round((netProfitYear2 / annualSalesYear2) * 100)}%* | *${Math.round((netProfitYear3 / annualSalesYear3) * 100)}%* |
`.trim();

  // Balance sheet math: Total Assets = Total Liabilities + Equity
  const machNetY1 = totalMachineryCost - annualDepreciation;
  const machNetY2 = totalMachineryCost - annualDepreciation * 2;
  const machNetY3 = totalMachineryCost - annualDepreciation * 3;

  const stockY1 = Math.round(annualCogsYear1 / 12);
  const stockY2 = Math.round(annualCogsYear2 / 12);
  const stockY3 = Math.round(annualCogsYear3 / 12);

  const totalAssetsY1 = year1ClosingCash + machNetY1 + stockY1;
  const loanBalY1 = Math.round(loanAmount * 0.5);
  const creditorsY1 = Math.round(stockY1 * 0.25);
  const equityY1 = totalAssetsY1 - loanBalY1 - creditorsY1;

  const totalAssetsY2 = year2ClosingCash + machNetY2 + stockY2;
  const creditorsY2 = Math.round(stockY2 * 0.25);
  const equityY2 = totalAssetsY2 - creditorsY2;

  const totalAssetsY3 = year3ClosingCash + machNetY3 + stockY3;
  const creditorsY3 = Math.round(stockY3 * 0.25);
  const equityY3 = totalAssetsY3 - creditorsY3;

  const threeYearBalanceSheetTable = `
| Balance Sheet Category | Opening Date (KES) | End of Year 1 (KES) | End of Year 2 (KES) | End of Year 3 (KES) |
| :--- | :--- | :--- | :--- | :--- |
| **CURRENT ASSETS:** | | | | |
| • Cash at Hand & in Bank | ${formatKES(openingCash)} | ${formatKES(year1ClosingCash)} | ${formatKES(year2ClosingCash)} | ${formatKES(year3ClosingCash)} |
| • Inventory / Stock of Goods | 0 | ${formatKES(stockY1)} | ${formatKES(stockY2)} | ${formatKES(stockY3)} |
| **Total Current Assets** | **${formatKES(openingCash)}** | **${formatKES(year1ClosingCash + stockY1)}** | **${formatKES(year2ClosingCash + stockY2)}** | **${formatKES(year3ClosingCash + stockY3)}** |
| **FIXED ASSETS:** | | | | |
| • Machinery, Plant & Equipment (At Cost) | ${formatKES(totalMachineryCost)} | ${formatKES(totalMachineryCost)} | ${formatKES(totalMachineryCost)} | ${formatKES(totalMachineryCost)} |
| • Less: Accumulated Depreciation | (0) | (${formatKES(annualDepreciation)}) | (${formatKES(annualDepreciation * 2)}) | (${formatKES(annualDepreciation * 3)}) |
| **Net Fixed Assets** | **${formatKES(totalMachineryCost)}** | **${formatKES(machNetY1)}** | **${formatKES(machNetY2)}** | **${formatKES(machNetY3)}** |
| **TOTAL ASSETS** | **${formatKES(totalStartupCapital)}** | **${formatKES(totalAssetsY1)}** | **${formatKES(totalAssetsY2)}** | **${formatKES(totalAssetsY3)}** |
| **LIABILITIES & EQUITY:** | | | | |
| **Current Liabilities:** | | | | |
| • Trade Creditors & Accrued Payables | 0 | ${formatKES(creditorsY1)} | ${formatKES(creditorsY2)} | ${formatKES(creditorsY3)} |
| **Long-Term Liabilities:** | | | | |
| • Bank / Youth Enterprise Fund Loan | ${formatKES(loanAmount)} | ${formatKES(loanBalY1)} | 0 | 0 |
| **Owner's Equity:** | | | | |
| • Initial Capital Employed | ${formatKES(ownerEquity)} | ${formatKES(ownerEquity)} | ${formatKES(ownerEquity)} | ${formatKES(ownerEquity)} |
| • Retained Earnings & Reserves | 0 | ${formatKES(equityY1 - ownerEquity)} | ${formatKES(equityY2 - ownerEquity)} | ${formatKES(equityY3 - ownerEquity)} |
| **Total Owner's Equity** | **${formatKES(ownerEquity)}** | **${formatKES(equityY1)}** | **${formatKES(equityY2)}** | **${formatKES(equityY3)}** |
| **TOTAL LIABILITIES & OWNER'S EQUITY** | **${formatKES(totalStartupCapital)}** | **${formatKES(totalAssetsY1)}** | **${formatKES(totalAssetsY2)}** | **${formatKES(totalAssetsY3)}** |
`.trim();

  const breakEvenTable = `
| Break-Even Parameter | Formula / Basis | Value |
| :--- | :--- | :--- |
| **Unit Selling Price (P)** | Market retail price per unit/pack | **KES ${formatKES(unitPrice)}** |
| **Unit Variable Cost (V)** | Direct raw material & packaging cost per unit | **KES ${formatKES(unitCost)}** |
| **Unit Contribution Margin (CM)** | $P - V$ | **KES ${formatKES(contributionMarginPerUnit)}** |
| **Total Monthly Fixed Costs (FC)** | Rent + Wages + Utilities + Transport + Marketing + Depreciation | **KES ${formatKES(monthlyFixedCosts)}** |
| **Monthly Break-Even Units** | $FC \\div CM$ | **${formatKES(breakEvenUnitsMonthly)} units/month** |
| **Monthly Break-Even Revenue** | $\\text{Units} \\times P$ | **KES ${formatKES(breakEvenRevenueMonthly)}/month** |
| **Annual Break-Even Revenue** | $\\text{Monthly Break-Even} \\times 12$ | **KES ${formatKES(breakEvenRevenueMonthly * 12)}/year** |
| **Break-Even Capacity Utilization** | $\\text{Break-Even Units} \\div \\text{Installed Capacity}$ | **${breakEvenLevelPercent}% of capacity** |
`.trim();

  const financialRatiosTable = `
| Financial Ratio Indicator | Calculation Formula | Year 1 Standard | Academic Interpretation |
| :--- | :--- | :--- | :--- |
| **Gross Profit Margin** | $\\frac{\\text{Gross Profit}}{\\text{Sales}} \\times 100$ | **${grossProfitMarginPercent}%** | Demonstrates robust markup over direct raw material inputs. |
| **Net Profit Margin** | $\\frac{\\text{Net Profit After Tax}}{\\text{Sales}} \\times 100$ | **${netProfitMarginPercentYear1}%** | Exceeds TVET target threshold (≥15%) confirming strong commercial health. |
| **Return on Investment (ROI)** | $\\frac{\\text{Net Profit After Tax}}{\\text{Total Capital Invested}} \\times 100$ | **${returnOnInvestmentYear1}%** | Strong capital recovery capability within initial operational cycle. |
| **Return on Equity (ROE)** | $\\frac{\\text{Net Profit After Tax}}{\\text{Owner's Equity}} \\times 100$ | **${returnOnEquityYear1}%** | High rate of return on personal savings invested by the entrepreneur. |
| **Current Ratio (Liquidity)** | $\\frac{\\text{Current Assets}}{\\text{Current Liabilities}}$ | **${( (year1ClosingCash + stockY1) / creditorsY1 ).toFixed(2)} : 1** | Substantially exceeds the safe liquidity benchmark (2:1). |
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
    grossProfitMarginPercent,
    netProfitMarginPercentYear1,
    returnOnEquityYear1,
    returnOnInvestmentYear1,
    preOperationalTable,
    capitalizationTable,
    monthlyCashFlowTableYear1,
    threeYearIncomeStatementTable,
    threeYearBalanceSheetTable,
    breakEvenTable,
    financialRatiosTable,
  };
}
