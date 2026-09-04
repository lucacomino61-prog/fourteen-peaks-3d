// K2 routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 35.8825, lon: 76.5133, elevation: 8611, name: 'K2', aka: 'Chogori · Qogir · Mount Godwin-Austen',
  range: 'Karakoram', countries: 'Pakistan / China',
  tagline: 'The second highest mountain on Earth, and the one most likely to kill the people who climb it.',
  summitText: 'A small snow dome with the whole Karakoram below. Most climbers arrive in the afternoon, already late; more than half of K2’s deaths happen on the way down from here.',
  summitBlurb: 'Second highest point on Earth, on the border of Pakistan and China. Only about one climber in eight who has stood on Everest has stood here.',
  figuresLead: 'Fewer people have stood on K2 than climb Everest in a single good season.',
  otherLines: 'Lines climbed but not modelled here: the North-east Ridge (Americans, 1978), the South Face “Polish Line” (Kukuczka and Piotrowski, 1986, never repeated), and the North-west Ridge and Face (1990s, Japanese and Russian teams).',
  historyTitle: 'A hundred and seventy years',
  historyLead: 'From a surveyor’s sketch to the first winter ascent.',
}

const routes = [
  {
    id: 'abruzzi',
    name: 'Abruzzi Spur',
    aka: 'Southeast Ridge · the normal route',
    color: '#ff6a3d',
    firstAscent: '31 July 1954, Lino Lacedelli & Achille Compagnoni (Italy, led by Ardito Desio)',
    share: '≈ 75% of all ascents',
    difficulty: 'Sustained rock IV-V, ice and snow to 60°, fixed ropes throughout',
    verticalGain: '≈ 3,300 m from Advanced Base',
    summary:
      'The line first tried by the Duke of the Abruzzi in 1909 and climbed in 1954. It follows the long south-east spur to the Shoulder, then the Bottleneck couloir beneath the summit serac. Steep, technical, and the busiest way up the mountain.',
    waypoints: [
      [35.8500, 76.5220], // Base Camp
      [35.8560, 76.5280],
      [35.8580, 76.5320], // ABC
      [35.8615, 76.5293],
      [35.8633, 76.5280], // C1
      [35.8667, 76.5253], // House's Chimney
      [35.8685, 76.5240], // C2
      [35.8702, 76.5226], // Black Pyramid
      [35.8720, 76.5213], // C3
      [35.8738, 76.5200],
      [35.8755, 76.5186], // C4 / Shoulder
      [35.8772, 76.5173],
      [35.8790, 76.5160], // Bottleneck
      [35.8800, 76.5142], // Traverse under the serac
      [35.8812, 76.5130],
      [35.8825, 76.5133], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 5150, lat: 35.8500, lon: 76.5220, blurb: 'On the Godwin-Austen Glacier moraine below the south face. Tents, a memorial cairn to the dead at the Gilkey Memorial, and the last place with any comfort.' },
      { name: 'Advanced Base', alt: 5350, lat: 35.8580, lon: 76.5320, blurb: 'At the foot of the spur. From here the route leaves the glacier and climbs rock and mixed ground.' },
      { name: 'Camp 1', alt: 6050, lat: 35.8633, lon: 76.5280, blurb: 'Small ledges on the crest of the spur. Rockfall from parties above is the main danger on the way here.' },
      { name: 'Camp 2', alt: 6700, lat: 35.8685, lon: 76.5240, blurb: 'Just above House’s Chimney, on a windy notch. Notoriously littered with decades of old tents and fixed rope.' },
      { name: 'Camp 3', alt: 7350, lat: 35.8720, lon: 76.5213, blurb: 'Above the Black Pyramid where the spur eases into snow slopes. Exposed to avalanche and wind; often destroyed in storms.' },
      { name: 'Camp 4', alt: 7900, lat: 35.8755, lon: 76.5186, blurb: 'On the Shoulder, a broad snow plateau in the Death Zone. Summit pushes leave from here around midnight.' },
    ],
    hazards: ['rockfall-lower', 'houses-chimney', 'black-pyramid', 'shoulder', 'bottleneck', 'serac-traverse', 'death-zone'],
  },
  {
    id: 'cesen',
    name: 'Česen Route',
    aka: 'Basque Route · South-southeast Spur',
    color: '#ffc14d',
    firstAscent: 'Spur to the Shoulder soloed by Tomo Česen (1986); to the summit by a Basque team, 1994',
    share: 'Most commercial teams since ~2014',
    difficulty: 'Steep snow and ice to 55°, less rock than the Abruzzi',
    verticalGain: '≈ 2,700 m to the Shoulder',
    summary:
      'A more direct line up the spur just left of the Abruzzi. It avoids House’s Chimney and the Black Pyramid, joining the normal route on the Shoulder below Camp 4, but its lower slopes are swept by avalanches after snowfall.',
    waypoints: [
      [35.8500, 76.5220], // Base Camp
      [35.8542, 76.5158],
      [35.8585, 76.5154], // C1
      [35.8629, 76.5150],
      [35.8651, 76.5148], // C2
      [35.8672, 76.5147],
      [35.8694, 76.5145], // C3
      [35.8716, 76.5143],
      [35.8738, 76.5150],
      [35.8755, 76.5186], // joins Abruzzi at C4
    ],
    camps: [
      { name: 'Camp 1', alt: 6050, lat: 35.8585, lon: 76.5154, blurb: 'Above the avalanche-prone lower snowfield.' },
      { name: 'Camp 2', alt: 6480, lat: 35.8651, lon: 76.5148, blurb: 'A cramped ledge on the crest of the spur.' },
      { name: 'Camp 3', alt: 7050, lat: 35.8694, lon: 76.5145, blurb: 'Below the final snow slopes to the Shoulder.' },
    ],
    hazards: ['cesen-avalanche', 'shoulder', 'bottleneck', 'serac-traverse', 'death-zone'],
    joins: 'abruzzi',
  },
  {
    id: 'north',
    name: 'North Ridge',
    aka: 'Chinese side · Xinjiang',
    color: '#5fd3ff',
    firstAscent: '14 August 1982, Naoe Sakashita, Hiroshi Yoshino, Yukihiro Yanagisawa (Japan)',
    share: 'A handful of ascents; extremely remote',
    difficulty: 'Sustained 45-55° snow and ice on a knife-edge ridge; long approach over the Shaksgam',
    verticalGain: '≈ 3,600 m from the K2 Glacier',
    summary:
      'An elegant, direct ridge rising from the K2 Glacier in China. Technically purer than the Abruzzi but the approach through the Shaksgam valley takes weeks, and rescue is impossible.',
    waypoints: [
      [35.9150, 76.5075], // Glacier / ABC
      [35.9078, 76.5088],
      [35.9015, 76.5099], // C1
      [35.8972, 76.5106],
      [35.8951, 76.5110], // C2
      [35.8930, 76.5114],
      [35.8909, 76.5118], // C3
      [35.8888, 76.5122],
      [35.8867, 76.5125], // C4
      [35.8846, 76.5129],
      [35.8825, 76.5133], // Summit
    ],
    camps: [
      { name: 'Advanced Base', alt: 5300, lat: 35.9150, lon: 76.5075, blurb: 'On the K2 Glacier, reached from Sughet Jangal after crossing the Shaksgam River.' },
      { name: 'Camp 1', alt: 5850, lat: 35.9015, lon: 76.5099, blurb: 'Where the ridge steepens above the glacier.' },
      { name: 'Camp 2', alt: 6750, lat: 35.8951, lon: 76.5110, blurb: 'On the crest, exposed on both sides.' },
      { name: 'Camp 3', alt: 7400, lat: 35.8909, lon: 76.5118, blurb: 'Below the upper snow slopes.' },
      { name: 'Camp 4', alt: 7950, lat: 35.8867, lon: 76.5125, blurb: 'Top of the ridge; from here the summit slopes lead directly up.' },
    ],
    hazards: ['north-ridge-exposure', 'death-zone'],
  },
  {
    id: 'magic',
    name: 'Magic Line',
    aka: 'South-southwest Pillar',
    color: '#c77dff',
    firstAscent: '3 August 1986, Przemysław Piasecki, Wojciech Wróż, Peter Božik (Poland / Slovakia)',
    share: 'Two ascents in history',
    difficulty: 'Extreme technical rock and mixed climbing to above 8,000 m',
    verticalGain: '≈ 2,300 m from the Negrotto Col',
    summary:
      'The pillar rising from the Negrotto Col to the summit, one of the hardest lines on any 8,000 m peak. Named by Reinhold Messner, who abandoned it in 1979. Wróż died on the descent in 1986; it was repeated once, by Jordi Corominas in 2004.',
    waypoints: [
      [35.8600, 76.4950], // Savoia side
      [35.8620, 76.4970],
      [35.8664, 76.5005], // Negrotto Col
      [35.8693, 76.5028],
      [35.8708, 76.5040], // C2
      [35.8723, 76.5052],
      [35.8737, 76.5063], // C3
      [35.8752, 76.5075],
      [35.8766, 76.5086], // C4
      [35.8781, 76.5098],
      [35.8796, 76.5110],
      [35.8825, 76.5133], // Summit
    ],
    camps: [
      { name: 'Negrotto Col', alt: 6300, lat: 35.8664, lon: 76.5005, blurb: 'The saddle between K2 and Angelus Peak, reached from the Savoia Glacier by a dangerous couloir.' },
      { name: 'Camp 2', alt: 6900, lat: 35.8708, lon: 76.5040, blurb: 'Bivouac ledges on the pillar.' },
      { name: 'Camp 3', alt: 7450, lat: 35.8737, lon: 76.5063, blurb: 'Below the hardest mixed pitches.' },
      { name: 'Camp 4', alt: 7900, lat: 35.8766, lon: 76.5086, blurb: 'Where the pillar merges into the summit snowfields.' },
    ],
    hazards: ['negrotto-couloir', 'death-zone'],
  },
  {
    id: 'west',
    name: 'West Ridge',
    aka: 'Japanese Route',
    color: '#7dffb3',
    firstAscent: '7 August 1981, Eiho Otani & Nazir Sabir (Japan / Pakistan)',
    share: 'Rarely attempted',
    difficulty: 'Long mixed ridge, traverses onto the south-west face high up',
    verticalGain: '≈ 3,500 m from the Savoia Glacier',
    summary:
      'A vast ridge climbed from the Savoia Glacier. The Japanese expedition fixed thousands of metres of rope and finished across the upper south-west face. Its first Pakistani summiteer, Nazir Sabir, became a national hero.',
    waypoints: [
      [35.8840, 76.4780], // Savoia glacier
      [35.8837, 76.4871], // C1
      [35.8835, 76.4919],
      [35.8833, 76.4967], // C2
      [35.8831, 76.4990],
      [35.8830, 76.5014], // C3
      [35.8829, 76.5038],
      [35.8828, 76.5062], // C4
      [35.8820, 76.5090],
      [35.8815, 76.5115],
      [35.8825, 76.5133], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 6050, lat: 35.8837, lon: 76.4871, blurb: 'On the lower ridge above the Savoia Glacier.' },
      { name: 'Camp 2', alt: 6730, lat: 35.8833, lon: 76.4967, blurb: 'Snow ridge; heavily corniced.' },
      { name: 'Camp 3', alt: 7350, lat: 35.8830, lon: 76.5014, blurb: 'Below the rock towers of the upper ridge.' },
      { name: 'Camp 4', alt: 7900, lat: 35.8828, lon: 76.5062, blurb: 'Where the line leaves the ridge for the south-west face.' },
    ],
    hazards: ['west-ridge-cornice', 'death-zone'],
  },
]

const hazards = [
  {
    id: 'bottleneck', name: 'The Bottleneck', lat: 35.8790, lon: 76.5160, alt: 8250, radius: 180, severity: 5,
    kind: 'Serac fall · ice avalanche',
    blurb: 'A 100 m couloir at 8,200-8,300 m squeezed beneath a hanging glacier the size of an apartment block. Every climber on the normal route must pass under it twice, moving slowly in the Death Zone. The serac collapses without warning.',
    incidents: ['1 Aug 2008, collapse sweeps fixed lines; 11 die', '2013, 2021, further falls and near misses'],
  },
  {
    id: 'serac-traverse', name: 'The Traverse', lat: 35.8800, lon: 76.5142, alt: 8350, radius: 150, severity: 5,
    kind: 'Exposure · ice fall',
    blurb: 'A leftward traverse on 50° ice directly beneath the serac wall, on fixed ropes anchored in ice screws. A fall here is unstoppable.',
    incidents: ['2008, anchors severed by ice fall, climbers stranded above'],
  },
  {
    id: 'shoulder', name: 'The Shoulder', lat: 35.8752, lon: 76.5182, alt: 7900, radius: 300, severity: 4,
    kind: 'Storm · whiteout · avalanche',
    blurb: 'A broad snow plateau where Camp 4 sits. Featureless in cloud, and where climbers were trapped for days in the 1986 storm. Slab avalanches release from the slopes above it.',
    incidents: ['Aug 1986, five die in a week-long storm at Camp 4', '1995, Alison Hargreaves and five others blown off the mountain above here'],
  },
  {
    id: 'black-pyramid', name: 'Black Pyramid', lat: 35.8702, lon: 76.5226, alt: 7100, radius: 220, severity: 3,
    kind: 'Technical rock · rockfall',
    blurb: 'A 400 m band of steep, loose, dark rock between 6,900 and 7,350 m. Sustained grade IV-V climbing at altitude on old, frayed fixed ropes.',
    incidents: [],
  },
  {
    id: 'houses-chimney', name: 'House’s Chimney', lat: 35.8667, lon: 76.5253, alt: 6600, radius: 120, severity: 3,
    kind: 'Technical rock · rope congestion',
    blurb: 'A 30 m vertical crack first led by Bill House in 1938. The crux of the lower Abruzzi; today a tangle of old ropes and a ladder, and a bottleneck for queues.',
    incidents: [],
  },
  {
    id: 'rockfall-lower', name: 'Lower Spur', lat: 35.8615, lon: 76.5293, alt: 5700, radius: 260, severity: 3,
    kind: 'Rockfall',
    blurb: 'Loose rock on the lower spur, released by the sun and by climbers above. Helmets essential; most injuries on the Abruzzi happen here.',
    incidents: [],
  },
  {
    id: 'cesen-avalanche', name: 'Česen Lower Slopes', lat: 35.8585, lon: 76.5154, alt: 6000, radius: 320, severity: 4,
    kind: 'Avalanche',
    blurb: 'Open 45° snow slopes that load after every storm. Teams wait for the slopes to settle before crossing.',
    incidents: ['2010s, several teams caught in slab releases between Camp 1 and 2'],
  },
  {
    id: 'negrotto-couloir', name: 'Negrotto Couloir', lat: 35.8640, lon: 76.4985, alt: 6000, radius: 220, severity: 4,
    kind: 'Avalanche · serac',
    blurb: 'The approach couloir to the Negrotto Col from the Savoia Glacier, a funnel for everything that falls off the west face.',
    incidents: ['1986, the Magic Line team narrowly escapes a serac fall here'],
  },
  {
    id: 'north-ridge-exposure', name: 'Knife-edge Ridge', lat: 35.8951, lon: 76.5110, alt: 6750, radius: 320, severity: 4,
    kind: 'Exposure · cornice · isolation',
    blurb: 'Kilometres of corniced crest with 2,000 m drops on both sides, and no possibility of rescue, the nearest road is a week away.',
    incidents: ['1982, Yanagisawa dies falling on the descent after the first ascent'],
  },
  {
    id: 'west-ridge-cornice', name: 'Corniced Crest', lat: 35.8833, lon: 76.4967, alt: 6730, radius: 300, severity: 3,
    kind: 'Cornice collapse',
    blurb: 'Long stretches of overhanging snow on the ridge crest; the line often runs below the cornice on the south side.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 35.8825, lon: 76.5133, alt: 8000, radius: 900, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Above 8,000 m the body can no longer acclimatise. Oxygen pressure is a third of sea level, temperatures fall below −40 °C, and judgement degrades. Every hour here shortens the margin for descent.',
    incidents: ['Most K2 deaths occur on the descent from above this altitude'],
    band: true,
  },
]

const timeline = [
  { year: 1856, title: 'Surveyed', text: 'Thomas Montgomerie of the Great Trigonometrical Survey sketches the peak from 200 km away and labels it “K2”, the second peak of the Karakoram.' },
  { year: 1902, title: 'First attempt', text: 'Oscar Eckenstein and Aleister Crowley reach about 6,500 m on the north-east ridge over 68 days in appalling weather.' },
  { year: 1909, title: 'The Duke of the Abruzzi', text: 'Luigi Amedeo’s expedition reaches ~6,250 m on the south-east spur that now bears his name, and declares the mountain unclimbable.' },
  { year: 1938, title: 'House’s Chimney', text: 'Charles Houston’s American expedition solves the crux of the lower spur and reaches ~7,925 m.' },
  { year: 1939, title: 'The Wiessner tragedy', text: 'Fritz Wiessner climbs to ~8,380 m without oxygen. Dudley Wolfe and three Sherpas, Pasang Kikuli, Pasang Kitar and Pintso, die on the mountain.' },
  { year: 1953, title: 'The Gilkey rescue', text: 'Houston returns. Art Gilkey develops thrombophlebitis at 7,700 m; during the retreat Pete Schoening’s “belay” holds six falling men. Gilkey is lost to an avalanche.' },
  { year: 1954, title: 'First ascent', text: 'Lino Lacedelli and Achille Compagnoni summit on 31 July. Walter Bonatti and Amir Mahdi survive an open bivouac at 8,100 m after carrying their oxygen up, a controversy that lasts fifty years.' },
  { year: 1977, title: 'Second ascent', text: 'A 1,500-person Japanese expedition puts seven climbers on top, 23 years after the first.' },
  { year: 1978, title: 'Americans, at last', text: 'Jim Wickwire, Lou Reichardt, John Roskelley and Rick Ridgeway summit via the north-east ridge. Reichardt climbs without oxygen; Wickwire survives a bivouac just below the top.' },
  { year: 1981, title: 'West Ridge', text: 'Japanese expedition; Eiho Otani and Nazir Sabir on the summit.' },
  { year: 1982, title: 'North Ridge', text: 'A Japanese team climbs the Chinese side. Yukihiro Yanagisawa falls to his death during the descent.' },
  { year: 1986, title: 'The Black Summer', text: 'Thirteen climbers die. Wanda Rutkiewicz becomes the first woman to summit; Kukuczka and Piotrowski climb the south face (Piotrowski dies descending); the Magic Line is climbed; a storm traps seven at Camp 4 for days, only two come down.' },
  { year: 1995, title: 'Storm', text: 'Alison Hargreaves, weeks after climbing Everest unsupported, is blown off the mountain with five others in a sudden hurricane-force wind above the Shoulder.' },
  { year: 2008, title: 'Serac collapse', text: 'On 1 August a section of the summit serac falls into the Bottleneck, cutting the fixed ropes below 30 climbers. Eleven die, the worst single day on K2.' },
  { year: 2018, title: 'Ski descent', text: 'Andrzej Bargiel skis from the summit to Base Camp without removing his skis.' },
  { year: 2021, title: 'Winter', text: 'On 16 January ten Nepali climbers, including Nirmal Purja and Mingma Gyalje Sherpa, make the first winter ascent, singing the national anthem in the last metres. Weeks later Ali Sadpara, John Snorri and Juan Pablo Mohr vanish near the Bottleneck.' },
  { year: 2022, title: 'The crowded year', text: 'Fixed ropes, forecasting and commercial teams produce nearly 200 summits in a single season, more than the previous seventy years combined.' },
]

const stats = [
  { label: 'Height', value: '8,611 m', note: '2nd highest on Earth' },
  { label: 'Prominence', value: '4,020 m', note: 'from the Karakoram floor' },
  { label: 'First ascent', value: '1954', note: 'Italian expedition' },
  { label: 'Summits', value: '≈ 1,000', note: 'roughly ⅛ of Everest’s' },
  { label: 'Deaths', value: '≈ 100', note: 'historically one for every four summits' },
  { label: 'Winter ascents', value: '1', note: 'January 2021' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'k2', peak, routes, hazards, timeline, stats, sources }
