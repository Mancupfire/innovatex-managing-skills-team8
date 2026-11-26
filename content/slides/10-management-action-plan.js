/* Slide 10 — Management Action Plan — owner: Nhật Minh
   status: "final" = team-approved content · "awaiting" = waiting for the owner's content
   Edit only the text between quotes or backticks. Keep commas, brackets and braces. */
Deck.slide({
  number: 10,
  topic: "Management Action Plan",
  owner: "Nhật Minh",
  status: "final",

  title: "Six weeks from approval to a decision",
  lead: "",

  blocks: [
    {
      type: "table",
      caption: "Pilot action plan",
      columns: ["When", "Action", "Accountable owner", "Resources"],
      widths: ["13%", "38%", "17%", "32%"],
      rows: [
        ["Week 1", "Appoint the panel, delegate authority and protect staff time", "Executive sponsor", "Pilot charter; 2 hours per representative per week"],
        ["Week 1", "Measure the baseline return rate from the previous two weeks", "Support lead", "Ticket records; baseline sheet"],
        ["Week 2, start", "Open submissions and publish review criteria", "Panel chair", "Anonymous form; decision log; 15-minute briefing"],
        ["Week 2, end", "Review ideas and prepare the handoff test", "Panel chair", "Review rubric; sample tickets; draft form"],
        ["Weeks 3–4", "Run the test and record returns and preparation time", "Support lead", "Ticket tracker; time log; Product representative"],
        ["Weeks 5–6", "Review evidence in Week 5 and publish the decision by Week 6", "Executive sponsor", "Results summary; staff feedback; named next owner"]
      ]
    },
    {
      type: "decision",
      label: "Decision rule",
      tag: "Proposed pilot targets",
      options: [
        { verdict: "Expand", symbol: "▲", text: "if the return rate falls by **at least 20%** relative to baseline **AND** the form adds **no more than 2 minutes** per case on average." },
        { verdict: "Revise and retest", symbol: "↻", text: "if only one condition is met." },
        { verdict: "Stop", symbol: "■", text: "if neither is met." }
      ]
    }
  ],

  sources: [],
  footnote: "Targets are Team 8 proposals for the pilot, not results.",

  notes: `Every action has one accountable owner. Week one sets authority and the baseline, weeks three and four run the test, and we agree the decision rule before we start.

Here is an illustrative example, not an actual result. If 10 of 50 tickets were returned before the pilot, the baseline was 20%. A 20% relative reduction takes it to 16%, equivalent to 8 of 50 comparable tickets. We would also check the time cost before expanding.

To know whether this works beyond one pilot, we need the right measures. Thảo Linh will now show the KPIs.`
});
