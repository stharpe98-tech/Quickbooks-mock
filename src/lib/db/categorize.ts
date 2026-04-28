// Keyword-based auto-categorization for imported transactions.
// Matches common vendor patterns to the standard category names produced by
// seedDefaultCategories(). Returns the category *name* (string) — the caller
// resolves it against the user's actual categories table.

import type { CategoryKind } from "./types";

type Rule = { category: string; patterns: RegExp[] };

const EXPENSE_RULES: Rule[] = [
  {
    category: "Groceries",
    patterns: [
      /\bwhole foods\b/i,
      /\btrader joe/i,
      /\bsafeway\b/i,
      /\bkroger\b/i,
      /\bwal[- ]?mart\b/i,
      /\baldi\b/i,
      /\bpublix\b/i,
      /\bcostco\b/i,
      /\bsam'?s club\b/i,
      /\bgrocery\b/i,
      /\bsuper ?market\b/i,
      /\binstacart\b/i,
    ],
  },
  {
    category: "Restaurants",
    patterns: [
      /\bstarbucks\b/i,
      /\bdunkin\b/i,
      /\bmcdonald/i,
      /\bchipotle\b/i,
      /\bpanera\b/i,
      /\bsubway\b/i,
      /\bchick[- ]?fil[- ]?a\b/i,
      /\btaco bell\b/i,
      /\bwendy/i,
      /\bburger king\b/i,
      /\bpizza\b/i,
      /\brestaurant\b/i,
      /\bcafe\b/i,
      /\bcoffee\b/i,
      /\buber eats\b/i,
      /\bdoordash\b/i,
      /\bgrubhub\b/i,
      /\bpostmates\b/i,
      /\bseamless\b/i,
    ],
  },
  {
    category: "Gas",
    patterns: [
      /\bshell\b/i,
      /\bchevron\b/i,
      /\bexxon/i,
      /\bbp\b/i,
      /\bmobil\b/i,
      /\bvalero\b/i,
      /\barco\b/i,
      /\bspeedway\b/i,
      /\b76\b/i,
      /\bgas station\b/i,
    ],
  },
  {
    category: "Subscriptions",
    patterns: [
      /\bnetflix\b/i,
      /\bspotify\b/i,
      /\bhulu\b/i,
      /\bdisney ?\+?\b/i,
      /\bapple\.com\/bill/i,
      /\bicloud\b/i,
      /\byoutube ?(premium|tv)?\b/i,
      /\bprime ?video\b/i,
      /\bhbo ?max\b/i,
      /\bopen ?ai\b/i,
      /\banthropic\b/i,
      /\bgithub\b/i,
      /\bgoogle ?one\b/i,
      /\bdropbox\b/i,
      /\bnotion\b/i,
    ],
  },
  {
    category: "Utilities",
    patterns: [
      /\belectric\b/i,
      /\bwater\b/i,
      /\bgas company\b/i,
      /\bpg&e\b/i,
      /\bcon ?ed\b/i,
      /\butility\b/i,
      /\bsewer\b/i,
      /\bwaste mgmt\b/i,
    ],
  },
  {
    category: "Internet",
    patterns: [
      /\bcomcast\b/i,
      /\bxfinity\b/i,
      /\bverizon ?fios\b/i,
      /\bspectrum\b/i,
      /\bat&t internet\b/i,
      /\bgoogle ?fiber\b/i,
      /\bstarlink\b/i,
    ],
  },
  {
    category: "Phone",
    patterns: [
      /\bverizon ?wireless\b/i,
      /\bat&t\b/i,
      /\bt[- ]?mobile\b/i,
      /\bsprint\b/i,
      /\bmint mobile\b/i,
      /\bvisible\b/i,
    ],
  },
  {
    category: "Entertainment",
    patterns: [
      /\bmovie\b/i,
      /\bcinema\b/i,
      /\bamc theatres?\b/i,
      /\bregal cinemas?\b/i,
      /\bsteam(games)?\b/i,
      /\bxbox\b/i,
      /\bplaystation\b/i,
      /\bnintendo\b/i,
      /\bticketmaster\b/i,
    ],
  },
  {
    category: "Shopping",
    patterns: [
      /\bamazon\b/i,
      /\bamzn\b/i,
      /\btarget\b/i,
      /\bbest buy\b/i,
      /\bebay\b/i,
      /\betsy\b/i,
      /\bhome depot\b/i,
      /\blowe'?s\b/i,
      /\bikea\b/i,
      /\bnike\b/i,
      /\bapple store\b/i,
    ],
  },
  {
    category: "Health",
    patterns: [
      /\bcvs\b/i,
      /\bwalgreens\b/i,
      /\bpharmacy\b/i,
      /\bdoctor\b/i,
      /\bclinic\b/i,
      /\bhospital\b/i,
      /\bdental\b/i,
      /\boptometr/i,
      /\bvision/i,
    ],
  },
  {
    category: "Travel",
    patterns: [
      /\bairbnb\b/i,
      /\bbooking\.com\b/i,
      /\bhotel\b/i,
      /\bdelta air\b/i,
      /\bunited air\b/i,
      /\bsouthwest\b/i,
      /\balaska air\b/i,
      /\bjetblue\b/i,
      /\bexpedia\b/i,
      /\bkayak\b/i,
    ],
  },
  {
    category: "Transportation",
    patterns: [
      /\buber\b/i,
      /\blyft\b/i,
      /\btransit\b/i,
      /\bparking\b/i,
      /\btoll\b/i,
      /\bmta\b/i,
      /\bbart\b/i,
      /\bmetro\b/i,
    ],
  },
  {
    category: "Rent",
    patterns: [/\brent payment\b/i, /\bapartments?\b/i, /\blandlord\b/i],
  },
  {
    category: "Insurance",
    patterns: [
      /\binsurance\b/i,
      /\bgeico\b/i,
      /\ballstate\b/i,
      /\bstate farm\b/i,
      /\bprogressive\b/i,
      /\busaa\b/i,
    ],
  },
];

const INCOME_RULES: Rule[] = [
  {
    category: "Salary",
    patterns: [
      /\bpayroll\b/i,
      /\bdirect ?dep(osit)?\b/i,
      /\bsalary\b/i,
      /\bpaycheck\b/i,
      /\bach credit\b/i,
    ],
  },
  {
    category: "Refund",
    patterns: [/\brefund\b/i, /\breturn\b/i, /\breimburs/i],
  },
  {
    category: "Gift",
    patterns: [/\bvenmo\b/i, /\bzelle\b/i, /\bcash app\b/i, /\bpaypal\b/i],
  },
];

/** Match a transaction label to one of the standard category names. */
export function categorize(label: string, kind: CategoryKind): string | null {
  const rules = kind === "income" ? INCOME_RULES : EXPENSE_RULES;
  for (const rule of rules) {
    if (rule.patterns.some((p) => p.test(label))) return rule.category;
  }
  return null;
}
