// Manaslu routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 28.5497, lon: 84.5597, elevation: 8163, name: 'Manaslu', aka: 'Manaslu · the Mountain of the Spirit',
  range: 'Himalaya, Mansiri Himal', countries: 'Nepal',
  tagline: 'The eighth highest mountain on Earth, and the busiest 8,000 m peak of every autumn: a plateau of fixed rope, and a true summit most people never reached.',
  summitText: 'A small corniced tower at the end of a long summit plateau. For decades most climbers stopped on the fore-summit below it and were told they had summited; drone footage in 2021 ended the pretence. Everything below the plateau is avalanche ground.',
  summitBlurb: 'Eighth highest point on Earth, in the Gorkha district of Nepal. About 3,000 ascents, most of them since 2010, and 90 deaths, the majority in a handful of avalanches.',
  figuresLead: 'A mountain that killed in dozens, twice, and now sees four hundred summits in a single September.',
  otherLines: 'Lines climbed but not modelled here: the 1981 Spanish west face variation, the 1983 Yugoslav south face direct, and the north-east ridge of the 1953 Japanese reconnaissance.',
  historyTitle: 'Seventy years',
  historyLead: 'From a monastery buried by an avalanche to the fixed lines of the autumn season.',
}

const routes = [
  {
    id: 'normal',
    name: 'Northeast Face',
    aka: 'The Japanese route · the normal route',
    color: '#ff6a3d',
    firstAscent: '9 May 1956, Toshio Imanishi & Gyalzen Norbu (Japanese expedition led by Yūkō Maki)',
    share: '≈ 95% of all ascents',
    difficulty: 'Glacier and serac bands at 30-45°, fixed rope from Camp 1 to the summit, oxygen almost universal above Camp 3',
    verticalGain: '≈ 3,350 m from Base Camp',
    summary:
      'From Samagaon up the moraine to Base Camp, then the north-east face: an icefall, the Hourglass serac band, the broad shelf of Camp 3 and the slopes to the plateau. Technically the gentlest of the fourteen after Cho Oyu, and one of the most avalanche-prone; in autumn a thousand people share its fixed lines.',
    waypoints: [
      [28.5941, 84.6002], // Base Camp
      [28.5900, 84.5990],
      [28.5860, 84.5975],
      [28.5820, 84.5965],
      [28.5785, 84.5956],
      [28.5756, 84.5920],
      [28.5712, 84.5865], // C1
      [28.5670, 84.5813], // Hourglass
      [28.5650, 84.5790], // C2
      [28.5612, 84.5741],
      [28.5598, 84.5722], // C3
      [28.5583, 84.5705],
      [28.5555, 84.5669], // C4
      [28.5526, 84.5633], // plateau
      [28.5515, 84.5615], // fore-summit
      [28.5497, 84.5597], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 4800, lat: 28.5941, lon: 84.6002, blurb: 'On the moraine above Samagaon, a village that in 1954 turned the Japanese away, blaming them for the avalanche that destroyed its monastery. Today it hosts hundreds of tents each September.' },
      { name: 'Camp 1', alt: 5700, lat: 28.5712, lon: 84.5865, blurb: 'On a flat glacier shelf above the first crevasse field.' },
      { name: 'Camp 2', alt: 6400, lat: 28.5650, lon: 84.5790, blurb: 'Above the Hourglass, on a bench that has been hit by serac fall more than once.' },
      { name: 'Camp 3', alt: 6800, lat: 28.5598, lon: 84.5722, blurb: 'A broad shelf below the upper seracs, where eleven climbers died in their tents in 2012.' },
      { name: 'Camp 4', alt: 7400, lat: 28.5555, lon: 84.5669, blurb: 'On the edge of the summit plateau. Summit day is six to nine hours on oxygen, in a queue.' },
    ],
    hazards: ['hourglass', 'camp3-slope', 'crowding', 'false-summit', 'death-zone'],
  },
  {
    id: 'nwspur',
    name: 'Northwest Spur',
    aka: 'Japanese route, 1971',
    color: '#5fd3ff',
    firstAscent: '17 May 1971, Kazuharu Kohara & Motoki Tanaka (Japanese expedition)',
    share: 'Rarely repeated',
    difficulty: 'A long spur of snow and rock from the Manaslu Glacier, then the upper north-west face',
    verticalGain: '≈ 3,700 m from the glacier',
    summary:
      'The second route on the mountain, up the spur that bounds the north-west face, climbed by a Japanese team fifteen years after the first ascent. Long and exposed to the wind from Tibet, it has seen few repeats.',
    waypoints: [
      [28.5850, 84.5100], // glacier
      [28.5821, 84.5141],
      [28.5791, 84.5183], // C1
      [28.5732, 84.5266], // C2
      [28.5674, 84.5349], // C3
      [28.5644, 84.5390],
      [28.5615, 84.5431], // C4
      [28.5556, 84.5514],
      [28.5526, 84.5556],
      [28.5497, 84.5597], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5150, lat: 28.5791, lon: 84.5183, blurb: 'At the foot of the spur.' },
      { name: 'Camp 2', alt: 6000, lat: 28.5732, lon: 84.5266, blurb: 'On the crest of the spur.' },
      { name: 'Camp 3', alt: 6500, lat: 28.5674, lon: 84.5349, blurb: 'Below the steep upper section.' },
      { name: 'Camp 4', alt: 7350, lat: 28.5615, lon: 84.5431, blurb: 'Where the spur meets the upper face.' },
    ],
    hazards: ['nw-spur', 'false-summit', 'death-zone'],
  },
  {
    id: 'swface',
    name: 'Southwest Face',
    aka: 'Messner’s route, 1972',
    color: '#c77dff',
    firstAscent: '25 April 1972, Reinhold Messner, solo from the top camp (Tyrolean expedition led by Wolfgang Nairz); Franz Jäger and Andi Schlick died in the storm that followed',
    share: 'A few ascents',
    difficulty: 'A 3,000 m face of ice fields and rock at 45-60°, exposed to storms from the south',
    verticalGain: '≈ 3,750 m from the Thulagi Glacier',
    summary:
      'The face Messner climbed alone from the last camp in 1972, his second 8,000 m peak, approached up the Dona Khola and the Thulagi Glacier to the basin the team called the Butterfly Valley. On the descent a storm caught the team; Jäger turned back and vanished, Schlick walked out of a tent into the night and was never found. Messner spent the night searching for them.',
    waypoints: [
      [28.4940, 84.5240], // Advanced Base, Thulagi Glacier
      [28.5000, 84.5270],
      [28.5060, 84.5300],
      [28.5100, 84.5320],
      [28.5140, 84.5340], // C1
      [28.5200, 84.5360],
      [28.5260, 84.5380],
      [28.5324, 84.5365], // C2, glacier plateau
      [28.5373, 84.5432],
      [28.5398, 84.5465],
      [28.5423, 84.5498], // C3
      [28.5448, 84.5531],
      [28.5472, 84.5564], // C4
      [28.5497, 84.5597], // Summit
    ],
    camps: [
      { name: 'Advanced Base', alt: 4400, lat: 28.4940, lon: 84.5240, blurb: 'On the Thulagi Glacier, a day above the base camp in the Dona Khola on the Marsyangdi side.' },
      { name: 'Camp 1', alt: 5650, lat: 28.5140, lon: 84.5340, blurb: 'Below the ice labyrinth that guards the upper basin.' },
      { name: 'Camp 2', alt: 5850, lat: 28.5324, lon: 84.5365, blurb: 'The high basin below the south-west face, the Butterfly Valley of the 1972 team.' },
      { name: 'Camp 3', alt: 6600, lat: 28.5423, lon: 84.5498, blurb: 'On the south-west shoulder, above the lower face.' },
      { name: 'Camp 4', alt: 7400, lat: 28.5472, lon: 84.5564, blurb: 'The 1972 top camp at the edge of the plateau, from which Messner climbed alone to the summit and back in a day.' },
    ],
    hazards: ['sw-face', 'false-summit', 'death-zone'],
  },
  {
    id: 'south',
    name: 'Messner Route in Winter',
    aka: 'Polish first winter ascent, 1984 · the 1972 line from the south',
    color: '#ffc14d',
    firstAscent: '12 January 1984, Maciej Berbeka & Ryszard Gajewski (Poland), by the 1972 Messner route from the south',
    share: 'Historic; the same line as the south-west face',
    difficulty: 'The Thulagi Glacier and the ice labyrinth to the Butterfly Valley, then the south-west face at 45-60° in winter winds',
    verticalGain: '≈ 3,700 m from the Thulagi Glacier',
    summary:
      'Lech Korniszewski’s Polish expedition came up the Marsyangdi and the Dona Khola and climbed the Tyrolean line of 1972 in the depths of winter, one of the run of Polish winter firsts of the 1980s. Stanisław Jaworski died on 11 December when a fixed rope broke below Camp 1; Berbeka and Gajewski reached the summit at 11 am on 12 January.',
    waypoints: [
      [28.4940, 84.5240], // Advanced Base, Thulagi Glacier
      [28.5000, 84.5270],
      [28.5060, 84.5300],
      [28.5100, 84.5320],
      [28.5140, 84.5340], // C1
      [28.5200, 84.5360],
      [28.5260, 84.5380],
      [28.5324, 84.5365], // Butterfly Valley
      [28.5373, 84.5432],
      [28.5398, 84.5465], // C2
      [28.5423, 84.5498],
      [28.5448, 84.5531], // C3
      [28.5472, 84.5564],
      [28.5485, 84.5580], // C4, on the plateau
      [28.5497, 84.5597], // Summit
    ],
    camps: [
      { name: 'Advanced Base', alt: 4400, lat: 28.4940, lon: 84.5240, blurb: 'On the Thulagi Glacier above the 4,000 m base camp in the Dona Khola, occupied in December.' },
      { name: 'Camp 1', alt: 5650, lat: 28.5140, lon: 84.5340, blurb: 'Below the ice labyrinth. Jaworski fell to his death below here on 11 December when a fixed rope parted.' },
      { name: 'Camp 2', alt: 6400, lat: 28.5398, lon: 84.5465, blurb: 'In the Butterfly Valley, at the foot of the face.' },
      { name: 'Camp 3', alt: 7100, lat: 28.5448, lon: 84.5531, blurb: 'A snow ledge in the middle of the face.' },
      { name: 'Camp 4', alt: 7700, lat: 28.5485, lon: 84.5580, blurb: 'On the plateau, the 1984 top camp; the summit is an hour beyond in still weather, longer in January wind.' },
    ],
    hazards: ['sw-face', 'false-summit', 'death-zone'],
    joins: 'swface',
  },
  {
    id: 'east',
    name: 'Northeast Face Direct',
    aka: 'Kukuczka–Hajzer, 1986',
    color: '#7dffb3',
    firstAscent: '10 November 1986, Jerzy Kukuczka & Artur Hajzer (Poland), by a new line up the north-east face in alpine style; Carlos Carsolio stopped at the 8,000 m bivouac with frostbite',
    share: 'One ascent',
    difficulty: 'Steep ice and mixed ground from the Manaslu Glacier to the east edge of the summit plateau, climbed in five days of November cold',
    verticalGain: '≈ 3,750 m from the Manaslu Glacier',
    summary:
      'Kukuczka’s twelfth 8,000 m peak. After six weeks of failure on the east ridge, he, Hajzer and Carsolio left the glacier on 5 November and climbed the face to the right of the ridge in alpine style, five bivouacs in five days. Carsolio stayed in the last one with frostbitten feet; the two Poles reached the summit on 10 November and all three went down the normal route.',
    waypoints: [
      [28.5970, 84.6110], // Base Camp, Manaslu Glacier
      [28.5929, 84.6082],
      [28.5889, 84.6055],
      [28.5848, 84.6027],
      [28.5808, 84.5999],
      [28.5767, 84.5972],
      [28.5727, 84.5944],
      [28.5709, 84.5932], // bivouac 5,500
      [28.5686, 84.5916],
      [28.5645, 84.5889],
      [28.5605, 84.5861],
      [28.5586, 84.5827],
      [28.5567, 84.5793], // bivouac 6,300
      [28.5549, 84.5759],
      [28.5530, 84.5725],
      [28.5511, 84.5691],
      [28.5492, 84.5657], // bivouac 7,300
      [28.5494, 84.5637], // bivouac 7,600
      [28.5496, 84.5605], // bivouac 8,000
      [28.5497, 84.5597], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 4400, lat: 28.5970, lon: 84.6110, blurb: 'On the Manaslu Glacier below the normal-route moraine, set up on 8 September 1986.' },
      { name: 'Bivouac 1', alt: 5500, lat: 28.5709, lon: 84.5932, blurb: 'The first night on the face, 5 November.' },
      { name: 'Bivouac 2', alt: 6300, lat: 28.5567, lon: 84.5793, blurb: 'On the spur east of the Hourglass.' },
      { name: 'Bivouac 3', alt: 7300, lat: 28.5492, lon: 84.5657, blurb: 'Below the steep upper face.' },
      { name: 'Bivouac 4', alt: 7600, lat: 28.5494, lon: 84.5637, blurb: 'A snow cave under the plateau rim.' },
      { name: 'Bivouac 5', alt: 8000, lat: 28.5496, lon: 84.5605, blurb: 'On the edge of the plateau. Carsolio stayed here with frostbite while Kukuczka and Hajzer went to the top.' },
    ],
    hazards: ['east-slopes', 'false-summit', 'death-zone'],
  },
]

const hazards = [
  {
    id: 'hourglass', name: 'The Hourglass', lat: 28.5670, lon: 84.5813, alt: 6250, radius: 350, severity: 5,
    kind: 'Serac · avalanche',
    blurb: 'The steep serac band between Camps 1 and 2, a funnel for ice fall from the hanging glaciers above; the busiest fixed lines on the mountain run straight through it.',
    incidents: ['10 Apr 1972, an avalanche destroys the Korean camp at 6,500 m; fifteen die, including ten Sherpas'],
  },
  {
    id: 'camp3-slope', name: 'Camp 3 shelf', lat: 28.5598, lon: 84.5722, alt: 6800, radius: 320, severity: 5,
    kind: 'Serac avalanche',
    blurb: 'A broad shelf under the upper serac barrier, where teams sleep in their hundreds each autumn.',
    incidents: ['23 Sep 2012, a serac collapse above Camp 3 buries the camp at 4 am; eleven die', '26 Sep 2022, an avalanche between Camps 3 and 4 kills a Nepali climber and injures a dozen'],
  },
  {
    id: 'crowding', name: 'Camp 4 and above', lat: 28.5555, lon: 84.5669, alt: 7400, radius: 300, severity: 3,
    kind: 'Queues · oxygen · exhaustion',
    blurb: 'On a good day in late September hundreds of climbers leave Camp 4 for the summit at once. The descent in traffic is where oxygen runs out.',
    incidents: [],
  },
  {
    id: 'false-summit', name: 'The fore-summit', lat: 28.5515, lon: 84.5615, alt: 8100, radius: 250, severity: 4,
    kind: 'False summit · cornice',
    blurb: 'The true summit is a corniced tower beyond a fore-summit at the end of the plateau. For years most parties stopped short and were credited anyway; since 2022 Nepal requires a photograph from the true top.',
    incidents: ['2021, drone footage shows hundreds of “summits” stopped 20 m below the top', '26 Sep 2022, Hilaree Nelson falls from the summit ridge while skiing'],
  },
  {
    id: 'nw-spur', name: 'Northwest spur', lat: 28.5674, lon: 84.5349, alt: 6500, radius: 350, severity: 4,
    kind: 'Avalanche · exposure',
    blurb: 'Windslab on the flanks of the spur and the full force of the wind off the Tibetan plateau.',
    incidents: [],
  },
  {
    id: 'sw-face', name: 'Southwest Face', lat: 28.5423, lon: 84.5498, alt: 6600, radius: 400, severity: 5,
    kind: 'Avalanche · storm',
    blurb: 'A face that catches every storm from the south; the 1972 team lost two climbers to one in a single night.',
    incidents: ['25 Apr 1972, Franz Jäger and Andi Schlick die in a storm on the descent'],
  },
  {
    id: 'east-slopes', name: 'East side of the face', lat: 28.5549, lon: 84.5759, alt: 6500, radius: 400, severity: 4,
    kind: 'Serac · avalanche',
    blurb: 'Steep ice and serac bands east of the normal route, below the plateau rim, climbed once, in November cold.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 28.5497, lon: 84.5597, alt: 8000, radius: 900, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Only the plateau and the summit tower lie above 8,000 m; nearly everyone crossing them is on bottled oxygen in a queue.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1950, title: 'Tilman', text: 'H. W. Tilman’s party reaches 5,500 m on the north-east side and photographs a possible line.' },
  { year: 1954, title: 'Turned away', text: 'Villagers of Samagaon block a Japanese expedition, blaming its predecessor for the avalanche that destroyed the Pungyen monastery and killed eighteen people.' },
  { year: 1956, title: 'First ascent', text: 'Toshio Imanishi and Gyalzen Norbu reach the summit on 9 May for Yūkō Maki’s Japanese expedition, the first 8,000 m peak climbed by a Japanese team.' },
  { year: 1971, title: 'Northwest spur', text: 'A Japanese team opens the second route on the mountain.' },
  { year: 1972, title: 'Fifteen dead, and Messner', text: 'On 10 April an avalanche kills fifteen members of a Korean expedition. Two weeks later Reinhold Messner climbs the south-west face solo from the top camp; Franz Jäger and Andi Schlick die in the storm that follows.' },
  { year: 1974, title: 'The women’s ascent', text: 'A Japanese women’s expedition puts Naoko Nakaseko, Masako Uchida and Mieko Mori on the summit on 4 May, the first women on any 8,000 m peak.' },
  { year: 1984, title: 'Winter', text: 'Maciej Berbeka and Ryszard Gajewski make the first winter ascent on 12 January by the 1972 Messner route from the south.' },
  { year: 1986, title: 'Kukuczka', text: 'Jerzy Kukuczka and Artur Hajzer climb a new route on the north-east face on 10 November in alpine style, Kukuczka’s twelfth of the fourteen; Carlos Carsolio stops at the last bivouac with frostbite.' },
  { year: 2012, title: 'Camp 3', text: 'A serac avalanche buries Camp 3 before dawn on 23 September; eleven climbers die, the mountain’s second mass tragedy.' },
  { year: 2021, title: 'The false summit', text: 'Drone footage proves that the great majority of recorded ascents stopped on the fore-summit; Nepal begins to require photographs from the true top.' },
  { year: 2022, title: 'Record season', text: 'More than 400 summits in one autumn. Hilaree Nelson dies in a fall from the summit ridge; an avalanche below Camp 4 kills a Nepali climber.' },
]

const stats = [
  { label: 'Height', value: '8,163 m', note: '8th highest on Earth' },
  { label: 'First ascent', value: '1956', note: 'Imanishi & Gyalzen Norbu' },
  { label: 'Summits', value: '≈ 3,000', note: 'most of them since 2010' },
  { label: 'Deaths', value: '≈ 90', note: 'a third of them in two avalanches' },
  { label: 'Winter ascent', value: '1984', note: 'Berbeka & Gajewski' },
  { label: 'True summit', value: '2022', note: 'required by Nepal since' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'manaslu', peak, routes, hazards, timeline, stats, sources }
