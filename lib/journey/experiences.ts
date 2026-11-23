/**
 * Approved experience library (EXP-01 … EXP-10) and misconception registry.
 *
 * Everything here is hand-authored educational content. All numbers, names
 * and prices are invented for learning and must never be presented as live
 * market data, forecasts or recommendations.
 */
import type {
  Check,
  CheckVariant,
  Experience,
  ExperienceId,
  Misconception
} from './types';

export const EXPERIENCE_IDS: ExperienceId[] = [
  'EXP-01',
  'EXP-02',
  'EXP-03',
  'EXP-04',
  'EXP-05',
  'EXP-06',
  'EXP-07',
  'EXP-08',
  'EXP-09',
  'EXP-10'
];

/** Negative lookbehind so "does not guarantee" / "isn't guaranteed" don't match. */
const NEG = "(?<!(?:not|n't|never|no|without|cannot)\\s)";

/* ------------------------------------------------------------------ */
/* Misconceptions                                                      */
/* ------------------------------------------------------------------ */

export const MISCONCEPTIONS: Record<string, Misconception> = {
  'stocks-funds-same': {
    id: 'stocks-funds-same',
    label: 'Stocks and mutual funds are the same thing',
    correction: 'A share is direct part-ownership of one company; a mutual fund unit is a proportional share of a pooled portfolio chosen by a fund manager.',
    dimension: 'products',
    remedies: ['EXP-02', 'EXP-01'],
    patterns: [
      `${NEG}\\b(same thing|identical|no difference|basically the same)\\b.{0,40}\\b(stock|share|fund)`,
      `\\b(stocks?|shares?)\\b.{0,25}${NEG}\\b(are|is)\\s+(the same as|just|basically)\\s+(a\\s+)?(mutual )?funds?`,
      `\\b(stocks?|shares?|funds?)\\s+(and|&)\\s+(mutual\\s+)?(funds?|stocks?|shares?)\\s+${NEG}\\b(are|is)\\s+(the\\s+)?(same|identical)`
    ]
  },
  'fund-guaranteed': {
    id: 'fund-guaranteed',
    label: 'Mutual funds are guaranteed or cannot lose value',
    correction: 'A mutual fund unit’s value (NAV) moves with the value of the securities in the pool, so it can fall as well as rise.',
    dimension: 'products',
    remedies: ['EXP-02', 'EXP-04'],
    patterns: [
      `\\b(mutual )?funds?\\b.{0,30}${NEG}\\b(guaranteed?|assured|risk[- ]free|safe from loss)`,
      `\\b(mutual )?funds?\\b.{0,20}\\b(can ?not|cannot|can't|never|don'?t|doesn'?t)\\s+(fall|lose|go down|drop)`
    ]
  },
  'share-is-loan': {
    id: 'share-is-loan',
    label: 'Buying a share means lending money to the company',
    correction: 'A share is part-ownership, not a loan. On an exchange you usually buy existing shares from another investor, so the company does not receive that money.',
    dimension: 'fundamentals',
    remedies: ['EXP-01'],
    patterns: [
      `${NEG}\\b(lend|lending|loan|loaning)\\b.{0,30}\\b(compan(y|ies))`,
      `\\b(share|stock)s?\\b.{0,20}\\b(is|are)\\s+(a\\s+)?(loan|debt)`
    ]
  },
  'diversification-removes-risk': {
    id: 'diversification-removes-risk',
    label: 'Diversification removes all risk',
    correction: 'Spreading money across many companies reduces dependence on any one company, but a market-wide fall still affects the whole pool.',
    dimension: 'risk',
    remedies: ['EXP-02', 'EXP-04'],
    patterns: [
      `\\b(diversif\\w*|spread\\w*|many companies|pool\\w*)\\b.{0,30}${NEG}\\b(removes?|eliminates?|gets? rid of)\\s+(all\\s+)?(the\\s+)?risk`,
      `\\b(diversif\\w*|pool\\w*)\\b.{0,30}\\b(no|zero)\\s+risk`
    ]
  },
  'prices-only-rise': {
    id: 'prices-only-rise',
    label: 'Prices always go up in the long run',
    correction: 'Past movements do not guarantee future ones. Values can stay lower for long periods, and losses can be permanent.',
    dimension: 'risk',
    remedies: ['EXP-04'],
    patterns: [
      `${NEG}\\b(always|only|guaranteed to|sure to|definitely)\\s+(go(es)?|move[s]?|end[s]?|come[s]?)\\s+(back\\s+)?up\\b`,
      `\\b(can'?t|cannot|never)\\s+(lose|go down|fall)\\b.{0,20}\\b(long[- ]term|eventually|over time)`
    ]
  },
  'volatility-means-loss': {
    id: 'volatility-means-loss',
    label: 'Any dip in price means money is permanently lost',
    correction: 'Volatility is movement in both directions. A fall is a change in value that may or may not recover; a loss is locked in if you sell below what you paid — and losses can be large.',
    dimension: 'risk',
    remedies: ['EXP-04'],
    patterns: [
      `\\b(dip|fall|drop|volatil\\w*)\\b.{0,25}${NEG}\\b(means?|is|equals?)\\s+(a\\s+)?(permanent|definite|certain)\\s+loss`,
      `${NEG}\\bvolatility\\s+(only\\s+)?(means?|is)\\s+(losing|loss)`
    ]
  },
  'invest-trade-same': {
    id: 'invest-trade-same',
    label: 'Investing and trading are the same activity',
    correction: 'Investing is usually framed around owning assets for years; trading focuses on shorter-term price movements and needs far more frequent decisions.',
    dimension: 'fundamentals',
    remedies: ['EXP-03'],
    patterns: [
      `${NEG}\\b(investing|investment)\\b.{0,20}\\b(and|or|is|=)\\s+(trading)\\b.{0,20}\\b(same|identical|no difference)`,
      `\\btrading\\b.{0,15}\\b(is\\s+)?(the same as|just)\\s+investing`
    ]
  },
  'trading-sure-profit': {
    id: 'trading-sure-profit',
    label: 'Trading is a quick, reliable way to make money',
    correction: 'Short-term price movements are hard to anticipate. Frequent trading adds costs and can lead to losses as easily as gains.',
    dimension: 'decisions',
    remedies: ['EXP-03', 'EXP-04'],
    patterns: [
      `\\btrading\\b.{0,30}${NEG}\\b(easy|quick|fast|sure|guaranteed|reliable)\\s+(money|profit|income|way)`,
      `\\b(double|quick)\\s+(my|your)\\s+money\\b`
    ]
  },
  'market-order-price-guarantee': {
    id: 'market-order-price-guarantee',
    label: 'A market order always executes at the price shown on screen',
    correction: 'A market order seeks the best available price at the moment it reaches the exchange. That can differ from the last displayed price, especially for larger quantities or fast markets.',
    dimension: 'tradingMechanics',
    remedies: ['EXP-05'],
    patterns: [
      `\\bmarket order\\b.{0,40}${NEG}\\b(guarantee[sd]?|always|exactly|locks? in)\\b.{0,30}\\b(price|displayed|shown|screen|last)`,
      `${NEG}\\b(always|exactly)\\s+(get|gets|pay|pays)\\s+(the\\s+)?(displayed|shown|screen|last)\\s+price`
    ]
  },
  'limit-guarantees-execution': {
    id: 'limit-guarantees-execution',
    label: 'A limit order is guaranteed to execute',
    correction: 'A limit order only executes if someone is willing to trade at your limit or better. If the price never reaches it, the order stays open or expires.',
    dimension: 'tradingMechanics',
    remedies: ['EXP-06', 'EXP-07'],
    patterns: [
      `\\blimit order\\b.{0,40}${NEG}\\b(guarantee[sd]?|always|definitely|surely)\\s+(to\\s+)?(execute|executes|fill|fills|go through|be executed|be filled|gets? executed)`,
      `\\blimit order\\b.{0,30}${NEG}\\b(will|always)\\s+(definitely\\s+)?(execute|fill|go through)`
    ]
  },
  'limit-same-as-market': {
    id: 'limit-same-as-market',
    label: 'Limit orders and market orders are the same',
    correction: 'A market order prioritises executing now at the best available price; a limit order prioritises the price and may not execute.',
    dimension: 'tradingMechanics',
    remedies: ['EXP-06', 'EXP-05'],
    patterns: [
      `${NEG}\\b(limit|market)\\s+(order\\s+)?(and|or|is)\\s+(a\\s+)?(market|limit)\\s+order\\b.{0,20}\\b(same|identical|no difference)`,
      `\\b(limit|market) order\\b.{0,10}\\b(is\\s+)?(the same as|just like)\\s+(a\\s+)?(market|limit) order`
    ]
  },
  'orders-always-fill': {
    id: 'orders-always-fill',
    label: 'An order always fills completely',
    correction: 'If there are not enough shares on the other side at acceptable prices, an order can be partly filled or not filled at all.',
    dimension: 'tradingMechanics',
    remedies: ['EXP-07'],
    patterns: [
      `\\borders?\\b.{0,30}${NEG}\\b(always|guaranteed to|will always)\\s+(get\\s+)?(fill|filled|complete|completely|execute)`,
      `\\b(can'?t|cannot|never)\\s+(be\\s+)?partial(ly)?\\s+(fill|filled|execut)`
    ]
  },
  'order-is-holding': {
    id: 'order-is-holding',
    label: 'Placing an order means you already own the shares',
    correction: 'An order is an instruction. You only hold shares after the order executes and settles; an open, cancelled or rejected order adds nothing to holdings.',
    dimension: 'platform',
    remedies: ['EXP-10', 'EXP-08'],
    patterns: [
      `\\b(placing|placed|place|putting)\\s+(an?\\s+)?(buy\\s+)?order\\b.{0,30}${NEG}\\b(means?|is|=)\\s+(I|you|we)?\\s*(own|owning|bought|have)`,
      `\\b(order|orders)\\b.{0,15}\\b(is|are)\\s+(the same as|basically)\\s+(a\\s+)?holdings?`
    ]
  },
  'charges-only-brokerage': {
    id: 'charges-only-brokerage',
    label: 'Brokerage is the only cost — zero brokerage means no charges',
    correction: 'Besides any brokerage, trades can attract statutory and exchange-related charges (such as STT, stamp duty, GST, exchange transaction charges and the SEBI fee), plus DP charges on some sells.',
    dimension: 'platform',
    remedies: ['EXP-09'],
    patterns: [
      `\\b(zero|no|free)\\s+brokerage\\b.{0,30}\\b(means?|so|=)\\s+(no|zero|free|nothing)\\b`,
      `\\bonly\\s+(cost|charge|fee)\\b.{0,15}\\bis\\s+(the\\s+)?brokerage`,
      `\\b(trading|investing|buying shares)\\b.{0,15}\\b(is|are)\\s+(completely\\s+)?free\\b`
    ]
  },
  'watchlist-is-owning': {
    id: 'watchlist-is-owning',
    label: 'Adding something to a watchlist means you own it',
    correction: 'A watchlist is just a list you follow. Nothing is bought until an order executes.',
    dimension: 'platform',
    remedies: ['EXP-08'],
    patterns: [
      `\\bwatch ?list\\b.{0,30}${NEG}\\b(means?|is|=)\\s+(I|you)?\\s*(own|owning|bought|buying|invested)`,
      `\\b(adding|added|add)\\b.{0,20}\\bwatch ?list\\b.{0,20}\\b(buys?|bought|purchases?)`
    ]
  },
  'funds-is-holdings': {
    id: 'funds-is-holdings',
    label: 'The Funds balance is the value of my investments',
    correction: 'Funds shows money available to place orders (and related balances). Holdings shows the securities you already own and their current value.',
    dimension: 'platform',
    remedies: ['EXP-08'],
    patterns: [
      `\\bfunds?\\s+(balance|section|tab)\\b.{0,30}${NEG}\\b(is|shows?|means?)\\s+(the\\s+)?(value of\\s+)?(my|your)\\s+(investments|holdings|shares)`
    ]
  },
  'displayed-price-is-live-truth': {
    id: 'displayed-price-is-live-truth',
    label: 'The displayed price is the price anyone can trade at right now',
    correction: 'The displayed price is usually the last traded price. Buyers and sellers quote bids and asks around it, and the price you can actually trade at depends on them.',
    dimension: 'tradingMechanics',
    remedies: ['EXP-07', 'EXP-05'],
    patterns: [
      `\\b(last|displayed|shown)\\s+price\\b.{0,25}${NEG}\\b(is|equals?)\\s+(always\\s+)?(the\\s+)?(price\\s+)?(I|you|anyone)\\s+(can|will)\\s+(buy|sell|trade)`
    ]
  }
};

/* ------------------------------------------------------------------ */
/* Experiences                                                         */
/* ------------------------------------------------------------------ */

const EXP_01: Experience = {
  id: 'EXP-01',
  title: 'What a share really is',
  short: 'Ownership, shares and why a share’s value moves.',
  objective: 'Understand that a share is a small slice of ownership in a company and that its value moves with what people will pay for it.',
  context: 'Imagine a made-up business, Company A, divided into 1,000 equal shares. Nothing here refers to a real company or a real price.',
  outcome: 'You can explain what owning a share means, how your slice is calculated, and why its value is not fixed.',
  minutes: 4,
  dimensions: ['fundamentals', 'products'],
  lab: 'share-split',
  labPrompt: 'Move the first slider to choose how many of Company A’s 1,000 shares you hold, then move the second slider to change the company’s invented value. Watch what happens to your slice.',
  prerequisites: [],
  sourceIds: ['direct-shares', 'beginner'],
  checks: [
    {
      id: 'slice',
      kind: 'choice',
      concept: 'Share ownership',
      prompt: 'Company A is split into 1,000 shares. You hold 10 of them. What do you own?',
      help: 'Think about the whole company divided into equal slices.',
      dimension: 'fundamentals',
      misconceptionIds: ['share-is-loan'],
      options: [
        { id: 'one-percent', label: 'About 1% of Company A’s ownership' },
        { id: 'loan', label: 'A loan of my money to Company A, which it must pay back' },
        { id: 'ten-percent', label: '10% of Company A' },
        { id: 'fixed-value', label: 'A fixed amount of money that will not change' }
      ],
      correctOptionId: 'one-percent',
      optionFeedback: {
        'one-percent': 'Exactly — 10 out of 1,000 equal slices is 1% of the ownership.',
        loan: 'A share is ownership, not a loan. Nobody promises to pay it back; its value depends on what others will pay for it.',
        'ten-percent': 'Close in spirit, but 10 out of 1,000 is 1%, not 10%.',
        'fixed-value': 'A share’s value is not fixed — it moves as the company’s value and demand for its shares change.'
      },
      optionMisconception: { loan: 'share-is-loan' },
      successFeedback: 'You’ve got it: a share is a slice of ownership, and your slice is your shares divided by the total.',
      retryFeedback: 'Divide the shares you hold by the total number of shares.'
    },
    {
      id: 'value-moves',
      kind: 'choice',
      concept: 'Why share value changes',
      prompt: 'In the simulation, Company A’s invented value rises by 20%. What happens to the value of your 10 shares, assuming the share price tracks it?',
      dimension: 'fundamentals',
      misconceptionIds: ['share-is-loan', 'prices-only-rise'],
      options: [
        { id: 'rises-too', label: 'It rises by about 20% too — and it could equally fall if the value fell' },
        { id: 'unchanged', label: 'Nothing — I lent a fixed amount, so my value stays the same' },
        { id: 'always-up', label: 'It rises, and shares like this only ever go up over time' }
      ],
      correctOptionId: 'rises-too',
      optionFeedback: {
        'rises-too': 'Right. Your slice moves with the price — in both directions.',
        unchanged: 'Because a share is ownership rather than a loan, its value moves with the company’s share price.',
        'always-up': 'It does rise in this invented case, but nothing guarantees future rises. Prices can fall and stay low.'
      },
      optionMisconception: { unchanged: 'share-is-loan', 'always-up': 'prices-only-rise' },
      successFeedback: 'Yes — ownership means you share in both rises and falls.',
      retryFeedback: 'A share’s value follows its market price, up or down.'
    },
    {
      id: 'explain-share',
      kind: 'explain',
      concept: 'Explaining a share',
      prompt: 'In your own words, how would you explain what a share is to a friend?',
      help: 'One or two sentences is plenty. No jargon needed.',
      dimension: 'fundamentals',
      misconceptionIds: ['share-is-loan', 'prices-only-rise'],
      minLength: 25,
      requiredConcepts: [
        ['own', 'ownership', 'part', 'piece', 'slice', 'portion', 'stake', 'fraction', 'bit of'],
        ['company', 'business', 'firm', 'corporation']
      ],
      modelAnswer: 'A share is a small piece of ownership in a company. Its value moves up and down with what people are willing to pay for it.',
      successFeedback: 'That’s a clear explanation of part-ownership.',
      retryFeedback: 'Try to mention that a share is a part of the ownership of a company.'
    }
  ],
  alternatives: {
    slice: {
      explanation: 'Think of a pizza cut into 8 equal slices. If you have 2 slices, you have a quarter of the pizza. A company works the same way: its ownership is cut into shares, and your shares ÷ total shares is your slice. You aren’t lending anything — you own part of the pizza.',
      check: {
        id: 'slice-alt',
        kind: 'choice',
        concept: 'Share ownership',
        prompt: 'A made-up company, Company B, has 200 shares. You hold 50. What do you have?',
        dimension: 'fundamentals',
        misconceptionIds: ['share-is-loan'],
        options: [
          { id: 'quarter', label: 'A quarter (25%) of the ownership of Company B' },
          { id: 'loan', label: 'A loan to Company B that it will repay with interest' },
          { id: 'fifty', label: '50% of Company B' }
        ],
        correctOptionId: 'quarter',
        optionFeedback: {
          quarter: 'Yes — 50 of 200 slices is a quarter.',
          loan: 'Shares are ownership, not loans. A loan is a different kind of instrument (like a bond).',
          fifty: '50 out of 200 is 25%, not 50%.'
        },
        optionMisconception: { loan: 'share-is-loan' },
        successFeedback: 'Correct — your shares divided by the total gives your slice.',
        retryFeedback: 'Divide 50 by 200.'
      }
    },
    'value-moves': {
      explanation: 'Picture owning part of a small shop with friends. If buyers would now pay more for the whole shop, your part is worth more; if they’d pay less, it’s worth less. Nobody guarantees which way it goes — that is what it means to share in ownership.',
      check: {
        id: 'value-moves-alt',
        kind: 'choice',
        concept: 'Why share value changes',
        prompt: 'In an invented example, buyers now value Company B 10% lower than before. What happens to your shares?',
        dimension: 'fundamentals',
        misconceptionIds: ['share-is-loan', 'prices-only-rise'],
        options: [
          { id: 'falls', label: 'Their value falls by about 10%, because my slice moves with the company’s value' },
          { id: 'protected', label: 'Their value is protected because the company owes me my money back' },
          { id: 'bounce', label: 'It doesn’t matter — share prices always come back up' }
        ],
        correctOptionId: 'falls',
        optionFeedback: {
          falls: 'Right — ownership moves both ways.',
          protected: 'Owners aren’t owed a fixed repayment. That’s why share values can fall.',
          bounce: 'Recovery is never guaranteed. Prices can stay lower for a long time.'
        },
        optionMisconception: { protected: 'share-is-loan', bounce: 'prices-only-rise' },
        successFeedback: 'Yes — your slice falls when the company is valued lower.',
        retryFeedback: 'Ownership means sharing in falls as well as rises.'
      }
    },
    'explain-share': {
      explanation: 'If ten friends together buy a food stall and each puts in an equal amount, each friend owns one-tenth of the stall. A share is the same idea at a bigger scale: a small piece of a company’s ownership.',
      check: {
        id: 'explain-share-alt',
        kind: 'explain',
        concept: 'Explaining a share',
        prompt: 'Using the food-stall idea, explain what someone holds when they hold a share.',
        dimension: 'fundamentals',
        misconceptionIds: ['share-is-loan'],
        minLength: 20,
        requiredConcepts: [
          ['own', 'ownership', 'part', 'piece', 'slice', 'portion', 'stake', 'fraction', 'share of'],
          ['company', 'business', 'stall', 'firm']
        ],
        modelAnswer: 'They hold a small part of the ownership of a business, just like one friend owning a tenth of the stall.',
        successFeedback: 'Nicely put — a share is a piece of ownership.',
        retryFeedback: 'Mention owning a part of the business.'
      }
    }
  },
  transfer: {
    id: 'transfer-secondary',
    kind: 'choice',
    concept: 'Buying existing shares',
    prompt: 'You buy 5 shares of an invented Company C on a stock exchange, from another investor who is selling. Who receives your money?',
    help: 'This is a new situation — think about who you are trading with.',
    dimension: 'fundamentals',
    misconceptionIds: ['share-is-loan'],
    options: [
      { id: 'seller', label: 'Mostly the investor who sold the shares (minus charges) — not Company C' },
      { id: 'company', label: 'Company C, because I am lending it money' },
      { id: 'exchange', label: 'The stock exchange keeps it' }
    ],
    correctOptionId: 'seller',
    optionFeedback: {
      seller: 'Correct. On an exchange, existing shares change hands between investors; the company isn’t receiving the money in that trade.',
      company: 'In everyday exchange trading you buy existing shares from another investor. The company isn’t borrowing from you.',
      exchange: 'The exchange matches buyers and sellers; the money goes to the seller (the exchange may levy a small transaction charge).'
    },
    optionMisconception: { company: 'share-is-loan' },
    successFeedback: 'Yes — you applied ownership to a real-world trade.',
    retryFeedback: 'You are buying from another owner, not from the company.'
  }
};

const EXP_02: Experience = {
  id: 'EXP-02',
  title: 'Stocks vs mutual funds',
  short: 'Direct ownership vs a slice of a pooled portfolio.',
  objective: 'Distinguish owning shares of one company directly from holding units of a mutual fund that pools money across many securities.',
  context: 'You’ll compare two invented ways to put the same ₹10,000 (a made-up amount) to work: all in one company, or in a pool spread across ten companies.',
  outcome: 'You can describe how direct shares and fund units differ in structure, who chooses what is held, and how diversification helps — and where it stops helping.',
  minutes: 5,
  dimensions: ['products', 'risk'],
  lab: 'pool-vs-direct',
  labPrompt: 'Switch between owning Company A directly and holding units in a pool of 10 companies. Then press “Company A falls 40%” and “Whole market dips 10%” to see how each set-up reacts.',
  prerequisites: ['EXP-01'],
  sourceIds: ['pooled-fund', 'direct-shares', 'mutual-fund', 'diversification'],
  checks: [
    {
      id: 'structure',
      kind: 'choice',
      concept: 'Direct vs pooled structure',
      prompt: 'What is the main structural difference between a company share and a mutual fund unit?',
      help: 'Think about what each one represents, not which one is better.',
      dimension: 'products',
      misconceptionIds: ['stocks-funds-same', 'fund-guaranteed'],
      options: [
        { id: 'direct-pool', label: 'A share is part-ownership of one company; a fund unit is a slice of a pool of many investments' },
        { id: 'same', label: 'They are the same thing with different names' },
        { id: 'fund-safe', label: 'A share can lose value; a fund unit cannot' }
      ],
      correctOptionId: 'direct-pool',
      optionFeedback: {
        'direct-pool': 'Yes — direct ownership of one company versus a proportional slice of a managed pool.',
        same: 'They are related but different: one is a direct holding, the other is a unit in a pool.',
        'fund-safe': 'A fund unit’s value (NAV) moves with the securities in the pool, so it can fall too.'
      },
      optionMisconception: { same: 'stocks-funds-same', 'fund-safe': 'fund-guaranteed' },
      successFeedback: 'That’s the core structural difference.',
      retryFeedback: 'Compare what each instrument represents.'
    },
    {
      id: 'sort-features',
      kind: 'sort',
      concept: 'Features of each route',
      prompt: 'Sort each statement under the route it describes.',
      dimension: 'products',
      misconceptionIds: ['stocks-funds-same'],
      buckets: [
        { id: 'direct', label: 'Direct shares' },
        { id: 'fund', label: 'Mutual fund units' }
      ],
      items: [
        { id: 'you-pick', label: 'You choose each company yourself', bucketId: 'direct' },
        { id: 'manager', label: 'A fund manager selects the securities', bucketId: 'fund' },
        { id: 'nav', label: 'Value is tracked as a NAV per unit', bucketId: 'fund' },
        { id: 'one-company', label: 'Value depends on one company’s share price', bucketId: 'direct' },
        { id: 'pooled', label: 'Your money is pooled with other investors’ money', bucketId: 'fund' }
      ],
      successFeedback: 'All sorted correctly — you can tell the two routes apart.',
      retryFeedback: 'Ask of each statement: is the person holding one company directly, or a slice of a pool?'
    },
    {
      id: 'diversification-limit',
      kind: 'choice',
      concept: 'Limits of diversification',
      prompt: 'In the lab, what happened to the pool when the whole market dipped?',
      dimension: 'risk',
      misconceptionIds: ['diversification-removes-risk', 'fund-guaranteed'],
      options: [
        { id: 'pool-fell', label: 'The pool fell too — spreading helps with one company’s problems, not a market-wide fall' },
        { id: 'pool-safe', label: 'Nothing — diversification removes all risk' },
        { id: 'pool-guaranteed', label: 'The fund was protected because mutual funds are guaranteed' }
      ],
      correctOptionId: 'pool-fell',
      optionFeedback: {
        'pool-fell': 'Right. Diversification reduces company-specific risk but not market-wide risk.',
        'pool-safe': 'Spreading across companies softens one company’s fall, but when most companies fall together, the pool falls too.',
        'pool-guaranteed': 'Mutual funds are not guaranteed; their value moves with what they hold.'
      },
      optionMisconception: { 'pool-safe': 'diversification-removes-risk', 'pool-guaranteed': 'fund-guaranteed' },
      successFeedback: 'You found the boundary of diversification.',
      retryFeedback: 'Compare the “one company falls” and “whole market dips” outcomes.'
    }
  ],
  alternatives: {
    structure: {
      explanation: 'Think of buying one mango directly from a farmer versus buying a share of a fruit basket that a shopkeeper fills with ten fruits. The mango is entirely yours; with the basket, you own a portion of everything in it — chosen by someone else.',
      check: {
        id: 'structure-alt',
        kind: 'choice',
        concept: 'Direct vs pooled structure',
        prompt: 'An invented “Example Fund” holds 40 companies. You hold units of it. What do you hold?',
        dimension: 'products',
        misconceptionIds: ['stocks-funds-same', 'fund-guaranteed'],
        options: [
          { id: 'slice-pool', label: 'A proportional slice of the whole pool of 40 companies' },
          { id: 'one-share-each', label: 'Exactly one share of each of the 40 companies in my own name' },
          { id: 'fixed', label: 'A fixed, guaranteed amount' }
        ],
        correctOptionId: 'slice-pool',
        optionFeedback: {
          'slice-pool': 'Yes — units represent your proportion of the pooled portfolio.',
          'one-share-each': 'The fund owns the securities; you own units of the fund that represent a slice of it.',
          fixed: 'Fund units are not guaranteed; their value moves with the pool.'
        },
        optionMisconception: { fixed: 'fund-guaranteed' },
        successFeedback: 'Exactly — a unit is a slice of the pool.',
        retryFeedback: 'You hold the basket, not each fruit directly.'
      }
    },
    'sort-features': {
      explanation: 'A quick test: if you are the one deciding which company to own, it’s a direct share. If you hand money to a pool where a manager decides, and you get “units”, it’s a mutual fund.',
      check: {
        id: 'sort-features-alt',
        kind: 'sort',
        concept: 'Features of each route',
        prompt: 'Sort these new statements.',
        dimension: 'products',
        misconceptionIds: ['stocks-funds-same'],
        buckets: [
          { id: 'direct', label: 'Direct shares' },
          { id: 'fund', label: 'Mutual fund units' }
        ],
        items: [
          { id: 'units', label: 'You receive units of a scheme', bucketId: 'fund' },
          { id: 'voting', label: 'You are a shareholder of that one company', bucketId: 'direct' },
          { id: 'many', label: 'One holding spreads across many securities', bucketId: 'fund' },
          { id: 'research', label: 'You research and pick the company yourself', bucketId: 'direct' }
        ],
        successFeedback: 'Sorted correctly.',
        retryFeedback: 'Who decides what is held — you, or a fund manager?'
      }
    },
    'diversification-limit': {
      explanation: 'Imagine carrying eggs in ten baskets instead of one. If one basket drops, you lose only a few eggs. But if the whole cart tips over, every basket falls. Diversification protects against one basket dropping — not the cart tipping.',
      check: {
        id: 'diversification-limit-alt',
        kind: 'choice',
        concept: 'Limits of diversification',
        prompt: 'An invented pool holds 25 companies. One company has a bad year; separately, the whole market has a bad month. Which statement fits?',
        dimension: 'risk',
        misconceptionIds: ['diversification-removes-risk'],
        options: [
          { id: 'both', label: 'The one company’s problem has a small effect on the pool; the market-wide fall affects most of the pool' },
          { id: 'none', label: 'Neither affects the pool because it is diversified' },
          { id: 'only-company', label: 'Only the single company’s problem matters' }
        ],
        correctOptionId: 'both',
        optionFeedback: {
          both: 'Exactly — the cart-tipping kind of risk remains.',
          none: 'Diversification softens single-company problems but cannot remove market-wide risk.',
          'only-company': 'A market-wide fall usually affects most holdings at once — that’s the bigger effect here.'
        },
        optionMisconception: { none: 'diversification-removes-risk' },
        successFeedback: 'Right — company-specific risk shrinks, market risk stays.',
        retryFeedback: 'Separate one basket dropping from the cart tipping over.'
      }
    }
  },
  transfer: {
    id: 'transfer-explain',
    kind: 'explain',
    concept: 'Explaining the difference',
    prompt: 'A cousin asks: “Isn’t a mutual fund just a safer stock?” In one or two sentences, explain the actual difference.',
    dimension: 'products',
    misconceptionIds: ['stocks-funds-same', 'fund-guaranteed', 'diversification-removes-risk'],
    minLength: 30,
    requiredConcepts: [
      ['share', 'stock', 'one company', 'direct', 'single company', 'own a company'],
      ['pool', 'many', 'basket', 'portfolio', 'several', 'different companies', 'spread', 'collection', 'fund manager', 'units']
    ],
    modelAnswer: 'A stock is direct ownership of one company, while a mutual fund pools money from many people into many investments chosen by a fund manager. Spreading out can reduce single-company risk, but fund values can still fall.',
    successFeedback: 'Clear and accurate — you separated structure from safety.',
    retryFeedback: 'Mention both sides: one company held directly, versus a pool of many investments.'
  }
};

const EXP_03: Experience = {
  id: 'EXP-03',
  title: 'Investing vs trading',
  short: 'Different goals, time horizons and daily activity.',
  objective: 'Understand that investing and trading differ in objective, time horizon and how often decisions are made.',
  context: 'Two invented people, Asha and Ravi, both use the same kind of app. Asha invests for goals years away; Ravi trades short-term price moves.',
  outcome: 'You can describe how investing and trading differ in purpose, time horizon and activity — without treating either as a promise of profit.',
  minutes: 4,
  dimensions: ['fundamentals', 'decisions'],
  lab: 'invest-vs-trade',
  labPrompt: 'Switch between the Investing and Trading tabs to compare time horizons, typical activities and what each pays attention to. Then sort a few activities into the approach they fit.',
  prerequisites: [],
  sourceIds: ['investing-trading', 'horizon-goal'],
  checks: [
    {
      id: 'sort-activities',
      kind: 'sort',
      concept: 'Investing vs trading activities',
      prompt: 'Sort each activity under the approach it most typically describes.',
      dimension: 'fundamentals',
      misconceptionIds: ['invest-trade-same'],
      buckets: [
        { id: 'invest', label: 'Investing' },
        { id: 'trade', label: 'Trading' }
      ],
      items: [
        { id: 'years', label: 'Holding for several years towards a goal', bucketId: 'invest' },
        { id: 'intraday', label: 'Buying and selling within the same day', bucketId: 'trade' },
        { id: 'business', label: 'Focusing on how a business performs over time', bucketId: 'invest' },
        { id: 'charts', label: 'Watching minute-by-minute price moves', bucketId: 'trade' },
        { id: 'monthly', label: 'Adding a fixed amount every month', bucketId: 'invest' }
      ],
      successFeedback: 'Well sorted — the time horizon gives it away.',
      retryFeedback: 'Ask: is this about years and the business, or short-term price moves?'
    },
    {
      id: 'main-difference',
      kind: 'choice',
      concept: 'Core difference',
      prompt: 'What best describes the main difference between Asha (investing) and Ravi (trading)?',
      dimension: 'decisions',
      misconceptionIds: ['invest-trade-same', 'trading-sure-profit'],
      options: [
        { id: 'horizon', label: 'Their objective and time horizon — years of ownership vs short-term price moves' },
        { id: 'same', label: 'There’s no real difference; it’s the same activity' },
        { id: 'profit', label: 'Ravi’s approach is a quicker, reliable way to make money' }
      ],
      correctOptionId: 'horizon',
      optionFeedback: {
        horizon: 'Yes — purpose and time horizon are what separate them.',
        same: 'They use similar apps, but their goals, time horizons and activity levels differ a lot.',
        profit: 'Short-term moves are hard to anticipate; frequent trading can lose money and adds costs.'
      },
      optionMisconception: { same: 'invest-trade-same', profit: 'trading-sure-profit' },
      successFeedback: 'That’s the key distinction.',
      retryFeedback: 'Compare how long each person holds and why.'
    },
    {
      id: 'explain-difference',
      kind: 'explain',
      concept: 'Explaining investing vs trading',
      prompt: 'In your own words, how is investing different from trading?',
      dimension: 'fundamentals',
      misconceptionIds: ['invest-trade-same', 'trading-sure-profit'],
      minLength: 25,
      requiredConcepts: [
        ['long', 'years', 'time', 'horizon', 'short', 'day', 'quick', 'frequent', 'often', 'duration', 'period'],
        ['trad']
      ],
      modelAnswer: 'Investing usually means owning assets for years towards a goal, while trading means buying and selling over short periods to try to benefit from price moves.',
      successFeedback: 'You captured the time-horizon difference.',
      retryFeedback: 'Mention how long each one usually holds, and name trading in your answer.'
    }
  ],
  alternatives: {
    'sort-activities': {
      explanation: 'Think of a mango orchard owner versus someone reselling mangoes at a market stall. The orchard owner cares about the trees over many seasons; the reseller cares about today’s price difference. Investing is closer to the orchard; trading is closer to the stall.',
      check: {
        id: 'sort-activities-alt',
        kind: 'sort',
        concept: 'Investing vs trading activities',
        prompt: 'Sort these new activities.',
        dimension: 'fundamentals',
        misconceptionIds: ['invest-trade-same'],
        buckets: [
          { id: 'invest', label: 'Investing' },
          { id: 'trade', label: 'Trading' }
        ],
        items: [
          { id: 'retire', label: 'Building money for a goal 15 years away', bucketId: 'invest' },
          { id: 'quick-exit', label: 'Selling as soon as the price moves a little', bucketId: 'trade' },
          { id: 'review-yearly', label: 'Reviewing holdings once or twice a year', bucketId: 'invest' },
          { id: 'many-orders', label: 'Placing many orders every week', bucketId: 'trade' }
        ],
        successFeedback: 'Correctly sorted.',
        retryFeedback: 'Orchard (years) or market stall (today’s price)?'
      }
    },
    'main-difference': {
      explanation: 'Investing and trading are like a long train journey versus a quick auto ride. Both move you, but they serve different purposes and need very different attention. Neither one guarantees you arrive with more money.',
      check: {
        id: 'main-difference-alt',
        kind: 'choice',
        concept: 'Core difference',
        prompt: 'Someone says, “I’ll trade every day — it’s just faster investing.” What’s the most accurate response?',
        dimension: 'decisions',
        misconceptionIds: ['invest-trade-same', 'trading-sure-profit'],
        options: [
          { id: 'different', label: 'Trading is a different activity with a short time horizon, frequent decisions and more costs — not a faster version of investing' },
          { id: 'faster', label: 'Yes, trading is investing done faster, with faster profits' },
          { id: 'identical', label: 'They’re identical, so it doesn’t matter' }
        ],
        correctOptionId: 'different',
        optionFeedback: {
          different: 'Exactly — different purpose, time horizon and workload.',
          faster: 'Short-term moves are uncertain; trading can lose money quickly too.',
          identical: 'Their goals and time horizons differ, so they are not identical.'
        },
        optionMisconception: { faster: 'trading-sure-profit', identical: 'invest-trade-same' },
        successFeedback: 'Right — trading is its own activity with its own risks.',
        retryFeedback: 'Think train journey vs auto ride.'
      }
    },
    'explain-difference': {
      explanation: 'A simple way to say it: investing is about owning something for a long time because of what it is; trading is about buying and selling over a short time because of how its price moves.',
      check: {
        id: 'explain-difference-alt',
        kind: 'explain',
        concept: 'Explaining investing vs trading',
        prompt: 'Finish this in your own words: “The biggest difference between investing and trading is…”',
        dimension: 'fundamentals',
        misconceptionIds: ['invest-trade-same'],
        minLength: 20,
        requiredConcepts: [
          ['long', 'years', 'time', 'horizon', 'short', 'day', 'quick', 'frequent', 'often', 'how long', 'period']
        ],
        modelAnswer: '…how long you hold: investing is usually for years, trading is for short periods based on price moves.',
        successFeedback: 'That names the key difference.',
        retryFeedback: 'Mention how long each one usually holds.'
      }
    }
  },
  transfer: {
    id: 'transfer-classify',
    kind: 'choice',
    concept: 'Applying the distinction',
    prompt: 'An invented person, Meera, buys units of a fund each month for her child’s education in 12 years and rarely checks prices. Which description fits?',
    dimension: 'decisions',
    misconceptionIds: ['invest-trade-same'],
    options: [
      { id: 'investing', label: 'Investing — a long time horizon tied to a goal' },
      { id: 'trading', label: 'Trading — she is buying and selling for short-term moves' },
      { id: 'neither', label: 'There’s no way to tell; they’re the same thing' }
    ],
    correctOptionId: 'investing',
    optionFeedback: {
      investing: 'Yes — a goal 12 years away and infrequent checking point to investing.',
      trading: 'She isn’t selling for short-term moves; her horizon is many years.',
      neither: 'The time horizon and goal make this clearly investing.'
    },
    optionMisconception: { neither: 'invest-trade-same' },
    successFeedback: 'You applied the distinction to a new person.',
    retryFeedback: 'Look at Meera’s time horizon.'
  }
};

const EXP_04: Experience = {
  id: 'EXP-04',
  title: 'Understanding volatility',
  short: 'Why prices wiggle, and what a dip does and doesn’t mean.',
  objective: 'Understand volatility as price movement in both directions and separate a temporary fall in value from a realised loss.',
  context: 'You’ll generate invented price paths for a made-up asset. These are random simulations — not predictions and not real prices.',
  outcome: 'You can explain what volatility means, read an invented price path without predicting from it, and describe when a fall becomes a realised loss.',
  minutes: 5,
  dimensions: ['risk'],
  lab: 'volatility-path',
  labPrompt: 'Move the volatility slider and press “Generate another path” a few times. Compare the biggest dip and the overall range at low and high volatility.',
  prerequisites: [],
  sourceIds: ['volatility-risk', 'risk-volatility'],
  checks: [
    {
      id: 'what-volatility',
      kind: 'choice',
      concept: 'Meaning of volatility',
      prompt: 'Based on the lab, what does higher volatility describe?',
      dimension: 'risk',
      misconceptionIds: ['volatility-means-loss', 'prices-only-rise'],
      options: [
        { id: 'bigger-swings', label: 'Bigger swings in price — both up and down' },
        { id: 'losses', label: 'A guarantee of losing money' },
        { id: 'up', label: 'A price that ends higher' }
      ],
      correctOptionId: 'bigger-swings',
      optionFeedback: {
        'bigger-swings': 'Yes — volatility is about the size of movement in both directions.',
        losses: 'Volatility means larger movement, not a guaranteed loss. Paths can end higher or lower.',
        up: 'Higher volatility doesn’t mean higher prices — it means bigger moves either way.'
      },
      optionMisconception: { losses: 'volatility-means-loss', up: 'prices-only-rise' },
      successFeedback: 'Right — volatility measures how much the price swings.',
      retryFeedback: 'Compare the shapes at low and high volatility.'
    },
    {
      id: 'dip-vs-loss',
      kind: 'choice',
      concept: 'Fall in value vs realised loss',
      prompt: 'An invented holding bought at ₹100 dips to ₹85, then rises to ₹95. The owner hasn’t sold. Which statement is accurate?',
      dimension: 'risk',
      misconceptionIds: ['volatility-means-loss', 'prices-only-rise'],
      options: [
        { id: 'unrealised', label: 'It’s currently worth less than they paid; the loss becomes realised only if they sell below ₹100 — and it may or may not recover' },
        { id: 'lost', label: 'The dip to ₹85 means ₹15 was permanently lost' },
        { id: 'will-recover', label: 'It will definitely come back above ₹100, so there’s no risk' }
      ],
      correctOptionId: 'unrealised',
      optionFeedback: {
        unrealised: 'Exactly — a fall in value is real, but it’s locked in only when sold. Recovery isn’t guaranteed.',
        lost: 'The value fell, but nothing is locked in until it’s sold. It could recover — or fall further.',
        'will-recover': 'Recovery is never guaranteed. Prices can stay lower for a long time.'
      },
      optionMisconception: { lost: 'volatility-means-loss', 'will-recover': 'prices-only-rise' },
      successFeedback: 'You separated a fall in value from a realised loss.',
      retryFeedback: 'Ask: has the owner sold yet?'
    },
    {
      id: 'explain-volatility',
      kind: 'explain',
      concept: 'Explaining volatility',
      prompt: 'Explain volatility in your own words, as if to someone who’s nervous about investing.',
      dimension: 'risk',
      misconceptionIds: ['volatility-means-loss', 'prices-only-rise'],
      minLength: 25,
      requiredConcepts: [
        ['move', 'swing', 'change', 'fluctuat', 'up and down', 'rise and fall', 'goes up', 'vary', 'varies', 'bounce']
      ],
      modelAnswer: 'Volatility is how much a price moves up and down over time. Higher volatility means bigger swings in both directions — it doesn’t tell you where the price will end up.',
      successFeedback: 'Calm and accurate — that’s a helpful explanation.',
      retryFeedback: 'Describe how the price moves up and down.'
    }
  ],
  alternatives: {
    'what-volatility': {
      explanation: 'Think of two roads between the same towns: one flat, one hilly. Both can end at the same place, but the hilly road has big ups and downs on the way. Volatility describes how hilly the road is — not where it ends.',
      check: {
        id: 'what-volatility-alt',
        kind: 'choice',
        concept: 'Meaning of volatility',
        prompt: 'Two invented assets both start at 100 and end at 110 after a year. Asset X moved between 98 and 112; Asset Y moved between 70 and 130. Which is more volatile?',
        dimension: 'risk',
        misconceptionIds: ['volatility-means-loss'],
        options: [
          { id: 'y', label: 'Asset Y — its swings were much larger' },
          { id: 'x', label: 'Asset X — it ended at the same price' },
          { id: 'same', label: 'Equally volatile, because both ended at 110' }
        ],
        correctOptionId: 'y',
        optionFeedback: {
          y: 'Yes — same start and end, but a much hillier road.',
          x: 'Asset X stayed in a narrow band, so it was less volatile.',
          same: 'Volatility is about the path, not just the start and end.'
        },
        optionMisconception: {},
        successFeedback: 'Right — volatility is about the path.',
        retryFeedback: 'Compare the size of the swings, not the end points.'
      }
    },
    'dip-vs-loss': {
      explanation: 'If you own a house and nearby prices fall for a while, your house is worth less on paper — but you only lock in a loss if you sell at that lower price. Prices might recover, or might not. Shares work the same way.',
      check: {
        id: 'dip-vs-loss-alt',
        kind: 'choice',
        concept: 'Fall in value vs realised loss',
        prompt: 'An invented holding bought at ₹200 is now worth ₹170. When does the ₹30 fall become a realised loss?',
        dimension: 'risk',
        misconceptionIds: ['volatility-means-loss', 'prices-only-rise'],
        options: [
          { id: 'when-sold', label: 'When it is sold at ₹170 (or any price below ₹200)' },
          { id: 'already', label: 'It’s already permanently lost the moment the price dips' },
          { id: 'never', label: 'Never — prices always come back eventually' }
        ],
        correctOptionId: 'when-sold',
        optionFeedback: {
          'when-sold': 'Yes — selling locks in the difference.',
          already: 'The value is lower right now, but it isn’t locked in until sold.',
          never: 'Recovery is not guaranteed; a loss can become permanent.'
        },
        optionMisconception: { already: 'volatility-means-loss', never: 'prices-only-rise' },
        successFeedback: 'Correct — selling is what realises a loss.',
        retryFeedback: 'Think about the house example: when is the loss locked in?'
      }
    },
    'explain-volatility': {
      explanation: 'Picture a boat on water. Calm water means small gentle rocking; rough water means big swings. Volatility is how rough the water is — the boat can rock up or down.',
      check: {
        id: 'explain-volatility-alt',
        kind: 'explain',
        concept: 'Explaining volatility',
        prompt: 'Using the boat idea, explain what “high volatility” means for a price.',
        dimension: 'risk',
        misconceptionIds: ['volatility-means-loss'],
        minLength: 20,
        requiredConcepts: [
          ['move', 'swing', 'change', 'fluctuat', 'up and down', 'rock', 'rise and fall', 'vary', 'bounce']
        ],
        modelAnswer: 'High volatility means the price swings a lot, up and down, like a boat in rough water.',
        successFeedback: 'That captures it.',
        retryFeedback: 'Mention the price swinging up and down.'
      }
    }
  },
  transfer: {
    id: 'transfer-path',
    kind: 'choice',
    concept: 'Reading a path without predicting',
    prompt: 'An invented price rose for five days in a row. What can you conclude about day six?',
    dimension: 'risk',
    misconceptionIds: ['prices-only-rise'],
    options: [
      { id: 'nothing', label: 'Nothing certain — past moves don’t guarantee the next one' },
      { id: 'rise', label: 'It will rise again because it has momentum' },
      { id: 'fall', label: 'It must fall because it has risen too much' }
    ],
    correctOptionId: 'nothing',
    optionFeedback: {
      nothing: 'Exactly — a path describes the past, not the future.',
      rise: 'A streak doesn’t guarantee the next day. Prices can turn at any time.',
      fall: 'There’s no rule that a rise must be followed by a fall either.'
    },
    optionMisconception: { rise: 'prices-only-rise' },
    successFeedback: 'You read the path without turning it into a prediction.',
    retryFeedback: 'Can a past path tell you the future for certain?'
  }
};

const EXP_05: Experience = {
  id: 'EXP-05',
  title: 'How market orders work',
  short: 'Executing now at the best available price.',
  objective: 'Understand that a market order executes against the best available prices at that moment, which can differ from the last displayed price.',
  context: 'You’ll look at an invented list of sellers (the “ask” side of an order book) for a made-up share. The last traded price shown is ₹100.00.',
  outcome: 'You can explain what a market order does, why the price you get may differ from the displayed price, and how quantity affects that.',
  minutes: 5,
  dimensions: ['tradingMechanics'],
  lab: 'market-order-book',
  labPrompt: 'Pick a quantity for a hypothetical market buy order and watch it fill against the sellers in the order book. Compare your average price with the ₹100.00 last traded price.',
  prerequisites: [],
  sourceIds: ['order-mechanics'],
  checks: [
    {
      id: 'what-price',
      kind: 'choice',
      concept: 'Market order execution price',
      prompt: 'The last traded price shows ₹100.00. You place a market buy order. What price do you get?',
      dimension: 'tradingMechanics',
      misconceptionIds: ['market-order-price-guarantee', 'displayed-price-is-live-truth'],
      options: [
        { id: 'best-available', label: 'The best available seller prices at that moment — which may differ from ₹100.00' },
        { id: 'exactly-100', label: 'Exactly ₹100.00, because that’s the price on screen' },
        { id: 'choose', label: 'Whatever price I type in' }
      ],
      correctOptionId: 'best-available',
      optionFeedback: {
        'best-available': 'Yes — a market order takes the best available prices, which can move between what you see and when it executes.',
        'exactly-100': 'The displayed price is usually the last trade. A market order matches against current sellers, whose prices may differ.',
        choose: 'Setting your own price is what a limit order does. A market order accepts the best available price.'
      },
      optionMisconception: { 'exactly-100': 'market-order-price-guarantee', choose: 'limit-same-as-market' },
      successFeedback: 'Right — market orders prioritise executing now, not a specific price.',
      retryFeedback: 'Think about who you are buying from.'
    },
    {
      id: 'quantity-slider',
      kind: 'slider',
      concept: 'Quantity and price impact',
      prompt: 'In this invented book, sellers offer 50 shares at ₹100.00, 100 at ₹100.50 and 200 at ₹101.00. Set the largest quantity that would fill entirely at ₹100.00.',
      help: 'Any quantity up to what the first seller offers stays at one price.',
      dimension: 'tradingMechanics',
      misconceptionIds: ['market-order-price-guarantee'],
      min: 0,
      max: 300,
      step: 10,
      start: 150,
      unit: 'shares',
      accept: { min: 50, max: 50 },
      successFeedback: 'Exactly — beyond 50 shares, the order walks up to the next seller’s higher price.',
      retryFeedback: 'Only 50 shares are offered at ₹100.00. Anything more fills at higher prices.'
    }
  ],
  alternatives: {
    'what-price': {
      explanation: 'Think of a vegetable market. The board says tomatoes last sold for ₹40/kg. If you say “I’ll take whatever the cheapest seller is asking right now”, you pay what that seller asks — maybe ₹40, maybe ₹42. The board shows the last sale, not a promise.',
      check: {
        id: 'what-price-alt',
        kind: 'choice',
        concept: 'Market order execution price',
        prompt: 'An invented share last traded at ₹250.00. The lowest seller is now asking ₹250.40. You place a market buy for a small quantity. What’s most likely?',
        dimension: 'tradingMechanics',
        misconceptionIds: ['market-order-price-guarantee'],
        options: [
          { id: 'ask', label: 'It executes around ₹250.40 — the best available seller price' },
          { id: 'last', label: 'It executes at ₹250.00 because that was the last price' },
          { id: 'waits', label: 'It waits until the price comes back to ₹250.00' }
        ],
        correctOptionId: 'ask',
        optionFeedback: {
          ask: 'Yes — you buy from the best available seller.',
          last: 'The last trade price isn’t a promise; sellers now ask ₹250.40.',
          waits: 'Waiting for a price is what a limit order does.'
        },
        optionMisconception: { last: 'market-order-price-guarantee', waits: 'limit-same-as-market' },
        successFeedback: 'Correct — the best available seller sets the price.',
        retryFeedback: 'The board shows the last sale. Who are you buying from now?'
      }
    },
    'quantity-slider': {
      explanation: 'Imagine buying mangoes: one seller has 5 kg at ₹100/kg, the next has 10 kg at ₹105/kg. If you want 8 kg right now, you buy all 5 kg from the first, then 3 kg from the second — so your average price rises. Big market orders work like that.',
      check: {
        id: 'quantity-slider-alt',
        kind: 'choice',
        concept: 'Quantity and price impact',
        prompt: 'Sellers offer 20 shares at ₹50.00 and 80 at ₹50.50 (invented). You place a market buy for 60 shares. What happens?',
        dimension: 'tradingMechanics',
        misconceptionIds: ['market-order-price-guarantee'],
        options: [
          { id: 'split', label: '20 fill at ₹50.00 and 40 at ₹50.50, so the average is above ₹50.00' },
          { id: 'all-50', label: 'All 60 fill at ₹50.00' },
          { id: 'none', label: 'Nothing fills because there aren’t 60 at one price' }
        ],
        correctOptionId: 'split',
        optionFeedback: {
          split: 'Yes — the order walks up the book and the average price rises.',
          'all-50': 'Only 20 are offered at ₹50.00; the rest must come from the next seller.',
          none: 'A market order fills across several price levels if needed.'
        },
        optionMisconception: { 'all-50': 'market-order-price-guarantee' },
        successFeedback: 'Correct — quantity can move your average price.',
        retryFeedback: 'Use up the first seller, then move to the next.'
      }
    }
  },
  transfer: {
    id: 'transfer-fast-market',
    kind: 'choice',
    concept: 'Market orders in fast markets',
    prompt: 'Prices of an invented share are jumping around quickly. What is the main trade-off if you use a market order?',
    dimension: 'tradingMechanics',
    misconceptionIds: ['market-order-price-guarantee', 'limit-same-as-market'],
    options: [
      { id: 'tradeoff', label: 'It usually executes quickly, but the price you get is less certain' },
      { id: 'protects', label: 'It protects me from price changes by locking in the screen price' },
      { id: 'same', label: 'There’s no trade-off — market and limit orders behave the same' }
    ],
    correctOptionId: 'tradeoff',
    optionFeedback: {
      tradeoff: 'Exactly — speed of execution in exchange for price certainty.',
      protects: 'A market order doesn’t lock in the displayed price; in fast markets the difference can be larger.',
      same: 'A limit order controls price but may not execute; a market order executes but doesn’t control price.'
    },
    optionMisconception: { protects: 'market-order-price-guarantee', same: 'limit-same-as-market' },
    successFeedback: 'You applied the idea to a new situation.',
    retryFeedback: 'What does a market order prioritise — speed or price?'
  }
};

const EXP_06: Experience = {
  id: 'EXP-06',
  title: 'How limit orders work',
  short: 'Setting your price — and accepting it may not execute.',
  objective: 'Understand that a limit buy order executes only at your limit price or lower, and may not execute at all.',
  context: 'An invented share last traded at ₹100.00. You’ll set a hypothetical limit buy price and run a simulated trading session. Nothing is sent to any broker or exchange.',
  outcome: 'You can explain what a limit price does, predict when a limit order executes or stays pending, and compare it with a market order.',
  minutes: 5,
  dimensions: ['tradingMechanics'],
  lab: 'limit-order-sim',
  labPrompt: 'Set a limit buy price with the slider, then press “Run simulated session”. Try a price well below ₹100 and one close to it, and see when the order executes or stays pending.',
  prerequisites: ['EXP-05'],
  sourceIds: ['order-mechanics'],
  checks: [
    {
      id: 'limit-meaning',
      kind: 'choice',
      concept: 'Limit price condition',
      prompt: 'You place a limit buy order at ₹98.00 while the price is ₹100.00. What does that instruction mean?',
      dimension: 'tradingMechanics',
      misconceptionIds: ['limit-guarantees-execution', 'limit-same-as-market'],
      options: [
        { id: 'at-or-below', label: 'Buy only at ₹98.00 or lower — if the price never gets there, it doesn’t execute' },
        { id: 'guaranteed', label: 'It is guaranteed to buy at ₹98.00 sometime today' },
        { id: 'now', label: 'Buy right now at ₹100.00, like a market order' }
      ],
      correctOptionId: 'at-or-below',
      optionFeedback: {
        'at-or-below': 'Yes — a limit sets the worst price you’ll accept, with no promise of execution.',
        guaranteed: 'A limit order only executes if sellers are willing to trade at ₹98.00 or lower. That may never happen.',
        now: 'Buying now at the best available price is a market order. A limit order waits for your price.'
      },
      optionMisconception: { guaranteed: 'limit-guarantees-execution', now: 'limit-same-as-market' },
      successFeedback: 'Exactly — price control, no execution guarantee.',
      retryFeedback: 'A limit is a condition, not a promise.'
    },
    {
      id: 'limit-slider',
      kind: 'slider',
      concept: 'When a limit order executes',
      prompt: 'In an invented session the price started at ₹100.00 and its lowest trade was ₹97.50. Set a limit buy price that WOULD have executed during this session.',
      help: 'A limit buy executes if the price reaches your limit or goes below it.',
      dimension: 'tradingMechanics',
      misconceptionIds: ['limit-guarantees-execution'],
      min: 94,
      max: 104,
      step: 0.5,
      start: 95,
      unit: '₹',
      accept: { min: 97.5, max: 104 },
      successFeedback: 'Correct — the price traded at or below your limit, so it could execute.',
      retryFeedback: 'The price never went below ₹97.50, so a lower limit would have stayed pending.'
    },
    {
      id: 'explain-limit',
      kind: 'explain',
      concept: 'Limit vs market order',
      prompt: 'In your own words, what is the difference between a limit order and a market order?',
      dimension: 'tradingMechanics',
      misconceptionIds: ['limit-guarantees-execution', 'limit-same-as-market', 'market-order-price-guarantee'],
      minLength: 30,
      requiredConcepts: [
        ['limit'],
        ['price', 'rate', '₹', 'amount', 'cost'],
        ['market', 'now', 'immediate', 'instant', 'right away', 'current', 'best available', 'quick']
      ],
      modelAnswer: 'A market order buys now at the best available price, whatever it is. A limit order sets the maximum price you’ll pay, so it only executes if the price reaches your limit — it might not execute at all.',
      successFeedback: 'You explained both sides of the trade-off.',
      retryFeedback: 'Mention what a limit order controls (the price) and what a market order prioritises (executing now).'
    }
  ],
  alternatives: {
    'limit-meaning': {
      explanation: 'Think of telling a friend at a market: “Buy me tomatoes, but only if they’re ₹38/kg or less.” If no seller goes that low, your friend comes back empty-handed. That’s a limit order — you control the price, not whether it happens.',
      check: {
        id: 'limit-meaning-alt',
        kind: 'choice',
        concept: 'Limit price condition',
        prompt: 'An invented share is at ₹500. You place a limit buy at ₹480. The price moves between ₹490 and ₹510 all day. What happens?',
        dimension: 'tradingMechanics',
        misconceptionIds: ['limit-guarantees-execution'],
        options: [
          { id: 'pending', label: 'The order doesn’t execute — the price never reached ₹480' },
          { id: 'executes', label: 'It executes at ₹480 anyway because limit orders always go through' },
          { id: 'at-490', label: 'It executes at ₹490, the closest price' }
        ],
        correctOptionId: 'pending',
        optionFeedback: {
          pending: 'Right — no seller came down to ₹480, so it stays pending.',
          executes: 'Limit orders only execute when the condition is met.',
          'at-490': '₹490 is above your limit, so a limit buy at ₹480 won’t accept it.'
        },
        optionMisconception: { executes: 'limit-guarantees-execution' },
        successFeedback: 'Correct — the condition was never met.',
        retryFeedback: 'Did the price ever reach ₹480?'
      }
    },
    'limit-slider': {
      explanation: 'A limit buy is like a price ceiling. Draw a line at your limit. If the price line ever touches or dips below it, the order can execute. If the price always stays above your line, nothing happens.',
      check: {
        id: 'limit-slider-alt',
        kind: 'choice',
        concept: 'When a limit order executes',
        prompt: 'An invented session’s lowest price was ₹205. Which limit buy could have executed?',
        dimension: 'tradingMechanics',
        misconceptionIds: ['limit-guarantees-execution'],
        options: [
          { id: 'at-206', label: 'A limit buy at ₹206' },
          { id: 'at-200', label: 'A limit buy at ₹200' },
          { id: 'at-203', label: 'A limit buy at ₹203' }
        ],
        correctOptionId: 'at-206',
        optionFeedback: {
          'at-206': 'Yes — the price went to ₹205, which is at or below ₹206.',
          'at-200': 'The price never fell to ₹200, so this would stay pending.',
          'at-203': 'The lowest trade was ₹205, so ₹203 was never reached.'
        },
        optionMisconception: { 'at-200': 'limit-guarantees-execution', 'at-203': 'limit-guarantees-execution' },
        successFeedback: 'Correct — the price line touched your ceiling.',
        retryFeedback: 'The limit must be at or above the lowest price reached.'
      }
    },
    'explain-limit': {
      explanation: 'A shortcut: market order = “now, at whatever the best price is”; limit order = “only at my price or better, even if that means waiting or never executing”.',
      check: {
        id: 'explain-limit-alt',
        kind: 'explain',
        concept: 'Limit vs market order',
        prompt: 'Complete in your own words: “I’d use a limit order instead of a market order when I care more about…”',
        dimension: 'tradingMechanics',
        misconceptionIds: ['limit-guarantees-execution', 'limit-same-as-market'],
        minLength: 20,
        requiredConcepts: [['price', 'rate', 'cost', 'how much', 'pay']],
        modelAnswer: '…the price I pay than about executing immediately — accepting that the order may not execute.',
        successFeedback: 'Yes — limit orders trade certainty of execution for control of price.',
        retryFeedback: 'Mention the price.'
      }
    }
  },
  transfer: {
    id: 'transfer-limit-sell',
    kind: 'choice',
    concept: 'Limit sell orders',
    prompt: 'New situation: you hold an invented share at ₹100 and place a limit SELL at ₹110. When can it execute?',
    dimension: 'tradingMechanics',
    misconceptionIds: ['limit-guarantees-execution'],
    options: [
      { id: 'at-or-above', label: 'Only if a buyer pays ₹110 or more' },
      { id: 'at-or-below', label: 'Whenever the price is ₹110 or less' },
      { id: 'always', label: 'Immediately — limit orders always execute' }
    ],
    correctOptionId: 'at-or-above',
    optionFeedback: {
      'at-or-above': 'Correct — for a sell, the limit is the lowest price you’ll accept.',
      'at-or-below': 'That’s reversed. A sell limit sets a floor: ₹110 or better (higher).',
      always: 'If no buyer offers ₹110 or more, it won’t execute.'
    },
    optionMisconception: { always: 'limit-guarantees-execution' },
    successFeedback: 'You applied the limit idea to selling.',
    retryFeedback: 'For selling, “better” means higher.'
  }
};

const EXP_07: Experience = {
  id: 'EXP-07',
  title: 'Why orders don’t execute',
  short: 'Bids, asks, spread, liquidity and partial fills.',
  objective: 'Understand bid and ask prices, the spread, and why limited liquidity can leave an order unfilled or partly filled.',
  context: 'You’ll explore an invented order book showing buyers (bids) and sellers (asks) for a made-up share, in a busy market and a thin one.',
  outcome: 'You can read a simple order book, explain the bid–ask spread, and predict full, partial or no fills.',
  minutes: 6,
  dimensions: ['tradingMechanics'],
  lab: 'order-depth',
  labPrompt: 'Toggle between a busy (liquid) and a thin order book. Place a hypothetical limit buy with a price and quantity, and see whether it fills fully, partly or not at all. Notice the spread between the best bid and best ask.',
  prerequisites: ['EXP-05'],
  sourceIds: ['order-mechanics'],
  checks: [
    {
      id: 'bid-ask',
      kind: 'choice',
      concept: 'Bid, ask and spread',
      prompt: 'In an invented book, the best bid is ₹99.50 and the best ask is ₹100.00. You place a limit buy at ₹99.00. Why doesn’t it execute?',
      dimension: 'tradingMechanics',
      misconceptionIds: ['limit-guarantees-execution', 'displayed-price-is-live-truth'],
      options: [
        { id: 'no-seller', label: 'No seller is willing to sell at ₹99.00 — the lowest ask is ₹100.00' },
        { id: 'broken', label: 'Something is broken; limit orders should always execute' },
        { id: 'bid', label: 'Because ₹99.50 is the price shown, so anything else is rejected' }
      ],
      correctOptionId: 'no-seller',
      optionFeedback: {
        'no-seller': 'Exactly — your bid sits in the book until a seller comes down to it.',
        broken: 'Nothing is broken; an order needs someone on the other side at an acceptable price.',
        bid: 'Your order isn’t rejected — it waits in the book alongside other bids.'
      },
      optionMisconception: { broken: 'limit-guarantees-execution', bid: 'displayed-price-is-live-truth' },
      successFeedback: 'Right — the gap between best bid and best ask is the spread.',
      retryFeedback: 'Who would you be buying from, and at what price are they selling?'
    },
    {
      id: 'sort-fills',
      kind: 'sort',
      concept: 'Full, partial or no fill',
      prompt: 'Sellers in an invented thin book offer only 30 shares at ₹100.00 and nothing below. Sort each limit buy by its likely outcome right now.',
      dimension: 'tradingMechanics',
      misconceptionIds: ['orders-always-fill', 'limit-guarantees-execution'],
      buckets: [
        { id: 'full', label: 'Fills fully' },
        { id: 'partial', label: 'Fills partly' },
        { id: 'none', label: 'Doesn’t fill' }
      ],
      items: [
        { id: 'q20', label: 'Buy 20 at ₹100.00', bucketId: 'full' },
        { id: 'q80', label: 'Buy 80 at ₹100.00', bucketId: 'partial' },
        { id: 'q10-low', label: 'Buy 10 at ₹99.00', bucketId: 'none' },
        { id: 'q30', label: 'Buy 30 at ₹100.00', bucketId: 'full' }
      ],
      successFeedback: 'Sorted correctly — quantity and price both matter.',
      retryFeedback: 'Check the price first (is anyone selling at that price?), then the quantity (are there enough shares?).'
    }
  ],
  alternatives: {
    'bid-ask': {
      explanation: 'Think of a second-hand bike market. Buyers shout what they’ll pay (bids); sellers shout what they want (asks). A sale only happens when a buyer and seller agree. If you offer less than any seller wants, you wait.',
      check: {
        id: 'bid-ask-alt',
        kind: 'choice',
        concept: 'Bid, ask and spread',
        prompt: 'Invented book: best bid ₹49.80, best ask ₹50.20. What is the spread, and what does it represent?',
        dimension: 'tradingMechanics',
        misconceptionIds: ['displayed-price-is-live-truth'],
        options: [
          { id: 'forty-paise', label: '₹0.40 — the gap between the highest buyer and the lowest seller' },
          { id: 'fee', label: '₹0.40 — a fee the broker charges' },
          { id: 'zero', label: 'Zero, because there is only one price for a share' }
        ],
        correctOptionId: 'forty-paise',
        optionFeedback: {
          'forty-paise': 'Yes — the spread is the gap between best bid and best ask.',
          fee: 'The spread isn’t a broker fee; it’s the gap between buyers’ and sellers’ prices.',
          zero: 'At any moment there are different bid and ask prices, not one single price.'
        },
        optionMisconception: { zero: 'displayed-price-is-live-truth' },
        successFeedback: 'Correct.',
        retryFeedback: 'Subtract the best bid from the best ask.'
      }
    },
    'sort-fills': {
      explanation: 'If a shop has only 3 packets of biscuits on the shelf and you want 5, you leave with 3 — a partial fill. If the shop only sells them at ₹30 and you will pay only ₹25, you leave with none.',
      check: {
        id: 'sort-fills-alt',
        kind: 'choice',
        concept: 'Full, partial or no fill',
        prompt: 'An invented thin book has 15 shares offered at ₹200.00 and nothing else nearby. You place a limit buy for 40 at ₹200.00. What’s most likely right now?',
        dimension: 'tradingMechanics',
        misconceptionIds: ['orders-always-fill'],
        options: [
          { id: 'partial', label: '15 fill; the other 25 stay pending' },
          { id: 'full', label: 'All 40 fill at ₹200.00' },
          { id: 'cancel', label: 'The whole order is cancelled automatically' }
        ],
        correctOptionId: 'partial',
        optionFeedback: {
          partial: 'Yes — that’s a partial fill.',
          full: 'Only 15 are available at that price, so the full 40 can’t fill now.',
          cancel: 'The unfilled part usually stays open (subject to the order’s validity) rather than being cancelled immediately.'
        },
        optionMisconception: { full: 'orders-always-fill' },
        successFeedback: 'Correct — limited liquidity means a partial fill.',
        retryFeedback: 'How many shares are actually on the shelf?'
      }
    }
  },
  transfer: {
    id: 'transfer-explain-unfilled',
    kind: 'explain',
    concept: 'Explaining unfilled orders',
    prompt: 'A friend says, “My buy order has been pending for an hour — the app must be broken.” Explain one likely reason in your own words.',
    dimension: 'tradingMechanics',
    misconceptionIds: ['limit-guarantees-execution', 'orders-always-fill'],
    minLength: 25,
    requiredConcepts: [
      ['seller', 'sell', 'no one', 'nobody', 'liquid', 'ask', 'other side', 'counterpart', 'buyer', 'match', 'reach', 'never got', 'not reached', 'too low', 'below', 'limit']
    ],
    modelAnswer: 'Their limit price may be below what any seller is asking, or there may not be enough sellers (low liquidity), so the order waits until the price reaches their limit.',
    successFeedback: 'That’s a clear, calm explanation.',
    retryFeedback: 'Mention the price not being reached or not enough sellers.'
  }
};

const EXP_08: Experience = {
  id: 'EXP-08',
  title: 'Finding your way in a brokerage app',
  short: 'Watchlist, Orders, Holdings and Funds explained.',
  objective: 'Understand what the main sections of a typical brokerage app show and how they relate to each other.',
  context: 'You’ll explore a generic, invented brokerage app. It isn’t any real broker’s design, and the companies and numbers are made up.',
  outcome: 'You can say where to look to follow a company, check an order, see what you own, and see money available.',
  minutes: 5,
  dimensions: ['platform'],
  lab: 'broker-app-tour',
  labPrompt: 'Tap through the Watchlist, Orders, Holdings and Funds tabs in the mock app. Tap the highlighted spots to learn what each part means.',
  prerequisites: [],
  sourceIds: ['brokerage-flow', 'market-entry'],
  checks: [
    {
      id: 'sort-sections',
      kind: 'sort',
      concept: 'App sections',
      prompt: 'Sort each item into the app section where you would normally find it.',
      dimension: 'platform',
      misconceptionIds: ['watchlist-is-owning', 'funds-is-holdings', 'order-is-holding'],
      buckets: [
        { id: 'watchlist', label: 'Watchlist' },
        { id: 'orders', label: 'Orders' },
        { id: 'holdings', label: 'Holdings' },
        { id: 'funds', label: 'Funds' }
      ],
      items: [
        { id: 'following', label: 'Companies you’re following but don’t own', bucketId: 'watchlist' },
        { id: 'pending', label: 'A buy instruction that hasn’t executed yet', bucketId: 'orders' },
        { id: 'owned', label: 'Shares you already own and their current value', bucketId: 'holdings' },
        { id: 'cash', label: 'Money available to place new orders', bucketId: 'funds' }
      ],
      successFeedback: 'All in the right place — you can find your way around.',
      retryFeedback: 'Ask: is it something I follow, an instruction, something I own, or money?'
    },
    {
      id: 'watchlist-meaning',
      kind: 'choice',
      concept: 'Watchlist vs ownership',
      prompt: 'You add an invented Company D to your watchlist. What have you done?',
      dimension: 'platform',
      misconceptionIds: ['watchlist-is-owning'],
      options: [
        { id: 'follow', label: 'Started following its price — nothing has been bought' },
        { id: 'bought', label: 'Bought some of its shares' },
        { id: 'order', label: 'Placed an order that will execute later' }
      ],
      correctOptionId: 'follow',
      optionFeedback: {
        follow: 'Right — a watchlist is just a list you keep an eye on.',
        bought: 'Adding to a watchlist doesn’t buy anything. Buying needs an order that executes.',
        order: 'A watchlist entry isn’t an order. Orders appear in the Orders section.'
      },
      optionMisconception: { bought: 'watchlist-is-owning', order: 'watchlist-is-owning' },
      successFeedback: 'Exactly — following isn’t owning.',
      retryFeedback: 'Is a watchlist an instruction to buy?'
    }
  ],
  alternatives: {
    'sort-sections': {
      explanation: 'Think of a shopping app: your Wishlist is things you like (Watchlist), My Orders tracks what you asked for (Orders), your cupboard is what actually arrived (Holdings), and your wallet balance is money you can still spend (Funds).',
      check: {
        id: 'sort-sections-alt',
        kind: 'choice',
        concept: 'App sections',
        prompt: 'You want to check whether a buy order you placed this morning has executed. Where would you look first?',
        dimension: 'platform',
        misconceptionIds: ['order-is-holding', 'funds-is-holdings'],
        options: [
          { id: 'orders', label: 'Orders — it shows the status of each instruction' },
          { id: 'watchlist', label: 'Watchlist' },
          { id: 'funds', label: 'Funds — the balance tells me what I own' }
        ],
        correctOptionId: 'orders',
        optionFeedback: {
          orders: 'Yes — Orders shows open, executed, cancelled or rejected instructions.',
          watchlist: 'The watchlist only shows things you’re following.',
          funds: 'Funds shows money available, not what you own or order status.'
        },
        optionMisconception: { funds: 'funds-is-holdings' },
        successFeedback: 'Correct — “My Orders” is where you track instructions.',
        retryFeedback: 'Where does a shopping app show what you’ve ordered?'
      }
    },
    'watchlist-meaning': {
      explanation: 'A watchlist is like saving a product to your wishlist on a shopping app. You can see its price change, but it’s not in your cupboard until you order it and the order goes through.',
      check: {
        id: 'watchlist-meaning-alt',
        kind: 'choice',
        concept: 'Watchlist vs ownership',
        prompt: 'Your watchlist shows an invented Company E up 4% today. How does that affect you?',
        dimension: 'platform',
        misconceptionIds: ['watchlist-is-owning'],
        options: [
          { id: 'no-effect', label: 'It doesn’t change my money — I’m only following it' },
          { id: 'gain', label: 'I gained 4% because it’s on my watchlist' }
        ],
        correctOptionId: 'no-effect',
        optionFeedback: {
          'no-effect': 'Right — you only gain or lose on things you actually hold.',
          gain: 'Watchlist items aren’t owned, so their moves don’t change your money.'
        },
        optionMisconception: { gain: 'watchlist-is-owning' },
        successFeedback: 'Correct.',
        retryFeedback: 'Do you own things on your wishlist?'
      }
    }
  },
  transfer: {
    id: 'transfer-funds',
    kind: 'choice',
    concept: 'Funds vs holdings',
    prompt: 'In the mock app, Funds shows ₹2,000 available and Holdings shows shares worth ₹8,000 (invented). What does the ₹2,000 represent?',
    dimension: 'platform',
    misconceptionIds: ['funds-is-holdings'],
    options: [
      { id: 'cash', label: 'Money available to place new orders — separate from the ₹8,000 of shares I hold' },
      { id: 'value', label: 'The total value of my investments' },
      { id: 'profit', label: 'My profit so far' }
    ],
    correctOptionId: 'cash',
    optionFeedback: {
      cash: 'Exactly — Funds is spending money; Holdings is what you own.',
      value: 'The value of what you own is shown in Holdings, not Funds.',
      profit: 'Funds isn’t profit; it’s money available to use for orders.'
    },
    optionMisconception: { value: 'funds-is-holdings' },
    successFeedback: 'You applied the sections to a new screen.',
    retryFeedback: 'Wallet balance or cupboard?'
  }
};

const EXP_09: Experience = {
  id: 'EXP-09',
  title: 'Understanding charges',
  short: 'What a contract note shows, and where to verify costs.',
  objective: 'Recognise the common types of charges on a share trade in India, who levies each, and where to verify the amounts that apply to you.',
  context: 'You’ll explore an invented contract note — the document a broker issues after a trade. We deliberately show no amounts: rates change and differ by broker and segment.',
  outcome: 'You can name the main charge types, separate broker charges from statutory and exchange charges, and know where to check current amounts.',
  minutes: 4,
  dimensions: ['platform', 'decisions'],
  lab: 'charges-explorer',
  labPrompt: 'Tap each row of the mock contract note to learn what that charge is and who levies it. Then check where the real amounts are published.',
  prerequisites: [],
  sourceIds: ['costs', 'regulated-education'],
  checks: [
    {
      id: 'sort-charges',
      kind: 'sort',
      concept: 'Who levies each charge',
      prompt: 'Sort each charge by who sets or levies it.',
      dimension: 'platform',
      misconceptionIds: ['charges-only-brokerage'],
      buckets: [
        { id: 'broker', label: 'Your broker / depository participant' },
        { id: 'statutory', label: 'Government or regulator' },
        { id: 'exchange', label: 'Stock exchange' }
      ],
      items: [
        { id: 'brokerage', label: 'Brokerage', bucketId: 'broker' },
        { id: 'dp', label: 'DP charges', bucketId: 'broker' },
        { id: 'stt', label: 'Securities Transaction Tax (STT)', bucketId: 'statutory' },
        { id: 'stamp', label: 'Stamp duty', bucketId: 'statutory' },
        { id: 'gst', label: 'GST', bucketId: 'statutory' },
        { id: 'sebi', label: 'SEBI turnover fee', bucketId: 'statutory' },
        { id: 'exch', label: 'Exchange transaction charges', bucketId: 'exchange' }
      ],
      successFeedback: 'All sorted — brokerage is only one part of trading costs.',
      retryFeedback: 'Taxes and regulator fees come from the government or SEBI; exchange charges from the exchange; brokerage and DP charges from your broker/DP.'
    },
    {
      id: 'where-verify',
      kind: 'choice',
      concept: 'Verifying charges',
      prompt: 'Where should you check the actual charges that apply to your trades?',
      dimension: 'decisions',
      misconceptionIds: ['charges-only-brokerage'],
      options: [
        { id: 'official', label: 'The broker’s official pricing page and the contract note issued after each trade' },
        { id: 'chat', label: 'A number someone mentioned in a chat group' },
        { id: 'none', label: 'Nowhere — trades have no charges' }
      ],
      correctOptionId: 'official',
      optionFeedback: {
        official: 'Yes — those are the authoritative sources, and the contract note shows what was actually charged.',
        chat: 'Figures in chats can be outdated or wrong. Use official pages and your contract note.',
        none: 'Trades usually carry several charges, even when brokerage is low or zero.'
      },
      optionMisconception: { none: 'charges-only-brokerage' },
      successFeedback: 'Right — always verify with official sources.',
      retryFeedback: 'Which source is official and specific to your trade?'
    }
  ],
  alternatives: {
    'sort-charges': {
      explanation: 'Think of a restaurant bill. The menu price is set by the restaurant (like brokerage), but taxes on the bill are set by the government (like STT, stamp duty and GST). A trade’s costs work the same way: some come from your broker, some are statutory, and some come from the exchange.',
      check: {
        id: 'sort-charges-alt',
        kind: 'choice',
        concept: 'Who levies each charge',
        prompt: 'Which of these is a statutory (government) levy rather than a broker’s fee?',
        dimension: 'platform',
        misconceptionIds: ['charges-only-brokerage'],
        options: [
          { id: 'stt', label: 'Securities Transaction Tax (STT)' },
          { id: 'brokerage', label: 'Brokerage' },
          { id: 'dp', label: 'DP charges' }
        ],
        correctOptionId: 'stt',
        optionFeedback: {
          stt: 'Yes — STT is a tax levied by the government on securities transactions.',
          brokerage: 'Brokerage is the broker’s own fee.',
          dp: 'DP charges are levied by your depository participant (often your broker) when securities are debited from your demat account.'
        },
        optionMisconception: {},
        successFeedback: 'Correct — taxes are on the bill whatever the menu price.',
        retryFeedback: 'Look for the tax.'
      }
    },
    'where-verify': {
      explanation: 'Charges are like train fares: they change and depend on the route and class. You wouldn’t trust last year’s screenshot — you’d check the official site and your ticket. For trades, that means the broker’s official pricing page and your contract note.',
      check: {
        id: 'where-verify-alt',
        kind: 'choice',
        concept: 'Verifying charges',
        prompt: 'After a trade, which document shows exactly what you were charged?',
        dimension: 'decisions',
        misconceptionIds: ['charges-only-brokerage'],
        options: [
          { id: 'contract-note', label: 'The contract note from the broker' },
          { id: 'watchlist', label: 'The watchlist' },
          { id: 'ad', label: 'An advertisement for the app' }
        ],
        correctOptionId: 'contract-note',
        optionFeedback: {
          'contract-note': 'Yes — it itemises the trade and the charges applied.',
          watchlist: 'The watchlist only tracks prices you follow.',
          ad: 'Ads aren’t a record of your trade’s charges.'
        },
        optionMisconception: {},
        successFeedback: 'Correct.',
        retryFeedback: 'Which document is your trade’s “ticket”?'
      }
    }
  },
  transfer: {
    id: 'transfer-zero-brokerage',
    kind: 'choice',
    concept: 'Zero brokerage, other charges',
    prompt: 'An invented app advertises “zero brokerage” on delivery trades. Does that mean a delivery trade costs nothing?',
    dimension: 'decisions',
    misconceptionIds: ['charges-only-brokerage'],
    options: [
      { id: 'still-charges', label: 'Not necessarily — statutory and exchange charges (and DP charges on sells) can still apply' },
      { id: 'free', label: 'Yes — zero brokerage means the trade is completely free' }
    ],
    correctOptionId: 'still-charges',
    optionFeedback: {
      'still-charges': 'Exactly — check the contract note and the official pricing page.',
      free: 'Brokerage is only one charge. Taxes, exchange charges and DP charges can still apply.'
    },
    optionMisconception: { free: 'charges-only-brokerage' },
    successFeedback: 'You applied it to a real-world claim.',
    retryFeedback: 'Is brokerage the only line on the contract note?'
  }
};

const EXP_10: Experience = {
  id: 'EXP-10',
  title: 'Orders vs holdings',
  short: 'From an instruction to something you actually own.',
  objective: 'Understand the difference between an order (an instruction) and a holding (securities you own after execution and settlement).',
  context: 'You’ll step through the life of an invented buy order in a generic app, including a path where the price never reaches the limit.',
  outcome: 'You can trace an order from placed to executed to holdings, and explain why an open or cancelled order isn’t something you own.',
  minutes: 4,
  dimensions: ['platform', 'tradingMechanics'],
  lab: 'order-lifecycle',
  labPrompt: 'Step through the order’s life: placed → open → executed → holdings. Then switch to “Price never reaches it” and see where the order ends up instead.',
  prerequisites: ['EXP-05'],
  sourceIds: ['brokerage-flow', 'order-mechanics'],
  checks: [
    {
      id: 'pending-where',
      kind: 'choice',
      concept: 'Open orders vs holdings',
      prompt: 'You placed a limit buy at ₹95 for an invented share. The price stayed at ₹100 all day. Where does this show up?',
      dimension: 'platform',
      misconceptionIds: ['order-is-holding', 'limit-guarantees-execution'],
      options: [
        { id: 'orders', label: 'In Orders, as open/pending — not in Holdings' },
        { id: 'holdings', label: 'In Holdings, because I placed the order' },
        { id: 'both', label: 'In both Orders and Holdings' }
      ],
      correctOptionId: 'orders',
      optionFeedback: {
        orders: 'Right — it’s still just an instruction waiting for its price.',
        holdings: 'Placing an order isn’t owning. Nothing executed, so nothing reaches Holdings.',
        both: 'Holdings only shows what you actually own after execution and settlement.'
      },
      optionMisconception: { holdings: 'order-is-holding', both: 'order-is-holding' },
      successFeedback: 'Exactly — an order is an instruction, not ownership.',
      retryFeedback: 'Did the order execute?'
    },
    {
      id: 'sort-lifecycle',
      kind: 'sort',
      concept: 'Order statuses',
      prompt: 'Sort each situation by whether you own the shares yet.',
      dimension: 'platform',
      misconceptionIds: ['order-is-holding'],
      buckets: [
        { id: 'not-owned', label: 'Not owned (only an order)' },
        { id: 'owned', label: 'Owned (appears in Holdings after settlement)' }
      ],
      items: [
        { id: 'open', label: 'Order is open, waiting for its limit price', bucketId: 'not-owned' },
        { id: 'cancelled', label: 'Order was cancelled before executing', bucketId: 'not-owned' },
        { id: 'rejected', label: 'Order was rejected (e.g. not enough funds)', bucketId: 'not-owned' },
        { id: 'executed', label: 'Buy order executed and settled', bucketId: 'owned' }
      ],
      successFeedback: 'All sorted — only executed (and settled) buys become holdings.',
      retryFeedback: 'Only an executed buy leads to shares you own.'
    }
  ],
  alternatives: {
    'pending-where': {
      explanation: 'Ordering food online: while it says “Order placed” or “Preparing”, the food isn’t on your table yet. Only when it’s delivered do you have it. Orders are the tracking screen; Holdings is your table.',
      check: {
        id: 'pending-where-alt',
        kind: 'choice',
        concept: 'Open orders vs holdings',
        prompt: 'Your Orders tab shows an invented buy order as “Open”. Do you own those shares?',
        dimension: 'platform',
        misconceptionIds: ['order-is-holding'],
        options: [
          { id: 'no', label: 'No — it hasn’t executed yet' },
          { id: 'yes', label: 'Yes — once I place an order, the shares are mine' }
        ],
        correctOptionId: 'no',
        optionFeedback: {
          no: 'Right — “Open” means waiting, like food still being prepared.',
          yes: 'An open order is only an instruction. Ownership needs execution and settlement.'
        },
        optionMisconception: { yes: 'order-is-holding' },
        successFeedback: 'Correct.',
        retryFeedback: 'Is the food on your table yet?'
      }
    },
    'sort-lifecycle': {
      explanation: 'Every order ends one of a few ways: it executes, or it’s cancelled, rejected or expires. Only the “executes” path (for a buy) leads to shares in Holdings — and for delivery trades in India, they show up after settlement (currently T+1, the next trading day).',
      check: {
        id: 'sort-lifecycle-alt',
        kind: 'choice',
        concept: 'Order statuses',
        prompt: 'Which of these leads to new shares in your Holdings?',
        dimension: 'platform',
        misconceptionIds: ['order-is-holding'],
        options: [
          { id: 'executed', label: 'A buy order that executed and settled' },
          { id: 'expired', label: 'A limit buy that expired at the end of the day' },
          { id: 'cancelled', label: 'A buy order I cancelled' }
        ],
        correctOptionId: 'executed',
        optionFeedback: {
          executed: 'Yes — execution plus settlement is what creates a holding.',
          expired: 'An expired order never executed, so nothing was bought.',
          cancelled: 'A cancelled order never executed, so nothing was bought.'
        },
        optionMisconception: { expired: 'order-is-holding', cancelled: 'order-is-holding' },
        successFeedback: 'Correct.',
        retryFeedback: 'Which path actually completes the purchase?'
      }
    }
  },
  transfer: {
    id: 'transfer-explain-order',
    kind: 'explain',
    concept: 'Explaining orders vs holdings',
    prompt: 'In your own words, explain the difference between an order and a holding.',
    dimension: 'platform',
    misconceptionIds: ['order-is-holding'],
    minLength: 30,
    requiredConcepts: [
      ['order', 'instruction', 'request'],
      ['hold', 'own', 'bought', 'have']
    ],
    modelAnswer: 'An order is an instruction to buy or sell that may or may not execute. A holding is what you actually own after an order executes and settles.',
    successFeedback: 'Clear and accurate.',
    retryFeedback: 'Describe what an order is (an instruction) and what a holding is (something you own).'
  }
};

export const EXPERIENCES: Record<ExperienceId, Experience> = {
  'EXP-01': EXP_01,
  'EXP-02': EXP_02,
  'EXP-03': EXP_03,
  'EXP-04': EXP_04,
  'EXP-05': EXP_05,
  'EXP-06': EXP_06,
  'EXP-07': EXP_07,
  'EXP-08': EXP_08,
  'EXP-09': EXP_09,
  'EXP-10': EXP_10
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function isExperienceId(value: unknown): value is ExperienceId {
  return typeof value === 'string' && (EXPERIENCE_IDS as string[]).includes(value);
}

export function getExperience(id: unknown): Experience | null {
  return isExperienceId(id) ? EXPERIENCES[id] : null;
}

export function findCheck(expId: unknown, checkId: string): { check: Check; variant: CheckVariant } | null {
  const exp = getExperience(expId);
  if (!exp) return null;
  const core = exp.checks.find((check) => check.id === checkId);
  if (core) return { check: core, variant: 'core' };
  for (const alternative of Object.values(exp.alternatives)) {
    if (alternative.check.id === checkId) return { check: alternative.check, variant: 'alternative' };
  }
  if (exp.transfer.id === checkId) return { check: exp.transfer, variant: 'transfer' };
  return null;
}

export function allChecks(exp: Experience): Check[] {
  return [...exp.checks, ...Object.values(exp.alternatives).map((alternative) => alternative.check), exp.transfer];
}

/** Compiled misconception patterns (case-insensitive). */
const compiled: Record<string, RegExp[]> = Object.fromEntries(
  Object.values(MISCONCEPTIONS).map((item) => [item.id, item.patterns.map((source) => new RegExp(source, 'i'))])
);

/** Detect misconception ids in free text (discovery messages or explain answers). */
export function detectMisconceptions(text: string, limitTo?: string[]): string[] {
  if (!text) return [];
  const ids = limitTo ?? Object.keys(MISCONCEPTIONS);
  return ids.filter((id) => compiled[id]?.some((pattern) => pattern.test(text)));
}
