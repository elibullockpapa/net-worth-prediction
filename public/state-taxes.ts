export interface TaxBracket {
    rate: number;
    minIncome: number;
    maxIncome?: number; // undefined means no upper limit
}

export interface StateTaxConfig {
    name: string;
    brackets: TaxBracket[];
    standardDeduction?: number;
    description: string;
}

/*
 * State Income Tax Configurations for Single Filers (Based on ~March 2025 Data)
 *
 * Represents estimated state income tax configurations for single filers. Data primarily based
 * on Tax Foundation figures reported as of March 15, 2025, which may include actual 2024/2025 rates/brackets
 * or projections based on enacted legislation. Some brackets noted as 2024 by the source.
 * This data primarily focuses on wage income and standard deductions where available/simple.
 * It may not capture all nuances (e.g., specific credits, deduction phase-outs, federal tax deductibility,
 * alternative minimum taxes, detailed local taxes beyond specified cities, benefit recapture).
 * Standard Deduction values may be estimates or based on prior years if not readily available for 2025.
 * Always consult official state documentation or a tax professional for definitive figures.
 */

export const stateTaxConfigs: StateTaxConfig[] = [
    {
        name: "Custom",
        description: "Configure your own tax brackets, rates, and standard deduction.",
        brackets: [],
        standardDeduction: 0
    },
    {
        name: "Alabama",
        description: "Alabama's progressive tax system with three brackets (2-5%). Federal tax may be deductible (not modeled). Local taxes apply. SD ($3k) is estimate based on prior years.",
        brackets: [
            { rate: 0.02, minIncome: 0, maxIncome: 500 },
            { rate: 0.04, minIncome: 500, maxIncome: 3000 },
            { rate: 0.05, minIncome: 3000 }
        ],
        standardDeduction: 3000 // Estimate based on prior years, may change. Note (a) federal deductibility not modeled.
    },
    {
        name: "Alaska",
        description: "Alaska has no state income tax.",
        brackets: [],
        standardDeduction: 0
    },
    {
        name: "Arizona",
        description: "Arizona has a 2.5% flat income tax rate. Uses state SD tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.025, minIncome: 0 }
        ],
        standardDeduction: 13850 // 2023 Single, tied to federal estimate. Check 2024/2025 value.
    },
    {
        name: "Arkansas",
        description: "Arkansas's tax system (2-3.9%). Source data notes complexity/special table for incomes <= $89.6k (not modeled). Uses state SD.",
        brackets: [
            { rate: 0.02, minIncome: 0, maxIncome: 4500 },
            { rate: 0.039, minIncome: 4500 } // Source notes 2024 brackets.
        ],
        standardDeduction: 2270 // Estimate based on prior years, may change.
    },
    {
        name: "California",
        description: "California's progressive system, 10 brackets (1-13.3%). Includes 1% Mental Health Services Tax > $1M. Uses state SD.",
        brackets: [
            { rate: 0.01, minIncome: 0, maxIncome: 10756 },
            { rate: 0.02, minIncome: 10756, maxIncome: 25499 },
            { rate: 0.04, minIncome: 25499, maxIncome: 40245 },
            { rate: 0.06, minIncome: 40245, maxIncome: 55866 },
            { rate: 0.08, minIncome: 55866, maxIncome: 70606 },
            { rate: 0.093, minIncome: 70606, maxIncome: 360659 },
            { rate: 0.103, minIncome: 360659, maxIncome: 432787 },
            { rate: 0.113, minIncome: 432787, maxIncome: 721314 },
            { rate: 0.123, minIncome: 721314, maxIncome: 1000000 },
            { rate: 0.133, minIncome: 1000000 } // Includes 1% surcharge
            // Source notes 2024 brackets.
        ],
        standardDeduction: 5363 // Estimate based on prior years, likely higher for 2024/2025. Check CA value.
    },
    {
        name: "Colorado",
        description: "Colorado has a flat 4.4% income tax rate. Local taxes may apply. Standard Deduction tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.044, minIncome: 0 }
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "Connecticut",
        description: "Connecticut's progressive system, 7 brackets (2-6.99%). High-income recapture not modeled. Uses state PE (modeled as SD, phases out).",
        brackets: [
            { rate: 0.02, minIncome: 0, maxIncome: 10000 },
            { rate: 0.045, minIncome: 10000, maxIncome: 50000 },
            { rate: 0.055, minIncome: 50000, maxIncome: 100000 },
            { rate: 0.06, minIncome: 100000, maxIncome: 200000 },
            { rate: 0.065, minIncome: 200000, maxIncome: 250000 },
            { rate: 0.069, minIncome: 250000, maxIncome: 500000 },
            { rate: 0.0699, minIncome: 500000 }
        ],
        // This is the personal exemption amount, subject to AGI phaseouts. Not a typical SD.
        standardDeduction: 15000
    },
    {
        name: "Delaware",
        description: "Delaware's progressive system, 6 brackets (2.2-6.6%). First $2k untaxed. Local taxes may apply. Uses state SD.",
        brackets: [
            { rate: 0.0, minIncome: 0, maxIncome: 2000 }, // Explicit 0% bracket
            { rate: 0.022, minIncome: 2000, maxIncome: 5000 },
            { rate: 0.039, minIncome: 5000, maxIncome: 10000 },
            { rate: 0.048, minIncome: 10000, maxIncome: 20000 },
            { rate: 0.052, minIncome: 20000, maxIncome: 25000 },
            { rate: 0.0555, minIncome: 25000, maxIncome: 60000 },
            { rate: 0.066, minIncome: 60000 }
        ],
        standardDeduction: 3250 // Estimate based on prior years, may change.
    },
    {
        name: "District of Columbia",
        description: "DC's progressive tax system with 7 brackets (4-10.75%). Uses DC-specific standard deduction (value is 2023 estimate).",
        brackets: [
            { rate: 0.04, minIncome: 0, maxIncome: 10000 },
            { rate: 0.06, minIncome: 10000, maxIncome: 40000 },
            { rate: 0.065, minIncome: 40000, maxIncome: 60000 },
            { rate: 0.085, minIncome: 60000, maxIncome: 250000 },
            { rate: 0.0925, minIncome: 250000, maxIncome: 500000 },
            { rate: 0.0975, minIncome: 500000, maxIncome: 1000000 },
            { rate: 0.1075, minIncome: 1000000 }
        ],
        standardDeduction: 13850 // DC SD tied to federal for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "Florida",
        description: "Florida has no state income tax.",
        brackets: [],
        standardDeduction: 0
    },
    {
        name: "Georgia",
        description: "Georgia has a flat tax rate of 5.39%. Uses state SD.",
        brackets: [
            { rate: 0.0539, minIncome: 0 }
        ],
        standardDeduction: 12000 // Estimate based on prior years, may change.
    },
    {
        name: "Hawaii",
        description: "Hawaii's progressive system, 12 brackets (1.4-11%). Low SD, but personal exemptions apply (not modeled).",
        brackets: [
            { rate: 0.014, minIncome: 0, maxIncome: 9600 },
            { rate: 0.032, minIncome: 9600, maxIncome: 14400 },
            { rate: 0.055, minIncome: 14400, maxIncome: 19200 },
            { rate: 0.064, minIncome: 19200, maxIncome: 24000 },
            { rate: 0.068, minIncome: 24000, maxIncome: 36000 },
            { rate: 0.072, minIncome: 36000, maxIncome: 48000 },
            { rate: 0.076, minIncome: 48000, maxIncome: 125000 },
            { rate: 0.079, minIncome: 125000, maxIncome: 175000 },
            { rate: 0.0825, minIncome: 175000, maxIncome: 225000 },
            { rate: 0.09, minIncome: 225000, maxIncome: 275000 },
            { rate: 0.10, minIncome: 275000, maxIncome: 325000 },
            { rate: 0.11, minIncome: 325000 }
        ],
        standardDeduction: 2200 // Estimate based on prior years, likely indexed. Check HI value.
    },
    {
        name: "Idaho",
        description: "Idaho has a flat 5.3% income tax rate on income above $4,673 (effectively 0% below). Standard Deduction tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.0, minIncome: 0, maxIncome: 4673 }, // Explicit 0% bracket
            { rate: 0.053, minIncome: 4673 }
            // Source notes 2024 brackets.
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "Illinois",
        description: "Illinois has a flat 4.95% income tax rate. Uses personal exemption (modeled as SD, value is 2023 estimate).",
        brackets: [
            { rate: 0.0495, minIncome: 0 }
        ],
        // Representing exemption as SD for calculator structure; functionally different.
        standardDeduction: 2425 // Personal Exemption for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "Indiana",
        description: "Indiana has a flat 3.0% state income tax rate. Counties add local tax (not modeled). Uses personal exemptions (basic modeled as SD).",
        brackets: [
            { rate: 0.03, minIncome: 0 }
        ],
        // Representing basic exemption as SD for calculator structure; functionally different.
        standardDeduction: 1000 // Basic Personal Exemption estimate. Check IN value/rules.
    },
    {
        name: "Iowa",
        description: "Iowa has moved to a flat 3.8% income tax rate. Local taxes may apply. Uses state SD.",
        brackets: [
            { rate: 0.038, minIncome: 0 }
        ],
        standardDeduction: 2730 // 2024 Single estimate. Check IA value for current year.
    },
    {
        name: "Kansas",
        description: "Kansas's tax system with two brackets (5.2-5.58%). Local taxes may apply. Uses state SD.",
        brackets: [
            { rate: 0.052, minIncome: 0, maxIncome: 23000 },
            { rate: 0.0558, minIncome: 23000 }
        ],
        standardDeduction: 3500 // Estimate based on prior years, may change.
    },
    {
        name: "Kentucky",
        description: "Kentucky has a flat 4.0% income tax rate. Local taxes apply (not modeled). Uses state-specific standard deduction.",
        brackets: [
            { rate: 0.040, minIncome: 0 }
        ],
        standardDeduction: 3180 // Estimated 2024 standard deduction. Check KY value for current year.
    },
    {
        name: "Louisiana",
        description: "Louisiana has a flat 3.0% income tax rate. Federal tax paid may be deductible (not modeled). SD tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.03, minIncome: 0 }
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value. Note (a) federal deductibility not modeled.
    },
    {
        name: "Maine",
        description: "Maine's progressive system, 3 brackets (5.8-7.15%). Standard Deduction tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.058, minIncome: 0, maxIncome: 26800 },
            { rate: 0.0675, minIncome: 26800, maxIncome: 63450 },
            { rate: 0.0715, minIncome: 63450 }
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "Maryland",
        description: "Maryland's progressive system, 8 brackets (2-5.75%). Counties add required local tax (avg ~2.5%, not modeled). State SD complex (capped value used).",
        brackets: [
            { rate: 0.02, minIncome: 0, maxIncome: 1000 },
            { rate: 0.03, minIncome: 1000, maxIncome: 2000 },
            { rate: 0.04, minIncome: 2000, maxIncome: 3000 },
            { rate: 0.0475, minIncome: 3000, maxIncome: 100000 },
            { rate: 0.05, minIncome: 100000, maxIncome: 125000 },
            { rate: 0.0525, minIncome: 125000, maxIncome: 150000 },
            { rate: 0.055, minIncome: 150000, maxIncome: 250000 },
            { rate: 0.0575, minIncome: 250000 }
        ],
        // MD standard deduction is 15% of Maryland AGI, min/max caps apply. Using 2023 max cap estimate. Check MD rules.
        standardDeduction: 2550
    },
    {
        name: "Massachusetts",
        description: "Massachusetts has a 5% rate, plus a 4% surtax on income over ~$1.08M (9% total marginal rate). Uses personal exemption (modeled as SD, value is 2023 estimate).",
        brackets: [
            { rate: 0.05, minIncome: 0, maxIncome: 1083150 },
            { rate: 0.09, minIncome: 1083150 } // 5% + 4% surtax
            // Adjusted 2025 threshold for surtax used.
        ],
        // Representing exemption as SD for calculator structure; functionally different.
        standardDeduction: 4400 // Personal Exemption for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "Michigan",
        description: "Michigan has a flat 4.25% income tax rate. Cities add local tax (not modeled). Uses personal exemption (modeled as SD, value is 2023 estimate).",
        brackets: [
            { rate: 0.0425, minIncome: 0 }
        ],
        // Representing exemption as SD for calculator structure; functionally different.
        standardDeduction: 5400 // Personal Exemption for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "Minnesota",
        description: "Minnesota's progressive system, 4 brackets (5.35-9.85%). Standard Deduction generally tied to federal (value is 2023 estimate, check MN rules).",
        brackets: [
            { rate: 0.0535, minIncome: 0, maxIncome: 32570 },
            { rate: 0.068, minIncome: 32570, maxIncome: 106990 },
            { rate: 0.0785, minIncome: 106990, maxIncome: 198630 },
            { rate: 0.0985, minIncome: 198630 }
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate, check MN specific rules/phaseouts/value for 2024/2025.
    },
    {
        name: "Mississippi",
        description: "Mississippi has a 4.4% flat tax rate on income over $10,000 (effectively 0% below). No standard deduction.",
        brackets: [
            { rate: 0.0, minIncome: 0, maxIncome: 10000 }, // Explicit 0% bracket
            { rate: 0.044, minIncome: 10000 }
        ],
        standardDeduction: 0 // Income exemption acts like deduction.
    },
    {
        name: "Missouri",
        description: "Missouri's progressive system (2-4.7% on income > $1,313). Local taxes apply. Standard Deduction tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.0, minIncome: 0, maxIncome: 1313 }, // Explicit 0% bracket
            { rate: 0.02, minIncome: 1313, maxIncome: 2626 },
            { rate: 0.025, minIncome: 2626, maxIncome: 3939 },
            { rate: 0.03, minIncome: 3939, maxIncome: 5252 },
            { rate: 0.035, minIncome: 5252, maxIncome: 6565 },
            { rate: 0.04, minIncome: 6565, maxIncome: 7878 },
            { rate: 0.045, minIncome: 7878, maxIncome: 9191 },
            { rate: 0.047, minIncome: 9191 }
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value. Note (a) Fed deductibility possible.
    },
    {
        name: "Montana",
        description: "Montana's two-bracket system (4.7% / 5.9%). Uses state SD.",
        brackets: [
            { rate: 0.047, minIncome: 0, maxIncome: 21100 },
            { rate: 0.059, minIncome: 21100 }
        ],
        standardDeduction: 5540 // 2024 Single estimate. Check MT value for current year. Note (a) Fed deductibility possible.
    },
    {
        name: "Nebraska",
        description: "Nebraska's progressive system (4 brackets, top rate 5.2%, phasing down). Uses state SD.",
        brackets: [
            { rate: 0.0246, minIncome: 0, maxIncome: 4030 },
            { rate: 0.0351, minIncome: 4030, maxIncome: 24120 },
            { rate: 0.0501, minIncome: 24120, maxIncome: 38870 },
            { rate: 0.052, minIncome: 38870 }
        ],
        standardDeduction: 8300 // 2024 Single estimate. Check NE value for current year.
    },
    {
        name: "Nevada",
        description: "Nevada has no state income tax.",
        brackets: [],
        standardDeduction: 0
    },
    {
        name: "New Hampshire",
        description: "New Hampshire does not tax wage income (interest & dividends tax phased out).",
        brackets: [],
        standardDeduction: 0
    },
    {
        name: "New Jersey",
        description: "New Jersey's progressive system, 7 brackets (1.4-10.75%). Local payroll taxes may apply. Uses personal exemptions ($1k), not a standard deduction.",
        brackets: [
            { rate: 0.014, minIncome: 0, maxIncome: 20000 },
            { rate: 0.0175, minIncome: 20000, maxIncome: 35000 },
            { rate: 0.035, minIncome: 35000, maxIncome: 40000 },
            { rate: 0.05525, minIncome: 40000, maxIncome: 75000 },
            { rate: 0.0637, minIncome: 75000, maxIncome: 500000 },
            { rate: 0.0897, minIncome: 500000, maxIncome: 1000000 },
            { rate: 0.1075, minIncome: 1000000 }
        ],
        standardDeduction: 0 // Uses exemptions.
    },
    {
        name: "New Mexico",
        description: "New Mexico's progressive system, 6 brackets (1.5-5.9%). Standard Deduction tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.015, minIncome: 0, maxIncome: 5500 },
            { rate: 0.032, minIncome: 5500, maxIncome: 16500 },
            { rate: 0.043, minIncome: 16500, maxIncome: 33500 },
            { rate: 0.047, minIncome: 33500, maxIncome: 66500 },
            { rate: 0.049, minIncome: 66500, maxIncome: 210000 },
            { rate: 0.059, minIncome: 210000 }
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "New York",
        description: "New York's progressive system, 9 brackets (4-10.9%). Cities like NYC add local tax. High-income recapture not modeled. Uses state SD.",
        brackets: [
            { rate: 0.04, minIncome: 0, maxIncome: 8500 },
            { rate: 0.045, minIncome: 8500, maxIncome: 11700 },
            { rate: 0.0525, minIncome: 11700, maxIncome: 13900 },
            { rate: 0.055, minIncome: 13900, maxIncome: 80650 },
            { rate: 0.06, minIncome: 80650, maxIncome: 215400 },
            { rate: 0.0685, minIncome: 215400, maxIncome: 1077550 },
            { rate: 0.0965, minIncome: 1077550, maxIncome: 5000000 },
            { rate: 0.103, minIncome: 5000000, maxIncome: 25000000 },
            { rate: 0.109, minIncome: 25000000 }
        ],
        standardDeduction: 8000 // Estimate based on prior years, may change.
    },
    {
        name: "New York - New York City",
        description: "Combined NY State + NYC progressive taxes (approx rates based on March 2025 NYS data + est. NYC rates, top rate ~14.8%). Uses NY state SD ($8k).",
        // NYC Rates (approx): 3.078% (<$12k), 3.762% ($12k-$25k), 3.819% ($25k-$50k), 3.876% (>$50k)
        // Combined brackets merge state and city progressive application.
        brackets: [
            // Combined Rate is NY Rate + Applicable NYC Rate
            { rate: 0.07078, minIncome: 0, maxIncome: 8500 },       // 4.00% + 3.078%
            { rate: 0.07578, minIncome: 8500, maxIncome: 11700 },     // 4.50% + 3.078%
            { rate: 0.08328, minIncome: 11700, maxIncome: 12000 },   // 5.25% + 3.078%
            { rate: 0.09012, minIncome: 12000, maxIncome: 13900 },   // 5.25% + 3.762%
            { rate: 0.09262, minIncome: 13900, maxIncome: 25000 },   // 5.50% + 3.762%
            { rate: 0.09319, minIncome: 25000, maxIncome: 50000 },   // 5.50% + 3.819%
            { rate: 0.09376, minIncome: 50000, maxIncome: 80650 },   // 5.50% + 3.876%
            { rate: 0.09876, minIncome: 80650, maxIncome: 215400 },  // 6.00% + 3.876%
            { rate: 0.10726, minIncome: 215400, maxIncome: 1077550 }, // 6.85% + 3.876%
            { rate: 0.13526, minIncome: 1077550, maxIncome: 5000000 }, // 9.65% + 3.876%
            { rate: 0.14176, minIncome: 5000000, maxIncome: 25000000 },// 10.30% + 3.876%
            { rate: 0.14776, minIncome: 25000000 }                     // 10.90% + 3.876%
        ],
        standardDeduction: 8000 // NY State Standard Deduction still applies
    },
    {
        name: "North Carolina",
        description: "North Carolina has a flat 4.25% income tax rate (rate phasing down). Standard Deduction tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.0425, minIncome: 0 }
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "North Dakota",
        description: "North Dakota's system with 0% bracket, then two rates (1.95%, 2.5%). SD tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.0, minIncome: 0, maxIncome: 48475 },
            { rate: 0.0195, minIncome: 48475, maxIncome: 244825 },
            { rate: 0.025, minIncome: 244825 }
            // Source notes 2024 brackets.
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "Ohio",
        description: "Ohio's system with 0% rate below $26,050, then two rates (2.75%, 3.5%). Cities add local tax (not modeled). Uses exemptions, not SD.",
        brackets: [
            { rate: 0.0, minIncome: 0, maxIncome: 26050 }, // Explicit 0% bracket
            { rate: 0.0275, minIncome: 26050, maxIncome: 100000 },
            { rate: 0.035, minIncome: 100000 }
            // Source notes 2024 brackets.
        ],
        standardDeduction: 0 // Uses personal exemptions.
    },
    {
        name: "Oklahoma",
        description: "Oklahoma's progressive system, 6 brackets (0.25-4.75%). Uses state-specific SD.",
        brackets: [
            { rate: 0.0025, minIncome: 0, maxIncome: 1000 },
            { rate: 0.0075, minIncome: 1000, maxIncome: 2500 },
            { rate: 0.0175, minIncome: 2500, maxIncome: 3750 },
            { rate: 0.0275, minIncome: 3750, maxIncome: 4900 },
            { rate: 0.0375, minIncome: 4900, maxIncome: 7200 },
            { rate: 0.0475, minIncome: 7200 }
        ],
        standardDeduction: 7350 // 2024 Single estimate. Check OK value for current year.
    },
    {
        name: "Oregon",
        description: "Oregon's progressive system, 4 brackets (4.75-9.9%). Local taxes may apply. Uses complex credits instead of standard deduction.",
        brackets: [
            { rate: 0.0475, minIncome: 0, maxIncome: 4400 },
            { rate: 0.0675, minIncome: 4400, maxIncome: 11050 },
            { rate: 0.0875, minIncome: 11050, maxIncome: 125000 },
            { rate: 0.099, minIncome: 125000 }
        ],
        // Credit system complex. Representing SD as 0. Note (a) Fed deductibility possible.
        standardDeduction: 0
    },
    {
        name: "Pennsylvania",
        description: "Pennsylvania has a flat 3.07% income tax rate. Most localities add Earned Income Tax (EIT, not modeled). No state standard deduction.",
        brackets: [
            { rate: 0.0307, minIncome: 0 }
        ],
        standardDeduction: 0
    },
    {
        name: "Pennsylvania - Philadelphia",
        description: "Combined PA state flat tax (3.07%) + Philadelphia resident wage tax (~3.75% est.). Combined rate ~6.82%. No standard deduction.",
        brackets: [
            // PA State 3.07% + Philly Resident Wage Tax ~3.75% (check current rate) = ~6.82%
            { rate: 0.0682, minIncome: 0 }
        ],
        standardDeduction: 0
    },
    {
        name: "Rhode Island",
        description: "Rhode Island's progressive system, 3 brackets (3.75-5.99%). Standard Deduction tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.0375, minIncome: 0, maxIncome: 79900 },
            { rate: 0.0475, minIncome: 79900, maxIncome: 181650 },
            { rate: 0.0599, minIncome: 181650 }
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "South Carolina",
        description: "South Carolina's system with 0% bracket, then two rates (3%, 6.2%, top rate phasing down). SD tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.0, minIncome: 0, maxIncome: 3560 },
            { rate: 0.03, minIncome: 3560, maxIncome: 17830 },
            { rate: 0.062, minIncome: 17830 }
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "South Dakota",
        description: "South Dakota has no state income tax.",
        brackets: [],
        standardDeduction: 0
    },
    {
        name: "Tennessee",
        description: "Tennessee has no state income tax on wages (Hall Tax repealed).",
        brackets: [],
        standardDeduction: 0
    },
    {
        name: "Texas",
        description: "Texas has no state income tax.",
        brackets: [],
        standardDeduction: 0
    },
    {
        name: "Utah",
        description: "Utah has a flat 4.55% income tax rate. Uses tax credits instead of standard deduction.",
        brackets: [
            { rate: 0.0455, minIncome: 0 }
        ],
        standardDeduction: 0 // Actual mechanism is credit-based.
    },
    {
        name: "Vermont",
        description: "Vermont's progressive system, 4 brackets (3.35-8.75%). Standard Deduction tied to federal (value is 2023 estimate).",
        brackets: [
            { rate: 0.0335, minIncome: 0, maxIncome: 47900 },
            { rate: 0.066, minIncome: 47900, maxIncome: 116000 },
            { rate: 0.076, minIncome: 116000, maxIncome: 242000 },
            { rate: 0.0875, minIncome: 242000 }
            // Source notes 2024 brackets. Structure changed from previous data.
        ],
        standardDeduction: 13850 // Tied to federal for 2023 estimate. Check 2024/2025 value.
    },
    {
        name: "Virginia",
        description: "Virginia's progressive system, 4 brackets (2-5.75%). Standard deduction increased.",
        brackets: [
            { rate: 0.02, minIncome: 0, maxIncome: 3000 },
            { rate: 0.03, minIncome: 3000, maxIncome: 5000 },
            { rate: 0.05, minIncome: 5000, maxIncome: 17000 },
            { rate: 0.0575, minIncome: 17000 }
        ],
        standardDeduction: 8000 // Check VA value for current year.
    },
    {
        name: "Washington",
        description: "Washington has no state income tax on wages. A 7% capital gains tax applies to gains over $250k (not modeled here).",
        brackets: [], // No tax on wage income
        standardDeduction: 0
    },
    {
        name: "West Virginia",
        description: "West Virginia's progressive system, 5 brackets (rates reduced, top rate ~4.82%). Local payroll taxes may apply. Uses exemptions, not SD.",
        brackets: [
            { rate: 0.0222, minIncome: 0, maxIncome: 10000 },
            { rate: 0.0296, minIncome: 10000, maxIncome: 25000 },
            { rate: 0.0333, minIncome: 25000, maxIncome: 40000 },
            { rate: 0.0444, minIncome: 40000, maxIncome: 60000 },
            { rate: 0.0482, minIncome: 60000 }
        ],
        standardDeduction: 0 // Uses personal exemptions.
    },
    {
        name: "Wisconsin",
        description: "Wisconsin's progressive system, 4 brackets (top rate 7.65%). Uses state-specific SD.",
        brackets: [
            { rate: 0.035, minIncome: 0, maxIncome: 14680 },
            { rate: 0.044, minIncome: 14680, maxIncome: 29370 },
            { rate: 0.053, minIncome: 29370, maxIncome: 323290 },
            { rate: 0.0765, minIncome: 323290 }
        ],
        standardDeduction: 13440 // 2024 Single estimate. Check WI value for current year.
    },
    {
        name: "Wyoming",
        description: "Wyoming has no state income tax.",
        brackets: [],
        standardDeduction: 0
    }
];

/**
 * Calculates the estimated state income tax based on gross income and state configuration.
 *
 * Handles progressive tax brackets and standard deductions.
 * Does not account for itemized deductions, tax credits, exemptions (unless modeled as SD),
 * local taxes (unless a specific combined config is used), federal tax deductibility, or other complex state rules.
 * Assumes income is taxable income *before* state standard deduction unless state rules differ significantly (like MS/ID/OH 0% initial bracket).
 *
 * @param income Gross annual income (or AGI as appropriate input for calculation).
 * @param config The StateTaxConfig object for the desired state/locality.
 * @returns Estimated state income tax liability.
 */
export function calculateStateTax(income: number, config: StateTaxConfig): number {
    if (!config.brackets.length) {
        // Handle states with no income tax or configs with no defined brackets
        return 0;
    }

    // Apply standard deduction if available *before* bracket calculation
    // Some states might apply deductions differently, this is a common approach.
    const incomeAfterDeduction = Math.max(0, income - (config.standardDeduction ?? 0));

    // Taxable income for bracket calculation starts after deduction
    let taxableIncome = incomeAfterDeduction;

    // Special handling for states where the 0% bracket IS the deduction mechanism (already built into brackets)
    // For states like MS, ID, OH, MO, DE where we added an explicit 0% bracket starting at $0,
    // the standardDeduction field should ideally be 0 or handled carefully.
    // Current approach: Applies SD first, then calculates across brackets (incl. any 0% bracket).
    // This is generally correct if the 0% bracket represents income *after* deduction that's still taxed at 0%.
    // If the 0% bracket *replaces* the SD (like MS), SD should be 0 in the config.

    let totalTax = 0;

    // Sort brackets just in case they are not perfectly ordered (defensive programming)
    const sortedBrackets = [...config.brackets].sort((a, b) => a.minIncome - b.minIncome);

    for (const bracket of sortedBrackets) {
        // If taxable income is below the start of this bracket, we're done calculating.
        // Use a small tolerance for floating point comparisons if necessary, though direct comparison should be fine here.
        if (taxableIncome <= bracket.minIncome) {
            break;
        }

        // Determine the upper bound of this bracket (Infinity if maxIncome is undefined)
        const bracketMax = bracket.maxIncome ?? Infinity;

        // Calculate the amount of income that falls *within* this specific bracket's range.
        // It's the portion of taxableIncome that is >= minIncome and < bracketMax.
        // Max income subject to this bracket's rate is min(taxableIncome, bracketMax)
        // Min income subject to this bracket's rate is bracket.minIncome
        // Income taxed *at this rate* = Max subject to rate - Min subject to rate
        const incomeInBracket = Math.min(taxableIncome, bracketMax) - bracket.minIncome;

        // Calculate tax only for the positive income amount within this bracket
        if (incomeInBracket > 0) {
            totalTax += incomeInBracket * bracket.rate;
        }

        // Optimization: If taxable income doesn't exceed this bracket's max, no need to check higher brackets
        if (taxableIncome <= bracketMax) {
            break;
        }
    }

    // Return calculated tax, ensuring it's not negative
    return Math.max(0, totalTax);
}