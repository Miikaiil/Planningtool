// src/data/staticData.js

export const instrumenter = [
  { id: 'gc01', namn: 'GC 01', maxBatchPerSekvens: 12 },
  { id: 'filterA', namn: 'Filter Aspirator', maxBatchPerSekvens: 10 },
];

export const standarder = [
  { id: 'stdA', namn: 'Standard A' },
  { id: 'stdB', namn: 'Standard B' },
];

export const analyser = [
  { id: 'fettsyra', namn: 'Fettsyremönster', instrumentId: 'gc01', standardId: 'stdA' },
  { id: 'filtrering', namn: 'Filtrering USP', instrumentId: 'filterA', standardId: 'stdB' },
];

export const produkter = [
  {
    id: 1,
    namn: "Produkt A",
    analysId: ["fettsyra", "filtrering"]
  },
  {
    id: 2,
    namn: "Produkt B",
    analysId: ["filtrering"]
  }
];
