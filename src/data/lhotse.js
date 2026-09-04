// Lhotse routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation. The ridge east of the main summit
// (Lhotse Middle, Lhotse Shar) is poorly resolved in the DEM; positions there are indicative.

const peak = {
  lat: 27.9617, lon: 86.9333, elevation: 8516, name: 'Lhotse', aka: 'Lhotse · the South Peak of Everest',
  range: 'Himalaya, Mahalangur Himal', countries: 'Nepal / China',
  tagline: 'The fourth highest mountain on Earth, climbed up Everest’s own face, with a 3,300 m south wall that defeated a generation.',
  summitText: 'A snow ridge a boot’s width wide, three kilometres from the top of Everest across the South Col. Behind it the crest runs east over Lhotse Middle, the highest unclimbed point on Earth until 2001, to Lhotse Shar. Nobody has crossed the whole of it.',
  summitBlurb: 'Fourth highest point on Earth, joined to Everest by the South Col. About 1,000 ascents, most by climbers adding it to Everest in the same season; the south face has been climbed only a handful of times.',
  figuresLead: 'A mountain most people climb on the way back from Everest, and a face almost nobody climbs at all.',
  otherLines: 'Lines climbed but not modelled here: the Polish south-face attempts of the 1970s and 80s, the Japanese and Slovenian south pillar attempts, and the Czech south-east face of Lhotse Shar (1984).',
  historyTitle: 'Seventy years',
  historyLead: 'From the Swiss double of 1956 to the couloir skied in 2018.',
}

const routes = [
  {
    id: 'normal',
    name: 'West Face',
    aka: 'Reiss Couloir · the normal route, shared with Everest to Camp 3',
    color: '#ff6a3d',
    firstAscent: '18 May 1956, Ernst Reiss & Fritz Luchsinger (Swiss expedition led by Albert Eggler), which also made the second ascent of Everest',
    share: '≈ 95% of all ascents',
    difficulty: 'The Everest route to the Lhotse Face, then a 40-50° ice face into a couloir two metres wide at 8,000 m',
    verticalGain: '≈ 3,150 m from Base Camp',
    summary:
      'Identical to the Everest route up the Khumbu Icefall and the Western Cwm to Camp 3, where the two lines part: Everest climbers traverse left to the South Col, Lhotse climbers go straight up the face into the Reiss Couloir, a gully that narrows to a chimney just below the summit. Many climb both peaks in one season, some within 24 hours.',
    waypoints: [
      [28.0025, 86.8555], // Base Camp
      [27.9972, 86.8668], // Khumbu Icefall
      [27.9918, 86.8782], // C1
      [27.9870, 86.8830], // floor of the Western Cwm
      [27.9847, 86.8933], // C2
      [27.9793, 86.9047],
      [27.9758, 86.9122], // foot of the face
      [27.9736, 86.9196], // C3
      [27.9706, 86.9230],
      [27.9686, 86.9253],
      [27.9667, 86.9276], // C4
      [27.9647, 86.9299], // Reiss Couloir
      [27.9637, 86.9310],
      [27.9627, 86.9322],
      [27.9617, 86.9333], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 5364, lat: 28.0025, lon: 86.8555, blurb: 'Everest Base Camp on the Khumbu Glacier; Lhotse teams share it, and the icefall ladders, with the Everest crowds.' },
      { name: 'Camp 1', alt: 6065, lat: 27.9918, lon: 86.8782, blurb: 'At the top of the Khumbu Icefall.' },
      { name: 'Camp 2', alt: 6400, lat: 27.9847, lon: 86.8933, blurb: 'Advanced Base at the head of the Western Cwm, below the full height of the Lhotse Face.' },
      { name: 'Camp 3', alt: 7200, lat: 27.9736, lon: 86.9196, blurb: 'On the Lhotse Face, the last camp shared with Everest.' },
      { name: 'Camp 4', alt: 7800, lat: 27.9667, lon: 86.9276, blurb: 'A few tents on ledges below the couloir; most summit pushes leave from here around midnight.' },
    ],
    hazards: ['khumbu-icefall', 'lhotse-face', 'reiss-couloir', 'summit-ridge', 'death-zone'],
  },
  {
    id: 'southface',
    name: 'South Face',
    aka: 'Soviet route, 1990 · the central pillar',
    color: '#c77dff',
    firstAscent: '16 October 1990, Sergei Bershov & Vladimir Karataev (Soviet expedition led by Alexander Shevchenko), reaching the summit at dusk',
    share: 'A handful of ascents; among the hardest faces in the Himalaya',
    difficulty: '3,300 m of ice and rock at up to 80°, siege-climbed with fixed rope; the top 500 m are technical rock above 8,000 m',
    verticalGain: '≈ 3,200 m from the Lhotse Glacier',
    summary:
      'The wall Messner called the hardest in the world. It repelled Polish, Yugoslav, Italian and Japanese expeditions through the 1980s and killed Jerzy Kukuczka in 1989. A large Soviet team finally forced the central pillar in the post-monsoon of 1990; Karataev lost most of his fingers and toes.',
    waypoints: [
      [27.9280, 86.9420], // Base Camp
      [27.9368, 86.9386],
      [27.9413, 86.9376], // C1
      [27.9459, 86.9367],
      [27.9504, 86.9357], // C2
      [27.9526, 86.9352],
      [27.9549, 86.9347], // C3
      [27.9572, 86.9343], // C4
      [27.9594, 86.9338],
      [27.9617, 86.9333], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 5500, lat: 27.9280, lon: 86.9420, blurb: 'On the Lhotse Glacier above Chukhung, facing the whole wall.' },
      { name: 'Camp 1', alt: 5900, lat: 27.9413, lon: 86.9376, blurb: 'At the foot of the face, below the first ice barrier.' },
      { name: 'Camp 2', alt: 6500, lat: 27.9504, lon: 86.9357, blurb: 'A snow cave on the pillar.' },
      { name: 'Camp 3', alt: 7100, lat: 27.9549, lon: 86.9347, blurb: 'Hanging tents below the rock band.' },
      { name: 'Camp 4', alt: 7500, lat: 27.9572, lon: 86.9343, blurb: 'The highest camp; from here the 1990 summit pair climbed the rock headwall and returned in the dark.' },
    ],
    hazards: ['south-face', 'south-headwall', 'summit-ridge', 'death-zone'],
  },
  {
    id: 'cesen',
    name: 'South Face, Česen line',
    aka: 'The disputed solo, April 1990',
    color: '#ffc14d',
    firstAscent: '22–24 April 1990, claimed by Tomo Česen (Slovenia), solo and without oxygen; unverified, and doubted by most of the climbing world',
    share: 'One claimed ascent',
    difficulty: 'Ice runnels and a rock headwall on the left side of the face, climbed at night to avoid rockfall',
    verticalGain: '≈ 3,300 m from the glacier',
    summary:
      'Česen reported climbing the left-hand side of the face alone in 46 hours, mostly at night, with two bivouacs and no rope, and descending the same way. With no summit photographs and contradicting accounts, the ascent remains the most argued-over in Himalayan history; it is shown here as claimed.',
    waypoints: [
      [27.9320, 86.9250], // glacier
      [27.9394, 86.9271],
      [27.9444, 86.9285],
      [27.9493, 86.9298], // bivouac 1
      [27.9518, 86.9305],
      [27.9543, 86.9312],
      [27.9567, 86.9319], // bivouac 2
      [27.9592, 86.9326],
      [27.9617, 86.9333], // Summit
    ],
    camps: [
      { name: 'Bivouac 1', alt: 6000, lat: 27.9493, lon: 86.9298, blurb: 'A snow hole at the foot of the upper face, dug at dawn.' },
      { name: 'Bivouac 2', alt: 7400, lat: 27.9567, lon: 86.9319, blurb: 'The reported second night, on a ledge below the headwall.' },
    ],
    hazards: ['south-face', 'south-headwall', 'death-zone'],
  },
  {
    id: 'shar',
    name: 'Lhotse Shar',
    aka: 'South-east Ridge · the 1970 Austrian route',
    color: '#5fd3ff',
    firstAscent: '12 May 1970, Sepp Mayerl & Rolf Walter (Austria), on the ridge that faces the Imja valley',
    share: 'A dozen ascents',
    difficulty: 'A long, corniced snow and ice ridge with rock towers, exposed to avalanche from the faces on both sides',
    verticalGain: '≈ 2,900 m from the Lhotse Shar Glacier',
    summary:
      'The eastern summit, 8,383 m, is a separate objective with its own history: the ridge from the south-east was climbed in 1970, and the wall below it took several lives before the Czechs climbed the face in 1984. The traverse from Shar over Middle to the main summit is still undone.',
    waypoints: [
      [27.9300, 86.9700], // Base Camp
      [27.9380, 86.9680],
      [27.9450, 86.9700], // C1
      [27.9495, 86.9640], // C2
      [27.9525, 86.9600],
      [27.9540, 86.9580], // C3
      [27.9555, 86.9560],
      [27.9570, 86.9500], // east ridge
      [27.9580, 86.9470],
      [27.9588, 86.9438], // Lhotse Shar
    ],
    camps: [
      { name: 'Base Camp', alt: 5500, lat: 27.9300, lon: 86.9700, blurb: 'On the Lhotse Shar Glacier below Island Peak, a trekking peak that stands in the shadow of the wall.' },
      { name: 'Camp 1', alt: 6500, lat: 27.9450, lon: 86.9700, blurb: 'On the glacier shelf below the ridge.' },
      { name: 'Camp 2', alt: 6850, lat: 27.9495, lon: 86.9640, blurb: 'Where the ridge steepens into ice.' },
      { name: 'Camp 3', alt: 7450, lat: 27.9540, lon: 86.9580, blurb: 'Below the summit towers.' },
    ],
    hazards: ['shar-ridge', 'summit-ridge', 'death-zone'],
    finish: { title: 'Lhotse Shar', alt: 8383, body: 'The eastern summit, 8,383 m. West of here the ridge climbs over Lhotse Middle to the main top; that traverse has never been completed.' },
  },
  {
    id: 'middle',
    name: 'Lhotse Middle',
    aka: 'The last unclimbed 8,000 m point · Russian route, 2001',
    color: '#7dffb3',
    firstAscent: '23 May 2001, Evgeny Vinogradsky, Sergei Timofeev, Alexei Bolotov & Petr Kuznetsov (Russia), from the normal route',
    share: 'One ascent',
    difficulty: 'The normal route to the couloir, then a technical traverse of the summit ridge above 8,000 m to a rock tower',
    verticalGain: '≈ 600 m of ridge above the couloir',
    summary:
      'A rock and snow tower on the ridge between the main summit and Lhotse Shar, at 8,410 m the highest point on Earth still unclimbed at the start of the century. A Russian team reached it in 2001 by climbing the normal route’s couloir and then traversing east along the crest, fixing rope on rock at 8,300 m.',
    waypoints: [
      [27.9667, 86.9276], // C4 on the normal route
      [27.9647, 86.9299],
      [27.9637, 86.9310],
      [27.9622, 86.9328], // below the main summit
      [27.9615, 86.9350], // ridge camp
      [27.9610, 86.9365],
      [27.9607, 86.9376], // Lhotse Middle
    ],
    camps: [
      { name: 'Camp 4', alt: 7800, lat: 27.9667, lon: 86.9276, blurb: 'The normal route’s high camp, shared with the West Face climbers.' },
      { name: 'Ridge camp', alt: 8150, lat: 27.9615, lon: 86.9350, blurb: 'A tent platform on the crest east of the main summit, the highest camp of the 2001 climb.' },
    ],
    hazards: ['reiss-couloir', 'summit-ridge', 'death-zone'],
    finish: { title: 'Lhotse Middle', alt: 8410, body: 'A rock tower on the crest, climbed once. The ridge continues east to Lhotse Shar; the full traverse of the three summits remains one of the great unclimbed lines of the Himalaya.' },
  },
]

const hazards = [
  {
    id: 'khumbu-icefall', name: 'Khumbu Icefall', lat: 27.9972, lon: 86.8668, alt: 5700, radius: 420, severity: 5,
    kind: 'Serac collapse · crevasses',
    blurb: 'A 700 m tumbling glacier crossed on ladders before dawn, shared with every Everest climber. It has killed more people than any other feature in the valley.',
    incidents: ['18 Apr 2014, serac avalanche kills 16 Nepali workers'],
  },
  {
    id: 'lhotse-face', name: 'Lhotse Face', lat: 27.9736, lon: 86.9200, alt: 7200, radius: 350, severity: 4,
    kind: 'Ice · falls · rockfall',
    blurb: 'A 1,200 m sheet of blue ice at 40-50°, the mountain’s own west face. Rock and ice fall from above, and anyone who unclips can slide the whole face.',
    incidents: [],
  },
  {
    id: 'reiss-couloir', name: 'Reiss Couloir', lat: 27.9647, lon: 86.9299, alt: 8050, radius: 200, severity: 5,
    kind: 'Rockfall · narrow couloir · queues',
    blurb: 'A gully that narrows to two metres at 8,000 m, where climbers going up and down share one rope. After sunrise the rock above sheds stones straight down it.',
    incidents: ['2023, a record season on the couloir; several climbers rescued from the upper face'],
  },
  {
    id: 'south-face', name: 'South Face', lat: 27.9500, lon: 86.9360, alt: 6500, radius: 420, severity: 5,
    kind: 'Avalanche · serac · rockfall',
    blurb: 'Three thousand three hundred metres of wall swept by avalanches from the summit ridge and rockfall from the headwall.',
    incidents: ['24 Oct 1989, Jerzy Kukuczka falls to his death at 8,200 m when an old fixed rope breaks', '1990, Tomo Česen’s solo claim disputed'],
  },
  {
    id: 'south-headwall', name: 'The headwall', lat: 27.9594, lon: 86.9338, alt: 8100, radius: 200, severity: 5,
    kind: 'Technical rock above 8,000 m',
    blurb: 'Five hundred metres of steep rock at the top of the face, where the 1990 Soviet pair climbed into the night and Karataev lost his fingers.',
    incidents: [],
  },
  {
    id: 'summit-ridge', name: 'Summit ridge', lat: 27.9612, lon: 86.9383, alt: 8250, radius: 420, severity: 5,
    kind: 'Cornice · unclimbed traverse',
    blurb: 'The crest between the main summit, Lhotse Middle and Lhotse Shar: corniced over the south face, rock towers on the north side, never traversed in full.',
    incidents: [],
  },
  {
    id: 'shar-ridge', name: 'South-east ridge', lat: 27.9525, lon: 86.9600, alt: 7250, radius: 350, severity: 4,
    kind: 'Avalanche · exposure',
    blurb: 'A long ridge of cornices and towers with avalanche-prone faces on both sides; the approach below it was the site of several early deaths.',
    incidents: ['1974, Polish and Austrian attempts abandoned after avalanches'],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 27.9617, lon: 86.9333, alt: 8000, radius: 1000, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Above 8,000 m the body can no longer acclimatise. Lhotse’s summit day climbs 700 m into it up a couloir, and back down the same rope in the afternoon.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1921, title: 'Named', text: 'The British reconnaissance expedition records the peak as Lhotse, Tibetan for “south peak”, of Everest.' },
  { year: 1955, title: 'First attempt', text: 'Norman Dyhrenfurth’s international expedition reaches about 8,100 m on the west face in October before the wind drives them down.' },
  { year: 1956, title: 'First ascent', text: 'Ernst Reiss and Fritz Luchsinger climb the couloir to the summit on 18 May; five days later the same Swiss expedition makes the second ascent of Everest.' },
  { year: 1970, title: 'Lhotse Shar', text: 'Sepp Mayerl and Rolf Walter climb the eastern summit by its south-east ridge.' },
  { year: 1977, title: 'Without oxygen', text: 'A German team led by Michael Dacher makes the first ascent without bottled oxygen.' },
  { year: 1986, title: 'Messner’s fourteenth', text: 'Reinhold Messner reaches the summit with Hans Kammerlander on 16 October, completing the first collection of all fourteen 8,000 m peaks.' },
  { year: 1988, title: 'Winter, alone', text: 'Krzysztof Wielicki climbs the normal route solo on 31 December, the first winter ascent, wearing a brace for a back injury.' },
  { year: 1989, title: 'Kukuczka', text: 'Jerzy Kukuczka, the second man to climb all fourteen, dies on the south face on 24 October when a worn fixed rope breaks at 8,200 m.' },
  { year: 1990, title: 'The south face', text: 'In April Tomo Česen claims a solo ascent of the face that is doubted to this day. In October Sergei Bershov and Vladimir Karataev reach the summit by the central pillar for a Soviet expedition, the first undisputed ascent of the wall.' },
  { year: 1996, title: 'First woman', text: 'Chantal Mauduit climbs Lhotse without oxygen on 10 May, the day the Everest storm begins across the South Col.' },
  { year: 2001, title: 'Lhotse Middle', text: 'A Russian team climbs the 8,410 m middle summit, the last unclimbed 8,000 m point on Earth.' },
  { year: 2011, title: 'The double', text: 'Michael Horst climbs Everest and Lhotse within 24 hours; the Everest–Lhotse link-up becomes a regular commercial offer.' },
  { year: 2018, title: 'Skied', text: 'Hilaree Nelson and Jim Morrison ski from the summit down the Reiss Couloir on 30 September, the first descent of the Lhotse Couloir.' },
]

const stats = [
  { label: 'Height', value: '8,516 m', note: '4th highest on Earth' },
  { label: 'First ascent', value: '1956', note: 'Reiss & Luchsinger' },
  { label: 'Summits', value: '≈ 1,000', note: 'most in the same season as Everest' },
  { label: 'Deaths', value: '≈ 25', note: 'about one per forty summits' },
  { label: 'South face', value: '3,300 m', note: 'climbed only a handful of times' },
  { label: 'Lhotse Middle', value: '2001', note: 'last unclimbed 8,000 m point' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'lhotse', peak, routes, hazards, timeline, stats, sources }
