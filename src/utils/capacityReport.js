// Beräkna maskin- och mantimmarskapacitet utifrån CSV-data
export function getInstrumentCapacity(instrument, analyser) {
  return instrument.map(inst => {
    // Ta alla analyser som instrumentet kan köra
    const kopplingar = inst.analysNamnLista || [];
    const analyserFörInstrument = analyser.filter(a => kopplingar.includes(a.Analys || a.namn));

    // Medelvärde/totalsumma för maskintid per batch för detta instrument
    const instrumenttider = analyserFörInstrument
      .map(a => Number((a["Instrumenttid per sekvens (h)"] || "0").replace(",", ".")))
      .filter(t => t > 0);

    // Räkna även ut mantimmar/batch
    const mantimmarPerBatch = analyserFörInstrument.reduce((sum, an) => {
      const toNumber = v => Number((v || "0").toString().replace(",", "."));
      return (
        sum +
        toNumber(an["Förberedelse (mantimmar)"]) +
        toNumber(an["Analystid (mantimmar)"]) +
        toNumber(an["Utvärdering (mantimmar)"]) +
        toNumber(an["Kontroll (mantimmar)"]) +
        toNumber(an["Rengöring (mantimmar)"])
      );
    }, 0);

    // Sätt defaultvärden om tomt
    const medelInstrumenttid = instrumenttider.length > 0
      ? instrumenttider.reduce((a, b) => a + b, 0) / instrumenttider.length
      : 0;

    const tillgängligaTimmar = inst.tillgängligatimmarpervecka || inst["tillgängliga timmar/vecka"] || 168;
    const maxSekvens = inst.maxSekvensstorlek || inst["max sekvensstorlek"] || 1;

    // Hur många sekvenser hinns per vecka?
    const sekvenser = medelInstrumenttid > 0
      ? Math.floor(tillgängligaTimmar / medelInstrumenttid)
      : 0;

    // Hur många batcher per vecka i praktiken (teoretiskt max)
    const maxBatcher = sekvenser * maxSekvens;

    return {
      namn: inst.namn,
      tillgängligaTimmar,
      maxSekvens,
      medelInstrumenttid,
      sekvenser,
      maxBatcher,
      mantimmarPerBatch
    };
  });
}
