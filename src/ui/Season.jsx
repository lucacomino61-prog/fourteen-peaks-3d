import { monthName, seasonText } from '../data/seasons'
import { t } from '../i18n'

// The climbing season in "The numbers": the twelve months with the season's filled, the line that
// says when and why, and its sources (src/data/seasons.js).
export default function Season({ season }) {
  if (!season) return null
  return (
    <div className="season" role="group" aria-labelledby="season-title">
      <h3 id="season-title" className="season-title mono">{t('Climbing season')}</h3>
      <ol className="season-strip" aria-label={t('The months of the climbing season: {months}', { months: seasonText(season.months, 'long') })}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <li key={m} className={season.months.includes(m) ? 'is-on' : undefined} aria-hidden="true">
            <span>{monthName(m, 'narrow')}</span>
          </li>
        ))}
      </ol>
      <p className="season-note">{season.note}</p>
      <p className="season-sources">{t('Sources')}: {season.sources.join('; ')}.</p>
    </div>
  )
}
