# The Great Banana Mystery 🍌

A CLI tool to help Willowbrook Zoo identify food inventory discrepancies.

## Features
- **Multi-format Input**: Supports Properties (.txt), CSV, and JSON files.
- **Robust Parsing**: Handles invalid or missing values gracefully.
- **Clear Reporting**: Identifies discrepancies and missing data.
- **Extensible Architecture**: Built with Hexagonal Architecture for future growth.

## Prerequisites
- Node.js (v14 or higher)
- npm

## Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Usage
Run the tool with the paths to your data files:

```bash
npm start -- -d data/delivery.txt -u data/usage.csv -i data/inventory.json
```

Or using the built binary directly:

```bash
node dist/index.js -d <delivery_file> -u <usage_file> -i <inventory_file>
```

### Options
- `-d, --delivery <path>`: Path to delivery file (.txt)
- `-u, --usage <path>`: Path to usage file (.csv)
- `-i, --inventory <path>`: Path to inventory file (.json)
- `-h, --help`: Display help information
- `-v, --verbose`: Output verbose debugging info helpful in troubleshooting and debugging

## Sample Output
```
Zoo Food Audit Report
=====================

banana: DISCREPANCY -7 (expected: 25, actual: 18)
carrots: OK
fish: OK
hay: OK
lettuce: UNKNOWN (missing data)
meat: OK

Summary: 1 discrepancy found
```

## Design Decisions
- **Hexagonal Architecture**: Separates the core business logic (`src/domain`) from the external world (`src/adapters`). This makes the system easy to test and adaptable to new input sources or output formats.
- **TypeScript**: Used for type safety and better developer experience. Strict mode is enabled.
- **NaN for Unknowns**: Invalid or missing values in the delivery file are parsed as `NaN`. The reconciler propagates this to report an "UNKNOWN" status, ensuring that we don't make false assumptions about stock.
- **Stateless Logic**: The core `Reconciler` is pure and stateless, making it suitable for multi-threaded environments or parallel processing in the future.

## Tech Stack
- **Language**: TypeScript
- **Runtime**: Node.js
- **CLI Framework**: Commander.js
- **Testing**: Jest (configured)

## Feedback
This was a fun assignment! The "mystery" theme adds a nice flavor to a standard reconciliation problem. The requirement to handle different file formats mimics real-world legacy integration challenges well.
