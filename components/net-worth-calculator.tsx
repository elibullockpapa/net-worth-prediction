"use client";

import React, {
    useState,
    useMemo,
    useCallback,
    useRef,
    useEffect,
} from "react";
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
import { useDebounce } from "use-debounce";
import { Slider } from "@heroui/react";

import {
    sp500RealReturnsWithDividends,
    sp500RealReturnsNoDividends,
} from "@/public/finances";
import { stateTaxConfigs, type StateTaxConfig } from "@/public/state-taxes";

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
    sliderTrack: "bg-gradient-to-b from-gray-300 to-gray-400",
    sliderTrackShadow: "shadow-inner shadow-black/20",
    sliderThumb: "bg-gradient-to-b from-sky-400 to-sky-600",
    sliderThumbShadow:
        "shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_2px_rgba(255,255,255,0.5)]",
    sliderThumbHover: "hover:from-sky-300 hover:to-sky-500",
    sliderThumbActive:
        "active:from-sky-500 active:to-sky-700 active:shadow-inner active:shadow-black/30",
    sliderValue:
        "bg-gray-800 text-green-400 font-mono px-2 py-1 rounded shadow-inner shadow-black/50 border border-gray-700",
};

// --- Data and Helpers (Unchanged) ---
const HISTORICAL_START_YEAR = 1871;

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

/**
 * Calculates real returns for a given year using price changes and dividend yields
 * @param year The year to calculate returns for (min 1871, max 2024)
 * @returns The real return rate as a percentage
 */
export function getRealReturn(
    year: number,
    includeDividends: boolean = true,
): number {
    const returnValue = includeDividends
        ? sp500RealReturnsWithDividends[year]
        : sp500RealReturnsNoDividends[year];

    if (returnValue === undefined) {
        console.warn(`No return data available for year ${year}`);

        return 0;
    }

    return returnValue * 100; // Convert to percentage
}

/**
 * Gets real returns for a range of years
 * @param startYear The first year to include (min 1871)
 * @param endYear The last year to include (max 2024)
 * @returns Array of real returns as percentages
 */
export function getRealReturns(
    startYear: number,
    endYear: number,
    includeDividends: boolean = true,
): number[] {
    const returns: number[] = [];

    for (let year = startYear; year <= endYear; year++) {
        returns.push(getRealReturn(year, includeDividends));
    }

    return returns;
}

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
    usedEstimatedReturns: boolean;
    estimatedReturnYears: number;
}

interface SimulationConfig {
    pStartAge: number;
    pEndAge: number;
    pInitialCash: number;
    pSavingsRate: number;
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
    fallbackRealReturnRate,
}: TooltipProps<ValueType, NameType> & { fallbackRealReturnRate: number }) => {
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
                    {data.usedEstimatedReturns && (
                        <p className="text-red-700 font-semibold mt-2 border-t border-red-200 pt-2">
                            ⚠️ {data.estimatedReturnYears} year
                            {data.estimatedReturnYears === 1 ? "" : "s"} used
                            fallback returns of {fallbackRealReturnRate}%
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

interface AgeRangeSliderProps {
    startAge: number;
    endAge: number;
    setStartAge: (value: number) => void;
    setEndAge: (value: number) => void;
    colors: typeof colors;
}

const AgeRangeSlider: React.FC<AgeRangeSliderProps> = ({
    startAge,
    endAge,
    setStartAge,
    setEndAge,
    colors,
}) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800">
                    Age Range
                </span>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Start:</span>
                        <span
                            className={`${colors.readoutBg} px-2 py-1 text-sm min-w-[3rem] text-center`}
                        >
                            {startAge}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">End:</span>
                        <span
                            className={`${colors.readoutBg} px-2 py-1 text-sm min-w-[3rem] text-center`}
                        >
                            {endAge}
                        </span>
                    </div>
                </div>
            </div>
            <div className="relative py-2">
                <Slider
                    classNames={{
                        base: "w-full",
                        track: "h-3 rounded-full bg-gradient-to-b from-stone-400 to-stone-500",
                        filler: "h-3 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]",
                        thumb: "group top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-b from-gray-100 to-gray-300 rounded-full cursor-grab data-[dragging=true]:cursor-grabbing shadow-[2px_2px_4px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.8),inset_0_0_0_1px_rgba(0,0,0,0.1)] hover:from-gray-50 hover:to-gray-200 active:from-gray-200 active:to-gray-300 active:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.8),inset_0_0_0_1px_rgba(0,0,0,0.1)] transition-all duration-150",
                        mark: "hidden",
                    }}
                    maxValue={100}
                    minValue={18}
                    step={1} // Changed from 5 to 1 for smoother sliding
                    value={[startAge, endAge]}
                    onChange={(value) => {
                        if (Array.isArray(value)) {
                            const newStart = Math.min(value[0], endAge);
                            const newEnd = Math.max(value[1], startAge);

                            setStartAge(newStart);
                            setEndAge(newEnd);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default function NetWorthCalculator() {
    // --- State ---
    const [startAge, setStartAge] = useState(22);
    const [endAge, setEndAge] = useState(65);
    const [initialCash, setInitialCash] = useState(10000);
    const [initialCashInput, setInitialCashInput] = useState("10000");
    const [fallbackRealReturnRate, setFallbackRealReturnRate] = useState(5);
    const [savingsRate, setSavingsRate] = useState(10);
    const [historicalStartYear, setHistoricalStartYear] = useState(1980);
    const [includeDividends, setIncludeDividends] = useState(true);
    const [salarySchedule, setSalarySchedule] = useState<SalaryEntry[]>([
        { age: 22, salary: 131000 },
        { age: 23, salary: 148000 },
        { age: 25, salary: 178000 },
        { age: 27, salary: 221000 },
        { age: 29, salary: 287000 },
    ]);
    const [selectedStateTax, setSelectedStateTax] = useState<StateTaxConfig>(
        stateTaxConfigs.find((config) => config.name === "Virginia") ||
        stateTaxConfigs[0],
    );
    const [isCustomTax, setIsCustomTax] = useState(false);
    const [customTaxRate, setCustomTaxRate] = useState(0);
    const [customStandardDeduction, setCustomStandardDeduction] = useState(0);

    // --- Backtesting State ---
    const [isBacktesting, setIsBacktesting] = useState(false);
    const [backtestRawResults, setBacktestRawResults] = useState<
        BacktestResult[]
    >([]);
    const workerRef = useRef<Worker | null>(null);

    // --- Debounced Values for Worker ---
    const [debouncedStartAge] = useDebounce(startAge, 500);
    const [debouncedEndAge] = useDebounce(endAge, 500);
    const [debouncedInitialCash] = useDebounce(initialCash, 500);
    const [debouncedSavingsRate] = useDebounce(savingsRate, 500);
    const [debouncedFallbackRate] = useDebounce(fallbackRealReturnRate, 500);
    const [debouncedSalarySchedule] = useDebounce(salarySchedule, 500);
    const [debouncedIncludeDividends] = useDebounce(includeDividends, 500);

    // --- Memoized Sorted Salary Schedule ---
    const sortedSalarySchedule = useMemo(
        () => [...salarySchedule].sort((a, b) => a.age - b.age),
        [salarySchedule],
    );

    // --- Worker Initialization and Termination ---
    useEffect(() => {
        // Initialize worker
        workerRef.current = new Worker("/backtest.worker.js");

        // Handle messages from worker
        workerRef.current.onmessage = (event) => {
            console.log("Main thread received results:", event.data.length);
            setBacktestRawResults(event.data);
            setIsBacktesting(false);
        };

        // Handle worker errors
        workerRef.current.onerror = (error) => {
            console.error("Worker error:", error);
            setIsBacktesting(false);
        };

        // Trigger initial calculation
        setIsBacktesting(true);
        workerRef.current.postMessage({
            pStartAge: startAge,
            pEndAge: endAge,
            pInitialCash: initialCash,
            pSavingsRate: savingsRate,
            pInvestmentReturn: fallbackRealReturnRate,
            pSalarySchedule: sortedSalarySchedule,
            includeDividends: includeDividends,
            stateTaxConfig: selectedStateTax,
            customTaxRate: isCustomTax ? customTaxRate : 0,
            customStandardDeduction: isCustomTax ? customStandardDeduction : 0,
        });

        // Cleanup function to terminate worker on component unmount
        return () => {
            console.log("Terminating worker");
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, []); // Run only once on mount to initialize

    // --- Effect to Trigger Worker on Debounced Input Changes ---
    useEffect(() => {
        if (!workerRef.current) {
            console.log("Worker not ready, skipping calculation");

            return;
        }

        // Only run if salary schedule is valid
        if (debouncedSalarySchedule.length === 0) {
            setBacktestRawResults([]);
            setIsBacktesting(false);

            return;
        }

        console.log("Triggering worker calculation with debounced values");
        setIsBacktesting(true);
        const config = {
            pStartAge: debouncedStartAge,
            pEndAge: debouncedEndAge,
            pInitialCash: debouncedInitialCash,
            pSavingsRate: debouncedSavingsRate,
            pInvestmentReturn: debouncedFallbackRate,
            pSalarySchedule: [...debouncedSalarySchedule].sort(
                (a, b) => a.age - b.age,
            ),
            includeDividends: debouncedIncludeDividends,
            stateTaxConfig: selectedStateTax,
            customTaxRate: isCustomTax ? customTaxRate : 0,
            customStandardDeduction: isCustomTax ? customStandardDeduction : 0,
        };

        workerRef.current.postMessage(config);
    }, [
        debouncedStartAge,
        debouncedEndAge,
        debouncedInitialCash,
        debouncedSavingsRate,
        debouncedFallbackRate,
        debouncedSalarySchedule,
        debouncedIncludeDividends,
        selectedStateTax,
        isCustomTax,
        customTaxRate,
        customStandardDeduction,
    ]);

    // --- Salary Schedule Handlers (Unchanged) ---
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

    // --- Main Projection Logic (Still runs synchronously for the single chart) ---
    const localGetRealReturn = useCallback(
        (year: number) => {
            return getRealReturn(year, includeDividends);
        },
        [includeDividends],
    );

    const generateProjection = useCallback(
        (simConfig: SimulationConfig): ProjectionData[] => {
            const {
                pStartAge,
                pEndAge,
                pInitialCash,
                pSavingsRate,
                pSimStartYear,
                pInvestmentReturn,
                pSalarySchedule,
            } = simConfig;

            if (pSalarySchedule.length === 0) return [];

            let netWorth = pInitialCash;
            const projectionData: ProjectionData[] = [];
            const simulationYears = pEndAge - pStartAge + 1;
            const sortedSchedule = [...pSalarySchedule].sort(
                (a, b) => a.age - b.age,
            );

            let salaryCache: { [key: number]: number } = {};
            const getSalaryForAge = (age: number) => {
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

                const stateTax = virginiaTaxRate(currentSalary);
                const fedTax = federalTaxRate(currentSalary);
                const totalTax = stateTax + fedTax;
                const afterTaxIncome = Math.max(0, currentSalary - totalTax);
                const annualSavings = afterTaxIncome * (pSavingsRate / 100);
                const livingMoney = afterTaxIncome - annualSavings;

                const historicalReturn = localGetRealReturn(currentYear);
                const returnRate =
                    historicalReturn !== 0
                        ? historicalReturn
                        : pInvestmentReturn;

                const growthFactor = 1 + returnRate / 100;

                netWorth = netWorth * growthFactor + annualSavings;

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
        [localGetRealReturn],
    );

    // --- Main Projection Data (Remains synchronous, uses main thread data) ---
    const tableData = useMemo(() => {
        if (startAge > endAge || sortedSalarySchedule.length === 0) return [];

        return generateProjection({
            pStartAge: startAge,
            pEndAge: endAge,
            pInitialCash: initialCash,
            pSavingsRate: savingsRate,
            pSimStartYear: historicalStartYear,
            pInvestmentReturn: fallbackRealReturnRate,
            pSalarySchedule: sortedSalarySchedule,
        });
    }, [
        startAge,
        endAge,
        initialCash,
        savingsRate,
        historicalStartYear,
        fallbackRealReturnRate,
        sortedSalarySchedule,
        generateProjection,
    ]);

    // --- Process Backtest Results (Fast calculation based on worker output) ---
    const backtestStats = useMemo(() => {
        if (!backtestRawResults || backtestRawResults.length === 0) return null;

        const results = backtestRawResults;
        const best = results.reduce(
            (a, b) => (a.netWorth > b.netWorth ? a : b),
            results[0],
        );
        const worst = results.reduce(
            (a, b) => (a.netWorth < b.netWorth ? a : b),
            results[0],
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
    }, [backtestRawResults]);

    // Add this new function before the return statement
    const currentProjectionUsesFallback = useMemo(() => {
        if (!tableData || tableData.length === 0) return false;

        return tableData.some(
            (data) => data.returnRate === fallbackRealReturnRate,
        );
    }, [tableData, fallbackRealReturnRate]);

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
                    Personal Finance Backtesting
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
                {`(inflation-adjusted) returns. The final net worth is also presented in today's purchasing power.`}
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
                        Key Parameters
                    </legend>
                    <div className="space-y-5 p-2">
                        <AgeRangeSlider
                            colors={colors}
                            endAge={endAge}
                            setEndAge={setEndAge}
                            setStartAge={setStartAge}
                            startAge={startAge}
                        />

                        {/* Keep the rest of the inputs */}
                        {[
                            {
                                label: `Initial Cash (${formatCurrency(initialCash)})`,
                                value: initialCashInput,
                                setter: setInitialCash,
                                min: 0,
                                type: "text",
                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setInitialCashInput(value);
                                },
                                onBlur: () => {
                                    setInitialCash(initialCashInput ? parseInt(initialCashInput) : 0);
                                }
                            },
                            {
                                label: "Savings Rate (% After-Tax)",
                                value: savingsRate,
                                setter: setSavingsRate,
                                min: 0,
                                max: 100,
                                step: 1,
                            },
                        ].map(({ label, value, setter, min, max, step, type, onChange, onBlur }) => (
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
                                    type={type || "number"}
                                    value={value}
                                    onChange={onChange || ((e) => {
                                        let numVal = Number(e.target.value);
                                        if (min !== undefined) numVal = Math.max(min, numVal);
                                        if (max !== undefined) numVal = Math.min(max, numVal);
                                        setter(isNaN(numVal) ? (min ?? 0) : numVal);
                                    })}
                                    onBlur={onBlur}
                                />
                            </label>
                        ))}

                        {/* Dividend Reinvestment Toggle */}
                        <div className="flex items-center space-x-3 pt-2 group">
                            <div className="relative">
                                <input
                                    checked={includeDividends}
                                    className="appearance-none h-5 w-5 border-2 border-gray-500 rounded-sm bg-gray-100 checked:bg-sky-600 checked:border-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-stone-300 focus:ring-sky-500 relative cursor-pointer peer"
                                    id="include-dividends"
                                    type="checkbox"
                                    onChange={(e) =>
                                        setIncludeDividends(e.target.checked)
                                    }
                                />
                                <svg
                                    aria-hidden="true"
                                    className="absolute inset-0 w-5 h-5 hidden peer-checked:block pointer-events-none p-0.5 text-white"
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
                            </div>

                            <div className="flex-1">
                                <label
                                    className="text-sm font-medium cursor-pointer text-gray-800 group-hover:text-sky-700"
                                    htmlFor="include-dividends"
                                >
                                    Include Dividend Reinvestment
                                </label>
                                <p className="text-xs text-gray-600 italic">
                                    Toggle to include/exclude dividend
                                    reinvestment in historical returns.
                                </p>
                            </div>
                        </div>
                    </div>
                </fieldset>

                {/* --- Column 2: State Tax Configuration --- */}
                <fieldset
                    className={`p-5 rounded-lg ${colors.panelBg} ${colors.panelShadow}`}
                >
                    <legend
                        className={`px-3 py-1 text-lg font-semibold ${colors.legendBg} ${colors.legendText} rounded-md -mt-8 mb-4 inline-block ${colors.panelShadow}`}
                    >
                        State Tax Configuration
                    </legend>
                    <div className="space-y-5 p-2">
                        <div className="space-y-4">
                            <label className="flex flex-col text-sm font-medium text-gray-800">
                                Select State Tax System
                                <select
                                    className={`mt-1 p-2 rounded-md ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-300 focus:ring-sky-500`}
                                    value={selectedStateTax.name}
                                    onChange={(e) => {
                                        const config = stateTaxConfigs.find(
                                            (c) => c.name === e.target.value,
                                        );

                                        if (config) {
                                            setSelectedStateTax(config);
                                            setIsCustomTax(
                                                config.name === "Custom",
                                            );
                                        }
                                    }}
                                >
                                    {stateTaxConfigs.map((config) => (
                                        <option
                                            key={config.name}
                                            value={config.name}
                                        >
                                            {config.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <div className="text-xs text-gray-600 italic">
                                {selectedStateTax.description}
                            </div>
                            {selectedStateTax.brackets.length > 0 && (
                                <div className="text-xs text-gray-600">
                                    <p className="font-medium mb-1">
                                        Tax Brackets:
                                    </p>
                                    <ul className="space-y-0.5">
                                        {selectedStateTax.brackets.map(
                                            (bracket, index) => (
                                                <li key={index}>
                                                    {(
                                                        bracket.rate * 100
                                                    ).toFixed(1)}
                                                    % on{" "}
                                                    {bracket.minIncome === 0
                                                        ? "first"
                                                        : `$${bracket.minIncome.toLocaleString()} to`}{" "}
                                                    {bracket.maxIncome
                                                        ? `$${bracket.maxIncome.toLocaleString()}`
                                                        : "and above"}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {isCustomTax && (
                            <div className="pt-4 border-t border-gray-300">
                                <div className="space-y-4">
                                    <label className="flex flex-col text-sm font-medium text-gray-800">
                                        Custom Tax Rate (%)
                                        <input
                                            className={`mt-1 p-2 rounded-md ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-300 focus:ring-sky-500`}
                                            max="100"
                                            min="0"
                                            step="0.1"
                                            type="number"
                                            value={customTaxRate}
                                            onChange={(e) =>
                                                setCustomTaxRate(
                                                    Number(e.target.value),
                                                )
                                            }
                                        />
                                    </label>
                                    <label className="flex flex-col text-sm font-medium text-gray-800">
                                        Standard Deduction
                                        <input
                                            className={`mt-1 p-2 rounded-md ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-300 focus:ring-sky-500`}
                                            min="0"
                                            step="100"
                                            type="number"
                                            value={customStandardDeduction}
                                            onChange={(e) =>
                                                setCustomStandardDeduction(
                                                    Number(e.target.value),
                                                )
                                            }
                                        />
                                    </label>
                                </div>
                            </div>
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

            {/* --- Backtesting Section --- */}
            <div
                className={`mt-10 p-6 rounded-lg ${colors.chartPanelBg} ${colors.chartPanelShadow} relative`}
            >
                {/* Loading Indicator Overlay */}
                {isBacktesting && (
                    <div className="absolute inset-0 bg-zinc-800/70 flex items-center justify-center z-10 rounded-lg">
                        <div className="flex flex-col items-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-8 w-8 text-sky-400 mb-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    fill="currentColor"
                                />
                            </svg>
                            <p className="text-lg font-semibold text-gray-300">
                                Calculating Backtests...
                            </p>
                        </div>
                    </div>
                )}

                <h2 className="text-xl font-semibold text-gray-300 text-shadow-sm shadow-black/50 mb-4 px-2">
                    Backtest Analysis
                </h2>

                {/* Conditional rendering based on backtestStats */}
                {!backtestStats && !isBacktesting && (
                    <p className="text-center text-gray-400 py-10">
                        Configure parameters and add salary data to generate
                        backtest analysis.
                    </p>
                )}

                {backtestStats && (
                    <>
                        <p className="text-sm text-gray-400 mb-6 px-2 italic">
                            Final net worth results if your simulation (
                            {startAge}-{endAge}) began in different historical
                            years ({HISTORICAL_START_YEAR}-2024). Only shows
                            results where the simulation period ends in 2024 or
                            earlier. Recalculates automatically after changes.
                        </p>

                        {/* Stats Panels */}
                        <div className="text-xs mt-4 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-2">
                            <div className="bg-gray-900/90 rounded-md border border-green-500/30 p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,255,0,0.1)]">
                                <strong className="block text-green-400 font-bold mb-1 text-sm">
                                    BEST Period Start: {backtestStats.best.year}
                                </strong>
                                <div className="bg-black/50 p-2 rounded shadow-inner">
                                    <span className="text-green-600 text-xs">
                                        Final Net Worth:
                                    </span>
                                    <strong className="block font-mono text-green-400 text-lg tracking-wider mt-1">
                                        {formatCurrencyDetailed(
                                            backtestStats.best.netWorth,
                                        )}
                                    </strong>
                                </div>
                            </div>
                            <div className="bg-gray-900/90 rounded-md border border-red-500/30 p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,0,0,0.1)]">
                                <strong className="block text-red-400 font-bold mb-1 text-sm">
                                    WORST Period Start:{" "}
                                    {backtestStats.worst.year}
                                </strong>
                                <div className="bg-black/50 p-2 rounded shadow-inner">
                                    <span className="text-red-600 text-xs">
                                        Final Net Worth:
                                    </span>
                                    <strong className="block font-mono text-red-400 text-lg tracking-wider mt-1">
                                        {formatCurrencyDetailed(
                                            backtestStats.worst.netWorth,
                                        )}
                                    </strong>
                                </div>
                            </div>
                            <div className="bg-gray-900/90 rounded-md border border-blue-500/30 p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,255,0.1)]">
                                <strong className="block text-blue-400 font-bold mb-1 text-sm">
                                    AVERAGE Final NW
                                </strong>
                                <div className="bg-black/50 p-2 rounded shadow-inner">
                                    <span className="text-blue-600 text-xs">
                                        Across all periods:
                                    </span>
                                    <strong className="block font-mono text-blue-400 text-lg tracking-wider mt-1">
                                        {formatCurrencyDetailed(
                                            backtestStats.avgNetWorth,
                                        )}
                                    </strong>
                                </div>
                            </div>
                            <div className="bg-gray-900/90 rounded-md border border-purple-500/30 p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_2px_rgba(128,0,255,0.1)]">
                                <strong className="block text-purple-400 font-bold mb-1 text-sm">
                                    MEDIAN Final NW
                                </strong>
                                <div className="bg-black/50 p-2 rounded shadow-inner">
                                    <span className="text-purple-600 text-xs">
                                        Across all periods:
                                    </span>
                                    <strong className="block font-mono text-purple-400 text-lg tracking-wider mt-1">
                                        {formatCurrencyDetailed(
                                            backtestStats.medianNetWorth,
                                        )}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-300 mb-3 px-2">
                            Final Net Worth vs. Historical Start Year
                        </h3>
                        <ResponsiveContainer height={300} width="100%">
                            <LineChart
                                data={backtestStats.results.filter(
                                    (r) => r.year + (endAge - startAge) <= 2024,
                                )}
                                margin={{
                                    top: 5,
                                    right: 35,
                                    left: 30,
                                    bottom: 25,
                                }}
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
                                    content={
                                        <BacktestCustomTooltip
                                            fallbackRealReturnRate={
                                                fallbackRealReturnRate
                                            }
                                        />
                                    }
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
                    </>
                )}
            </div>

            {/* --- Main Projection Chart --- */}
            <div
                className={`mt-10 p-6 rounded-lg ${colors.chartPanelBg} ${colors.chartPanelShadow}`}
            >
                <div className="flex justify-between items-center mb-5 px-2">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-300 text-shadow-sm shadow-black/50">
                            Backtest Results For Starting in Year
                            <input
                                className={`w-20 ml-2 p-1 mx-1 rounded inline-block ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} text-center focus:outline-none focus:ring-1 focus:ring-sky-500`}
                                min={HISTORICAL_START_YEAR}
                                type="number"
                                value={historicalStartYear}
                                onChange={(e) =>
                                    setHistoricalStartYear(
                                        Math.max(
                                            HISTORICAL_START_YEAR,
                                            parseInt(e.target.value) ||
                                            HISTORICAL_START_YEAR,
                                        ),
                                    )
                                }
                            />
                        </h2>
                        {currentProjectionUsesFallback && (
                            <div className="mt-2 flex items-center gap-2">
                                <label
                                    className="text-sm font-medium text-gray-300"
                                    htmlFor="fallback-rate"
                                >
                                    Fallback Annual Real Return (%):
                                </label>
                                <input
                                    className={`w-20 p-1 rounded ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} text-center focus:outline-none focus:ring-1 focus:ring-sky-500`}
                                    id="fallback-rate"
                                    step="0.1"
                                    type="number"
                                    value={fallbackRealReturnRate}
                                    onChange={(e) =>
                                        setFallbackRealReturnRate(
                                            Number(e.target.value),
                                        )
                                    }
                                />
                                <span className="text-xs text-gray-400 italic">
                                    Used for years after 2024
                                </span>
                            </div>
                        )}
                    </div>
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
        </div>
    );
}

