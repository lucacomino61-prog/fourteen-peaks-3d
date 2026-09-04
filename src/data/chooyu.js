// Cho Oyu routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 28.0942, lon: 86.6608, elevation: 8188, name: 'Cho Oyu', aka: 'Cho Oyu · the Turquoise Goddess',
  range: 'Himalaya, Mahalangur Himal', countries: 'Nepal / China',
  tagline: 'The sixth highest mountain on Earth, and the one most people climb first: a drive-in base camp, one ice step, and a summit plateau the size of a village.',
  summitText: 'A flat snow plateau so wide that the true summit is a long walk beyond the point where most people stop. Everest, Lhotse and Makalu line the horizon to the east; the Nangpa La trade route lies 2,500 m below to the west.',
  summitBlurb: 'Sixth highest point on Earth, 20 km west of Everest on the Nepal–Tibet border. About 4,000 ascents, more than any 8,000 m peak but Everest, and the lowest death rate of the fourteen.',
  figuresLead: 'The mountain where most people climb their first 8,000 m peak, and where altitude, not terrain, does the killing.',
  otherLines: 'Lines climbed but not modelled here: the 1984 Yugoslav north face, the 1994 Russian west face, and the 2022 commercial line from Gokyo on the Nepal side.',
  historyTitle: 'Seventy years',
  historyLead: 'From Tichy’s three-man ascent of 1954 to the busiest slopes in Tibet.',
}

const routes = [
  {
    id: 'normal',
    name: 'Northwest Ridge',
    aka: 'The normal route from Tibet',
    color: '#ff6a3d',
    firstAscent: 'In its modern form from the 1980s; the mountain was first climbed by this flank on 19 October 1954 by Herbert Tichy, Sepp Jöchler & Pasang Dawa Lama',
    share: '≈ 95% of all ascents',
    difficulty: 'Snow slopes at 30-40°, one 40 m ice cliff at 6,600 m and a short rock band at 7,600 m; the easiest of the fourteen',
    verticalGain: '≈ 2,500 m from Advanced Base',
    summary:
      'From an Advanced Base reached by yak from the roadhead at Tingri, up the broad north-west flank: a scree hill, two snow camps, the ice cliff with its fixed ladder, a rock band, and then the plateau. Nothing on it is hard, which is exactly why it fills with people who have never been above 7,000 m.',
    waypoints: [
      [28.1180, 86.6050], // Advanced Base
      [28.1136, 86.6152],
      [28.1085, 86.6270], // C1
      [28.1060, 86.6330], // ice cliff
      [28.1020, 86.6420], // C2
      [28.0990, 86.6490], // C3
      [28.0975, 86.6540],
      [28.0964, 86.6557], // plateau
      [28.0942, 86.6608], // Summit
    ],
    camps: [
      { name: 'Advanced Base', alt: 5700, lat: 28.1180, lon: 86.6050, blurb: 'On the moraine of the Gyabrag Glacier, a day’s yak walk above the Chinese Base Camp at 4,900 m, itself an hour from the road. Dozens of teams share it in autumn.' },
      { name: 'Camp 1', alt: 6400, lat: 28.1085, lon: 86.6270, blurb: 'On the crest above the scree hill, in the wind.' },
      { name: 'Camp 2', alt: 7050, lat: 28.1020, lon: 86.6420, blurb: 'Above the ice cliff on a broad snow shelf; most teams sleep here on oxygen.' },
      { name: 'Camp 3', alt: 7550, lat: 28.0990, lon: 86.6490, blurb: 'Below the rock band, the last camp before the plateau. Summit day is six to ten hours.' },
    ],
    hazards: ['abc-altitude', 'ice-cliff', 'camp4-1959', 'yellow-band', 'summit-plateau', 'death-zone'],
  },
  {
    id: 'tichy',
    name: 'The 1954 line',
    aka: 'Tichy route · from the Nangpa La',
    color: '#ffc14d',
    firstAscent: '19 October 1954, Herbert Tichy, Sepp Jöchler & Pasang Dawa Lama (Austria / Nepal), a three-man expedition without oxygen',
    share: 'Historic; the same north-west flank as the normal route',
    difficulty: 'Glacier from the Nangpa La trade pass to the Gyabrag base, then the north-west face: the ice cliff, the snow slopes and the plateau',
    verticalGain: '≈ 2,700 m from the 1954 base camp',
    summary:
      'Tichy’s tiny post-monsoon expedition walked over the Nangpa La from Nepal into Tibet, put its base on the Gyabrag Glacier and climbed the north-west face in a fortnight with a handful of Sherpas, reaching the summit in a storm with Tichy’s frostbitten hands wrapped in bandages: the smallest team to make a first ascent of an 8,000 m peak. The line is the normal route of today.',
    waypoints: [
      [28.1150, 86.5850], // Nangpa La
      [28.1158, 86.5900],
      [28.1166, 86.5950],
      [28.1174, 86.6000],
      [28.1180, 86.6050], // 1954 Base Camp, modern Advanced Base
      [28.1136, 86.6152],
      [28.1085, 86.6270],
      [28.1060, 86.6330], // ice cliff, C3 below it
      [28.1020, 86.6420], // C4
      [28.0990, 86.6490],
      [28.0975, 86.6540],
      [28.0964, 86.6557], // plateau
      [28.0942, 86.6608], // Summit
    ],
    camps: [
      { name: 'Nangpa La', alt: 5716, lat: 28.1150, lon: 86.5850, blurb: 'The glacier pass between Nepal and Tibet, a yak trade route for centuries and the refugees’ road out of Tibet.' },
      { name: 'Base Camp', alt: 5500, lat: 28.1180, lon: 86.6050, blurb: 'On the Gyabrag Glacier a short way below the modern Advanced Base, a day’s walk over the pass from Nepal.' },
      { name: 'Camp 3', alt: 6600, lat: 28.1062, lon: 86.6325, blurb: 'Just below the ice cliff that had turned Shipton and Hillary back in 1952.' },
      { name: 'Camp 4', alt: 7000, lat: 28.1023, lon: 86.6412, blurb: 'The 1954 high camp, above the ice cliff; summit day started here.' },
    ],
    hazards: ['nangpa-la', 'ice-cliff', 'camp4-1959', 'yellow-band', 'summit-plateau', 'death-zone'],
    joins: 'normal',
  },
  {
    id: 'swface',
    name: 'Southwest Face',
    aka: 'Loretan–Troillet–Kurtyka, 1990',
    color: '#c77dff',
    firstAscent: '20–21 September 1990, Erhard Loretan, Jean Troillet (Switzerland) & Wojciech Kurtyka (Poland), in a single push of two days and one night',
    share: 'A handful of ascents',
    difficulty: 'A 2,500 m face of ice fields and rock bands at 50-60°, climbed night-naked style with no tents or rope',
    verticalGain: '≈ 2,200 m from the foot of the face',
    summary:
      'The face above the glacier basin west of the summit, reached over the Nangpa La from a base camp across the Gyabrag Glacier from the pass. Three of the best alpinists of their generation climbed it without a tent in 1990, resting in the sun by day and moving by night, in the same style Loretan and Troillet had used on Everest’s north face four years earlier, and came back down the west ridge.',
    waypoints: [
      [28.1180, 86.6050], // Base Camp
      [28.1140, 86.6060],
      [28.1100, 86.6070],
      [28.1060, 86.6083],
      [28.1020, 86.6095],
      [28.1000, 86.6100],
      [28.0975, 86.6145],
      [28.0950, 86.6190],
      [28.0930, 86.6230], // foot of the face
      [28.0932, 86.6280],
      [28.0933, 86.6330],
      [28.0935, 86.6380],
      [28.0936, 86.6419],
      [28.0937, 86.6450], // bivouac
      [28.0938, 86.6482],
      [28.0939, 86.6513], // headwall
      [28.0941, 86.6545],
      [28.0941, 86.6576],
      [28.0942, 86.6608], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 5700, lat: 28.1180, lon: 86.6050, blurb: 'Across the Gyabrag Glacier from the Nangpa La, where the normal route’s Advanced Base now stands; the 1990 trio walked in over the pass from Nepal.' },
      { name: 'Foot of the face', alt: 6000, lat: 28.0930, lon: 86.6230, blurb: 'The flat glacier basin under the face, west-south-west of the summit.' },
      { name: 'Bivouac', alt: 6950, lat: 28.0937, lon: 86.6450, blurb: 'A snow ledge where the 1990 trio sat out the daylight hours.' },
      { name: 'Headwall', alt: 7500, lat: 28.0939, lon: 86.6513, blurb: 'The steepest rock, climbed unroped at night.' },
    ],
    hazards: ['sw-face', 'summit-plateau', 'death-zone'],
  },
  {
    id: 'sepillar',
    name: 'Southeast Pillar',
    aka: 'Polish route · the first winter ascent, 1985',
    color: '#5fd3ff',
    firstAscent: '12 February 1985, Maciej Berbeka & Maciej Pawlikowski (Poland); Jerzy Kukuczka and Andrzej Heinrich three days later',
    share: 'Rarely repeated',
    difficulty: 'A long pillar of rock and ice at 45-60° from the Nepal side, climbed in −40 °C winter winds',
    verticalGain: '≈ 2,800 m from the Lungsampa Glacier',
    summary:
      'A new route and a first winter ascent in one: Andrzej Zawada’s Polish expedition forced 2,800 m of ice and rock from the Lungsampa Glacier in the coldest weeks of the year, with the permit technically expiring the day before the second summit team topped out.',
    waypoints: [
      [28.0680, 86.6720], // Lungsampa Glacier
      [28.0713, 86.6706],
      [28.0746, 86.6692],
      [28.0771, 86.6681], // C1
      [28.0810, 86.6664], // C2
      [28.0855, 86.6645], // C3
      [28.0877, 86.6636], // C4
      [28.0888, 86.6631], // C5
      [28.0920, 86.6617],
      [28.0942, 86.6608], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 6000, lat: 28.0771, lon: 86.6681, blurb: 'At the foot of the pillar, above the glacier cwm.' },
      { name: 'Camp 2', alt: 6500, lat: 28.0810, lon: 86.6664, blurb: 'On the lower pillar, above the 1,200 m cliff of the lower face.' },
      { name: 'Camp 3', alt: 7100, lat: 28.0855, lon: 86.6645, blurb: 'On the crest of the pillar.' },
      { name: 'Camp 4', alt: 7450, lat: 28.0877, lon: 86.6636, blurb: 'Under the upper rock barrier.' },
      { name: 'Camp 5', alt: 7550, lat: 28.0888, lon: 86.6631, blurb: 'The 1985 high camp, moved over the rocky barrier a few days before the summit.' },
    ],
    hazards: ['se-pillar', 'summit-plateau', 'death-zone'],
  },
  {
    id: 'seface',
    name: 'Southeast Face',
    aka: 'Austrian route, 1978',
    color: '#7dffb3',
    firstAscent: '27 October 1978, Edi Koblmüller & Alois Furtner (Austria), in alpine style without a permit; Herbert Haberl turned back at 8,000 m',
    share: 'A few ascents',
    difficulty: 'Ice slopes and a rock band at 7,000 m, climbed in a few days by a small team',
    verticalGain: '≈ 2,750 m from the Lungsampa Glacier',
    summary:
      'Koblmüller and Furtner climbed the face on the Nepal side from a base at 5,000 m on a Gokyo trekking permit, with camps at 6,000 and 7,400 m, and reached the summit at six in the evening: the second new route on the mountain and one of the earliest alpine-style ascents of an 8,000 m peak. They were fined on return, and the claim was disputed for years; Messner backed it.',
    waypoints: [
      [28.0705, 86.6780], // Lungsampa Glacier
      [28.0735, 86.6758],
      [28.0764, 86.6737],
      [28.0792, 86.6717], // C1
      [28.0818, 86.6698],
      [28.0843, 86.6680],
      [28.0877, 86.6655], // C2
      [28.0900, 86.6638],
      [28.0922, 86.6622],
      [28.0942, 86.6608], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 6000, lat: 28.0792, lon: 86.6717, blurb: 'Above the glacier, below the ice slopes.' },
      { name: 'Camp 2', alt: 7400, lat: 28.0877, lon: 86.6655, blurb: 'Above the rock band, the last camp before the plateau.' },
    ],
    hazards: ['se-face', 'summit-plateau', 'death-zone'],
  },
]

const hazards = [
  {
    id: 'abc-altitude', name: 'Advanced Base', lat: 28.1180, lon: 86.6050, alt: 5700, radius: 350, severity: 3,
    kind: 'Altitude illness · inexperience',
    blurb: 'A drive-in base camp and an easy angle make Cho Oyu the 8,000 m peak most attempted by novices. Pulmonary and cerebral oedema at Advanced Base and Camp 1 kill more people here than the mountain does.',
    incidents: [],
  },
  {
    id: 'ice-cliff', name: 'The ice cliff', lat: 28.1060, lon: 86.6330, alt: 6600, radius: 250, severity: 3,
    kind: 'Serac step · queues',
    blurb: 'A 40 m ice wall between Camps 1 and 2, the only technical obstacle on the normal route, climbed on fixed rope and a ladder. Shipton and Hillary turned back below it in 1952.',
    incidents: [],
  },
  {
    id: 'camp4-1959', name: 'Camp 4, 1959', lat: 28.1020, lon: 86.6420, alt: 7100, radius: 300, severity: 4,
    kind: 'Avalanche',
    blurb: 'The snow shelf above the ice cliff where the international women’s expedition of 1959, approaching over the Nangpa La, had its Camp 4.',
    incidents: ['2 Oct 1959, an avalanche buries Camp 4 at about 7,100 m; Claude Kogan, Claudine van der Straten and Ang Norbu die, and a second Sherpa is killed going up to help'],
  },
  {
    id: 'yellow-band', name: 'Rock band', lat: 28.0985, lon: 86.6507, alt: 7600, radius: 200, severity: 3,
    kind: 'Rock step at 7,600 m',
    blurb: 'A short band of yellow rock above Camp 3, fixed with rope every season; slow in crampons on a crowded day.',
    incidents: [],
  },
  {
    id: 'summit-plateau', name: 'Summit plateau', lat: 28.0965, lon: 86.6590, alt: 8100, radius: 380, severity: 4,
    kind: 'Whiteout · false summit',
    blurb: 'A flat expanse of snow above 8,000 m where the true summit is a twenty-minute walk beyond the point most parties stop. In cloud, climbers have wandered for hours looking for the way down.',
    incidents: ['Several parties lost on the plateau in whiteouts; a British climber died here in 2017 after separating from his team'],
  },
  {
    id: 'nangpa-la', name: 'Nangpa La', lat: 28.1150, lon: 86.5850, alt: 5716, radius: 400, severity: 3,
    kind: 'Border · crevasses',
    blurb: 'The glacier pass on the Nepal–Tibet border, crossed by yak caravans and by Tibetan refugees.',
    incidents: ['30 Sep 2006, Chinese border guards fire on refugees crossing the pass in full view of climbers at Advanced Base; a 17-year-old nun, Kelsang Namtso, is killed'],
  },
  {
    id: 'sw-face', name: 'Southwest Face', lat: 28.0938, lon: 86.6482, alt: 7100, radius: 400, severity: 5,
    kind: 'Serac · avalanche · commitment',
    blurb: 'Ice fields under the summit seracs, with no place to stop; the 1990 trio climbed it because they could not afford to be on it in daylight.',
    incidents: [],
  },
  {
    id: 'se-pillar', name: 'Southeast Pillar', lat: 28.0810, lon: 86.6664, alt: 6500, radius: 350, severity: 4,
    kind: 'Cornice · wind · cold',
    blurb: 'A crest exposed to the winter jet stream; the 1985 team climbed it in −40 °C.',
    incidents: [],
  },
  {
    id: 'se-face', name: 'Southeast Face', lat: 28.0843, lon: 86.6680, alt: 6800, radius: 350, severity: 4,
    kind: 'Avalanche',
    blurb: 'Snow slopes below the rock band that load after every storm from the Nepal side.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 28.0942, lon: 86.6608, alt: 8000, radius: 900, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Only the summit plateau lies above 8,000 m, but it is broad, exposed and slow to cross; most climbers are on oxygen from Camp 2.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1952, title: 'Reconnaissance', text: 'Eric Shipton’s team, with Edmund Hillary, reaches the ice cliff at 6,650 m on the north-west face and turns back, wary of crossing into Tibet.' },
  { year: 1954, title: 'Three men', text: 'Herbert Tichy, Sepp Jöchler and Pasang Dawa Lama reach the summit on 19 October without oxygen, after crossing the Nangpa La: the smallest expedition ever to make an 8,000 m first ascent.' },
  { year: 1958, title: 'Second ascent', text: 'Pasang Dawa Lama climbs the mountain again with Sonam Gyatso for an Indian expedition.' },
  { year: 1959, title: 'The women’s expedition', text: 'An international women’s expedition led by Claude Kogan ends when an avalanche kills Kogan, Claudine van der Straten and two Sherpas at Camp 4.' },
  { year: 1978, title: 'Southeast Face', text: 'Edi Koblmüller and Alois Furtner climb a new route on the Nepal side in alpine style, without a permit.' },
  { year: 1985, title: 'Winter', text: 'Maciej Berbeka and Maciej Pawlikowski make the first winter ascent on 12 February by a new route up the south-east pillar; Kukuczka and Heinrich follow on the 15th, the permit already expired.' },
  { year: 1990, title: 'Southwest Face', text: 'Loretan, Troillet and Kurtyka climb the face in a two-day push with no tent or rope.' },
  { year: 1994, title: 'The commercial peak', text: 'With a road to Base Camp and an easy line, Cho Oyu becomes the standard first 8,000 m peak for guided clients; hundreds summit every autumn.' },
  { year: 2006, title: 'Nangpa La', text: 'On 30 September climbers at Advanced Base watch Chinese border guards shoot at a line of Tibetan refugees crossing the pass. Film of the killing reaches the world within days.' },
  { year: 2020, title: 'Closed', text: 'China shuts the Tibetan side to foreign climbers. Expeditions move to the harder Nepal side; Gelje Sherpa’s team opens a new commercial line from Gokyo in 2022.' },
]

const stats = [
  { label: 'Height', value: '8,188 m', note: '6th highest on Earth' },
  { label: 'First ascent', value: '1954', note: 'Tichy, Jöchler & Pasang Dawa Lama' },
  { label: 'Summits', value: '≈ 4,000', note: 'second only to Everest' },
  { label: 'Deaths', value: '≈ 50', note: 'the lowest ratio of the fourteen' },
  { label: 'Winter ascent', value: '1985', note: 'Berbeka & Pawlikowski' },
  { label: 'From Everest', value: '20 km', note: 'west along the border' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'chooyu', peak, routes, hazards, timeline, stats, sources }
