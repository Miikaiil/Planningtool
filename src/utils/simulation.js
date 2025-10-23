/**
 * FIFO Simulering med sekvensstorlek & instrumenttimmar/batch
 * batchar: [{ Batchnummer, Produkt, Ankomst }]
 * instrumentsConfig: { analysnamn: { duration (min), analysts, maxSeq } }
 * productAnalyses: { produktnamn: [analysnamn, ...] }
 * totalAnalysts: antal analytiker tillgängliga totalt
 */
export function runQcSimulation(batches, instrumentsConfig, productAnalyses, totalAnalysts) {
  batches = [...batches];

  // Beräkna starttid för hela simuleringen
  const startTime = new Date(Math.min(...batches.map(b => new Date(b.Ankomst).getTime())));
  batches.forEach(b => {
    b.arrivalMin = Math.floor((new Date(b.Ankomst).getTime() - startTime.getTime()) / 60000);
  });

  const instrumentFreeAt = {};
  for (const inst in instrumentsConfig) instrumentFreeAt[inst] = 0;
  let availableAnalysts = totalAnalysts;
  const analystReleases = [];
  const queue = [];

  // Bygg analyskö (en rad för varje batch och analys)
  batches.sort((a, b) => a.arrivalMin - b.arrivalMin);
  batches.forEach((batch, idx) => {
    const prod = batch.Produkt;
    if (!(prod in productAnalyses)) return;
    productAnalyses[prod].forEach(analysisType => {
      if (!(analysisType in instrumentsConfig)) return;
      queue.push({
        batchId: batch.Batchnummer,
        product: prod,
        analysisType,
        arrivalTime: batch.arrivalMin,
        status: "pending",
        startTime: null,
        endTime: null,
        waitTime: 0,
        blockedBy: null,
        index: idx
      });
    });
  });

  let t = batches.length > 0 ? batches[0].arrivalMin : 0;
  const MAX_T = 100000;

  while (queue.some(a => a.status === "pending") && t < MAX_T) {
    // Hantera analytiker som blir lediga
    for (const rel of analystReleases) {
      if (rel.active && rel.endTime <= t) {
        availableAnalysts += rel.analysts;
        rel.active = false;
      }
    }

    // Gå igenom varje instrument och hantera sekvenskörning
    for (const inst in instrumentsConfig) {
      const cfg = instrumentsConfig[inst];
      const maxSeq = cfg.maxSeq || 1;

      // Hitta pending analyser för detta instrument som kan starta nu
      const ready = queue.filter(a =>
        a.status === "pending" && a.analysisType === inst && a.arrivalTime <= t
      );

      // Om instrument är ledigt och det finns batcher att starta, kör sekvens
      if (
        ready.length > 0 &&
        instrumentFreeAt[inst] <= t &&
        availableAnalysts >= Math.min(maxSeq, ready.length)
      ) {
        const toStart = ready.slice(0, maxSeq);
        toStart.forEach(a => {
          a.status = "running";
          a.startTime = t;
          a.endTime = t + cfg.duration;
          a.waitTime = t - a.arrivalTime;
          a.blockedBy = a.waitTime > 0 ? (availableAnalysts < maxSeq ? "analysts" : null) : null;
        });
        instrumentFreeAt[inst] = t + cfg.duration;
        availableAnalysts -= toStart.length;
        analystReleases.push({
          endTime: t + cfg.duration,
          analysts: toStart.length,
          active: true
        });
      }
    }

    // Markera blockerade batcher (analyst/instrument/båda)
    queue.forEach(a => {
      if (a.status === "pending" && a.arrivalTime <= t && a.blockedBy === null) {
        const cfg = instrumentsConfig[a.analysisType];
        const maxSeq = cfg.maxSeq || 1;
        if (instrumentFreeAt[a.analysisType] > t && availableAnalysts < maxSeq) a.blockedBy = "both";
        else if (instrumentFreeAt[a.analysisType] > t) a.blockedBy = "instrument";
        else if (availableAnalysts < maxSeq) a.blockedBy = "analysts";
      }
    });

    // Hoppa till nästa event
    const nextTimes = [
      ...queue.filter(a => a.status === "pending" && a.arrivalTime > t).map(a => a.arrivalTime),
      ...analystReleases.filter(rel => rel.active && rel.endTime > t).map(rel => rel.endTime),
      ...Object.values(instrumentFreeAt).filter(x => x > t)
    ].filter(Boolean);

    if (nextTimes.length === 0) break;
    t = Math.min(...nextTimes);
  }

  return queue;
}
