"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    TooltipProps,
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

// Historical S&P 500 REAL returns (inflation-adjusted), assumed 1929-2024 based on length
const realReturns = [
    -12.44, -23.59, -41.64, -5.41, 45.43, -7.57, 37.21, 26.13, -40.28, 28.78,
    -5.45, -15.29, -25.23, 3.13, 15.89, 11.31, 27.97, -25.35, -8.09, -3.57,
    12.57, 14.99, 9.85, 10.94, -7.25, 45.38, 25.85, -0.37, -16.52, 35.59, 6.67,
    -4.33, 22.17, -12.9, 17.06, 11.9, 7.04, -15.95, 16.61, 3.38, -16.65, -5.2,
    7.24, 11.86, -23.97, -37.59, 23.0, 13.56, -17.13, -7.3, -0.87, 11.79,
    -17.01, 10.56, 13.02, -2.41, 21.54, 13.39, -2.74, 7.66, 21.57, -10.02,
    22.51, 1.52, 4.23, -4.19, 30.73, 16.42, 28.84, 24.61, 16.32, -13.03, -14.47,
    -25.07, 23.91, 5.49, -0.38, 11.03, -1.47, -38.49, 22.46, 12.78, -0.0, 13.41,
    29.6, 11.39, -0.73, 9.54, 19.42, -6.24, 28.88, 16.26, 26.89, -19.44, 24.23,
    23.31, -2.88,
];
const HISTORICAL_START_YEAR = 1929;
const LAST_HISTORICAL_DATA_YEAR =
    HISTORICAL_START_YEAR + realReturns.length - 1;

// Helper: Format currency
const formatCurrency = (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return "$0.00";

    return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

// Helper: Format currency for smaller numbers or details
const formatCurrencyDetailed = (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return "$0.00";

    return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

// --- Tax Functions ---
const virginiaTaxRate = (income: number): number => {
    if (income <= 3000) return 0.02 * income;
    if (income <= 5000) return 60 + 0.03 * (income - 3000);
    if (income <= 17000) return 120 + 0.05 * (income - 5000);

    return 720 + 0.0575 * (income - 17000);
};

const federalTaxRate = (income: number): number => {
    const taxableIncome = Math.max(0, income - 13850);

    if (taxableIncome <= 11000) return taxableIncome * 0.1;
    if (taxableIncome <= 44725) return 1100 + (taxableIncome - 11000) * 0.12;
    if (taxableIncome <= 95375) return 5147 + (taxableIncome - 44725) * 0.22;
    if (taxableIncome <= 182100) return 16290 + (taxableIncome - 95375) * 0.24;
    if (taxableIncome <= 231250) return 37104 + (taxableIncome - 182100) * 0.32;
    if (taxableIncome <= 578125) return 52832 + (taxableIncome - 231250) * 0.35;

    return 174238.25 + (taxableIncome - 578125) * 0.37;
};

interface SalaryEntry {
    age: number;
    salary: number;
}

interface ProjectionData {
    age: number;
    salary: number;
    totalTax: number;
    afterTaxIncome: number;
    annualSavings: number;
    livingMoney: number;
    returnRate: number;
    netWorth: number;
}

interface BacktestResult {
    year: number;
    netWorth: number;
    avgReturn: number;
}

interface BacktestStats {
    best: BacktestResult;
    worst: BacktestResult;
    avgNetWorth: number;
    medianNetWorth: number;
    results: BacktestResult[];
}

interface SimulationConfig {
    pStartAge: number;
    pEndAge: number;
    pInitialCash: number;
    pSavingsRate: number;
    pUseHistorical: boolean;
    pSimStartYear: number;
    pInvestmentReturn: number;
    pSalarySchedule: SalaryEntry[];
}

// Custom tooltip for main chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border rounded shadow-lg">
                <p className="font-semibold">Age: {label}</p>
                <div className="space-y-1 mt-2 text-sm">
                    <p>Net Worth: {formatCurrency(data.netWorth)}</p>
                    <p>Income: {formatCurrency(data.salary)}</p>
                    <p>Taxes: {formatCurrency(data.totalTax)}</p>
                    <p>Savings: {formatCurrency(data.annualSavings)}</p>
                    <p>Spending: {formatCurrency(data.livingMoney)}</p>
                    {data.returnRate && (
                        <p>Return Rate: {data.returnRate.toFixed(2)}%</p>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

// Custom tooltip for backtest chart
const BacktestCustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border rounded shadow-lg">
                <p className="font-semibold">Start Year: {label}</p>
                <div className="space-y-1 mt-2 text-sm">
                    <p>Final Net Worth: {formatCurrency(data.netWorth)}</p>
                    <p>Average Return: {data.avgReturn.toFixed(2)}%</p>
                </div>
            </div>
        );
    }
    return null;
};

export default function NetWorthCalculator() {
    const [startAge, setStartAge] = useState(22);
    const [endAge, setEndAge] = useState(65);
    const [initialCash, setInitialCash] = useState(100000);
    const [investmentReturn, setInvestmentReturn] = useState(5);
    const [savingsRate, setSavingsRate] = useState(20);
    const [useHistorical, setUseHistorical] = useState(true);
    const [historicalStartYear, setHistoricalStartYear] = useState(1980);
    const [salarySchedule, setSalarySchedule] = useState<SalaryEntry[]>([
        { age: 22, salary: 131000 },
        { age: 23, salary: 148000 },
        { age: 25, salary: 178000 },
        { age: 27, salary: 221000 },
        { age: 29, salary: 287000 },
        { age: 40, salary: 350000 },
        { age: 50, salary: 400000 },
    ]);

    // Sort schedule by age for reliable lookup
    const sortedSalarySchedule = useMemo(
        () => [...salarySchedule].sort((a, b) => a.age - b.age),
        [salarySchedule],
    );

    // --- Salary Schedule Editing ---
    const handleSalaryChange = useCallback(
        (index: number, field: keyof SalaryEntry, value: string) => {
            setSalarySchedule((currentSchedule) => {
                const newSchedule = [...currentSchedule];
                const numValue = Number(value);

                if (!isNaN(numValue) && numValue >= 0) {
                    newSchedule[index] = {
                        ...newSchedule[index],
                        [field]: numValue,
                    };

                    return newSchedule;
                }

                return currentSchedule;
            });
        },
        [],
    );

    const addSalaryEntry = useCallback(() => {
        setSalarySchedule((currentSchedule) => {
            const lastEntry =
                currentSchedule.length > 0
                    ? currentSchedule[currentSchedule.length - 1]
                    : { age: startAge, salary: 0 };
            const newAge =
                currentSchedule.length > 0 ? lastEntry.age + 1 : startAge;

            return [
                ...currentSchedule,
                { age: newAge, salary: lastEntry.salary },
            ];
        });
    }, [startAge]);

    const removeSalaryEntry = useCallback((index: number) => {
        setSalarySchedule((currentSchedule) =>
            currentSchedule.filter((_, i) => i !== index),
        );
    }, []);

    // --- Core Projection Logic ---
    const generateProjection = useCallback(
        (simConfig: SimulationConfig): ProjectionData[] => {
            const {
                pStartAge,
                pEndAge,
                pInitialCash,
                pSavingsRate,
                pUseHistorical,
                pSimStartYear,
                pInvestmentReturn,
                pSalarySchedule,
            } = simConfig;

            if (pSalarySchedule.length === 0) {
                console.error("Salary schedule cannot be empty.");

                return [];
            }

            let netWorth = pInitialCash;
            const projectionData: ProjectionData[] = [];
            const simulationYears = pEndAge - pStartAge + 1;

            for (let i = 0; i < simulationYears; i++) {
                const currentAge = pStartAge + i;

                let currentSalary = pSalarySchedule[0].salary;

                for (let j = pSalarySchedule.length - 1; j >= 0; j--) {
                    if (currentAge >= pSalarySchedule[j].age) {
                        currentSalary = pSalarySchedule[j].salary;
                        break;
                    }
                }

                const stateTax = virginiaTaxRate(currentSalary);
                const fedTax = federalTaxRate(currentSalary);
                const totalTax = stateTax + fedTax;
                const afterTaxIncome = Math.max(0, currentSalary - totalTax);
                const annualSavings = afterTaxIncome * (pSavingsRate / 100);
                const livingMoney = afterTaxIncome - annualSavings;

                let returnRate = pInvestmentReturn;

                if (pUseHistorical) {
                    const historicalYearIndex =
                        pSimStartYear - HISTORICAL_START_YEAR + i;

                    if (
                        historicalYearIndex >= 0 &&
                        historicalYearIndex < realReturns.length
                    ) {
                        returnRate = realReturns[historicalYearIndex];
                    } else {
                        console.warn(
                            `Historical data not available for year index ${historicalYearIndex} (Sim Age: ${currentAge}, Sim Start Year: ${pSimStartYear}). Using default return ${pInvestmentReturn}%.`,
                        );
                        returnRate = pInvestmentReturn;
                    }
                }

                netWorth = netWorth * (1 + returnRate / 100) + annualSavings;

                projectionData.push({
                    age: currentAge,
                    salary: currentSalary,
                    totalTax,
                    afterTaxIncome,
                    annualSavings,
                    livingMoney,
                    returnRate,
                    netWorth: Math.max(0, netWorth),
                });
            }

            return projectionData;
        },
        [],
    );

    // Memoize the main projection table data
    const tableData = useMemo(() => {
        if (startAge > endAge || sortedSalarySchedule.length === 0) {
            return [];
        }

        return generateProjection({
            pStartAge: startAge,
            pEndAge: endAge,
            pInitialCash: initialCash,
            pSavingsRate: savingsRate,
            pUseHistorical: useHistorical,
            pSimStartYear: historicalStartYear,
            pInvestmentReturn: investmentReturn,
            pSalarySchedule: sortedSalarySchedule,
        });
    }, [
        startAge,
        endAge,
        initialCash,
        savingsRate,
        useHistorical,
        historicalStartYear,
        investmentReturn,
        sortedSalarySchedule,
        generateProjection,
    ]);

    // --- Backtesting Logic ---
    const canRunHistorical = useMemo(() => {
        const requiredYears = endAge - startAge + 1;

        if (requiredYears <= 0) return false;

        return requiredYears <= realReturns.length;
    }, [startAge, endAge]);

    const maxBacktestStartYear = useMemo(() => {
        return (
            HISTORICAL_START_YEAR + realReturns.length - (endAge - startAge + 1)
        );
    }, [startAge, endAge]);

    const backtestStats = useMemo(() => {
        if (
            !useHistorical ||
            !canRunHistorical ||
            sortedSalarySchedule.length === 0
        ) {
            return null;
        }

        const results: BacktestResult[] = [];

        for (
            let year = HISTORICAL_START_YEAR;
            year <= maxBacktestStartYear;
            year++
        ) {
            const resultData = generateProjection({
                pStartAge: startAge,
                pEndAge: endAge,
                pInitialCash: initialCash,
                pSavingsRate: savingsRate,
                pUseHistorical: true,
                pSimStartYear: year,
                pInvestmentReturn: investmentReturn,
                pSalarySchedule: sortedSalarySchedule,
            });

            if (resultData.length > 0) {
                const finalNetWorth =
                    resultData[resultData.length - 1].netWorth;
                const avgReturn =
                    resultData.reduce((acc, row) => acc + row.returnRate, 0) /
                    resultData.length;

                results.push({
                    year: year,
                    netWorth: finalNetWorth,
                    avgReturn: avgReturn,
                });
            }
        }

        if (results.length === 0) return null;

        const best = results.reduce((a, b) =>
            a.netWorth > b.netWorth ? a : b,
        );
        const worst = results.reduce((a, b) =>
            a.netWorth < b.netWorth ? a : b,
        );
        const avgNetWorth =
            results.reduce((acc, r) => acc + r.netWorth, 0) / results.length;

        // Calculate median net worth
        const sortedNetWorths = [...results].sort(
            (a, b) => a.netWorth - b.netWorth,
        );
        const mid = Math.floor(sortedNetWorths.length / 2);
        const medianNetWorth =
            sortedNetWorths.length % 2 === 0
                ? (sortedNetWorths[mid - 1].netWorth +
                    sortedNetWorths[mid].netWorth) /
                2
                : sortedNetWorths[mid].netWorth;

        return { best, worst, avgNetWorth, medianNetWorth, results };
    }, [
        useHistorical,
        canRunHistorical,
        startAge,
        endAge,
        initialCash,
        savingsRate,
        investmentReturn,
        sortedSalarySchedule,
        maxBacktestStartYear,
        generateProjection,
    ]);

    return (
        <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Net Worth Projection
            </h1>

            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                <strong>Important:</strong> All monetary values (Initial Cash,
                Salaries) should be entered in{" "}
                <strong className="font-semibold">today&apos;s dollars</strong>.
                The projection uses historical{" "}
                <strong className="font-semibold">real</strong>{" "}
                (inflation-adjusted) returns, so the final net worth is also in
                today&apos;s purchasing power. No separate inflation input is
                needed.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Core Parameters */}
                <fieldset className="border p-4 rounded-md bg-white shadow-sm">
                    <legend className="text-lg font-semibold px-2 text-gray-700">
                        Simulation Parameters
                    </legend>
                    <div className="space-y-4 p-2">
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Start Age
                            <input
                                className="mt-1 p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                min="0"
                                type="number"
                                value={startAge}
                                onChange={(e) =>
                                    setStartAge(
                                        Math.max(
                                            0,
                                            parseInt(e.target.value) || 0,
                                        ),
                                    )
                                }
                            />
                        </label>
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            End Age
                            <input
                                className="mt-1 p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                min={startAge}
                                type="number"
                                value={endAge}
                                onChange={(e) =>
                                    setEndAge(
                                        Math.max(
                                            startAge,
                                            parseInt(e.target.value) ||
                                            startAge,
                                        ),
                                    )
                                }
                            />
                        </label>
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Initial Cash ({formatCurrency(initialCash)})
                            <input
                                className="mt-1 p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                min="0"
                                step="1000"
                                type="number"
                                value={initialCash}
                                onChange={(e) =>
                                    setInitialCash(
                                        Math.max(0, Number(e.target.value)),
                                    )
                                }
                            />
                        </label>
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Annual Savings Rate (% of After-Tax Income)
                            <input
                                className="mt-1 p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                max="100"
                                min="0"
                                step="1"
                                type="number"
                                value={savingsRate}
                                onChange={(e) =>
                                    setSavingsRate(
                                        Math.max(
                                            0,
                                            Math.min(
                                                100,
                                                Number(e.target.value),
                                            ),
                                        ),
                                    )
                                }
                            />
                        </label>
                    </div>
                </fieldset>

                {/* Column 2: Investment & Historical Options */}
                <fieldset className="border p-4 rounded-md bg-white shadow-sm">
                    <legend className="text-lg font-semibold px-2 text-gray-700">
                        Investment Returns
                    </legend>
                    <div className="space-y-4 p-2">
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            Expected Annual Real Return (%)
                            <input
                                className={`mt-1 p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${useHistorical ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                disabled={useHistorical}
                                step="0.1"
                                type="number"
                                value={investmentReturn}
                                onChange={(e) =>
                                    setInvestmentReturn(Number(e.target.value))
                                }
                            />
                            <span className="text-xs text-gray-500 mt-1">
                                Used when &quot;Use Historical&quot; is
                                unchecked. Represents average return above
                                inflation.
                            </span>
                        </label>

                        <div className="flex items-start space-x-3 pt-2">
                            <input
                                checked={useHistorical}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!canRunHistorical}
                                id="use-historical"
                                type="checkbox"
                                onChange={(e) =>
                                    setUseHistorical(e.target.checked)
                                }
                            />
                            <div className="flex-1">
                                <label
                                    className={`text-sm font-medium ${!canRunHistorical ? "text-gray-400" : "text-gray-700"}`}
                                    htmlFor="use-historical"
                                >
                                    Use Historical S&P 500 Real Returns
                                </label>
                                {!canRunHistorical && (
                                    <p className="text-xs text-red-600">
                                        Age range too long for available
                                        historical data ({realReturns.length}{" "}
                                        years).
                                    </p>
                                )}
                                {canRunHistorical && (
                                    <p className="text-xs text-gray-500">
                                        Uses actual year-by-year
                                        inflation-adjusted S&P 500 returns.
                                        Enables backtesting.
                                    </p>
                                )}
                            </div>
                        </div>

                        {useHistorical && canRunHistorical && (
                            <label className="flex flex-col text-sm font-medium text-gray-700">
                                Projection Start Year (for main chart)
                                <input
                                    className="mt-1 p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    max={maxBacktestStartYear}
                                    min={HISTORICAL_START_YEAR}
                                    type="number"
                                    value={historicalStartYear}
                                    onChange={(e) =>
                                        setHistoricalStartYear(
                                            Math.max(
                                                HISTORICAL_START_YEAR,
                                                Math.min(
                                                    maxBacktestStartYear,
                                                    parseInt(e.target.value) ||
                                                    HISTORICAL_START_YEAR,
                                                ),
                                            ),
                                        )
                                    }
                                />
                                <span className="text-xs text-gray-500 mt-1">
                                    Select the year the historical sequence
                                    begins for the primary projection chart
                                    (e.g., 1980). Max possible:{" "}
                                    {maxBacktestStartYear}.
                                </span>
                            </label>
                        )}
                    </div>
                </fieldset>

                {/* Column 3: Salary Schedule Editor */}
                <fieldset className="border p-4 rounded-md bg-white shadow-sm">
                    <legend className="text-lg font-semibold px-2 text-gray-700">
                        Salary Schedule (in Today&apos;s Dollars)
                    </legend>
                    <div className="space-y-3 p-2 max-h-96 overflow-y-auto">
                        {sortedSalarySchedule.length === 0 && (
                            <p className="text-sm text-red-600">
                                Please add at least one salary entry.
                            </p>
                        )}
                        {sortedSalarySchedule.map((entry, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-2"
                            >
                                <label className="flex items-center text-sm">
                                    Age:
                                    <input
                                        className="ml-1 p-1 border rounded-md w-16 text-right"
                                        min="0"
                                        type="number"
                                        value={entry.age}
                                        onChange={(e) =>
                                            handleSalaryChange(
                                                index,
                                                "age",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <label className="flex items-center text-sm flex-grow">
                                    Salary: $
                                    <input
                                        className="ml-1 p-1 border rounded-md flex-grow text-right"
                                        min="0"
                                        step="1000"
                                        type="number"
                                        value={entry.salary}
                                        onChange={(e) =>
                                            handleSalaryChange(
                                                index,
                                                "salary",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                                <button
                                    className="text-red-500 hover:text-red-700 text-sm font-medium p-1"
                                    title="Remove Entry"
                                    onClick={() => removeSalaryEntry(index)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        className="mt-3 w-full text-sm bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md transition duration-150 ease-in-out"
                        onClick={addSalaryEntry}
                    >
                        Add Salary Entry
                    </button>
                    <p className="text-xs text-gray-500 mt-2 px-2">
                        Enter income at specific ages. The projection will use
                        the salary from the closest preceding age entry.
                    </p>
                </fieldset>
            </div>

            {/* Main Projection Chart */}
            <div className="mt-8 bg-white p-4 rounded-md shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Retired Net Worth:{" "}
                    {formatCurrency(
                        tableData[tableData.length - 1]?.netWorth || 0,
                    )}
                </h2>
                {tableData.length > 0 ? (
                    <ResponsiveContainer height={400} width="100%">
                        <LineChart
                            data={tableData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid
                                stroke="#e0e0e0"
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                dataKey="age"
                                label={{
                                    value: "Age",
                                    position: "insideBottomRight",
                                    offset: -5,
                                }}
                            />
                            <YAxis
                                domain={["auto", "auto"]}
                                tickFormatter={(value) =>
                                    `$${(value / 1000).toFixed(0)}k`
                                }
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                dataKey="netWorth"
                                dot={false}
                                name="Net Worth"
                                stroke="#8884d8"
                                strokeWidth={2}
                                type="monotone"
                            />
                            <Line
                                dataKey="salary"
                                dot={false}
                                name="Income"
                                stroke="#82ca9d"
                                strokeWidth={1}
                                type="monotone"
                            />
                            <Line
                                dataKey="annualSavings"
                                dot={false}
                                name="Savings"
                                stroke="#ffc658"
                                strokeWidth={1}
                                type="monotone"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-500">
                        Enter valid parameters and at least one salary entry to
                        see the projection.
                    </p>
                )}
            </div>

            {/* Backtesting Section */}
            {useHistorical && backtestStats && (
                <div className="mt-8 bg-white p-4 rounded-md shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Historical Backtest Results
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        This shows the final net worth if your simulation period
                        ({startAge}-{endAge}) had started in different
                        historical years, using actual S&P 500 real returns for
                        each period.
                    </p>
                    <div className="text-sm mt-4 space-y-2 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <p className="bg-green-50 p-3 rounded border border-green-200">
                            <strong>Best Period Start:</strong>{" "}
                            {backtestStats.best.year} <br />
                            Final Net Worth:{" "}
                            <span className="font-semibold">
                                {formatCurrencyDetailed(
                                    backtestStats.best.netWorth,
                                )}
                            </span>
                        </p>
                        <p className="bg-red-50 p-3 rounded border border-red-200">
                            <strong>Worst Period Start:</strong>{" "}
                            {backtestStats.worst.year} <br />
                            Final Net Worth:{" "}
                            <span className="font-semibold">
                                {formatCurrencyDetailed(
                                    backtestStats.worst.netWorth,
                                )}
                            </span>
                        </p>
                        <p className="bg-blue-50 p-3 rounded border border-blue-200">
                            <strong>Average Final Net Worth:</strong>
                            <br />
                            Across all periods:{" "}
                            <span className="font-semibold">
                                {formatCurrencyDetailed(
                                    backtestStats.avgNetWorth,
                                )}
                            </span>
                        </p>
                        <p className="bg-purple-50 p-3 rounded border border-purple-200">
                            <strong>Median Final Net Worth:</strong>
                            <br />
                            Across all periods:{" "}
                            <span className="font-semibold">
                                {formatCurrencyDetailed(
                                    backtestStats.medianNetWorth,
                                )}
                            </span>
                        </p>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Final Net Worth by Historical Start Year
                    </h3>
                    <ResponsiveContainer height={300} width="100%">
                        <LineChart
                            data={backtestStats.results}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid
                                stroke="#e0e0e0"
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                dataKey="year"
                                label={{
                                    value: "Simulation Start Year",
                                    position: "insideBottomRight",
                                    offset: -5,
                                }}
                            />
                            <YAxis
                                domain={["auto", "auto"]}
                                tickFormatter={(value) =>
                                    `$${(value / 1000).toFixed(0)}k`
                                }
                            />
                            <Tooltip content={<BacktestCustomTooltip />} />
                            <Line
                                dataKey="netWorth"
                                dot={false}
                                name="Final Net Worth"
                                stroke="#82ca9d"
                                type="monotone"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
