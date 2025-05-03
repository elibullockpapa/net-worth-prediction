# Net Worth Calculator & Financial Backtesting Tool

This project is an advanced net worth projection and personal finance backtesting tool. It leverages over 150 years of real, inflation-adjusted S&P 500 data to help users model their financial future, test different scenarios, and understand the impact of historical market cycles on their wealth trajectory.

## Features

- **Historical Backtesting:** Run simulations starting in any year from 1871–2024 using real S&P 500 returns (with or without dividends).
- **Custom Salary Schedules:** Define your income at specific ages, including raises, career changes, or sabbaticals.
- **Tax Modeling:** Supports federal and all U.S. state income tax systems, including custom tax rates and deductions.
- **Savings Rate & Initial Cash:** Set your after-tax savings rate and starting net worth.
- **Percentile Analysis:** Visualize best, worst, median, and custom percentile outcomes across history.
- **Modern UI:** Built with Next.js, HeroUI, and Tailwind CSS for a responsive, accessible experience.
- **All values inflation-adjusted:** Results are shown in today's dollars for realistic planning.

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/) (for interactive charts)
- [next-themes](https://github.com/pacocoursey/next-themes)

## Getting Started

### Install dependencies

Use your preferred package manager (e.g. `npm`, `yarn`, `pnpm`, `bun`). Example with npm:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Set your starting age, ending age, and initial cash.**
2. **Define your salary schedule** by adding income at specific ages.
3. **Adjust your savings rate** (as a % of after-tax income).
4. **Choose your state** (or custom) tax system.
5. **Toggle dividends** and set fallback return rates if desired.
6. **Run backtests** to see how your plan would have performed across history.
7. **Explore percentile outcomes** and visualize your projected net worth.

## License

Licensed under the [MIT license](LICENSE).
