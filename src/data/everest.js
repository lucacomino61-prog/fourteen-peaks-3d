// Everest routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 27.9881, lon: 86.9250, elevation: 8849, name: 'Everest', aka: 'Sagarmatha · Chomolungma · Peak XV',
  range: 'Himalaya, Mahalangur Himal', countries: 'Nepal / China',
  tagline: 'The highest point on Earth, and the most crowded place in the Death Zone.',
  summitText: 'A short ridge of snow, the highest ground on the planet. On a good May morning a hundred people can stand here; the descent through the Hillary Step and the Balcony kills more than the climb.',
  summitBlurb: 'Highest point on Earth, on the Nepal–China border. Around 12,000 ascents by roughly 7,000 people; about 340 have died on the mountain.',
  figuresLead: 'A mountain climbed by thousands, on which roughly one climber in a hundred does not come home.',
  otherLines: 'Lines climbed but not modelled here: the Great Couloir on the North Face (Australians, 1984, without oxygen), the Kangshung Face direct (Americans, 1983), and the full North-east Ridge from the Raphu La, still unrepeated.',
  historyTitle: 'A hundred and seventy years',
  historyLead: 'From the Great Trigonometrical Survey to the queue at the Hillary Step.',
}

const routes = [
  {
    id: 'southcol',
    name: 'South Col Route',
    aka: 'Southeast Ridge · the normal route from Nepal',
    color: '#ff6a3d',
    firstAscent: '29 May 1953, Edmund Hillary & Tenzing Norgay (British expedition led by John Hunt)',
    share: '≈ 65% of all ascents',
    difficulty: 'Icefall and glacier, 40-50° ice on the Lhotse Face, fixed ropes and bottled oxygen almost universal',
    verticalGain: '≈ 3,500 m from Base Camp',
    summary:
      'Up the Khumbu Icefall into the Western Cwm, up the Lhotse Face to the South Col, then the south-east ridge over the Balcony and the South Summit. Not technical by the standards of K2, but long, high, and crowded: the icefall and the ridge are where most people die.',
    waypoints: [
      [28.0025, 86.8555], // Base Camp
      [27.9972, 86.8668], // Khumbu Icefall
      [27.9918, 86.8782], // C1
      [27.9905, 86.8830],
      [27.9847, 86.8933], // C2
      [27.9793, 86.9047],
      [27.9758, 86.9122], // foot of the Lhotse Face
      [27.9736, 86.9196], // C3
      [27.9733, 86.9232], // Yellow Band
      [27.9727, 86.9287], // Geneva Spur
      [27.9725, 86.9305], // South Col
      [27.9772, 86.9288],
      [27.9834, 86.9266], // Balcony
      [27.9865, 86.9256], // South Summit
      [27.9873, 86.9253], // Hillary Step
      [27.9881, 86.9250], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 5364, lat: 28.0025, lon: 86.8555, blurb: 'A tent city of several hundred on the moraine of the Khumbu Glacier, with bakeries, a hospital tent and helicopter pads. Five to six weeks are spent here acclimatising.' },
      { name: 'Camp 1', alt: 6065, lat: 27.9918, lon: 86.8782, blurb: 'At the top of the Khumbu Icefall, on the lip of the Western Cwm. Crossed at night and rarely slept in.' },
      { name: 'Camp 2', alt: 6400, lat: 27.9847, lon: 86.8933, blurb: 'Advanced Base, on the moraine at the head of the Cwm. Cook tents, a doctor, and the last comfortable night.' },
      { name: 'Camp 3', alt: 7200, lat: 27.9736, lon: 86.9196, blurb: 'Platforms hacked into the Lhotse Face. Clipped in even inside the tent; most teams start oxygen here.' },
      { name: 'Camp 4', alt: 7950, lat: 27.9725, lon: 86.9305, blurb: 'The South Col: a windswept saddle of rock in the Death Zone. Summit pushes leave around 9 pm for a 10 to 14 hour climb.' },
    ],
    hazards: ['khumbu-icefall', 'western-cwm', 'lhotse-face', 'south-col', 'balcony', 'hillary-step', 'death-zone'],
  },
  {
    id: 'northcol',
    name: 'North Col Route',
    aka: 'Northeast Ridge · the normal route from Tibet',
    color: '#5fd3ff',
    firstAscent: '25 May 1960, Wang Fuzhou, Gonpo & Qu Yinhua (China), by night and without summit photographs',
    share: '≈ 30% of all ascents',
    difficulty: 'Long exposed ridge above 8,000 m with three rock steps; the Second Step is climbed by a fixed ladder',
    verticalGain: '≈ 2,450 m from Advanced Base',
    summary:
      'The line of the British expeditions of the 1920s: up the East Rongbuk Glacier to the North Col, then the north ridge to the north-east ridge and its three steps. Drier and windier than the Nepal side, with a far longer summit day.',
    waypoints: [
      [28.0265, 86.9425], // ABC
      [28.0184, 86.9380],
      [28.0130, 86.9350],
      [28.0120, 86.9330], // North Col
      [28.0082, 86.9333],
      [28.0070, 86.9328], // C2
      [28.0009, 86.9303],
      [27.9936, 86.9273], // C3
      [27.9917, 86.9265], // First Step
      [27.9905, 86.9260], // Second Step
      [27.9895, 86.9255], // Third Step
      [27.9881, 86.9250], // Summit
    ],
    camps: [
      { name: 'Advanced Base', alt: 6400, lat: 28.0265, lon: 86.9425, blurb: 'At the head of the East Rongbuk Glacier, reached by yak from the Rongbuk Base Camp at 5,150 m.' },
      { name: 'North Col', alt: 7020, lat: 28.0120, lon: 86.9330, blurb: 'Camp 1, on the saddle between Everest and Changtse, above the ice slope that killed seven Sherpas in 1922.' },
      { name: 'Camp 2', alt: 7500, lat: 28.0070, lon: 86.9328, blurb: 'On the broad, windswept north ridge. Tents are routinely destroyed here.' },
      { name: 'Camp 3', alt: 8300, lat: 27.9936, lon: 86.9273, blurb: 'The highest camp on any route, on sloping ledges below the ridge crest. Summit night starts here at around 11 pm.' },
    ],
    hazards: ['north-col-slope', 'northeast-ridge', 'second-step', 'death-zone'],
  },
  {
    id: 'westridge',
    name: 'West Ridge',
    aka: 'Hornbein Couloir · the American route',
    color: '#7dffb3',
    firstAscent: '22 May 1963, Tom Hornbein & Willi Unsoeld (USA), descending the South Col route in the first traverse of the mountain',
    share: 'A handful of ascents; the direct line is rarely attempted',
    difficulty: 'Long mixed ridge to the West Shoulder, then the 45-55° Hornbein Couloir on the North Face',
    verticalGain: '≈ 2,850 m from the Lho La',
    summary:
      'From the Lho La the ridge climbs to the West Shoulder and along the crest, then breaks onto the north face to finish up a narrow gully, the Hornbein Couloir. Hornbein and Unsoeld climbed it knowing they could not retreat, bivouacked at 8,500 m without shelter, and survived.',
    waypoints: [
      [28.0090, 86.8750], // Lho La
      [28.0020, 86.8800],
      [27.9977, 86.8884], // West Shoulder
      [27.9945, 86.9006],
      [27.9924, 86.9087], // C4
      [27.9913, 86.9128], // Hornbein Couloir
      [27.9902, 86.9169], // C5
      [27.9892, 86.9209],
      [27.9881, 86.9250], // Summit
    ],
    camps: [
      { name: 'Lho La', alt: 6000, lat: 28.0090, lon: 86.8750, blurb: 'The col at the head of the Khumbu Icefall, on the Tibetan border. Reached by fixed ropes from the Nepal side.' },
      { name: 'West Shoulder', alt: 7250, lat: 27.9977, lon: 86.8884, blurb: 'A broad snow shoulder where the ridge levels off, exposed to the full force of the jet stream.' },
      { name: 'Camp 4', alt: 7500, lat: 27.9924, lon: 86.9087, blurb: 'On the crest of the ridge before the line drops onto the north face.' },
      { name: 'Camp 5', alt: 8300, lat: 27.9902, lon: 86.9169, blurb: 'Inside the Hornbein Couloir, the highest camp of the 1963 climb.' },
    ],
    hazards: ['hornbein-couloir', 'death-zone'],
  },
  {
    id: 'swface',
    name: 'Southwest Face',
    aka: 'Bonington route · the Rock Band',
    color: '#c77dff',
    firstAscent: '24 September 1975, Doug Scott & Dougal Haston (British expedition led by Chris Bonington)',
    share: 'A few ascents; not repeated since the 1980s',
    difficulty: 'Sustained 50-60° face with a 300 m rock cliff at 8,300 m; siege-style with thousands of metres of fixed rope',
    verticalGain: '≈ 2,400 m from the Western Cwm',
    summary:
      'The huge face that rises straight out of the Western Cwm. The 1975 expedition breached the Rock Band through a hidden gully and put two climbers on the summit at 6 pm; they survived an open bivouac at 8,760 m, the highest anyone had ever slept.',
    waypoints: [
      [27.9847, 86.8933], // Camp 2 in the Cwm
      [27.9790, 86.9020],
      [27.9808, 86.9066],
      [27.9826, 86.9112], // C3
      [27.9845, 86.9158], // C4
      [27.9854, 86.9181], // C5
      [27.9863, 86.9204], // Rock Band
      [27.9868, 86.9215], // C6
      [27.9881, 86.9250], // Summit
    ],
    camps: [
      { name: 'Camp 3', alt: 7000, lat: 27.9826, lon: 86.9112, blurb: 'Snow platforms at the foot of the face proper, in the fall line of everything above.' },
      { name: 'Camp 4', alt: 7500, lat: 27.9845, lon: 86.9158, blurb: 'Box tents bolted to the slope below the Rock Band.' },
      { name: 'Camp 5', alt: 7750, lat: 27.9854, lon: 86.9181, blurb: 'Under the Rock Band, where the 1975 lead climbers searched for a way through.' },
      { name: 'Camp 6', alt: 8300, lat: 27.9868, lon: 86.9215, blurb: 'A single tent above the Rock Band, from which Scott and Haston climbed to the summit.' },
    ],
    hazards: ['sw-face-avalanche', 'rock-band', 'death-zone'],
  },
  {
    id: 'kangshung',
    name: 'Kangshung Face',
    aka: 'Neverest Buttress · the East Face from Tibet',
    color: '#ffc14d',
    firstAscent: '12 May 1988, Stephen Venables (UK) reaching the summit without oxygen; Anderson, Webster and Teare stopped short',
    share: 'Two lines, a handful of ascents',
    difficulty: 'Steep ice buttress under hanging glaciers, then the South Col route',
    verticalGain: '≈ 2,450 m to the South Col',
    summary:
      'The remote east face, three kilometres of ice and serac that Mallory dismissed in 1921. A four-person team climbed the buttress to the South Col in 1988 without oxygen or Sherpa support; Venables went on alone to the summit and spent a night out on the descent.',
    waypoints: [
      [27.9780, 86.9650], // Kangshung Base
      [27.9769, 86.9582],
      [27.9764, 86.9548],
      [27.9758, 86.9514], // C1
      [27.9747, 86.9446],
      [27.9742, 86.9412], // C2
      [27.9736, 86.9378],
      [27.9731, 86.9344],
      [27.9725, 86.9305], // South Col, joins the normal route
    ],
    camps: [
      { name: 'Kangshung Base', alt: 5450, lat: 27.9780, lon: 86.9650, blurb: 'On the Kangshung Glacier in a lonely valley of Tibet, a week’s walk from the road.' },
      { name: 'Camp 1', alt: 6400, lat: 27.9758, lon: 86.9514, blurb: 'On top of the buttress, above the worst of the serac fall.' },
      { name: 'Camp 2', alt: 7150, lat: 27.9742, lon: 86.9412, blurb: 'A snow cave on the upper slopes below the South Col.' },
    ],
    hazards: ['kangshung-avalanche', 'south-col'],
    joins: 'southcol',
  },
]

const hazards = [
  {
    id: 'khumbu-icefall', name: 'Khumbu Icefall', lat: 27.9972, lon: 86.8668, alt: 5700, radius: 420, severity: 5,
    kind: 'Serac collapse · crevasses',
    blurb: 'A 700 m tumbling glacier of house-sized ice blocks that moves about a metre a day. Climbers cross it before dawn on ladders lashed over crevasses, up to ten times in a season. It has killed more people than any other feature on the mountain.',
    incidents: ['18 Apr 2014, serac avalanche kills 16 Nepali workers', '25 Apr 2015, earthquake avalanche from Pumori sweeps Base Camp; 22 die'],
  },
  {
    id: 'western-cwm', name: 'Western Cwm', lat: 27.9880, lon: 86.8880, alt: 6300, radius: 400, severity: 3,
    kind: 'Heat · hidden crevasses',
    blurb: 'A silent valley of snow between Everest, Nuptse and Lhotse that becomes an oven by mid-morning. Crevasses are bridged by ladders; the walls above shed avalanches across the route.',
    incidents: [],
  },
  {
    id: 'lhotse-face', name: 'Lhotse Face', lat: 27.9736, lon: 86.9200, alt: 7200, radius: 350, severity: 4,
    kind: 'Ice · falls · rockfall',
    blurb: 'A 1,200 m sheet of blue ice at 40-50°. Rock and ice fall from above, and anyone who unclips from the fixed line can slide the whole face.',
    incidents: ['2023, a record season: several climbers die of exhaustion or falls on the face'],
  },
  {
    id: 'south-col', name: 'South Col', lat: 27.9725, lon: 86.9305, alt: 7950, radius: 260, severity: 4,
    kind: 'Wind · exposure · crowding',
    blurb: 'A barren saddle of rock and old oxygen bottles at the edge of the jet stream, where winds routinely exceed 100 km/h. Summit pushes start here around 9 pm.',
    incidents: ['10-11 May 1996, a storm traps climbers above the col; eight die'],
  },
  {
    id: 'balcony', name: 'The Balcony', lat: 27.9834, lon: 86.9266, alt: 8400, radius: 160, severity: 4,
    kind: 'Exhaustion · oxygen',
    blurb: 'The first rest point on the ridge, where oxygen bottles are swapped. Climbers who are too slow here are turned around, or should be.',
    incidents: ['2019, queues of more than 200 people above here in a narrow window; 11 die that season'],
  },
  {
    id: 'hillary-step', name: 'Hillary Step', lat: 27.9873, lon: 86.9253, alt: 8790, radius: 120, severity: 5,
    kind: 'Exposure · queues',
    blurb: 'A 12 m rock step, largely a snow slope since the 2015 earthquake, on a knife-edge with 2,400 m drops into Tibet and 3,000 m into Nepal. One fixed rope carries traffic in both directions.',
    incidents: ['2019, fatal queues on the summit ridge'],
  },
  {
    id: 'north-col-slope', name: 'North Col slope', lat: 28.0150, lon: 86.9360, alt: 6800, radius: 300, severity: 4,
    kind: 'Avalanche',
    blurb: 'The 400 m ice slope below the North Col loads with windslab after every storm and has avalanched onto climbing parties since 1922.',
    incidents: ['7 Jun 1922, an avalanche kills seven Sherpas: the first deaths on Everest'],
  },
  {
    id: 'northeast-ridge', name: 'Northeast Ridge', lat: 27.9960, lon: 86.9285, alt: 8200, radius: 300, severity: 4,
    kind: 'Exposure · long descent',
    blurb: 'Hours of traverse on loose, outward-sloping slabs above 8,000 m. The bodies along the ridge mark where descents ran out of daylight, oxygen or strength.',
    incidents: ['1996, three climbers die on this side in the same storm as the South Col disaster'],
  },
  {
    id: 'second-step', name: 'Second Step', lat: 27.9905, lon: 86.9260, alt: 8610, radius: 120, severity: 5,
    kind: 'Technical rock at 8,600 m',
    blurb: 'A 30 m cliff on the north-east ridge, climbed since 1975 by a Chinese aluminium ladder. Whether Mallory and Irvine got past it in 1924 remains the mountain’s great question.',
    incidents: ['8 Jun 1924, Mallory and Irvine last seen going strong below the steps'],
  },
  {
    id: 'hornbein-couloir', name: 'Hornbein Couloir', lat: 27.9905, lon: 86.9160, alt: 8000, radius: 250, severity: 5,
    kind: 'Avalanche · no retreat',
    blurb: 'A 500 m gully on the north face at 45-55°, swept by spindrift avalanches, with no reasonable way back down once committed.',
    incidents: [],
  },
  {
    id: 'rock-band', name: 'Rock Band', lat: 27.9863, lon: 86.9204, alt: 8300, radius: 200, severity: 5,
    kind: 'Technical rock · altitude',
    blurb: 'A 300 m cliff across the entire south-west face at 8,300 m. Five expeditions failed under it before the 1975 gully was found.',
    incidents: [],
  },
  {
    id: 'sw-face-avalanche', name: 'Lower face', lat: 27.9820, lon: 86.9090, alt: 7000, radius: 350, severity: 4,
    kind: 'Avalanche · stonefall',
    blurb: 'The snowfields below the Rock Band are strafed by rockfall and powder avalanches from the whole face above.',
    incidents: [],
  },
  {
    id: 'kangshung-avalanche', name: 'Kangshung serac', lat: 27.9755, lon: 86.9500, alt: 6300, radius: 400, severity: 5,
    kind: 'Avalanche · serac',
    blurb: 'The most avalanche-prone face on the mountain; hanging glaciers the size of city blocks calve onto the approach. Mallory judged it not for “men who count their lives”.',
    incidents: ['1983 and 1988 teams narrowly escape serac collapses'],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 27.9881, lon: 86.9250, alt: 8000, radius: 1100, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Above 8,000 m the body can no longer acclimatise. Oxygen pressure is a third of sea level, temperatures fall below −40 °C, and judgement degrades. Nearly everyone here is breathing bottled oxygen; when it runs out, the margin is hours.',
    incidents: ['Most Everest deaths occur on the descent from above this altitude'],
    band: true,
  },
]

const timeline = [
  { year: 1852, title: 'Peak XV', text: 'Radhanath Sikdar, a computer of the Great Trigonometrical Survey of India, works out that the peak labelled XV is the highest in the world. It is named for the former Surveyor General, George Everest, in 1865.' },
  { year: 1921, title: 'Reconnaissance', text: 'The first British expedition, with George Mallory, circles the mountain, finds the East Rongbuk Glacier and reaches the North Col.' },
  { year: 1922, title: 'First attempt', text: 'Climbers reach 8,320 m using oxygen. On 7 June an avalanche below the North Col kills seven Sherpas.' },
  { year: 1924, title: 'Mallory and Irvine', text: 'Edward Norton reaches 8,570 m without oxygen. On 8 June Mallory and Andrew Irvine are seen climbing near the ridge steps, then vanish. Mallory’s body is found in 1999; Irvine’s remains in 2024.' },
  { year: 1953, title: 'First ascent', text: 'Edmund Hillary and Tenzing Norgay reach the summit at 11:30 on 29 May by the South Col route, the news arriving in London on the morning of the Coronation.' },
  { year: 1960, title: 'From Tibet', text: 'A Chinese team climbs the north ridge, passing the Second Step on a human ladder at night. Without photographs, the ascent is doubted for decades.' },
  { year: 1963, title: 'West Ridge', text: 'Tom Hornbein and Willi Unsoeld climb the west ridge and Hornbein Couloir, descend the South Col route, and survive a bivouac at 8,500 m; Unsoeld loses nine toes.' },
  { year: 1975, title: 'Tabei, and the face', text: 'Junko Tabei becomes the first woman on the summit on 16 May. In September Doug Scott and Dougal Haston climb the South-west Face for Chris Bonington’s expedition.' },
  { year: 1978, title: 'Without oxygen', text: 'Reinhold Messner and Peter Habeler reach the summit on 8 May breathing only air, something physiologists had said was impossible.' },
  { year: 1980, title: 'Winter, and alone', text: 'Poles Krzysztof Wielicki and Leszek Cichy make the first winter ascent of any 8,000 m peak on 17 February. In August Messner climbs the north side solo, in the monsoon, in three days.' },
  { year: 1988, title: 'Kangshung', text: 'A four-person team climbs the east face buttress to the South Col without oxygen; Stephen Venables continues alone to the summit.' },
  { year: 1996, title: 'The storm', text: 'On 10-11 May a blizzard catches guided teams high on the mountain. Eight die, including guides Rob Hall and Scott Fischer. Jon Krakauer’s account, Into Thin Air, makes Everest a byword for commercial climbing.' },
  { year: 2014, title: 'The icefall', text: 'A serac avalanche in the Khumbu Icefall kills 16 Nepali workers on 18 April. The Sherpa community ends the season.' },
  { year: 2015, title: 'Earthquake', text: 'The Gorkha earthquake sends an avalanche from Pumori through Base Camp, killing 22. For the first time since 1974 nobody reaches the summit.' },
  { year: 2019, title: 'The queue', text: 'A photograph of more than 200 climbers lined up on the summit ridge goes around the world. Eleven die in the season, most of them in the traffic above the Balcony.' },
  { year: 2023, title: 'Record year', text: 'Nepal issues 478 permits, the most ever; 18 people die, the deadliest season on record. Kami Rita Sherpa climbs the mountain for the 28th time.' },
]

const stats = [
  { label: 'Height', value: '8,849 m', note: 'highest on Earth (2020 survey)' },
  { label: 'First ascent', value: '1953', note: 'Hillary & Tenzing' },
  { label: 'Summits', value: '≈ 12,000', note: 'by roughly 7,000 people' },
  { label: 'Deaths', value: '≈ 340', note: 'about one per hundred summits' },
  { label: 'Without oxygen', value: '≈ 2%', note: 'of all ascents' },
  { label: 'Winter ascent', value: '1980', note: 'first of any 8,000 m peak' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'everest', peak, routes, hazards, timeline, stats, sources }
