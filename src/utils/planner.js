export function planeraBatches({
  batcher = [],
  produkter = [],
  analyser = [],
  instrument = [],
  analytiker = []
}) {
  const days = ["Mån", "Tis", "Ons", "Tor", "Fre"];
  const hoursPerDay = 9;
  const instrKalender = {};
  instrument.forEach(inst => {
    instrKalender[inst.namn] = Array(5).fill(null).map(() => Array(hoursPerDay).fill(null).map(() => []));
  });
  const anlStats = {};
  analytiker.forEach(anl => {
    anlStats[anl.namn] = Array(5).fill(null).map(() => Array(hoursPerDay).fill(null));
  });

  const plan = [];

  for (const batch of batcher) {
    const prod = produkter.find(p => p.namn === batch.Produkt);
    const prodOK = !!prod;
    const analyserFG = prodOK ? analyser.filter(a => (prod.analysNamnLista || []).includes(a.Analys || a.namn)) : [];
    const analyserOK = analyserFG.length > 0;
    const maskinTid = analyserFG.reduce((sum, an) => {
      const toNumber = v => Number((v || "0").toString().replace(",", "."));
      return sum + toNumber(an["Instrumenttid per sekvens (h)"]);
    }, 0);
    const manTid = analyserFG.reduce((sum, an) => {
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

    // Vilka instrument går att köra batchen på (baserat på analys)
    const possibleInst = prodOK
      ? instrument.filter(inst =>
          inst.analysNamnLista?.some(an => (prod.analysNamnLista || []).includes(an))
        )
      : [];

    let allocated = false;
    let failStep = "";

    outerLoop:
    for (let day = 0; day < 5 && !allocated; day++) {
      for (let hour = 0; hour < hoursPerDay && !allocated; hour++) {
        for (let inst of possibleInst) {
          const maxSekvens = inst.maxSekvensstorlek || 12;

          let instrFree = true;
          for (let t = 0; t < Math.ceil(maskinTid); t++) {
            if (hour + t >= hoursPerDay) {
              instrFree = false;
              failStep = "Timestep/maskin";
              break;
            }
            if ((instrKalender[inst.namn][day][hour + t].length || 0) >= maxSekvens) {
              instrFree = false;
              failStep = `Max sekvens (${maxSekvens}) på ${inst.namn}, hour ${hour + t}`;
              break;
            }
          }
          if (!instrFree) continue;

          // Finns ledig analytiker denna period (med rätt kompetens)
          const anlAvailable = analytiker.find(anl =>
            analyserFG.every(
              analiz => (anl.kompetens?.[analiz.Analys || analiz.namn] || []).length > 0 &&
                anlStats[anl.namn][day].slice(hour, hour + Math.ceil(manTid)).every(slot => slot === null)
            )
          );
          if (!anlAvailable) {
            failStep = "Ingen analyskompetens tillgänglig";
            continue;
          }

          // Boka denna batch på instrument-sloten
          for (let t = 0; t < Math.ceil(maskinTid); t++) {
            instrKalender[inst.namn][day][hour + t].push(batch.Batchnummer);
          }
          for (let t = 0; t < Math.ceil(manTid); t++) {
            anlStats[anlAvailable.namn][day][hour + t] = batch.Batchnummer;
          }

          plan.push({
            batch: batch.Batchnummer, day: days[day], start: 8 + hour, duration: maskinTid,
            instrument: inst.namn, analytiker: anlAvailable.namn, produkt: batch.Produkt,
            analyser: analyserFG.map(a => a.Analys || a.namn),
            analyssum: maskinTid, mansum: manTid,
            status: "ok", message: "OK"
          });
          allocated = true;
          break outerLoop;
        }
      }
    }

    // Om batch ej allokerad: skriv ut all felsökningsinfo
    if (!allocated) {
      plan.push({
        batch: batch.Batchnummer,
        produkt: batch.Produkt,
        analyser: analyserFG.map(a => a.Analys || a.namn),
        possibleInst: possibleInst.map(inst => `${inst.namn} (max per sekvens: ${inst.maxSekvensstorlek})`),
        analyssum: maskinTid, mansum: manTid,
        status: "full",
        message: "Kunde ej planeras: " +
          (prodOK ? "" : "Produkt ej funnen. ") +
          (analyserOK ? "" : "Ingen analys kopplad. ") +
          (possibleInst.length ? "" : "Inget instrument hittat för analyserna. ") +
          (failStep ? "[Misslyckades vid: " + failStep + "]" : "")
      });
    }
  }
  return plan;
}
