# October's card templates (a record, not live pages)

`short.html` and `x-card.html` are the pages the October 2026 shorts and the
X card image were drawn from. They were under `site/cards/` and so were live
on the sales host until 12 Nov 2026, unlinked. They moved here because they
state the offer as it was on 16 Oct ("$50 first month") and the earnings
number of that week ($18.09). Both are out of date: the offer since 17 Oct is
$50 until the app's first dollar from a stranger, or 90 days, whichever comes
first, then $30 a month.

Do not draw a new card from these without fixing those lines first. To open
them, serve `site/` and this folder together (they load `/logo.svg`).
`short.html?v=1` to `?v=10` picks the short; `render(t)` draws second `t`.
