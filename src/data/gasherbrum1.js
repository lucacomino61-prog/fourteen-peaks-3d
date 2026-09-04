// Gasherbrum I (Hidden Peak) routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 35.7242, lon: 76.6964, elevation: 8080, name: 'Gasherbrum I', aka: 'Hidden Peak · K5',
  range: 'Karakoram, Gasherbrum group', countries: 'Pakistan / China',
  tagline: 'The eleventh highest mountain on Earth, hidden at the head of the Baltoro behind its own neighbours, and the first 8,000 m peak climbed in alpine style.',
  summitText: 'A rounded snow summit on a high plateau, invisible from the Baltoro Glacier that gives it its name. Messner and Habeler stood here in 1975 after three days from base camp with no fixed rope or camps, and changed what Himalayan climbing meant.',
  summitBlurb: 'Eleventh highest point on Earth, at the head of the Baltoro Glacier on the Pakistan–China border. About 450 ascents and 35 deaths; usually climbed in the same season as Gasherbrum II from a shared base camp.',
  figuresLead: 'A quiet giant that most people climb as the second half of a Gasherbrum double.',
  otherLines: 'Lines climbed but not modelled here: the 1985 Polish north face, the 1980 French south ridge, and the 1990 Slovenian south face variations.',
  historyTitle: 'Ninety years',
  historyLead: 'From the 1934 reconnaissance to the winter ascent of 2012.',
}

const routes = [
  {
    id: 'couloir',
    name: 'Japanese Couloir',
    aka: 'Northwest Face · the normal route',
    color: '#ff6a3d',
    firstAscent: 'Climbed in 1981 (an Italian party first, then the Japanese expedition that gave it its name); the standard route since the mid-1980s',
    share: '≈ 80% of all ascents',
    difficulty: 'The Gasherbrum icefall, then a 600 m couloir at 45-55° to the north-west ridge, and long summit slopes',
    verticalGain: '≈ 3,000 m from Base Camp',
    summary:
      'Up the South Gasherbrum Glacier icefall, shared with Gasherbrum II, to the basin below the Gasherbrum La; then the couloir that splits the north-west face to the crest, and the summit slopes. Steeper than its neighbour, and the couloir is a stone chute after the sun reaches it.',
    waypoints: [
      [35.7450, 76.5800], // Base Camp
      [35.7400, 76.6400],
      [35.7306, 76.6581], // C1
      [35.7369, 76.6694],
      [35.7400, 76.6750], // C2
      [35.7353, 76.6814],
      [35.7321, 76.6857], // couloir
      [35.7305, 76.6878], // C3
      [35.7274, 76.6921],
      [35.7258, 76.6943],
      [35.7242, 76.6964], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 5050, lat: 35.7450, lon: 76.5800, blurb: 'On the Abruzzi Glacier where the South Gasherbrum Glacier joins it, shared by every Gasherbrum I and II expedition; a week’s walk up the Baltoro from Askole.' },
      { name: 'Camp 1', alt: 5900, lat: 35.7306, lon: 76.6581, blurb: 'Above the icefall on the South Gasherbrum Glacier, the fork between the two Gasherbrums.' },
      { name: 'Camp 2', alt: 6400, lat: 35.7400, lon: 76.6750, blurb: 'In the basin below the Gasherbrum La, at the foot of the couloir.' },
      { name: 'Camp 3', alt: 7100, lat: 35.7305, lon: 76.6878, blurb: 'At the top of the couloir on the north-west ridge. Summit day from here is ten to fourteen hours.' },
    ],
    hazards: ['gasherbrum-icefall', 'japanese-couloir', 'summit-slopes', 'death-zone'],
  },
  {
    id: 'messner',
    name: 'Northwest Face',
    aka: 'Messner–Habeler, 1975 · the first alpine-style 8,000er',
    color: '#ffc14d',
    firstAscent: '10 August 1975, Reinhold Messner & Peter Habeler (Tyrol / Austria), in three days from base camp with a single tent and no fixed rope',
    share: 'Historic; the modern route runs beside it',
    difficulty: 'An ice face at 50-60° with a rock band, climbed without camps',
    verticalGain: '≈ 3,000 m from Base Camp',
    summary:
      'Two men, one tent, twelve kilograms each: Messner and Habeler climbed the unclimbed north-west face and were back at base camp in five days, proving an 8,000 m peak could be climbed like an alpine route. The modern normal route follows the couloir just to the right.',
    waypoints: [
      [35.7450, 76.5800], // Base Camp
      [35.7400, 76.6400],
      [35.7306, 76.6581], // C1
      [35.7400, 76.6750], // bivouac
      [35.7360, 76.6820],
      [35.7330, 76.6870], // bivouac
      [35.7290, 76.6920],
      [35.7242, 76.6964], // Summit
    ],
    camps: [
      { name: 'Bivouac 1', alt: 5900, lat: 35.7306, lon: 76.6581, blurb: 'The first night, above the icefall.' },
      { name: 'Bivouac 2', alt: 6400, lat: 35.7400, lon: 76.6750, blurb: 'At the foot of the face, the tent pitched in the evening.' },
      { name: 'Bivouac 3', alt: 7100, lat: 35.7330, lon: 76.6870, blurb: 'On the face itself, the third night; the summit and the return to this tent took the next day.' },
    ],
    hazards: ['gasherbrum-icefall', 'nw-face', 'summit-slopes', 'death-zone'],
  },
  {
    id: 'roch',
    name: 'Roch Arête',
    aka: 'The 1958 American route · IHE spur / south-east ridge · the first ascent',
    color: '#5fd3ff',
    firstAscent: '5 July 1958, Pete Schoening & Andy Kauffman (American expedition led by Nick Clinch), by the spur reconnoitred by André Roch in 1934',
    share: 'Historic; rarely repeated',
    difficulty: 'A glacier bench and a long rib to the summit plateau, then the plateau, the upper snow bowl and a short couloir to the crest',
    verticalGain: '≈ 2,500 m from the glacier',
    summary:
      'The line of the first ascent: from the upper Abruzzi Glacier up the spur on the south side that the 1934 International Himalayan Expedition (Roch and Ertl) had identified and the French pushed to 6,800 m in 1936, to the high plateau, then a long summit day. Schoening, the man whose ice-axe belay had saved five on K2 in 1953, reached the top with Kauffman, the only 8,000 m first ascent by Americans.',
    waypoints: [
      [35.6860, 76.7000], // upper Abruzzi Glacier bench
      [35.6890, 76.7000], // C1
      [35.6920, 76.6950],
      [35.6948, 76.6928], // C2
      [35.6975, 76.6921], // C3, ice dome
      [35.7000, 76.6918], // C4, plateau edge
      [35.7035, 76.6924],
      [35.7057, 76.6943],
      [35.7080, 76.6975], // plateau
      [35.7120, 76.7000], // C5
      [35.7152, 76.6985],
      [35.7184, 76.6971], // upper snow bowl
      [35.7213, 76.6968], // couloir to the crest
      [35.7242, 76.6964], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5640, lat: 35.6890, lon: 76.7000, blurb: 'At the base of the arête, above the bench of the upper Abruzzi Glacier.' },
      { name: 'Camp 2', alt: 6400, lat: 35.6948, lon: 76.6928, blurb: 'Behind a rock buttress on the rib.' },
      { name: 'Camp 3', alt: 6700, lat: 35.6975, lon: 76.6921, blurb: 'On an ice dome on the crest of the spur.' },
      { name: 'Camp 4', alt: 6860, lat: 35.7000, lon: 76.6918, blurb: 'At the edge of the southern plateau.' },
      { name: 'Camp 5', alt: 7160, lat: 35.7120, lon: 76.7000, blurb: 'The 1958 top camp on the plateau; from here Schoening and Kauffman crossed the upper snow bowl and took a couloir just east of the summit to the crest.' },
    ],
    hazards: ['roch-spur', 'summit-slopes', 'death-zone'],
  },
  {
    id: 'swridge',
    name: 'Southwest Ridge',
    aka: 'Yugoslav route, 1977',
    color: '#7dffb3',
    firstAscent: '8 July 1977, Andrej Štremfelj & Nejc Zaplotnik (Yugoslavia), a new route two years after Messner and Habeler',
    share: 'A few ascents',
    difficulty: 'A rock and ice ridge with towers, sustained above 6,500 m',
    verticalGain: '≈ 2,600 m from the glacier',
    summary:
      'The ridge that bounds the south-west face on its left, climbed by two of the young Slovenians who would define the next decade of Himalayan climbing. A long, elegant line with the summit plateau at its top.',
    waypoints: [
      [35.7081, 76.6655], // glacier
      [35.7121, 76.6732], // C1
      [35.7161, 76.6809], // C2
      [35.7182, 76.6848], // C3
      [35.7202, 76.6887], // C4
      [35.7222, 76.6925],
      [35.7242, 76.6964], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5800, lat: 35.7121, lon: 76.6732, blurb: 'At the foot of the ridge.' },
      { name: 'Camp 2', alt: 6250, lat: 35.7161, lon: 76.6809, blurb: 'Below the first towers.' },
      { name: 'Camp 3', alt: 6750, lat: 35.7182, lon: 76.6848, blurb: 'On the crest.' },
      { name: 'Camp 4', alt: 7200, lat: 35.7202, lon: 76.6887, blurb: 'The last camp, below the summit slopes.' },
    ],
    hazards: ['sw-ridge', 'summit-slopes', 'death-zone'],
  },
  {
    id: 'swface',
    name: 'Southwest Face',
    aka: 'Kukuczka–Kurtyka, 1983',
    color: '#c77dff',
    firstAscent: '23 July 1983, Jerzy Kukuczka & Wojciech Kurtyka (Poland), alpine style, a week after climbing a new route on Gasherbrum II',
    share: 'One ascent',
    difficulty: 'A 2,500 m face of ice and mixed ground climbed in a single push',
    verticalGain: '≈ 2,500 m from the glacier',
    summary:
      'The great Polish partnership at its peak: after a new route on Gasherbrum II, Kukuczka and Kurtyka climbed the south-west face of Hidden Peak in alpine style, two new 8,000 m routes in one fortnight.',
    waypoints: [
      [35.7050, 76.6700], // glacier
      [35.7088, 76.6753],
      [35.7108, 76.6779], // bivouac
      [35.7146, 76.6832], // bivouac
      [35.7165, 76.6858],
      [35.7184, 76.6885], // bivouac
      [35.7204, 76.6911],
      [35.7223, 76.6938],
      [35.7242, 76.6964], // Summit
    ],
    camps: [
      { name: 'Bivouac 1', alt: 6050, lat: 35.7108, lon: 76.6779, blurb: 'At the foot of the face.' },
      { name: 'Bivouac 2', alt: 6450, lat: 35.7146, lon: 76.6832, blurb: 'A ledge on the lower ice field.' },
      { name: 'Bivouac 3', alt: 7050, lat: 35.7184, lon: 76.6885, blurb: 'Below the summit headwall, the last night on the face.' },
    ],
    hazards: ['sw-face', 'summit-slopes', 'death-zone'],
  },
]

const hazards = [
  {
    id: 'gasherbrum-icefall', name: 'Gasherbrum icefall', lat: 35.7400, lon: 76.6400, alt: 5600, radius: 420, severity: 4,
    kind: 'Serac · crevasses',
    blurb: 'The broken South Gasherbrum Glacier between Base Camp and Camp 1, shared with Gasherbrum II and crossed many times each season; it has swallowed climbers whole.',
    incidents: ['2006, a serac collapse in the icefall kills a climber and a high-altitude porter'],
  },
  {
    id: 'japanese-couloir', name: 'Japanese Couloir', lat: 35.7321, lon: 76.6857, alt: 6900, radius: 260, severity: 4,
    kind: 'Rockfall · ice · queues',
    blurb: 'A 600 m gully at 45-55° that becomes a stone chute once the sun touches the rock above it; climbed before dawn on fixed rope.',
    incidents: ['2013, three Spanish climbers vanish on the summit day above the couloir', '2019, a fall in the couloir on the descent'],
  },
  {
    id: 'summit-slopes', name: 'Summit slopes', lat: 35.7258, lon: 76.6943, alt: 7800, radius: 300, severity: 4,
    kind: 'Whiteout · length',
    blurb: 'Broad snow slopes and a plateau where the summit is hard to find in cloud and the way back easy to lose.',
    incidents: ['9 Mar 2012, the first winter ascent by Bielecki and Gołąb; the same day Göschl, Hählen and Nisar Hussain of a second expedition vanish near the summit'],
  },
  {
    id: 'nw-face', name: 'Northwest Face', lat: 35.7360, lon: 76.6820, alt: 6800, radius: 300, severity: 4,
    kind: 'Ice · rockfall',
    blurb: 'The face of the 1975 ascent: 50-60° ice with a rock band, exposed to whatever falls from the crest.',
    incidents: [],
  },
  {
    id: 'roch-spur', name: 'Roch spur', lat: 35.7000, lon: 76.6918, alt: 6860, radius: 350, severity: 3,
    kind: 'Cornice · exposure',
    blurb: 'A long, exposed spur to the plateau, corniced along its crest.',
    incidents: [],
  },
  {
    id: 'sw-ridge', name: 'Southwest ridge', lat: 35.7182, lon: 76.6848, alt: 6750, radius: 300, severity: 4,
    kind: 'Rock towers · exposure',
    blurb: 'Rock towers and ice on a narrow crest above 6,500 m.',
    incidents: [],
  },
  {
    id: 'sw-face', name: 'Southwest Face', lat: 35.7146, lon: 76.6832, alt: 6450, radius: 380, severity: 5,
    kind: 'Avalanche · serac',
    blurb: 'Ice fields under the summit plateau, climbed once, in a single push.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 35.7242, lon: 76.6964, alt: 8000, radius: 700, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Only the last 80 m lie above 8,000 m; the danger on Hidden Peak is the length of the summit day, not the altitude.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1892, title: 'Hidden Peak', text: 'Martin Conway’s expedition, the first to explore the upper Baltoro, names the mountain Hidden Peak because it cannot be seen until the head of the glacier.' },
  { year: 1934, title: 'Reconnaissance', text: 'André Roch and Hans Ertl of Dyhrenfurth’s International Himalayan Expedition climb the south spur to about 6,300 m, the line that would be followed in 1958.' },
  { year: 1936, title: 'The French', text: 'A French expedition led by Henry de Ségogne pushes the IHE spur, reconnoitred by Roch and Ertl in 1934, to about 6,800 m.' },
  { year: 1958, title: 'First ascent', text: 'Pete Schoening and Andy Kauffman reach the summit on 5 July for Nick Clinch’s small American expedition, the only first ascent of an 8,000 m peak by Americans.' },
  { year: 1975, title: 'Alpine style', text: 'Reinhold Messner and Peter Habeler climb the north-west face in three days with one tent and no fixed rope: the first alpine-style ascent of an 8,000 m peak.' },
  { year: 1977, title: 'Southwest ridge', text: 'Andrej Štremfelj and Nejc Zaplotnik open a new route for a Yugoslav expedition.' },
  { year: 1982, title: 'The north face', text: 'A German expedition (Günter Sturm, Michl Dacher and Sigi Hupfauer) climbs a new route on the north face; Marie-José Valençot becomes the first woman on the summit, and Sylvain Saudan makes the first ski descent from the top of an 8,000 m peak.' },
  { year: 1983, title: 'The Polish fortnight', text: 'Jerzy Kukuczka and Wojciech Kurtyka climb a new route on the south-west face on 23 July, a week after a new route on Gasherbrum II.' },
  { year: 1984, title: 'The double traverse', text: 'Messner and Hans Kammerlander traverse Gasherbrum II and Gasherbrum I without returning to base camp, the first traverse of two 8,000 m peaks.' },
  { year: 2012, title: 'Winter', text: 'Adam Bielecki and Janusz Gołąb make the first winter ascent on 9 March. The same day Gerfried Göschl, Cedric Hählen and Nisar Hussain Sadpara of a second expedition disappear near the summit.' },
  { year: 2013, title: 'Lost', text: 'Three Spanish climbers disappear on the summit day in July; the summer’s second tragedy on the Karakoram 8,000ers after the Nanga Parbat attack.' },
]

const stats = [
  { label: 'Height', value: '8,080 m', note: '11th highest on Earth' },
  { label: 'First ascent', value: '1958', note: 'Schoening & Kauffman' },
  { label: 'Summits', value: '≈ 450', note: 'usually paired with Gasherbrum II' },
  { label: 'Deaths', value: '≈ 35', note: 'about one per thirteen summits' },
  { label: 'Alpine style', value: '1975', note: 'the first 8,000er climbed that way' },
  { label: 'Winter ascent', value: '2012', note: 'Bielecki & Gołąb' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'gasherbrum1', peak, routes, hazards, timeline, stats, sources }
