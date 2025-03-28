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
import {
    NameType,
    ValueType,
} from "recharts/types/component/DefaultTooltipContent";

// Define retro color palette (adjust as needed)
const colors = {
    background: "bg-gradient-to-br from-amber-100 via-orange-200 to-amber-200", // Linen/paper texture
    panelBg: "bg-gradient-to-b from-stone-300 to-stone-400", // Light metallic/plastic
    panelShadow:
        "shadow-[4px_4px_8px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(255,255,255,0.5),inset_0_0_0_1px_rgba(0,0,0,0.1)]",
    legendBg: "bg-gradient-to-b from-stone-400 to-stone-500", // Darker label area
    legendText: "text-stone-100 text-shadow-sm shadow-black/50",
    inputText: "text-gray-800",
    inputBg:
        "bg-gradient-to-b from-gray-100 to-gray-200 shadow-inner shadow-black/20", // Inset look
    inputBorder: "border border-gray-400 border-t-gray-300 border-l-gray-300",
    buttonBg: "bg-gradient-to-b from-sky-500 to-sky-700",
    buttonHoverBg: "hover:from-sky-400 hover:to-sky-600",
    buttonActiveBg:
        "active:from-sky-600 active:to-sky-800 active:shadow-inner active:shadow-black/30 active:pt-px", // Press down effect
    buttonShadow:
        "shadow-[2px_2px_5px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]",
    buttonText: "text-white font-semibold text-shadow-sm shadow-black/40",
    removeButtonBg: "bg-gradient-to-b from-red-500 to-red-700",
    removeButtonHoverBg: "hover:from-red-400 hover:to-red-600",
    removeButtonActiveBg:
        "active:from-red-600 active:to-red-800 active:shadow-inner active:shadow-black/30 active:pt-px",
    chartPanelBg: "bg-gradient-to-b from-zinc-700 via-zinc-800 to-black", // Darker chart area
    chartPanelShadow:
        "shadow-[6px_6px_12px_rgba(0,0,0,0.4),-3px_-3px_6px_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(0,0,0,0.2)]",
    tooltipBg: "bg-yellow-50/95 border-amber-700 border-2 shadow-xl", // Old paper tooltip
    tooltipText: "text-amber-900",
    accentLine1: "#a0522d", // Sienna - for Net Worth
    accentLine2: "#2e8b57", // SeaGreen - for Income
    accentLine3: "#daa520", // Goldenrod - for Savings
    accentLineBacktest: "#4682b4", // SteelBlue - for Backtest
    readoutBg:
        "bg-gray-800 text-green-400 font-mono p-2 rounded shadow-inner shadow-black border border-gray-900/50", // LCD Readout
    statsPanelBg:
        "bg-gradient-to-b from-blue-100 to-blue-200 border border-blue-500 shadow-md", // Info panel style
};

// --- Data and Helpers (Unchanged) ---
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

const formatCurrency = (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return "$0";

    return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

const formatCurrencyDetailed = (value: number | null | undefined): string => {
    if (value == null || isNaN(value)) return "$0.00";

    return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

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

// --- Custom Tooltips (Skeuomorphic Style) ---
const CustomTooltip = ({
    active,
    payload,
    label,
}: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;

        return (
            <div
                className={`${colors.tooltipBg} p-3 rounded ${colors.tooltipText}`}
            >
                <p className="font-bold text-base mb-2 border-b border-amber-600 pb-1">
                    Age: {label}
                </p>
                <div className="space-y-1 text-sm font-medium">
                    <p>
                        Net Worth:{" "}
                        <span className="font-bold">
                            {formatCurrency(data.netWorth)}
                        </span>
                    </p>
                    <p>Income: {formatCurrency(data.salary)}</p>
                    <p>Taxes: {formatCurrency(data.totalTax)}</p>
                    <p>Savings: {formatCurrency(data.annualSavings)}</p>
                    <p>Spending: {formatCurrency(data.livingMoney)}</p>
                    {data.returnRate != null && ( // Check for null/undefined
                        <p>
                            Return Rate:{" "}
                            <span
                                className={
                                    data.returnRate >= 0
                                        ? "text-green-700"
                                        : "text-red-700"
                                }
                            >
                                {data.returnRate.toFixed(2)}%
                            </span>
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

const BacktestCustomTooltip = ({
    active,
    payload,
    label,
}: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;

        return (
            <div
                className={`${colors.tooltipBg} p-3 rounded ${colors.tooltipText}`}
            >
                <p className="font-bold text-base mb-2 border-b border-amber-600 pb-1">
                    Start Year: {label}
                </p>
                <div className="space-y-1 text-sm font-medium">
                    <p>
                        Final Net Worth:{" "}
                        <span className="font-bold">
                            {formatCurrency(data.netWorth)}
                        </span>
                    </p>
                    <p>Avg. Return: {data.avgReturn.toFixed(2)}%</p>
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

    // --- Hooks and Logic (Unchanged) ---
    const sortedSalarySchedule = useMemo(
        () => [...salarySchedule].sort((a, b) => a.age - b.age),
        [salarySchedule],
    );

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

            if (pSalarySchedule.length === 0) return [];

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
                        // console.warn(`Historical data fallback for year index ${historicalYearIndex}.`); // Keep console clean for UI focus
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

    const tableData = useMemo(() => {
        if (startAge > endAge || sortedSalarySchedule.length === 0) return [];

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

    const canRunHistorical = useMemo(
        () => endAge - startAge + 1 <= realReturns.length,
        [startAge, endAge],
    );
    const maxBacktestStartYear = useMemo(
        () =>
            HISTORICAL_START_YEAR +
            realReturns.length -
            (endAge - startAge + 1),
        [startAge, endAge],
    );

    const backtestStats = useMemo(() => {
        if (
            !useHistorical ||
            !canRunHistorical ||
            sortedSalarySchedule.length === 0
        )
            return null;
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

    // --- Component Rendering ---
    return (
        <div
            className={`p-6 md:p-10 min-h-screen ${colors.background} font-sans`}
        >
            {/* Title Plaque */}
            <div className="mb-8 text-center">
                <h1
                    className={`inline-block px-8 py-3 text-3xl font-bold ${colors.legendBg} ${colors.legendText} rounded-lg ${colors.panelShadow} tracking-wide`}
                >
                    Net Worth Projection
                </h1>
            </div>

            {/* Explanatory Note - Taped Paper Style */}
            <p className="text-sm text-amber-900 bg-yellow-50/80 p-4 rounded-md border-2 border-dashed border-amber-700/50 shadow-lg mb-8 max-w-4xl mx-auto relative">
                <span className="absolute -top-2 -left-2 bg-gray-400/50 w-8 h-8 rotate-[-20deg] shadow-sm" />{" "}
                {/* Tape */}
                <span className="absolute -top-2 -right-2 bg-gray-400/50 w-8 h-8 rotate-[15deg] shadow-sm" />{" "}
                {/* Tape */}
                <strong className="font-semibold text-amber-950">
                    IMPORTANT NOTE:
                </strong>{" "}
                All monetary values (Initial Cash, Salaries) are in{" "}
                <strong className="font-semibold text-amber-950">
                    {`today's dollars`}
                </strong>
                . The projection utilizes historical{" "}
                <strong className="font-semibold text-amber-950">real</strong>{" "}
                (inflation-adjusted) returns. The final net worth is also
                {`presented in today's purchasing power.`}
            </p>

            {/* Control Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* --- Column 1: Core Parameters --- */}
                <fieldset
                    className={`p-5 rounded-lg ${colors.panelBg} ${colors.panelShadow}`}
                >
                    <legend
                        className={`px-3 py-1 text-lg font-semibold ${colors.legendBg} ${colors.legendText} rounded-md -mt-8 mb-4 inline-block ${colors.panelShadow}`}
                    >
                        Simulation Setup
                    </legend>
                    <div className="space-y-5 p-2">
                        {/* Input Field Styling */}
                        {[
                            {
                                label: "Start Age",
                                value: startAge,
                                setter: setStartAge,
                                min: 0,
                                step: 1,
                            },
                            {
                                label: "End Age",
                                value: endAge,
                                setter: setEndAge,
                                min: startAge,
                                step: 1,
                            },
                            {
                                label: `Initial Cash (${formatCurrency(initialCash)})`,
                                value: initialCash,
                                setter: setInitialCash,
                                min: 0,
                                step: 1000,
                            },
                            {
                                label: "Savings Rate (% After-Tax)",
                                value: savingsRate,
                                setter: setSavingsRate,
                                min: 0,
                                max: 100,
                                step: 1,
                            },
                        ].map(({ label, value, setter, min, max, step }) => (
                            <label
                                key={label}
                                className="flex flex-col text-sm font-medium text-gray-800"
                            >
                                {label}
                                <input
                                    className={`mt-1 p-2 rounded-md ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-300 focus:ring-sky-500`}
                                    max={max}
                                    min={min}
                                    step={step}
                                    type="number"
                                    value={value}
                                    onChange={(e) => {
                                        let numVal = Number(e.target.value);

                                        if (min !== undefined)
                                            numVal = Math.max(min, numVal);
                                        if (max !== undefined)
                                            numVal = Math.min(max, numVal);
                                        setter(
                                            isNaN(numVal) ? (min ?? 0) : numVal,
                                        );
                                    }}
                                />
                            </label>
                        ))}
                    </div>
                </fieldset>

                {/* --- Column 2: Investment & Historical --- */}
                <fieldset
                    className={`p-5 rounded-lg ${colors.panelBg} ${colors.panelShadow}`}
                >
                    <legend
                        className={`px-3 py-1 text-lg font-semibold ${colors.legendBg} ${colors.legendText} rounded-md -mt-8 mb-4 inline-block ${colors.panelShadow}`}
                    >
                        Investment Engine
                    </legend>
                    <div className="space-y-5 p-2">
                        <label className="flex flex-col text-sm font-medium text-gray-800">
                            Expected Annual Real Return (%)
                            <input
                                className={`mt-1 p-2 rounded-md ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-300 focus:ring-sky-500 ${useHistorical ? "opacity-50 cursor-not-allowed bg-gray-300" : ""}`}
                                disabled={useHistorical}
                                step="0.1"
                                type="number"
                                value={investmentReturn}
                                onChange={(e) =>
                                    setInvestmentReturn(Number(e.target.value))
                                }
                            />
                            <span className="text-xs text-gray-600 mt-1 italic">
                                Used only when Historical Returns are OFF.
                            </span>
                        </label>

                        {/* Custom Checkbox */}
                        <div className="flex items-center space-x-3 pt-2 group">
                            <input
                                checked={useHistorical}
                                className="appearance-none h-5 w-5 border-2 border-gray-500 rounded-sm bg-gray-100 checked:bg-sky-600 checked:border-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-stone-300 focus:ring-sky-500 relative cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed peer"
                                disabled={!canRunHistorical}
                                id="use-historical"
                                type="checkbox"
                                onChange={(e) =>
                                    setUseHistorical(e.target.checked)
                                }
                            />
                            {/* Checkmark SVG */}
                            <svg
                                aria-hidden="true"
                                className="absolute w-5 h-5 hidden peer-checked:block pointer-events-none p-0.5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    clipRule="evenodd"
                                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                    fillRule="evenodd"
                                />
                            </svg>

                            <div className="flex-1">
                                <label
                                    className={`text-sm font-medium cursor-pointer ${!canRunHistorical ? "text-gray-500 italic" : "text-gray-800 group-hover:text-sky-700"}`}
                                    htmlFor="use-historical"
                                >
                                    Use Historical S&P 500 Real Returns
                                </label>
                                {!canRunHistorical && (
                                    <p className="text-xs text-red-700 font-semibold">
                                        Age range too long for data (
                                        {realReturns.length} yrs max).
                                    </p>
                                )}
                                {canRunHistorical && (
                                    <p className="text-xs text-gray-600 italic">
                                        Also Enables Backtesting Graph.
                                    </p>
                                )}
                            </div>
                        </div>

                        {useHistorical && canRunHistorical && (
                            <label className="flex flex-col text-sm font-medium text-gray-800">
                                Projection Start Year (Main Chart)
                                <input
                                    className={`mt-1 p-2 rounded-md ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-300 focus:ring-sky-500`}
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
                                <span className="text-xs text-gray-600 mt-1 italic">
                                    Select sequence start (
                                    {HISTORICAL_START_YEAR}-
                                    {maxBacktestStartYear}).
                                </span>
                            </label>
                        )}
                    </div>
                </fieldset>

                {/* --- Column 3: Salary Schedule Editor --- */}
                <fieldset
                    className={`p-5 rounded-lg ${colors.panelBg} ${colors.panelShadow}`}
                >
                    <legend
                        className={`px-3 py-1 text-lg font-semibold ${colors.legendBg} ${colors.legendText} rounded-md -mt-8 mb-4 inline-block ${colors.panelShadow}`}
                    >
                        Income Profile
                    </legend>
                    <div className="space-y-3 p-1 max-h-screen overflow-y-auto border border-inset border-gray-500/50 bg-stone-200/50 rounded-md shadow-inner">
                        {sortedSalarySchedule.length === 0 && (
                            <p className="p-4 text-center text-sm text-red-700 font-semibold">
                                Please add at least one salary entry below.
                            </p>
                        )}
                        {sortedSalarySchedule.map((entry, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-[auto,1fr,auto] gap-2 items-center bg-stone-100/70 p-1.5 rounded"
                            >
                                <div className="flex items-center text-sm font-medium text-gray-700">
                                    <span className="w-8 text-right mr-1">
                                        Age:
                                    </span>
                                    <input
                                        className={`w-14 p-1 rounded ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} text-right focus:outline-none focus:ring-1 focus:ring-sky-500`}
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
                                </div>
                                <div className="flex items-center text-sm">
                                    <span className="text-gray-600 font-medium mx-1">
                                        $
                                    </span>
                                    <input
                                        className={`w-full p-1 rounded ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} text-right focus:outline-none focus:ring-1 focus:ring-sky-500`}
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
                                </div>
                                <button
                                    className={`w-7 h-7 flex items-center justify-center rounded ${colors.removeButtonBg} ${colors.removeButtonHoverBg} ${colors.removeButtonActiveBg} ${colors.buttonShadow} ${colors.buttonText} text-lg leading-none`}
                                    title="Remove Entry"
                                    onClick={() => removeSalaryEntry(index)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        className={`mt-4 w-full py-2 px-4 rounded-md ${colors.buttonBg} ${colors.buttonHoverBg} ${colors.buttonActiveBg} ${colors.buttonShadow} ${colors.buttonText} transition-all duration-100 ease-in-out`}
                        onClick={addSalaryEntry}
                    >
                        Add Salary Entry
                    </button>
                    <p className="text-xs text-gray-600 mt-2 px-1 italic">
                        {`Enter income at specific ages (today's dollars). Uses
                        salary from closest prior age.`}
                    </p>
                </fieldset>
            </div>

            {/* --- Main Projection Chart --- */}
            <div
                className={`mt-10 p-6 rounded-lg ${colors.chartPanelBg} ${colors.chartPanelShadow}`}
            >
                <div className="flex justify-between items-center mb-5 px-2">
                    <h2 className="text-xl font-semibold text-gray-300 text-shadow-sm shadow-black/50">
                        Net Worth Projection Visualizer
                    </h2>
                    <div className="text-right">
                        <span className="text-sm font-medium text-gray-400 block">
                            Est. Net Worth at Age {endAge}:
                        </span>
                        <span
                            className={`block text-2xl font-bold ${colors.readoutBg}`}
                        >
                            {formatCurrency(
                                tableData[tableData.length - 1]?.netWorth ?? 0,
                            )}
                        </span>
                    </div>
                </div>

                {tableData.length > 0 ? (
                    <ResponsiveContainer height={400} width="100%">
                        <LineChart
                            data={tableData}
                            margin={{ top: 5, right: 35, left: 30, bottom: 25 }}
                        >
                            <CartesianGrid
                                opacity={0.5}
                                stroke="#555"
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                axisLine={{ stroke: "#777" }}
                                dataKey="age"
                                label={{
                                    value: "Age",
                                    position: "insideBottom",
                                    offset: -15,
                                    fill: "#bbb",
                                    fontSize: 14,
                                }}
                                tick={{ fill: "#bbb", fontSize: 12 }}
                                tickLine={{ stroke: "#777" }}
                            />
                            <YAxis
                                axisLine={{ stroke: "#777" }}
                                domain={["auto", "auto"]}
                                label={{
                                    value: "Value (Today's $)",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: -5,
                                    fill: "#bbb",
                                    fontSize: 14,
                                }}
                                tick={{ fill: "#bbb", fontSize: 12 }}
                                tickFormatter={(value) =>
                                    `$${(value / 1000).toFixed(0)}k`
                                }
                                tickLine={{ stroke: "#777" }}
                                width={70} // Increased width for labels
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{
                                    stroke: "red",
                                    strokeWidth: 1,
                                    strokeDasharray: "3 3",
                                }}
                            />
                            <Legend
                                formatter={(value) => (
                                    <span style={{ color: "#ccc" }}>
                                        {value}
                                    </span>
                                )}
                                wrapperStyle={{ bottom: 0, left: 20 }}
                            />
                            <Line
                                dataKey="netWorth"
                                dot={false}
                                name="Net Worth"
                                stroke={colors.accentLine1}
                                strokeWidth={3}
                                type="monotone"
                            />
                            <Line
                                dataKey="salary"
                                dot={false}
                                name="Income"
                                stroke={colors.accentLine2}
                                strokeDasharray="5 5"
                                strokeWidth={1.5}
                                type="monotone"
                            />
                            <Line
                                dataKey="annualSavings"
                                dot={false}
                                name="Savings"
                                stroke={colors.accentLine3}
                                strokeDasharray="1 3"
                                strokeWidth={1.5}
                                type="monotone"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-400 py-10">
                        Configure parameters and add salary data to generate
                        projection.
                    </p>
                )}
            </div>

            {/* --- Backtesting Section --- */}
            {useHistorical && backtestStats && (
                <div
                    className={`mt-10 p-6 rounded-lg ${colors.chartPanelBg} ${colors.chartPanelShadow}`}
                >
                    <h2 className="text-xl font-semibold text-gray-300 text-shadow-sm shadow-black/50 mb-4 px-2">
                        Backtest Analysis
                    </h2>
                    <p className="text-sm text-gray-400 mb-6 px-2 italic">
                        Final net worth results if your simulation ({startAge}-
                        {endAge}) began in different historical years (
                        {HISTORICAL_START_YEAR}-{maxBacktestStartYear}).
                    </p>
                    {/* Stats Panels */}
                    <div className="text-xs mt-4 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-2">
                        <div
                            className={`${colors.statsPanelBg} p-3 rounded-md border-green-600 bg-green-100 text-green-900`}
                        >
                            <strong className="block text-sm mb-1">
                                BEST Period Start: {backtestStats.best.year}
                            </strong>
                            Final Net Worth:{" "}
                            <strong className="font-mono">
                                {formatCurrencyDetailed(
                                    backtestStats.best.netWorth,
                                )}
                            </strong>
                        </div>
                        <div
                            className={`${colors.statsPanelBg} p-3 rounded-md border-red-600 bg-red-100 text-red-900`}
                        >
                            <strong className="block text-sm mb-1">
                                WORST Period Start: {backtestStats.worst.year}
                            </strong>
                            Final Net Worth:{" "}
                            <strong className="font-mono">
                                {formatCurrencyDetailed(
                                    backtestStats.worst.netWorth,
                                )}
                            </strong>
                        </div>
                        <div
                            className={`${colors.statsPanelBg} p-3 rounded-md border-blue-600 bg-blue-100 text-blue-900`}
                        >
                            <strong className="block text-sm mb-1">
                                AVERAGE Final NW
                            </strong>
                            Across all periods:{" "}
                            <strong className="font-mono">
                                {formatCurrencyDetailed(
                                    backtestStats.avgNetWorth,
                                )}
                            </strong>
                        </div>
                        <div
                            className={`${colors.statsPanelBg} p-3 rounded-md border-purple-600 bg-purple-100 text-purple-900`}
                        >
                            <strong className="block text-sm mb-1">
                                MEDIAN Final NW
                            </strong>
                            Across all periods:{" "}
                            <strong className="font-mono">
                                {formatCurrencyDetailed(
                                    backtestStats.medianNetWorth,
                                )}
                            </strong>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-300 mb-3 px-2">
                        Final Net Worth vs. Historical Start Year
                    </h3>
                    <ResponsiveContainer height={300} width="100%">
                        <LineChart
                            data={backtestStats.results}
                            margin={{ top: 5, right: 35, left: 30, bottom: 25 }}
                        >
                            <CartesianGrid
                                opacity={0.5}
                                stroke="#555"
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                axisLine={{ stroke: "#777" }}
                                dataKey="year"
                                label={{
                                    value: "Simulation Start Year",
                                    position: "insideBottom",
                                    offset: -15,
                                    fill: "#bbb",
                                    fontSize: 14,
                                }}
                                tick={{ fill: "#bbb", fontSize: 12 }}
                                tickLine={{ stroke: "#777" }}
                            />
                            <YAxis
                                axisLine={{ stroke: "#777" }}
                                domain={["auto", "auto"]}
                                label={{
                                    value: "Final Net Worth",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: -5,
                                    fill: "#bbb",
                                    fontSize: 14,
                                }}
                                tick={{ fill: "#bbb", fontSize: 12 }}
                                tickFormatter={(value) =>
                                    `$${(value / 1000).toFixed(0)}k`
                                }
                                tickLine={{ stroke: "#777" }}
                                width={70}
                            />
                            <Tooltip
                                content={<BacktestCustomTooltip />}
                                cursor={{
                                    stroke: "cyan",
                                    strokeWidth: 1,
                                    strokeDasharray: "3 3",
                                }}
                            />
                            <Legend
                                formatter={(value) => (
                                    <span style={{ color: "#ccc" }}>
                                        {value}
                                    </span>
                                )}
                                wrapperStyle={{ bottom: 0, left: 20 }}
                            />
                            <Line
                                dataKey="netWorth"
                                dot={false}
                                name="Final Net Worth"
                                stroke={colors.accentLineBacktest}
                                strokeWidth={2}
                                type="monotone"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

// Add this to your global CSS or a style tag if you need text-shadow utility
/*
@layer utilities {
  .text-shadow-sm {
    text-shadow: 0 1px 2px var(--tw-shadow-color, rgba(0,0,0,0.5));
  }
  .text-shadow {
    text-shadow: 0 2px 4px var(--tw-shadow-color, rgba(0,0,0,0.5));
  }
  .text-shadow-lg {
    text-shadow: 0 10px 15px var(--tw-shadow-color, rgba(0,0,0,0.5));
  }
  .text-shadow-none {
    text-shadow: none;
  }
}
*/
