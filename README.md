# Tailwind Color Matcher

## 🎨 Project Overview

This utility helps developers and designers easily match custom colors to the closest equivalent in the Tailwind CSS color palette. By leveraging advanced color difference calculation techniques, the project provides precise color mapping and comparison.

## 🔬 Color Matching Methodology

The color matching process uses the CIEDE2000 color difference algorithm, which is considered the most accurate method for calculating color differences. The key steps include:

1. **Color Space Conversion**:
   - Transform RGB to LAB color space for perceptually uniform comparison

2. **Color Difference Calculation**:
   - Compute Delta E (ΔE) using the CIEDE2000 formula
   - Evaluate differences in:
     - Lightness (L*)
     - Chroma (C*)
     - Hue (H*)

3. **Closest Color Selection**:
   - Compare the input color against Tailwind's color palette
   - Find the color with the smallest perceptual difference

## 📦 Project Setup

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Installation Steps
1. Clone the repository
```bash
git clone https://github.com/ajkl2533/tailwind-color-matcher.git
cd tailwind-color-matcher
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Build for production
```bash
npm run build
# or
yarn build
```

## 📊 Features
- Precise color matching
- CIEDE2000 color difference calculation
- Support for Tailwind CSS v3 color palette

## 📝 License
MIT License