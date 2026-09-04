// Dhaulagiri I routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 28.6983, lon: 83.4875, elevation: 8167, name: 'Dhaulagiri', aka: 'Dhaulagiri I · the White Mountain',
  range: 'Himalaya, Dhaulagiri Himal', countries: 'Nepal',
  tagline: 'The seventh highest mountain on Earth, once believed the highest of all: a colossal white wedge above the deepest gorge in the world.',
  summitText: 'A corniced crest above 4,000 m walls on every side. Annapurna stands across the Kali Gandaki, the gorge between the two summits the deepest on Earth. The Swiss reached this point in 1960 with the help of an aeroplane; the ridge below has killed more than seventy people since.',
  summitBlurb: 'Seventh highest point on Earth and, for thirty years after its survey in 1808, believed the highest. About 600 ascents and 80 deaths, the second worst ratio of the fourteen after Annapurna.',
  figuresLead: 'A mountain climbed by a few hundred people, on which one climber in seven has not come home.',
  otherLines: 'Lines climbed but not modelled here: the East Face (Kurtyka, MacIntyre, Wilczyński and Ghilini, 1980, alpine style), the Pear Buttress of the 1950s attempts, and the Japanese north-west ridge.',
  historyTitle: 'Two hundred years',
  historyLead: 'From the highest mountain in the world, briefly, to the Swiss aeroplane and the avalanches.',
}

const routes = [
  {
    id: 'normal',
    name: 'Northeast Ridge',
    aka: 'The Swiss route · the normal route',
    color: '#ff6a3d',
    firstAscent: '13 May 1960, Kurt Diemberger, Peter Diener, Ernst Forrer, Albin Schelbert, Nyima Dorje & Nawang Dorje (Swiss expedition led by Max Eiselin)',
    share: '≈ 90% of all ascents',
    difficulty: 'Glacier and serac-threatened slopes to the North-east Col, then a long snow and ice ridge at 40-50° with a corniced finish',
    verticalGain: '≈ 3,400 m from Base Camp',
    summary:
      'From the Chhonbardan Glacier around the foot of the north face and up the icefall to the North-east Col, then up the ridge the Austrians and Swiss tried in the late 1950s. The 1960 expedition flew its camps to the col in a Pilatus Porter, the first mountaineering airlift; the plane later crashed on the Dampus Pass, and the climbers walked up anyway.',
    waypoints: [
      [28.7472, 83.4995], // Base Camp
      [28.7440, 83.4980],
      [28.7420, 83.5040],
      [28.7400, 83.5100],
      [28.7350, 83.5135],
      [28.7300, 83.5170], // icefall
      [28.7255, 83.5195],
      [28.7210, 83.5220],
      [28.7150, 83.5250], // NE Col, C1
      [28.7130, 83.5195],
      [28.7110, 83.5140],
      [28.7103, 83.5088],
      [28.7097, 83.5036], // C2
      [28.7059, 83.4982], // C3
      [28.7040, 83.4955], // C4
      [28.7021, 83.4929],
      [28.7002, 83.4902],
      [28.6983, 83.4875], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 4750, lat: 28.7472, lon: 83.4995, blurb: 'On the Chhonbardan Glacier under the north face, 4 km below the French Pass; reached over the pass from Marpha or up the Myagdi Khola from Darbang.' },
      { name: 'Camp 1', alt: 5750, lat: 28.7150, lon: 83.5250, blurb: 'On the North-east Col, where the Swiss landed their Pilatus Porter in 1960. The wind blows through it from Tibet.' },
      { name: 'Camp 2', alt: 6600, lat: 28.7097, lon: 83.5036, blurb: 'On the ridge above the col; the slopes below load with windslab.' },
      { name: 'Camp 3', alt: 7200, lat: 28.7059, lon: 83.4982, blurb: 'A cramped platform on the crest.' },
      { name: 'Camp 4', alt: 7500, lat: 28.7040, lon: 83.4955, blurb: 'The last camp, below the summit slopes and their false tops. Summit day is eight to twelve hours.' },
    ],
    hazards: ['north-face-serac', 'ne-col', 'ridge-slopes', 'summit-traverse', 'death-zone'],
  },
  {
    id: 'westface',
    name: 'West Face',
    aka: 'Czechoslovak route, 1984',
    color: '#c77dff',
    firstAscent: 'October 1984, a Czechoslovak expedition, up the 4,000 m face that dominates the Chhonbardan Glacier',
    share: 'Rarely repeated',
    difficulty: 'Four thousand metres of ice and rock bands, among the biggest faces in the Himalaya',
    verticalGain: '≈ 4,000 m from the glacier',
    summary:
      'The wall that fills the sky above Base Camp, rising four vertical kilometres from the glacier to the summit. The Czechoslovaks climbed it in the post-monsoon of 1984 in a long siege, one of the last of the great faces to fall.',
    waypoints: [
      [28.7000, 83.4350], // glacier
      [28.6994, 83.4525],
      [28.6991, 83.4613], // C1
      [28.6989, 83.4700], // C2
      [28.6987, 83.4744], // C3
      [28.6986, 83.4787], // C4
      [28.6984, 83.4831],
      [28.6983, 83.4875], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5000, lat: 28.6991, lon: 83.4613, blurb: 'At the foot of the face on the glacier.' },
      { name: 'Camp 2', alt: 5900, lat: 28.6989, lon: 83.4700, blurb: 'Below the first ice band.' },
      { name: 'Camp 3', alt: 6500, lat: 28.6987, lon: 83.4744, blurb: 'A ledge in the middle of the wall.' },
      { name: 'Camp 4', alt: 7000, lat: 28.6986, lon: 83.4787, blurb: 'Under the summit headwall.' },
    ],
    hazards: ['west-face', 'summit-traverse', 'death-zone'],
  },
  {
    id: 'swpillar',
    name: 'Southwest Pillar',
    aka: 'Japanese route, 1978',
    color: '#7dffb3',
    firstAscent: '10–11 May 1978, a Japanese expedition (Takashi Amemiya among the summit party), after several attempts on the pillar through the 1970s',
    share: 'Rarely repeated',
    difficulty: 'A rock and ice pillar with serac bands, sustained above 6,500 m',
    verticalGain: '≈ 3,700 m from the glacier',
    summary:
      'The pillar between the west and south faces, tried by Japanese teams several times before it was climbed in 1978. Long, exposed to serac fall from the faces on both sides, and almost never repeated.',
    waypoints: [
      [28.6700, 83.4450], // glacier
      [28.6771, 83.4556],
      [28.6818, 83.4627], // C1
      [28.6865, 83.4698], // C2
      [28.6889, 83.4733], // C3
      [28.6912, 83.4769],
      [28.6936, 83.4804], // C4
      [28.6959, 83.4840],
      [28.6983, 83.4875], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5450, lat: 28.6818, lon: 83.4627, blurb: 'Where the pillar rises from the glacier.' },
      { name: 'Camp 2', alt: 6200, lat: 28.6865, lon: 83.4698, blurb: 'On the crest of the pillar.' },
      { name: 'Camp 3', alt: 6950, lat: 28.6889, lon: 83.4733, blurb: 'Below the upper rock.' },
      { name: 'Camp 4', alt: 7400, lat: 28.6936, lon: 83.4804, blurb: 'The highest camp, on the summit slopes.' },
    ],
    hazards: ['sw-pillar', 'summit-traverse', 'death-zone'],
  },
  {
    id: 'southface',
    name: 'South Face',
    aka: 'Humar’s solo, 1999',
    color: '#ffc14d',
    firstAscent: '25 October – 2 November 1999, Tomaž Humar (Slovenia), solo, to the south-east ridge at about 8,000 m; the face direct to the summit remains unclimbed',
    share: 'One ascent to the ridge',
    difficulty: 'A 4,000 m face of rotten rock and ice at up to 90°, swept by avalanches; climbed alone with a broken finger and no rope for most of it',
    verticalGain: '≈ 2,700 m from the glacier to the ridge',
    summary:
      'The biggest unclimbed face in the Himalaya until 1999, and still unclimbed to the summit. Humar spent nine days alone on it, broadcast live to Slovenia, and escaped onto the south-east ridge at 8,000 m below the summit, then descended the normal route.',
    waypoints: [
      [28.6550, 83.4900], // glacier
      [28.6694, 83.4892],
      [28.6730, 83.4890],
      [28.6767, 83.4887], // foot of the face
      [28.6803, 83.4885], // bivouac
      [28.6839, 83.4883],
      [28.6875, 83.4881], // bivouac
      [28.6911, 83.4879],
      [28.6935, 83.4895],
      [28.6955, 83.4910], // south-east ridge
    ],
    camps: [
      { name: 'Glacier camp', alt: 5300, lat: 28.6730, lon: 83.4890, blurb: 'Below the face; the 1999 base with its satellite link.' },
      { name: 'Bivouac 1', alt: 6700, lat: 28.6803, lon: 83.4885, blurb: 'A snow hole in the middle of the face.' },
      { name: 'Bivouac 2', alt: 7500, lat: 28.6875, lon: 83.4881, blurb: 'The last night on the face, under the rock band.' },
    ],
    hazards: ['south-face', 'death-zone'],
    finish: { title: 'Southeast ridge, 8,000 m', alt: 8000, body: 'Humar reached the ridge here and, with his fingers frostbitten and the face behind him, chose to descend the normal route rather than continue 170 m to the summit. The face direct is still unclimbed.' },
  },
  {
    id: 'seridge',
    name: 'Southeast Ridge',
    aka: 'The 1969 line · climbed 1978',
    color: '#5fd3ff',
    firstAscent: '19–20 October 1978, a Japanese expedition (Seiko Tanaka), on the ridge where the American expedition was destroyed by an avalanche in 1969; one member, Kogure, was killed',
    share: 'Rarely repeated',
    difficulty: 'A long ridge from the Kali Gandaki side, with an avalanche-prone approach and corniced upper crest',
    verticalGain: '≈ 3,800 m from the glacier',
    summary:
      'The ridge that rises from the Myagdi side to the summit. In April 1969 an avalanche at its foot killed seven members of Boyd Everett’s American expedition; the Japanese climbed the ridge nine years later.',
    waypoints: [
      [28.6650, 83.5300], // glacier
      [28.6733, 83.5194],
      [28.6789, 83.5123], // C1
      [28.6816, 83.5087], // C2
      [28.6844, 83.5052],
      [28.6872, 83.5017], // C3
      [28.6900, 83.4981], // C4
      [28.6928, 83.4946], // C5
      [28.6955, 83.4910],
      [28.6983, 83.4875], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5100, lat: 28.6789, lon: 83.5123, blurb: 'At the foot of the ridge, the site of the 1969 disaster.' },
      { name: 'Camp 2', alt: 5750, lat: 28.6816, lon: 83.5087, blurb: 'On the lower crest.' },
      { name: 'Camp 3', alt: 6600, lat: 28.6872, lon: 83.5017, blurb: 'Below the rock steps.' },
      { name: 'Camp 4', alt: 7000, lat: 28.6900, lon: 83.4981, blurb: 'On the upper ridge.' },
      { name: 'Camp 5', alt: 7570, lat: 28.6928, lon: 83.4946, blurb: 'The highest camp, below the summit crest.' },
    ],
    hazards: ['se-ridge-approach', 'summit-traverse', 'death-zone'],
  },
]

const hazards = [
  {
    id: 'north-face-serac', name: 'North face seracs', lat: 28.7380, lon: 83.5080, alt: 4950, radius: 420, severity: 5,
    kind: 'Serac fall · avalanche',
    blurb: 'The approach from Base Camp to the icefall and the North-east Col runs beneath the hanging glaciers of the north face; the crossing is done before dawn and never in fresh snow.',
    incidents: [],
  },
  {
    id: 'ne-col', name: 'Northeast Col', lat: 28.7150, lon: 83.5250, alt: 5750, radius: 320, severity: 3,
    kind: 'Wind · crevasses',
    blurb: 'Camp 1 sits on the col where the Swiss landed a light aircraft in 1960, the first mountaineering airlift; the plane crashed on the Dampus Pass a few days later and the expedition finished on foot.',
    incidents: [],
  },
  {
    id: 'ridge-slopes', name: 'Ridge slopes', lat: 28.7078, lon: 83.5009, alt: 6900, radius: 320, severity: 4,
    kind: 'Windslab · exposure',
    blurb: 'The snow slopes between Camps 2 and 3 load with windslab after every storm and have avalanched onto fixed lines repeatedly.',
    incidents: ['1998, Chantal Mauduit and Ang Tshering die when their tent at Camp 2 is buried by an avalanche', 'Oct 1999, Ginette Harrison killed by an avalanche between Camps 2 and 3'],
  },
  {
    id: 'summit-traverse', name: 'Summit crest', lat: 28.7010, lon: 83.4900, alt: 7900, radius: 260, severity: 4,
    kind: 'Cornice · false summits · late descents',
    blurb: 'A series of false tops on a corniced crest; many summit claims have stopped short, and many descents have run into the dark.',
    incidents: ['2010, three climbers die in a single week on the descent from the summit'],
  },
  {
    id: 'west-face', name: 'West Face', lat: 28.6987, lon: 83.4744, alt: 6500, radius: 450, severity: 5,
    kind: 'Rockfall · ice · 4,000 m of wall',
    blurb: 'Four kilometres of vertical relief from the glacier, threatened by rockfall and ice avalanche along its whole width.',
    incidents: [],
  },
  {
    id: 'sw-pillar', name: 'Southwest Pillar', lat: 28.6865, lon: 83.4698, alt: 6200, radius: 350, severity: 4,
    kind: 'Serac · rock',
    blurb: 'Exposed to serac fall from the faces on both sides of the crest.',
    incidents: [],
  },
  {
    id: 'south-face', name: 'South Face', lat: 28.6803, lon: 83.4885, alt: 6700, radius: 420, severity: 5,
    kind: 'Avalanche · serac · rockfall',
    blurb: 'A 4,000 m wall of loose rock and ice, still unclimbed to the summit, swept by everything that falls off the crest.',
    incidents: ['1999, Tomaž Humar spends nine days alone on the face'],
  },
  {
    id: 'se-ridge-approach', name: 'Southeast ridge approach', lat: 28.6789, lon: 83.5123, alt: 5100, radius: 420, severity: 5,
    kind: 'Avalanche',
    blurb: 'The slopes at the foot of the ridge, loaded by every storm off the Kali Gandaki.',
    incidents: ['28 Apr 1969, an avalanche kills five Americans, including leader Boyd Everett, and two Sherpas'],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 28.6983, lon: 83.4875, alt: 8000, radius: 900, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Only the summit crest lies above 8,000 m, but its false tops and cornices are crossed late in the day by tired climbers.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1808, title: 'The highest mountain', text: 'British surveyors measure Dhaulagiri from the plains and declare it the highest mountain in the world, a title it holds until Kangchenjunga is measured thirty years later.' },
  { year: 1950, title: 'Herzog looks away', text: 'The French expedition finds no feasible line on Dhaulagiri after weeks of searching, and turns to Annapurna instead.' },
  { year: 1954, title: 'Argentina', text: 'An Argentine expedition reaches about 8,000 m on the Pear Buttress; Francisco Ibáñez dies of frostbite complications.' },
  { year: 1960, title: 'The aeroplane', text: 'Max Eiselin’s Swiss expedition flies its supplies to the North-east Col in a Pilatus Porter. On 13 May Kurt Diemberger, Peter Diener, Ernst Forrer, Albin Schelbert, Nyima Dorje and Nawang Dorje reach the summit.' },
  { year: 1969, title: 'The American disaster', text: 'An avalanche at the foot of the south-east ridge kills seven, including expedition leader Boyd Everett.' },
  { year: 1978, title: 'New lines', text: 'Japanese expeditions climb the south-west pillar and the south-east ridge in the same year.' },
  { year: 1980, title: 'East Face', text: 'Voytek Kurtyka, Alex MacIntyre, Ludwik Wilczyński and René Ghilini climb the east face in alpine style, a landmark of the lightweight revolution.' },
  { year: 1984, title: 'West Face', text: 'A Czechoslovak expedition climbs the 4,000 m west face.' },
  { year: 1985, title: 'Winter', text: 'Jerzy Kukuczka and Andrzej Czok make the first winter ascent on 21 January.' },
  { year: 1998, title: 'Mauduit', text: 'Chantal Mauduit, with six 8,000 m peaks, dies with Ang Tshering when an avalanche buries their tent at Camp 2.' },
  { year: 1999, title: 'Humar', text: 'Tomaž Humar climbs the south face alone over nine days, live on Slovenian television, and escapes onto the ridge at 8,000 m. In the autumn Ginette Harrison is killed by an avalanche on the normal route.' },
  { year: 2010, title: 'Bad week', text: 'Three climbers die within days on the descent from the summit; the mountain’s fatality rate remains the second worst of the fourteen.' },
]

const stats = [
  { label: 'Height', value: '8,167 m', note: '7th highest on Earth' },
  { label: 'First ascent', value: '1960', note: 'Swiss expedition' },
  { label: 'Summits', value: '≈ 600', note: 'nearly all by the north-east ridge' },
  { label: 'Deaths', value: '≈ 80', note: 'about one for every seven summits' },
  { label: 'Winter ascent', value: '1985', note: 'Kukuczka & Czok' },
  { label: 'Kali Gandaki', value: '7,000 m', note: 'deep between here and Annapurna' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'dhaulagiri', peak, routes, hazards, timeline, stats, sources }
