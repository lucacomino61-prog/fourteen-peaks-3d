// Broad Peak routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 35.8114, lon: 76.5650, elevation: 8051, name: 'Broad Peak', aka: 'Broad Peak · Faichan Kangri · K3',
  range: 'Karakoram, Baltoro', countries: 'Pakistan / China',
  tagline: 'The twelfth highest mountain on Earth: a mile and a half of summit ridge across the glacier from K2, first climbed by four men with no porters, no oxygen and no fixed camps.',
  summitText: 'The far end of a summit ridge one and a half kilometres long, with K2 filling the sky to the north. Buhl and Diemberger reached it at seven in the evening in 1957; the walk back along the ridge is where the mountain does its killing.',
  summitBlurb: 'Twelfth highest point on Earth, across the Godwin-Austen Glacier from K2. About 800 ascents and 30 deaths; the long summit ridge means a good share of recorded ascents stopped at the fore-summit.',
  figuresLead: 'A mountain climbed cleanly at the first attempt, whose true summit many visitors never reach.',
  otherLines: 'Lines climbed but not modelled here: the 1983 Yugoslav west face variation, the Spanish south-west ridge line, and the north-west ridge to Broad Peak North.',
  historyTitle: 'Seventy years',
  historyLead: 'From the four Austrians of 1957 to the winter tragedy of 2013.',
}

const routes = [
  {
    id: 'normal',
    name: 'West Spur',
    aka: 'The 1957 route · the normal route',
    color: '#ff6a3d',
    firstAscent: '9 June 1957, Hermann Buhl, Kurt Diemberger, Marcus Schmuck & Fritz Wintersteller (Austria), without porters, oxygen or fixed camps',
    share: '≈ 95% of all ascents',
    difficulty: 'Snow and scree spur at 35-45° to the col at 7,800 m, then a long corniced ridge over the fore-summit to the true top',
    verticalGain: '≈ 3,150 m from Base Camp',
    summary:
      'Up the spur on the west side from the Godwin-Austen Glacier to the col between the Rocky fore-summit and the main summit, then the ridge. The 1957 team carried everything themselves, the first 8,000 m first ascent in what would later be called alpine style; Buhl died three weeks later on Chogolisa.',
    waypoints: [
      [35.8050, 76.5250], // Base Camp
      [35.8059, 76.5329],
      [35.8064, 76.5382], // C1
      [35.8070, 76.5435], // C2
      [35.8079, 76.5514],
      [35.8087, 76.5594], // C3
      [35.8090, 76.5620], // col
      [35.8102, 76.5635], // Rocky Summit
      [35.8108, 76.5643],
      [35.8114, 76.5650], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 4900, lat: 35.8050, lon: 76.5250, blurb: 'On the Godwin-Austen Glacier below the west face, an hour south of K2 Base Camp.' },
      { name: 'Camp 1', alt: 5800, lat: 35.8064, lon: 76.5382, blurb: 'On the spur above the crevassed lower slopes.' },
      { name: 'Camp 2', alt: 6200, lat: 35.8070, lon: 76.5435, blurb: 'A shelf on the spur; the 1957 team’s middle camp.' },
      { name: 'Camp 3', alt: 7000, lat: 35.8087, lon: 76.5594, blurb: 'Below the col. Summit day from here crosses the col and the whole ridge: twelve to sixteen hours.' },
    ],
    hazards: ['lower-spur', 'spur-slopes', 'the-col', 'summit-ridge', 'death-zone'],
  },
  {
    id: 'swface',
    name: 'Southwest Face',
    aka: 'Carsolio’s solo, 1994',
    color: '#c77dff',
    firstAscent: '9 July 1994, Carlos Carsolio (Mexico), solo, a new line up the face left of the spur',
    share: 'One ascent',
    difficulty: 'Ice fields and rock bands at 50-60° to the upper ridge, climbed alone in a single push',
    verticalGain: '≈ 2,750 m from the glacier',
    summary:
      'Carsolio, then collecting the fourteen at a pace matched only by Kukuczka, soloed the face in a day and a night and joined the summit ridge below the true top, his ninth 8,000 m peak.',
    waypoints: [
      [35.7950, 76.5350], // glacier
      [35.7977, 76.5400],
      [35.8032, 76.5500], // bivouac
      [35.8059, 76.5550],
      [35.8073, 76.5575], // bivouac
      [35.8087, 76.5600],
      [35.8100, 76.5625],
      [35.8114, 76.5650], // Summit
    ],
    camps: [
      { name: 'Bivouac 1', alt: 6100, lat: 35.8032, lon: 76.5500, blurb: 'At the foot of the upper face.' },
      { name: 'Bivouac 2', alt: 6850, lat: 35.8073, lon: 76.5575, blurb: 'A ledge below the rock band.' },
    ],
    hazards: ['sw-face', 'summit-ridge', 'death-zone'],
  },
  {
    id: 'central',
    name: 'Broad Peak Central',
    aka: 'Polish route, 1975 · the 8,011 m middle summit',
    color: '#ffc14d',
    firstAscent: '28 July 1975, Kazimierz Głazek, Marek Kęsicki, Janusz Kuliś, Bohdan Nowaczyk & Andrzej Sikorski (Poland); Kęsicki, Nowaczyk and Sikorski died in a storm on the descent',
    share: 'A few ascents',
    difficulty: 'The west spur to the col south of the central summit, then a corniced ridge above 7,600 m',
    verticalGain: '≈ 3,100 m from Base Camp',
    summary:
      'The middle of Broad Peak’s three summits is an 8,000 m top in its own right and was unclimbed until 1975, when five Poles reached it late in the day. A storm caught them on the way down; three fell or froze on the ridge, and the two survivors reached camp after a night out.',
    waypoints: [
      [35.8050, 76.5250], // Base Camp
      [35.8064, 76.5382], // C1
      [35.8070, 76.5435], // C2
      [35.8100, 76.5500],
      [35.8130, 76.5560], // C3
      [35.8160, 76.5620],
      [35.8176, 76.5643], // col
      [35.8192, 76.5642],
      [35.8207, 76.5640], // Central summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5800, lat: 35.8064, lon: 76.5382, blurb: 'Shared with the normal route.' },
      { name: 'Camp 2', alt: 6200, lat: 35.8070, lon: 76.5435, blurb: 'Where the Polish line leaves the spur for the central face.' },
      { name: 'Camp 3', alt: 7000, lat: 35.8130, lon: 76.5560, blurb: 'Below the col between the main and central summits.' },
      { name: 'The col', alt: 7650, lat: 35.8176, lon: 76.5643, blurb: 'The saddle south of the central summit, where the 1975 survivors bivouacked in the storm.' },
    ],
    hazards: ['spur-slopes', 'central-ridge', 'death-zone'],
    finish: { title: 'Broad Peak Central', alt: 8011, body: 'The middle summit, 8,011 m. From here the ridge continues north to Broad Peak North and south to the main top; the 1975 team turned back into the storm.' },
  },
  {
    id: 'traverse',
    name: 'Three-summit traverse',
    aka: 'Kukuczka–Kurtyka, 1984',
    color: '#7dffb3',
    firstAscent: '13–17 July 1984, Jerzy Kukuczka & Wojciech Kurtyka (Poland), over Broad Peak North, Central and Main in alpine style',
    share: 'Once',
    difficulty: 'Three summits and five kilometres of corniced ridge above 7,300 m, carried in a single push',
    verticalGain: '≈ 3,200 m from Base Camp',
    summary:
      'The Polish pair climbed the unclimbed north summit from the west, then followed the whole crest south over the central summit to the main top and down the normal route: one of the great ridge traverses of the Himalaya, done with one tent and no support.',
    waypoints: [
      [35.8050, 76.5250], // Base Camp
      [35.8150, 76.5350],
      [35.8230, 76.5450], // bivouac
      [35.8260, 76.5560],
      [35.8269, 76.5633], // North summit
      [35.8238, 76.5637],
      [35.8207, 76.5640], // Central summit
      [35.8176, 76.5643],
      [35.8145, 76.5647],
      [35.8130, 76.5648],
      [35.8114, 76.5650], // Main summit
    ],
    camps: [
      { name: 'Bivouac', alt: 6800, lat: 35.8230, lon: 76.5450, blurb: 'On the west side below the north summit.' },
      { name: 'Broad Peak North', alt: 7490, lat: 35.8269, lon: 76.5633, blurb: 'The first summit of the traverse, unclimbed until 1984.' },
      { name: 'Broad Peak Central', alt: 8011, lat: 35.8207, lon: 76.5640, blurb: 'The second summit, reached on the third day.' },
    ],
    hazards: ['north-ridge', 'central-ridge', 'summit-ridge', 'death-zone'],
  },
  {
    id: 'winter',
    name: 'The winter line',
    aka: 'The first winter ascent, March 2013',
    color: '#5fd3ff',
    firstAscent: '5 March 2013, Maciej Berbeka, Adam Bielecki, Tomasz Kowalski & Artur Małek (Poland); Berbeka and Kowalski died on the descent',
    share: 'Historic; the normal route in winter',
    difficulty: 'The normal route in −40 °C, with the summit reached at dusk after a fourteen-hour push',
    verticalGain: '≈ 3,150 m from Base Camp',
    summary:
      'The last of the Polish winter firsts in the Karakoram before K2: four climbers reached the summit late on 5 March. Bielecki and Małek descended through the night; Berbeka and Kowalski, exhausted on the ridge, bivouacked near the col and did not survive the next day.',
    waypoints: [
      [35.8050, 76.5250], // Base Camp
      [35.8064, 76.5382], // C1
      [35.8070, 76.5435], // C2
      [35.8079, 76.5514], // C3
      [35.8087, 76.5594], // C4
      [35.8090, 76.5620], // col
      [35.8102, 76.5635],
      [35.8114, 76.5650], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5800, lat: 35.8064, lon: 76.5382, blurb: 'Dug into the spur.' },
      { name: 'Camp 2', alt: 6200, lat: 35.8070, lon: 76.5435, blurb: 'The middle camp.' },
      { name: 'Camp 3', alt: 6500, lat: 35.8079, lon: 76.5514, blurb: 'Below the upper slopes.' },
      { name: 'Camp 4', alt: 7000, lat: 35.8087, lon: 76.5594, blurb: 'The last camp; the summit push of 5 March started here at 5 am.' },
    ],
    hazards: ['spur-slopes', 'the-col', 'summit-ridge', 'death-zone'],
  },
]

const hazards = [
  {
    id: 'lower-spur', name: 'Lower spur', lat: 35.8059, lon: 76.5329, alt: 5300, radius: 350, severity: 3,
    kind: 'Crevasses · rockfall',
    blurb: 'Crevassed slopes and loose rock between Base Camp and Camp 1.',
    incidents: [],
  },
  {
    id: 'spur-slopes', name: 'Upper spur', lat: 35.8079, lon: 76.5514, alt: 6500, radius: 350, severity: 4,
    kind: 'Avalanche · windslab',
    blurb: 'Broad snow slopes between Camps 2 and 3 that load with windslab and have avalanched onto the fixed lines.',
    incidents: [],
  },
  {
    id: 'the-col', name: 'The col', lat: 35.8090, lon: 76.5620, alt: 7800, radius: 250, severity: 4,
    kind: 'Wind · exposure',
    blurb: 'The saddle between the Rocky fore-summit and the main summit, reached after a long slog and exposed to the wind from China.',
    incidents: ['Mar 2013, Berbeka and Kowalski bivouac near here after the winter summit and die'],
  },
  {
    id: 'summit-ridge', name: 'Summit ridge', lat: 35.8106, lon: 76.5641, alt: 7950, radius: 320, severity: 5,
    kind: 'False summit · length · late descents',
    blurb: 'From the col the corniced ridge runs a kilometre and a half over the Rocky Summit (8,028 m) to the true top. Many stop at the fore-summit; the traverse back in the afternoon has killed the strongest.',
    incidents: ['9 Jun 1957, Buhl and Diemberger reach the true summit at 7 pm', '5 Mar 2013, two of the four winter summiters die on the descent'],
  },
  {
    id: 'central-ridge', name: 'Central ridge', lat: 35.8176, lon: 76.5643, alt: 7700, radius: 320, severity: 5,
    kind: 'Cornice · storm',
    blurb: 'The corniced crest between the main and central summits, where the 1975 Polish team was caught by a storm.',
    incidents: ['28 Jul 1975, Kęsicki, Nowaczyk and Sikorski die descending from Broad Peak Central'],
  },
  {
    id: 'north-ridge', name: 'North ridge', lat: 35.8238, lon: 76.5637, alt: 7500, radius: 350, severity: 4,
    kind: 'Cornice · length',
    blurb: 'The crest between the north and central summits, traversed once.',
    incidents: [],
  },
  {
    id: 'sw-face', name: 'Southwest Face', lat: 35.8059, lon: 76.5550, alt: 6600, radius: 400, severity: 5,
    kind: 'Avalanche · serac',
    blurb: 'Ice fields under the summit ridge, soloed once.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 35.8114, lon: 76.5650, alt: 8000, radius: 700, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'The whole summit ridge lies at or above 8,000 m, and it is walked twice, late in the day.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1892, title: 'Named', text: 'Martin Conway, seeing the mountain’s mile-wide summit from the Baltoro, names it Broad Peak after the Breithorn.' },
  { year: 1954, title: 'First attempt', text: 'Karl Herrligkoffer’s German expedition reaches about 6,900 m on the west spur in October cold.' },
  { year: 1957, title: 'Four men', text: 'Hermann Buhl, Kurt Diemberger, Marcus Schmuck and Fritz Wintersteller reach the summit on 9 June with no porters, oxygen or fixed camps. Buhl dies on Chogolisa three weeks later when a cornice breaks.' },
  { year: 1975, title: 'Central', text: 'Five Poles climb the 8,011 m central summit; three die in a storm on the descent.' },
  { year: 1977, title: 'Second ascent', text: 'A Japanese expedition makes the second ascent of the main summit, twenty years after the first.' },
  { year: 1984, title: 'The traverse', text: 'Jerzy Kukuczka and Wojciech Kurtyka traverse all three summits in alpine style over five days.' },
  { year: 1994, title: 'Carsolio', text: 'Carlos Carsolio solos a new route on the south-west face.' },
  { year: 2013, title: 'Winter', text: 'Four Poles make the first winter ascent on 5 March. Maciej Berbeka, who had reached the fore-summit in winter 25 years earlier, and Tomasz Kowalski die on the descent.' },
  { year: 2019, title: 'Commercial seasons', text: 'Fixed ropes to the col and shared logistics with K2 bring dozens of summits a year; the true summit remains a long way from the fore-summit where many turn back.' },
]

const stats = [
  { label: 'Height', value: '8,051 m', note: '12th highest on Earth' },
  { label: 'First ascent', value: '1957', note: 'Buhl, Diemberger, Schmuck & Wintersteller' },
  { label: 'Summits', value: '≈ 800', note: 'many stopping at the fore-summit' },
  { label: 'Deaths', value: '≈ 30', note: 'most on the summit ridge' },
  { label: 'Summit ridge', value: '1.5 km', note: 'above 8,000 m' },
  { label: 'Winter ascent', value: '2013', note: 'two of four died descending' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'broadpeak', peak, routes, hazards, timeline, stats, sources }
