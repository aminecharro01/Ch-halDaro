
export const getMockPredictions = (fixtureId: string | number) => {
  return [
    {
      predictions: {
        winner: { name: "Real Madrid" },
        win_or_draw: true,
        percent: { home: "45%", draw: "28%", away: "27%" },
        advice: "Double chance : Real Madrid or draw"
      },
      teams: {
        home: { name: "Real Madrid", league: { form: "WWWDW" } },
        away: { name: "FC Barcelona", league: { form: "WLWWW" } }
      },
      comparison: {
        form: { home: "80%", away: "60%" },
        att: { home: "85%", away: "75%" },
        def: { home: "90%", away: "70%" }
      }
    }
  ];
};
