// --- Data (Copy relevant data here) ---
// IMPORTANT: Keep this data synchronized with your main data source (@/public/finances)
const sp500RealReturnsWithDividends = {
    2024: 0.2234, 2023: 0.1939, 2022: -0.1722, 2021: 0.1362, 2020: 0.1583,
    2019: 0.2488, 2018: -0.0607, 2017: 0.2224, 2016: 0.1801, 2015: -0.0457,
    2014: 0.1356, 2013: 0.2351, 2012: 0.1440, 2011: 0.0052, 2010: 0.1431,
    2009: 0.2901, 2008: -0.3515, 2007: -0.0534, 2006: 0.1101, 2005: 0.0590,
    2004: 0.0298, 2003: 0.2594, 2002: -0.2205, 2001: -0.1443, 2000: -0.0858,
    1999: 0.1242, 1998: 0.2915, 1997: 0.2578, 1996: 0.2338, 1995: 0.3144,
    1994: -0.0161, 1993: 0.0882, 1992: 0.0419, 1991: 0.2824, 1990: -0.0601,
    1989: 0.1691, 1988: 0.1258, 1987: -0.0579, 1986: 0.2914, 1985: 0.2121,
    1984: 0.0399, 1983: 0.1541, 1982: 0.2426, 1981: -0.1403, 1980: 0.1222,
    1979: 0.0259, 1978: 0.0624, 1977: -0.1442, 1976: 0.0584, 1975: 0.2984,
    1974: -0.2912, 1973: -0.2320, 1972: 0.1354, 1971: 0.1018, 1970: 0.0162,
    1969: -0.1373, 1968: 0.0594, 1967: 0.1192, 1966: -0.0956, 1965: 0.0941,
    1964: 0.1480, 1963: 0.1905, 1962: -0.0400, 1961: 0.1825, 1960: 0.0449,
    1959: 0.0652, 1958: 0.3759, 1957: -0.0885, 1956: 0.0374, 1955: 0.2814,
    1954: 0.4697, 1953: 0.0164, 1952: 0.1363, 1951: 0.1569, 1950: 0.2431,
    1949: 0.1981, 1948: 0.0847, 1947: -0.0654, 1946: -0.2521, 1945: 0.3543,
    1944: 0.1656, 1943: 0.1994, 1942: 0.1110, 1941: -0.1794, 1940: -0.1007,
    1939: 0.0410, 1938: 0.1667, 1937: -0.3164, 1936: 0.3024, 1935: 0.5144,
    1934: -0.1058, 1933: 0.5135, 1932: 0.0137, 1931: -0.3654, 1930: -0.1598,
    1929: -0.0877, 1928: 0.4838, 1927: 0.3815, 1926: 0.1393, 1925: 0.2104,
    1924: 0.2605, 1923: 0.0213, 1922: 0.2967, 1921: 0.2270, 1920: -0.1234,
    1919: 0.0194, 1918: -0.0091, 1917: -0.3101, 1916: -0.0349, 1915: 0.2672,
    1914: -0.0655, 1913: -0.0674, 1912: -0.0005, 1911: 0.0453, 1910: 0.0360,
    1909: 0.0495, 1908: 0.3370, 1907: -0.2207, 1906: -0.0343, 1905: 0.2100,
    1904: 0.2790, 1903: -0.1308, 1902: -0.0127, 1901: 0.1650, 1900: 0.2380,
    1899: -0.1122, 1898: 0.2688, 1897: 0.1648, 1896: 0.0608, 1895: 0.0344,
    1894: 0.0773, 1893: -0.0609, 1892: -0.0150, 1891: 0.2608, 1890: -0.0824,
    1889: 0.1221, 1888: 0.0792, 1887: -0.0489, 1886: 0.1154, 1885: 0.3288,
    1884: -0.0207, 1883: 0.0266, 1882: 0.0552, 1881: -0.0673, 1880: 0.3387,
    1879: 0.2290, 1878: 0.2899, 1877: 0.1488, 1876: -0.1443, 1875: 0.1128,
    1874: 0.1228, 1873: 0.0216, 1872: 0.0886, 1871: 0.1358
};

const sp500RealReturnsNoDividends = {
    2024: 0.2083, 2023: 0.1767, 2022: -0.1862, 2021: 0.1217, 2020: 0.1413,
    2019: 0.2268, 2018: -0.0797, 2017: 0.2013, 2016: 0.1569, 2015: -0.0668,
    2014: 0.1139, 2013: 0.2119, 2012: 0.1204, 2011: -0.0148, 2010: 0.1232,
    2009: 0.2649, 2008: -0.3721, 2007: -0.0721, 2006: 0.0911, 2005: 0.0409,
    2004: 0.0131, 2003: 0.2403, 2002: -0.2342, 2001: -0.1560, 2000: -0.0968,
    1999: 0.1112, 1998: 0.2750, 1997: 0.2378, 1996: 0.2102, 1995: 0.2856,
    1994: -0.0432, 1993: 0.0600, 1992: 0.0130, 1991: 0.2459, 1990: -0.0938,
    1989: 0.1323, 1988: 0.0886, 1987: -0.0899, 1986: 0.2522, 1985: 0.1678,
    1984: -0.0038, 1983: 0.1069, 1982: 0.1861, 1981: -0.1863, 1980: 0.0725,
    1979: -0.0239, 1978: 0.0110, 1977: -0.1863, 1976: 0.0186, 1975: 0.2509,
    1974: -0.3247, 1973: -0.2581, 1972: 0.1060, 1971: 0.0700, 1970: -0.0168,
    1969: -0.1665, 1968: 0.0284, 1967: 0.0858, 1966: -0.1253, 1965: 0.0632,
    1964: 0.1157, 1963: 0.1561, 1962: -0.0705, 1961: 0.1489, 1960: 0.0119,
    1959: 0.0326, 1958: 0.3340, 1957: -0.1265, 1956: -0.0008, 1955: 0.2355,
    1954: 0.4087, 1953: -0.0383, 1952: 0.0782, 1951: 0.0932, 1950: 0.1625,
    1949: 0.1223, 1948: 0.0228, 1947: -0.1155, 1946: -0.2855, 1945: 0.3064,
    1944: 0.1128, 1943: 0.1407, 1942: 0.0497, 1941: -0.2398, 1940: -0.1544,
    1939: -0.0089, 1938: 0.1210, 1937: -0.3615, 1936: 0.2511, 1935: 0.4644,
    1934: -0.1473, 1933: 0.4528, 1932: -0.0531, 1931: -0.4225, 1930: -0.2084,
    1929: -0.1267, 1928: 0.4347, 1927: 0.3233, 1926: 0.0835, 1925: 0.1556,
    1924: 0.1982, 1923: -0.0365, 1922: 0.2264, 1921: 0.1543, 1920: -0.1821,
    1919: -0.0383, 1918: -0.0762, 1917: -0.3704, 1916: -0.0882, 1915: 0.2113,
    1914: -0.1152, 1913: -0.1180, 1912: -0.0496, 1911: -0.0059, 1910: -0.0140,
    1909: 0.0056, 1908: 0.2804, 1907: -0.2677, 1906: -0.0731, 1905: 0.1708,
    1904: 0.2336, 1903: -0.1741, 1902: -0.0497, 1901: 0.1208, 1900: 0.1876,
    1899: -0.1418, 1898: 0.2284, 1897: 0.1234, 1896: 0.0174, 1895: -0.0096,
    1894: 0.0266, 1893: -0.1123, 1892: -0.0555, 1891: 0.2124, 1890: -0.1223,
    1889: 0.0781, 1888: 0.0338, 1887: -0.0916, 1886: 0.0731, 1885: 0.2702,
    1884: -0.0874, 1883: -0.0349, 1882: 0.0001, 1881: -0.1151, 1880: 0.2848,
    1879: 0.1827, 1878: 0.2281, 1877: 0.0854, 1876: -0.2110, 1875: 0.0427,
    1874: 0.0467, 1873: -0.0460, 1872: 0.0282, 1871: 0.0781
};

const HISTORICAL_START_YEAR = 1871;
const CURRENT_MAX_YEAR = 2024;

// --- State Tax Configuration ---
const stateTaxConfigs = [
    {
        name: "Virginia",
        description: "Virginia's progressive tax system with four brackets",
        brackets: [
            { rate: 0.02, minIncome: 0, maxIncome: 3000 },
            { rate: 0.03, minIncome: 3000, maxIncome: 5000 },
            { rate: 0.05, minIncome: 5000, maxIncome: 17000 },
            { rate: 0.0575, minIncome: 17000 }
        ],
        standardDeduction: 4500
    },
    {
        name: "California",
        description: "California's progressive tax system with nine brackets",
        brackets: [
            { rate: 0.01, minIncome: 0, maxIncome: 10099 },
            { rate: 0.02, minIncome: 10099, maxIncome: 23942 },
            { rate: 0.04, minIncome: 23942, maxIncome: 37788 },
            { rate: 0.06, minIncome: 37788, maxIncome: 52455 },
            { rate: 0.08, minIncome: 52455, maxIncome: 66295 },
            { rate: 0.093, minIncome: 66295, maxIncome: 338639 },
            { rate: 0.103, minIncome: 338639, maxIncome: 406364 },
            { rate: 0.113, minIncome: 406364, maxIncome: 677275 },
            { rate: 0.123, minIncome: 677275 }
        ],
        standardDeduction: 5202
    },
    {
        name: "New York",
        description: "New York's progressive tax system with eight brackets",
        brackets: [
            { rate: 0.04, minIncome: 0, maxIncome: 8500 },
            { rate: 0.045, minIncome: 8500, maxIncome: 11700 },
            { rate: 0.0525, minIncome: 11700, maxIncome: 13900 },
            { rate: 0.055, minIncome: 13900, maxIncome: 80650 },
            { rate: 0.06, minIncome: 80650, maxIncome: 215400 },
            { rate: 0.0625, minIncome: 215400, maxIncome: 1077550 },
            { rate: 0.0882, minIncome: 1077550, maxIncome: 25000000 },
            { rate: 0.0882, minIncome: 25000000 }
        ],
        standardDeduction: 8000
    },
    {
        name: "Texas",
        description: "Texas has no state income tax",
        brackets: [],
        standardDeduction: 0
    },
    {
        name: "Florida",
        description: "Florida has no state income tax",
        brackets: [],
        standardDeduction: 0
    },
    {
        name: "Custom",
        description: "Configure your own tax brackets and rates",
        brackets: [],
        standardDeduction: 0
    }
];

function calculateStateTax(income, config, customRate = 0, customDeduction = 0) {
    if (config.name === "Custom") {
        const taxableIncome = Math.max(0, income - customDeduction);
        return taxableIncome * (customRate / 100);
    }

    if (!config.brackets.length) return 0; // No tax for states without income tax

    let taxableIncome = income;
    if (config.standardDeduction) {
        taxableIncome = Math.max(0, income - config.standardDeduction);
    }

    let totalTax = 0;
    for (const bracket of config.brackets) {
        if (taxableIncome <= bracket.minIncome) continue;

        const bracketIncome = bracket.maxIncome
            ? Math.min(taxableIncome, bracket.maxIncome) - bracket.minIncome
            : taxableIncome - bracket.minIncome;

        if (bracketIncome > 0) {
            totalTax += bracketIncome * bracket.rate;
        }
    }

    return totalTax;
}

// --- Helper Functions ---
function federalTaxRate(income) {
    const taxableIncome = Math.max(0, income - 13850);
    if (taxableIncome <= 11000) return taxableIncome * 0.1;
    if (taxableIncome <= 44725) return 1100 + (taxableIncome - 11000) * 0.12;
    if (taxableIncome <= 95375) return 5147 + (taxableIncome - 44725) * 0.22;
    if (taxableIncome <= 182100) return 16290 + (taxableIncome - 95375) * 0.24;
    if (taxableIncome <= 231250) return 37104 + (taxableIncome - 182100) * 0.32;
    if (taxableIncome <= 578125) return 52832 + (taxableIncome - 231250) * 0.35;
    return 174238.25 + (taxableIncome - 578125) * 0.37;
}

function getRealReturn(year, includeDividends = true) {
    const dataSet = includeDividends ? sp500RealReturnsWithDividends : sp500RealReturnsNoDividends;
    const returnValue = dataSet[year] || 0;
    return returnValue * 100; // Convert to percentage
}

// --- Core Projection Logic ---
function generateProjection(simConfig) {
    const {
        pStartAge,
        pEndAge,
        pInitialCash,
        pSavingsRate,
        pSimStartYear,
        pInvestmentReturn,
        pSalarySchedule,
        pIncludeDividends,
        pStateTaxConfig,
        pCustomTaxRate,
        pCustomStandardDeduction
    } = simConfig;

    if (pSalarySchedule.length === 0) return [];

    let netWorth = pInitialCash;
    const projectionData = [];
    const simulationYears = pEndAge - pStartAge + 1;

    // Pre-sort salary schedule
    const sortedSchedule = [...pSalarySchedule].sort((a, b) => a.age - b.age);

    // Cache salary lookup per age
    let salaryCache = {};
    const getSalaryForAge = (age) => {
        if (salaryCache[age] !== undefined) return salaryCache[age];
        let currentSalary = sortedSchedule[0]?.salary ?? 0;
        for (let j = sortedSchedule.length - 1; j >= 0; j--) {
            if (age >= sortedSchedule[j].age) {
                currentSalary = sortedSchedule[j].salary;
                break;
            }
        }
        salaryCache[age] = currentSalary;
        return currentSalary;
    };

    for (let i = 0; i < simulationYears; i++) {
        const currentAge = pStartAge + i;
        const currentYear = pSimStartYear + i;
        const currentSalary = getSalaryForAge(currentAge);

        const stateTax = calculateStateTax(currentSalary, pStateTaxConfig, pCustomTaxRate, pCustomStandardDeduction);
        const fedTax = federalTaxRate(currentSalary);
        const totalTax = stateTax + fedTax;
        const afterTaxIncome = Math.max(0, currentSalary - totalTax);
        const annualSavings = afterTaxIncome * (pSavingsRate / 100);
        const livingMoney = afterTaxIncome - annualSavings;

        const historicalReturn = getRealReturn(currentYear, pIncludeDividends);
        const returnRate = historicalReturn !== 0 ? historicalReturn : pInvestmentReturn;
        const usedFallback = historicalReturn === 0 && currentYear <= CURRENT_MAX_YEAR && currentYear >= HISTORICAL_START_YEAR;

        const growthFactor = 1 + returnRate / 100;
        netWorth = netWorth * growthFactor + annualSavings;

        projectionData.push({
            age: currentAge,
            year: currentYear,
            salary: currentSalary,
            totalTax,
            afterTaxIncome,
            annualSavings,
            livingMoney,
            returnRate,
            usedFallback,
            netWorth: Math.max(0, netWorth)
        });
    }

    return projectionData;
}

// --- Web Worker Message Handler ---
self.onmessage = function (event) {
    const config = event.data;
    const results = [];

    // Pre-sort salary schedule once before the loop
    const sortedSalarySchedule = [...config.pSalarySchedule].sort((a, b) => a.age - b.age);

    // Backtest Loop
    for (let year = HISTORICAL_START_YEAR; year <= CURRENT_MAX_YEAR; year++) {
        const projectionConfig = {
            ...config,
            pSimStartYear: year,
            pSalarySchedule: sortedSalarySchedule,
            pIncludeDividends: config.includeDividends,
            pStateTaxConfig: config.stateTaxConfig,
            pCustomTaxRate: config.customTaxRate,
            pCustomStandardDeduction: config.customStandardDeduction
        };

        const resultData = generateProjection(projectionConfig);

        if (resultData.length > 0) {
            const finalNetWorth = resultData[resultData.length - 1].netWorth;

            let totalReturn = 0;
            let estimatedReturnYears = 0;
            let validReturnYears = 0;

            for (const row of resultData) {
                if (row.year >= HISTORICAL_START_YEAR && row.year <= CURRENT_MAX_YEAR) {
                    totalReturn += row.returnRate;
                    validReturnYears++;
                }
                if (row.usedFallback) {
                    estimatedReturnYears++;
                }
            }

            const avgReturn = validReturnYears > 0 ? totalReturn / validReturnYears : 0;

            results.push({
                year: year,
                netWorth: finalNetWorth,
                avgReturn: avgReturn,
                usedEstimatedReturns: estimatedReturnYears > 0,
                estimatedReturnYears: estimatedReturnYears
            });
        } else {
            results.push({
                year: year,
                netWorth: 0,
                avgReturn: 0,
                usedEstimatedReturns: false,
                estimatedReturnYears: 0
            });
        }
    }

    self.postMessage(results);
}; 