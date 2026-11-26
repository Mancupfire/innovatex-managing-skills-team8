/* Slide 09 — Innovation and Change — owner: Nhật Minh
   status: "final" = team-approved content · "awaiting" = waiting for the owner's content
   Edit only the text between quotes or backticks. Keep commas, brackets and braces. */
Deck.slide({
  number: 9,
  topic: "Innovation and Change",
  owner: "Nhật Minh",
  status: "final",

  title: "Give employee ideas a fair test",
  lead: "A six-week pilot gives employees a safe way to raise ideas and a clear route to a management decision.",

  blocks: [
    {
      type: "cards",
      numbered: true,
      widths: ["0.85fr", "1.3fr", "1.05fr"],   // relative column widths (optional)
      items: [
        {
          heading: "Submit safely",
          points: [
            "Employees describe a problem and suggest one small fix",
            "They may submit anonymously",
            "Written response within five working days"
          ]
        },
        {
          heading: "Share decision rights",
          points: [
            "One representative each from Product, Engineering and Customer Support assesses customer impact, effort and risk",
            "Department heads delegate approval for small, low-risk internal tests",
            "Each head postpones one low-priority task to free two hours per representative per week",
            "The sponsor retains approval for spending or customer-facing changes"
          ]
        },
        {
          heading: "Test one real workflow",
          points: [
            "Support tickets sometimes reach Product without enough context",
            "Compare two weeks using a shared handoff form with the previous two weeks",
            "Track the share of tickets returned for missing information and the average extra preparation time per case"
          ]
        }
      ]
    },
    {
      type: "row",
      blocks: [
        {
          type: "callout",
          label: "Leadership trade-off",
          text: "give up some departmental control and protect staff time for a cross-functional test."
        },
        {
          type: "example",
          button: "Follow one idea",
          badge: "Illustrative example",
          code: "IX-001",
          title: "Missing information in Support-to-Product handoffs",
          steps: [
            {
              name: "Submit",
              detail: "A Support agent sees tickets reach Product without enough context and suggests one small fix: a shared handoff form. The idea is submitted anonymously."
            },
            {
              name: "Panel review",
              detail: "Representatives from Product, Engineering and Customer Support assess customer impact, effort and risk. The submitter gets a written response within five working days."
            },
            {
              name: "Two-week test",
              detail: "Support uses the shared handoff form for two weeks. Returns for missing information and extra preparation time are compared with the previous two weeks."
            },
            {
              name: "Decision",
              detail: "Decision pending pilot results. The panel will publish its reasons and what it learned, whatever the outcome."
            }
          ],
          printLine: "Illustrative example · IX-001 · Missing information in Support-to-Product handoffs: Submit → Panel review → Two-week test → Decision pending pilot results"
        }
      ]
    }
  ],

  sources: [
    {
      text: "Edmondson, A. (1999). Psychological Safety and Learning Behavior in Work Teams. Administrative Science Quarterly, 44(2), 350–383.",
      url: "https://doi.org/10.2307/2666999"
    },
    {
      text: "Institute for Healthcare Improvement. Model for Improvement: Testing Changes.",
      url: "https://www.ihi.org/library/model-for-improvement/testing-changes"
    }
  ],
  footnote: "Six weeks, five working days and two hours are Team 8 design assumptions.",

  notes: `Our first move is a six-week pilot, and we expect resistance. Department heads may feel they are losing control, so each head chooses which low-priority task to postpone. Employees may still worry about speaking up, so they can stay anonymous, see the reasons behind every decision and revise their idea. The panel also shares what it learned when a test fails, so even a failed test is useful.`,

  // Shown under the notes for reference; not part of the spoken script.
  notesRef: `How the sources are used: Edmondson (1999) supports the basis for employees speaking up and learning as a team. The IHI Model for Improvement supports testing a change on a small scale first. Six weeks, five working days and two hours are Team 8 design assumptions.`
});
