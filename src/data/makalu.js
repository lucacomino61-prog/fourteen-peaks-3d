// Makalu routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 27.8897, lon: 87.0885, elevation: 8485, name: 'Makalu', aka: 'Makalu · Kumbhakarna · the Great Black',
  range: 'Himalaya, Mahalangur Himal', countries: 'Nepal / China',
  tagline: 'The fifth highest mountain on Earth: an isolated pyramid of black granite, harder than its neighbours and far less crowded.',
  summitText: 'A small snow summit on a pyramid of granite, with Everest, Lhotse and Kangchenjunga all in view. The French reached it in 1955 with every member of the team; since then the ridge and couloir below have claimed climbers on the way down more often than on the way up.',
  summitBlurb: 'Fifth highest point on Earth, 19 km east of Everest across the Barun valley. Around 500 ascents and 45 deaths; its faces and pillars carry some of the hardest routes on any 8,000 m peak.',
  figuresLead: 'A mountain climbed by a few hundred people, nearly all by one route, with faces that stopped the strongest teams of the 1970s.',
  otherLines: 'Lines climbed but not modelled here: Jerzy Kukuczka’s 1981 solo variation on the north-west face, the Polish west face line of 1982, and the long east ridge from the Kangshung side.',
  historyTitle: 'Seventy years',
  historyLead: 'From the French model expedition of 1955 to the first winter ascent of 2009.',
}

const routes = [
  {
    id: 'normal',
    name: 'Northwest Ridge',
    aka: 'Makalu La · the French route · the normal route',
    color: '#ff6a3d',
    firstAscent: '15 May 1955, Jean Couzy & Lionel Terray (French expedition led by Jean Franco); all nine members summited over three days',
    share: '≈ 90% of all ascents',
    difficulty: 'Glacier and snow slopes to the Makalu La at 7,400 m, then a long ridge and the French Couloir at 8,000 m; fixed ropes and oxygen common',
    verticalGain: '≈ 3,600 m from Base Camp',
    summary:
      'Up the Barun Glacier to the col between Makalu and Kangchungtse, then the north-west ridge and a final couloir of loose granite to the summit. The French climbed it in 1955 in perfect weather with every member reaching the top, a model expedition; the ridge above the La is where the wind lives.',
    waypoints: [
      [27.8477, 87.0837], // Base Camp
      [27.8620, 87.0828], // ABC
      [27.8716, 87.0822], // C1
      [27.8764, 87.0819], // C2
      [27.8850, 87.0700],
      [27.8950, 87.0750],
      [27.9000, 87.0780],
      [27.9050, 87.0800], // Makalu La
      [27.9004, 87.0825],
      [27.8974, 87.0842], // C4
      [27.8943, 87.0859], // French Couloir
      [27.8920, 87.0870],
      [27.8897, 87.0885], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 4870, lat: 27.8477, lon: 87.0837, blurb: 'Hillary Base Camp on the moraine of the Barun Glacier, a fortnight’s walk from Tumlingtar through the Barun valley.' },
      { name: 'Advanced Base', alt: 5700, lat: 27.8620, lon: 87.0828, blurb: 'On the upper Barun Glacier under the west face.' },
      { name: 'Camp 1', alt: 6100, lat: 27.8716, lon: 87.0822, blurb: 'At the foot of the slopes leading towards the La.' },
      { name: 'Camp 2', alt: 6600, lat: 27.8764, lon: 87.0819, blurb: 'On the glacier shelf below the col; the last easy ground.' },
      { name: 'Makalu La', alt: 7400, lat: 27.9050, lon: 87.0800, blurb: 'Camp 3, on the col between Makalu and Kangchungtse. The wind here is legendary; tents are shredded every season.' },
      { name: 'Camp 4', alt: 7800, lat: 27.8974, lon: 87.0842, blurb: 'On the ridge below the French Couloir. Summit pushes leave at midnight for a 10 to 12 hour climb.' },
    ],
    hazards: ['barun-approach', 'makalu-la', 'nw-ridge', 'french-couloir', 'death-zone'],
  },
  {
    id: 'westpillar',
    name: 'West Pillar',
    aka: 'French route, 1971',
    color: '#c77dff',
    firstAscent: '23 May 1971, Bernard Mellet & Yannick Seigneur (French expedition led by Robert Paragot)',
    share: 'A handful of ascents; the first truly technical route on any 8,000 m peak',
    difficulty: 'Sustained rock climbing to grade V and aid between 7,000 and 8,000 m, siege-climbed with thousands of metres of fixed rope',
    verticalGain: '≈ 2,900 m from the glacier',
    summary:
      'The great granite pillar that divides the west face from the north-west face. Paragot’s 1971 expedition fixed it in spring cold and put two climbers on the summit, a step change in what was considered possible at altitude. Repeated alpine-style only decades later.',
    waypoints: [
      [27.8850, 87.0500], // glacier
      [27.8862, 87.0596],
      [27.8870, 87.0660], // C1
      [27.8877, 87.0725],
      [27.8881, 87.0757], // C2
      [27.8885, 87.0789], // C3
      [27.8889, 87.0821], // C4
      [27.8893, 87.0853], // C5
      [27.8897, 87.0885], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 6000, lat: 27.8870, lon: 87.0660, blurb: 'At the foot of the pillar on the Barun Glacier.' },
      { name: 'Camp 2', alt: 6650, lat: 27.8881, lon: 87.0757, blurb: 'On the crest below the first rock towers.' },
      { name: 'Camp 3', alt: 7000, lat: 27.8885, lon: 87.0789, blurb: 'Hanging tents at the start of the hardest rock.' },
      { name: 'Camp 4', alt: 7400, lat: 27.8889, lon: 87.0821, blurb: 'Above the crux towers.' },
      { name: 'Camp 5', alt: 7850, lat: 27.8893, lon: 87.0853, blurb: 'The highest camp, where the pillar merges into the summit slopes.' },
    ],
    hazards: ['west-pillar-rock', 'death-zone'],
  },
  {
    id: 'westface',
    name: 'West Face',
    aka: 'Russian direct, 1997',
    color: '#7dffb3',
    firstAscent: '21 May 1997, a Russian expedition led by Sergey Efimov; Salavat Khabibullin died of exhaustion near the summit',
    share: 'One ascent; awarded a Piolet d’Or',
    difficulty: 'A 2,500 m face of steep granite and ice, the hardest line on the mountain',
    verticalGain: '≈ 2,700 m from the glacier',
    summary:
      'Straight up the face left of the pillar, on ground the 1970s teams considered impossible. The Russians climbed it capsule-style over weeks in 1997 and reached the summit late in the day; one climber did not survive the descent.',
    waypoints: [
      [27.8800, 87.0550], // glacier
      [27.8824, 87.0634],
      [27.8840, 87.0690], // C1
      [27.8857, 87.0745], // C2
      [27.8873, 87.0801], // C3
      [27.8881, 87.0829], // C4
      [27.8889, 87.0857],
      [27.8897, 87.0885], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 6200, lat: 27.8840, lon: 87.0690, blurb: 'Below the first rock band.' },
      { name: 'Camp 2', alt: 6650, lat: 27.8857, lon: 87.0745, blurb: 'A snow ledge in the middle of the face.' },
      { name: 'Camp 3', alt: 7200, lat: 27.8873, lon: 87.0801, blurb: 'Below the headwall.' },
      { name: 'Camp 4', alt: 7550, lat: 27.8881, lon: 87.0829, blurb: 'The last camp before the summit push.' },
    ],
    hazards: ['west-face', 'death-zone'],
  },
  {
    id: 'southface',
    name: 'South Face',
    aka: 'Yugoslav route, 1975',
    color: '#ffc14d',
    firstAscent: '6 October 1975, Stane Belak; six more climbers over the following days (Yugoslav expedition led by Aleš Kunaver)',
    share: 'A few ascents',
    difficulty: 'A 2,500 m face of ice fields and rock bands, climbed in the autumn cold',
    verticalGain: '≈ 2,900 m from the Barun Glacier',
    summary:
      'The face that rises from the upper Barun Glacier straight to the summit. Kunaver’s Yugoslav expedition, after two earlier attempts, forced it in October 1975 and put seven climbers on top, the country’s first 8,000 m summit.',
    waypoints: [
      [27.8500, 87.0950], // glacier
      [27.8585, 87.0936],
      [27.8642, 87.0927], // C1
      [27.8698, 87.0917], // C2
      [27.8755, 87.0908], // C3
      [27.8784, 87.0904], // C4
      [27.8812, 87.0899], // C5
      [27.8840, 87.0894],
      [27.8897, 87.0885], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5900, lat: 27.8642, lon: 87.0927, blurb: 'At the foot of the face.' },
      { name: 'Camp 2', alt: 6400, lat: 27.8698, lon: 87.0917, blurb: 'Below the first ice field.' },
      { name: 'Camp 3', alt: 6750, lat: 27.8755, lon: 87.0908, blurb: 'A platform under the rock band.' },
      { name: 'Camp 4', alt: 7150, lat: 27.8784, lon: 87.0904, blurb: 'Above the rock band.' },
      { name: 'Camp 5', alt: 7550, lat: 27.8812, lon: 87.0899, blurb: 'The highest camp, from which the 1975 summit teams climbed the final snow slopes.' },
    ],
    hazards: ['south-face', 'death-zone'],
  },
  {
    id: 'seridge',
    name: 'Southeast Ridge',
    aka: 'Japanese route, 1970 · the line of the 1954 attempts',
    color: '#5fd3ff',
    firstAscent: '23 May 1970, Yūichi Ozaki & Atsushi Tanaka (Japanese expedition)',
    share: 'Rarely repeated',
    difficulty: 'A long corniced ridge with rock steps, exposed to the wind from both sides',
    verticalGain: '≈ 3,100 m from the glacier',
    summary:
      'The ridge the Americans and Edmund Hillary’s New Zealanders tried in 1954, and the Japanese finished in 1970. Long, exposed and rarely climbed since, it joins the summit from the south-east over a series of rock steps.',
    waypoints: [
      [27.8550, 87.1200], // glacier
      [27.8600, 87.1155],
      [27.8624, 87.1133], // C1
      [27.8674, 87.1088], // C2
      [27.8724, 87.1043],
      [27.8748, 87.1020], // C3
      [27.8773, 87.0998], // C4
      [27.8823, 87.0952],
      [27.8847, 87.0930], // C5
      [27.8872, 87.0907],
      [27.8897, 87.0885], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 6000, lat: 27.8624, lon: 87.1133, blurb: 'Where the ridge rises from the glacier.' },
      { name: 'Camp 2', alt: 6600, lat: 27.8674, lon: 87.1088, blurb: 'On the crest, below the first rock step.' },
      { name: 'Camp 3', alt: 7150, lat: 27.8748, lon: 87.1020, blurb: 'A notch in the ridge.' },
      { name: 'Camp 4', alt: 7500, lat: 27.8773, lon: 87.0998, blurb: 'On the long level section of the ridge.' },
      { name: 'Camp 5', alt: 7700, lat: 27.8847, lon: 87.0930, blurb: 'Below the summit pyramid.' },
    ],
    hazards: ['se-ridge', 'death-zone'],
  },
]

const hazards = [
  {
    id: 'barun-approach', name: 'Barun Glacier', lat: 27.8620, lon: 87.0828, alt: 5700, radius: 350, severity: 3,
    kind: 'Crevasses · rockfall',
    blurb: 'The glacier between Base Camp and Camp 1, crossed many times in a season, threatened by rockfall from the walls of Makalu’s west side.',
    incidents: [],
  },
  {
    id: 'makalu-la', name: 'Makalu La', lat: 27.9050, lon: 87.0800, alt: 7400, radius: 300, severity: 4,
    kind: 'Wind · exposure',
    blurb: 'The col between Makalu and Kangchungtse funnels the jet stream. Tents are shredded here every season and climbers have been blown off the ridge above.',
    incidents: ['2009, the winter expedition of Moro and Urubko waits out weeks of 150 km/h winds at the La'],
  },
  {
    id: 'nw-ridge', name: 'Northwest ridge', lat: 27.9000, lon: 87.0828, alt: 7800, radius: 300, severity: 4,
    kind: 'Cornice · wind · exposure',
    blurb: 'A broad snow ridge that narrows to cornices over the Kangshung side, in the full force of the wind.',
    incidents: [],
  },
  {
    id: 'french-couloir', name: 'French Couloir', lat: 27.8943, lon: 87.0859, alt: 8050, radius: 200, severity: 5,
    kind: 'Loose rock · exposure · late descents',
    blurb: 'The final 400 m: a gully and rock steps at 8,000 m on loose granite, where most of the route’s deaths have happened on the way down.',
    incidents: ['2019 and 2023, several climbers die of exhaustion between the couloir and Camp 4'],
  },
  {
    id: 'west-pillar-rock', name: 'West Pillar towers', lat: 27.8885, lon: 87.0789, alt: 7000, radius: 300, severity: 5,
    kind: 'Technical rock at 7,000 m · rockfall',
    blurb: 'Granite towers climbed with aid in 1971; the fixed ropes left on them have killed climbers who trusted old anchors.',
    incidents: [],
  },
  {
    id: 'west-face', name: 'West Face', lat: 27.8857, lon: 87.0745, alt: 6800, radius: 400, severity: 5,
    kind: 'Rockfall · ice · commitment',
    blurb: 'A 2,500 m wall of granite and ice with no easy retreat, climbed once.',
    incidents: ['1997, Salavat Khabibullin dies of exhaustion after reaching the summit ridge'],
  },
  {
    id: 'south-face', name: 'South Face', lat: 27.8698, lon: 87.0917, alt: 6500, radius: 400, severity: 5,
    kind: 'Avalanche · serac',
    blurb: 'Ice fields swept by avalanches from the summit slopes; the 1972 and 1974 attempts on it were turned back by storms and avalanche.',
    incidents: [],
  },
  {
    id: 'se-ridge', name: 'Southeast ridge', lat: 27.8748, lon: 87.1020, alt: 7100, radius: 350, severity: 4,
    kind: 'Cornice · length',
    blurb: 'Kilometres of corniced crest with rock steps, and no quick way down to either side.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 27.8897, lon: 87.0885, alt: 8000, radius: 900, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Above 8,000 m the body can no longer acclimatise. On Makalu the summit day from Camp 4 climbs the couloir into it and returns down loose rock in the afternoon.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1954, title: 'Two attempts', text: 'An American team tries the south-east ridge and a New Zealand party under Edmund Hillary reconnoitres the mountain; Hillary is evacuated with broken ribs and pneumonia.' },
  { year: 1955, title: 'The model expedition', text: 'Jean Franco’s French expedition puts Jean Couzy and Lionel Terray on the summit on 15 May, then every other member over the next two days, by the north-west ridge. Nobody is hurt.' },
  { year: 1970, title: 'Southeast Ridge', text: 'A Japanese expedition completes the ridge of the 1954 attempts; Yūichi Ozaki and Atsushi Tanaka summit on 23 May.' },
  { year: 1971, title: 'West Pillar', text: 'Robert Paragot’s French team climbs the granite pillar in spring cold; Bernard Mellet and Yannick Seigneur reach the summit on 23 May, the first technical rock route on an 8,000 m peak.' },
  { year: 1975, title: 'South Face', text: 'Aleš Kunaver’s Yugoslav expedition climbs the south face in October; seven climbers summit, the first Yugoslavs on an 8,000 m peak.' },
  { year: 1981, title: 'Kukuczka alone', text: 'Jerzy Kukuczka climbs a new line on the north-west face solo on 15 October, one of the boldest ascents of his career.' },
  { year: 1997, title: 'West Face', text: 'Sergey Efimov’s Russian expedition climbs the west face direct and receives a Piolet d’Or; Salavat Khabibullin dies on the descent.' },
  { year: 2009, title: 'Winter', text: 'Simone Moro and Denis Urubko make the first winter ascent on 9 February, after weeks of wind at the Makalu La.' },
  { year: 2019, title: 'Commercial season', text: 'Fixed ropes to the summit and oxygen bring a record season; two climbers die on the descent from the couloir.' },
  { year: 2023, title: 'Record year', text: 'More than 100 people reach the summit in a single spring for the first time; several deaths above Camp 4 follow the same pattern as the previous decade.' },
]

const stats = [
  { label: 'Height', value: '8,485 m', note: '5th highest on Earth' },
  { label: 'First ascent', value: '1955', note: 'Couzy & Terray' },
  { label: 'Summits', value: '≈ 500', note: 'nearly all by the normal route' },
  { label: 'Deaths', value: '≈ 45', note: 'about one per eleven summits' },
  { label: 'Winter ascent', value: '2009', note: 'Moro & Urubko' },
  { label: 'From Everest', value: '19 km', note: 'across the Barun valley' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'makalu', peak, routes, hazards, timeline, stats, sources }
