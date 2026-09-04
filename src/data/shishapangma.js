// Shishapangma routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 28.3520, lon: 85.7817, elevation: 8027, name: 'Shishapangma', aka: 'Shishapangma · Gosainthan · Xixabangma',
  range: 'Himalaya, Jugal Himal', countries: 'China (Tibet)',
  tagline: 'The fourteenth and lowest of the 8,000 m peaks, the only one entirely in Tibet, and the last to be climbed: a summit that many who claim it never actually reached.',
  summitText: 'A corniced crest at the end of a ridge that many parties never finish. The Central summit, 8,008 m, is where most ascents stop; the true top is 19 m higher and an hour further along a ridge that has killed people in both directions. In 1964 ten Chinese climbers stood here, the last first ascent of the fourteen.',
  summitBlurb: 'Fourteenth highest point on Earth and the last 8,000 m peak to be climbed, in 1964. About 400 ascents to the true summit and 35 deaths; hundreds more reached only the central summit.',
  figuresLead: 'The smallest of the giants, the last climbed, and the one whose summit has been argued over more than any other.',
  otherLines: 'Lines climbed but not modelled here: the 1993 Slovenian south-west face direct, the 2002 Korean north face variation, and Ueli Steck’s 2011 solo of the south-west face in ten and a half hours.',
  historyTitle: 'Sixty years',
  historyLead: 'From the Chinese ascent of 1964 to the avalanches of 2023.',
}

const routes = [
  {
    id: 'normal',
    name: 'North Ridge',
    aka: 'The Chinese route · north-east face to the north ridge · the normal route from Tibet',
    color: '#ff6a3d',
    firstAscent: '2 May 1964, Xu Jing and nine others (Chinese expedition of 195 members), the last first ascent of the fourteen 8,000 m peaks',
    share: '≈ 90% of all ascents',
    difficulty: 'A long glacier approach and snow slopes at 30-45° up the north-east flank to the north ridge, then a corniced summit ridge over the central summit to the true top',
    verticalGain: '≈ 2,400 m from Advanced Base',
    summary:
      'From a drivable base camp on the Tibetan plateau up the Yebokangjiala Glacier to Advanced Base, then the north-east flank to the north ridge. The technical difficulty is low; the difficulty is the last hour, a knife-edge from the central summit to the main one that most parties, and most guidebooks, quietly skip.',
    waypoints: [
      [28.4400, 85.7750], // Advanced Base
      [28.4300, 85.7762],
      [28.4210, 85.7775],
      [28.4114, 85.7787],
      [28.4018, 85.7799], // C1
      [28.3955, 85.7798],
      [28.3895, 85.7797],
      [28.3810, 85.7796],
      [28.3730, 85.7795], // C2
      [28.3648, 85.7794],
      [28.3607, 85.7793], // C3
      [28.3580, 85.7790],
      [28.3555, 85.7778], // Central summit
      [28.3535, 85.7800],
      [28.3520, 85.7817], // Main summit
    ],
    camps: [
      { name: 'Advanced Base', alt: 5650, lat: 28.4400, lon: 85.7750, blurb: 'On the moraine of the Yebokangjiala Glacier, two days by yak from the Chinese Base Camp at 5,000 m, which is itself an hour from the road.' },
      { name: 'Camp 1', alt: 6400, lat: 28.4018, lon: 85.7799, blurb: 'On the glacier below the face.' },
      { name: 'Camp 2', alt: 6900, lat: 28.3730, lon: 85.7795, blurb: 'A snow shelf on the north-east flank, in the fall line of the slopes above.' },
      { name: 'Camp 3', alt: 7400, lat: 28.3607, lon: 85.7793, blurb: 'On the north ridge above the rock band. Summit day reaches the central summit in five or six hours; the true summit is another hour of exposed ridge.' },
    ],
    hazards: ['face-avalanche', 'central-summit', 'summit-ridge', 'death-zone'],
  },
  {
    id: 'british',
    name: 'Southwest Face',
    aka: 'British route, 1982 · Scott, MacIntyre, Baxter-Jones',
    color: '#c77dff',
    firstAscent: '28 May 1982, Doug Scott, Alex MacIntyre & Roger Baxter-Jones (UK), alpine style, direct to the main summit',
    share: 'A few ascents',
    difficulty: 'A 2,000 m face of ice and rock at 50-60°, climbed in three days with two bivouacs',
    verticalGain: '≈ 2,200 m from the glacier',
    summary:
      'The great south-west face rises from the Nyalam side to the true summit. Scott, MacIntyre and Baxter-Jones climbed it in a three-day alpine-style push in 1982, reaching the main summit directly and avoiding the ridge. MacIntyre died on Annapurna five months later.',
    waypoints: [
      [28.3200, 85.7500], // glacier
      [28.3335, 85.7622],
      [28.3390, 85.7670], // foot of the face
      [28.3417, 85.7695],
      [28.3444, 85.7719], // bivouac
      [28.3471, 85.7743],
      [28.3498, 85.7768], // bivouac
      [28.3520, 85.7817], // Summit
    ],
    camps: [
      { name: 'Glacier camp', alt: 5600, lat: 28.3200, lon: 85.7500, blurb: 'On the glacier below the face, reached from Nyalam.' },
      { name: 'Bivouac 1', alt: 6500, lat: 28.3444, lon: 85.7719, blurb: 'A ledge on the lower ice field.' },
      { name: 'Bivouac 2', alt: 7300, lat: 28.3498, lon: 85.7768, blurb: 'Below the summit rocks, the last night on the face.' },
    ],
    hazards: ['sw-face', 'death-zone'],
  },
  {
    id: 'swiss',
    name: 'Southwest Face, 1990 line',
    aka: 'Loretan–Troillet–Kurtyka · one night, no tent',
    color: '#ffc14d',
    firstAscent: '3 October 1990, Erhard Loretan, Jean Troillet (Switzerland) & Wojciech Kurtyka (Poland), in a single push from the glacier',
    share: 'One ascent',
    difficulty: 'A direct line up the face left of the British route, climbed by night without bivouac gear',
    verticalGain: '≈ 2,100 m from the glacier',
    summary:
      'The same trio that had climbed Cho Oyu’s south-west face a fortnight earlier repeated the trick: up the face by night, over the top and down in a day and a half, carrying almost nothing.',
    waypoints: [
      [28.3100, 85.7800], // glacier
      [28.3277, 85.7797],
      [28.3348, 85.7795], // foot of the face
      [28.3419, 85.7794],
      [28.3454, 85.7793], // rest
      [28.3490, 85.7810],
      [28.3520, 85.7817], // Summit
    ],
    camps: [
      { name: 'Glacier camp', alt: 5900, lat: 28.3100, lon: 85.7800, blurb: 'The starting point of the night push.' },
      { name: 'Rest', alt: 7000, lat: 28.3454, lon: 85.7793, blurb: 'A stance in the sun on the upper face, the only stop of the climb.' },
    ],
    hazards: ['sw-face', 'death-zone'],
  },
  {
    id: 'westridge',
    name: 'West Ridge',
    aka: 'Kukuczka–Hajzer, 1987 · the fourteenth',
    color: '#7dffb3',
    firstAscent: '18 September 1987, Jerzy Kukuczka & Artur Hajzer (Poland), a new route over the unclimbed west summit; Kukuczka’s last of the fourteen, completed in eight years',
    share: 'Rarely repeated',
    difficulty: 'A long ridge of snow and rock from the north-west basin, over the west summit, joining the summit ridge at the central summit',
    verticalGain: '≈ 1,600 m from Camp 1',
    summary:
      'Kukuczka finished the fourteen 8,000 m peaks here, by a new route, as he had done on almost every one of them: from the north side, a long ridge climbed with Artur Hajzer over the unclimbed west summit to the central and main summits. Kukuczka skied down the normal route the next day. Only Messner had completed the fourteen before him, one year earlier.',
    waypoints: [
      [28.3900, 85.7700], // north-west glacier basin
      [28.3850, 85.7650],
      [28.3800, 85.7600], // Camp 1
      [28.3763, 85.7560],
      [28.3727, 85.7520],
      [28.3690, 85.7480], // bivouac at the foot of the ridge
      [28.3650, 85.7520],
      [28.3620, 85.7560],
      [28.3604, 85.7600],
      [28.3594, 85.7640], // ridge bivouac
      [28.3594, 85.7680],
      [28.3568, 85.7700],
      [28.3567, 85.7720], // West summit
      [28.3561, 85.7760],
      [28.3555, 85.7778], // Central summit
      [28.3535, 85.7800],
      [28.3520, 85.7817], // Main summit
    ],
    camps: [
      { name: 'Camp 1', alt: 6400, lat: 28.3800, lon: 85.7600, blurb: 'The site of the traditional Camp 1 on the north side, reached on skis.' },
      { name: 'Bivouac', alt: 6800, lat: 28.3690, lon: 85.7480, blurb: 'At the bottom of the ridge.' },
      { name: 'Ridge bivouac', alt: 7300, lat: 28.3594, lon: 85.7640, blurb: 'On the crest above the rock band, with snowfields on the southern side.' },
      { name: 'West summit', alt: 7966, lat: 28.3567, lon: 85.7720, blurb: 'The unclimbed west summit, crossed on the way to the central summit.' },
    ],
    hazards: ['west-ridge', 'central-summit', 'summit-ridge', 'death-zone'],
  },
  {
    id: 'winter',
    name: 'The winter line',
    aka: 'Morawski–Moro, January 2005',
    color: '#5fd3ff',
    firstAscent: '14 January 2005, Piotr Morawski (Poland) & Simone Moro (Italy), the first winter ascent, to the true summit',
    share: 'Historic; the normal route in winter',
    difficulty: 'The normal route in winter jet-stream winds, with the full ridge to the main summit',
    verticalGain: '≈ 2,400 m from Advanced Base',
    summary:
      'After a decade of Polish winter attempts, Morawski and Moro reached the true summit on 14 January 2005 and descended the same day, the first winter ascent of the last of the fourteen to be climbed in winter at that time.',
    waypoints: [
      [28.4400, 85.7750], // Advanced Base
      [28.4300, 85.7762],
      [28.4210, 85.7775],
      [28.4114, 85.7787],
      [28.4018, 85.7799], // C1
      [28.3955, 85.7798],
      [28.3895, 85.7797],
      [28.3810, 85.7796],
      [28.3730, 85.7795], // C2
      [28.3648, 85.7794],
      [28.3607, 85.7793], // C3
      [28.3580, 85.7790],
      [28.3555, 85.7778], // Central summit
      [28.3535, 85.7800],
      [28.3520, 85.7817], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 6400, lat: 28.4018, lon: 85.7799, blurb: 'The first camp, on the glacier.' },
      { name: 'Camp 2', alt: 6900, lat: 28.3730, lon: 85.7795, blurb: 'Dug into the north-east flank against the wind.' },
      { name: 'Camp 3', alt: 7400, lat: 28.3607, lon: 85.7793, blurb: 'The top camp on the north ridge; the summit push of 14 January started here before dawn.' },
    ],
    hazards: ['face-avalanche', 'central-summit', 'summit-ridge', 'death-zone'],
  },
]

const hazards = [
  {
    id: 'face-avalanche', name: 'North-east face', lat: 28.3730, lon: 85.7795, alt: 6900, radius: 420, severity: 5,
    kind: 'Avalanche · windslab',
    blurb: 'Broad, gently angled slopes on the north-east flank that load after every storm and release across the fixed lines; the normal route’s deaths are nearly all here.',
    incidents: ['7 Oct 2023, two avalanches kill Anna Gutu, Gina Rzucidlo and their guides Mingmar Sherpa and Tenjen Lama, racing to finish the fourteen'],
  },
  {
    id: 'central-summit', name: 'Central summit', lat: 28.3555, lon: 85.7778, alt: 8008, radius: 200, severity: 3,
    kind: 'False summit',
    blurb: 'At 8,008 m the central summit is where most ascents end. Whether it counts has divided the sport; guidebook stats and personal records were quietly rewritten when it stopped counting.',
    incidents: [],
  },
  {
    id: 'summit-ridge', name: 'Summit ridge', lat: 28.3535, lon: 85.7800, alt: 8015, radius: 220, severity: 5,
    kind: 'Cornice · knife-edge',
    blurb: 'The ridge from the central to the main summit: an hour of corniced knife-edge above 8,000 m, dangerous in both directions and impossible in poor snow.',
    incidents: ['24 Sep 2014, an avalanche at about 7,900 m just below the summit ridge kills Sebastian Haag and Andrea Zambaldi', 'Several parties have turned back within sight of the true summit; falls from the cornice have killed climbers on both sides'],
  },
  {
    id: 'sw-face', name: 'Southwest face', lat: 28.3444, lon: 85.7719, alt: 6500, radius: 420, severity: 5,
    kind: 'Avalanche · serac',
    blurb: 'A 2,000 m face of ice fields and rock bands, climbed by night to avoid what falls off it by day.',
    incidents: ['5 Oct 1999, Alex Lowe and David Bridges killed by an avalanche while scouting the face for a ski descent'],
  },
  {
    id: 'west-ridge', name: 'West ridge', lat: 28.3594, lon: 85.7640, alt: 7300, radius: 350, severity: 4,
    kind: 'Cornice · exposure',
    blurb: 'A long crest with cornices over the south side, rarely repeated since 1987.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 28.3520, lon: 85.7817, alt: 8000, radius: 500, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Only the summit ridge lies above 8,000 m, and it is where the argument about this mountain is settled: an hour of exposure that many choose not to take.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1964, title: 'The last of the fourteen', text: 'A Chinese expedition of 195 members puts Xu Jing and nine others on the summit on 2 May, the last 8,000 m peak to be climbed and the only first ascent made without Western climbers.' },
  { year: 1980, title: 'Opened', text: 'Tibet opens to foreign expeditions; a German team makes the second ascent by the north side.' },
  { year: 1982, title: 'Southwest Face', text: 'Doug Scott, Alex MacIntyre and Roger Baxter-Jones climb the face in alpine style, direct to the true summit.' },
  { year: 1987, title: 'Kukuczka’s fourteenth', text: 'Jerzy Kukuczka completes the fourteen 8,000 m peaks by a new route on the west ridge with Artur Hajzer, a year after Messner and in half the time.' },
  { year: 1990, title: 'By night', text: 'Loretan, Troillet and Kurtyka climb the south-west face in a single push with no bivouac gear, two weeks after doing the same on Cho Oyu.' },
  { year: 1999, title: 'Alex Lowe', text: 'Alex Lowe, the finest all-round climber of his generation, and David Bridges are killed by an avalanche on 5 October while scouting a ski descent of the south face. Conrad Anker survives.' },
  { year: 2005, title: 'Winter', text: 'Piotr Morawski and Simone Moro make the first winter ascent on 14 January, reaching the true summit.' },
  { year: 2011, title: 'Steck', text: 'Ueli Steck solos the south-west face in ten and a half hours from base camp.' },
  { year: 2014, title: 'Avalanche', text: 'Sebastian Haag and Andrea Zambaldi are killed on 24 September by an avalanche at about 7,900 m, just below the summit ridge and above Camp 3 on the normal route.' },
  { year: 2023, title: 'The race', text: 'Two American women, Anna Gutu and Gina Rzucidlo, each trying to become the first American woman to climb all fourteen, die with their guides in two avalanches on the same day, 7 October. China closes the mountain for the season.' },
]

const stats = [
  { label: 'Height', value: '8,027 m', note: '14th highest on Earth' },
  { label: 'First ascent', value: '1964', note: 'Chinese expedition' },
  { label: 'True summits', value: '≈ 400', note: 'hundreds more stopped at 8,008 m' },
  { label: 'Deaths', value: '≈ 35', note: 'nearly all in avalanches' },
  { label: 'Central to main', value: '19 m', note: 'and an hour of ridge' },
  { label: 'Winter ascent', value: '2005', note: 'Morawski & Moro' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'shishapangma', peak, routes, hazards, timeline, stats, sources }
