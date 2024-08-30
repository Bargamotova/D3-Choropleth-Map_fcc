
const COUNTY_URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
const EDUCATION_URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

const space = { top: 20, right: 20, bottom: 20, left: 20 };
let w = 960 - space.left - space.right,
  h = 600 - space.top - space.bottom;

const svg = d3.select('#map_container')
  .append('svg')
  .attr('class', 'map')
  .attr('width', w + space.left + space.right)
  .attr('height', h + space.top + space.bottom)

const tooltip = d3.select('#tooltip').style('opacity', 0);
const format = d => `${Math.round(d)}%`;

Promise.all
  ([d3.json(COUNTY_URL), d3.json(EDUCATION_URL)])
  .then(res => {
    const [county, education] = res;
    createMap(county, education)
  })
  .catch(err => console.log(err))


function createMap(dataCount, dataEducation) {
  const minBachelors = d3.min(dataEducation, (d) => d.bachelorsOrHigher);
  const maxBachelors = d3.max(dataEducation, (d) => d.bachelorsOrHigher);
  const colors = d3.schemeBlues[9];
  const path = d3.geoPath();

  const colorsThreshold =
    d3.scaleThreshold()
      .domain(
        (function (min, max, count) {
          const array = [];
          const step = (max - min) / count;
          const base = min;
          for (let i = 0; i < count; i++) {
            array.push(base + i * step);
          }
          return array;
        })(minBachelors, maxBachelors, colors.length)
      ).range(colors);

  createLegend(minBachelors, maxBachelors, colors, colorsThreshold);
  // create counties
  svg.append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(dataCount, dataCount.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', (d) => d.id)
    .attr('data-education', getBachelor)
    .attr('fill', (d) => colorsThreshold(getBachelor(d)))
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.2)
    .attr('d', path)
    .on("mouseover", (e, d) => {
      tooltip
        .style('opacity', 0.9)
        .style("left", e.pageX + 20 + 'px')
        .style("top", e.pageY - 50 + 'px')
        .attr('data-education', getBachelor(d))
        .html(`
          <p>State: <span>${getState(d)} </span></p> 
          <p>County: <span>${getAreaName(d)}</span></p>
          ${getBachelor(d)}%
          `);
      tooltip
        .append('svg')
        .attr('class', 'pin')
        .style('margin-left', 15)
        .attr('width', 30)
        .attr('height', 8);
      tooltip
        .select('.pin')
        .append('rect')
        .attr('width', 30)
        .attr('height', 8)
        .attr('x', 0)
        .attr('y', 0)
        .attr('fill', colorsThreshold(getBachelor(d)))
    })
    .on('mouseout', () => tooltip.style('opacity', 0));

  //helper functions
  function getBachelor(d) {
    let result = dataEducation.filter((obj) => obj.fips === d.id);
    const { bachelorsOrHigher } = result[0];
    if (result[0]) {
      return bachelorsOrHigher;
    }
    return 0;
  }
  function getAreaName(d) {
    let result = dataEducation.filter((obj) => obj.fips === d.id);
    const { area_name } = result[0];
    if (result[0]) {
      const rest = area_name.split(' ').splice(-1).join().split('').length;
      return area_name.slice(0, -rest);
    }
    return 0;
  }
  function getState(d) {
    let result = dataEducation.filter((obj) => obj.fips === d.id);
    const { state } = result[0];
    if (result[0]) {
      return convertAbbr(state);
    }
    return 0;
  }

  // create border of states
  svg.append('path')
    .datum(topojson.mesh(dataCount, dataCount.objects.states, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-linejoin", "round").attr('d', path);
}

// @create legend 
function createLegend(min, max, data, colors) {
  const widthOfRect = 30;
  const legendBox =
    svg.append('g')
      .attr('id', 'legend')
      .attr('width', widthOfRect * data.length)
      .attr('transform', `translate(600, 20)`);

  legendBox.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('width', widthOfRect)
    .attr('height', 10)
    .attr('x', (_, i) => i * widthOfRect)
    .attr('fill', (d) => d);

  // legend axis x
  const legendScaleX =
    d3.scaleLinear()
      .domain([min, max])
      .range([min, widthOfRect * data.length]);

  const legendXAxis =
    d3.axisBottom()
      .scale(legendScaleX)
      .tickSize(10)
      .tickValues(colors.domain())
      .tickFormat((d) => format(d));

  // remove black line in the legend
  legendBox.call(legendXAxis).select('.domain').remove();
  legendBox.selectAll('.tick line').attr('opacity', 0.5).attr('stroke-width', 0.5)
}
// converter 
const states = [
  ['Alabama', 'AL'],
  ['Alaska', 'AK'],
  ['American Samoa', 'AS'],
  ['Arizona', 'AZ'],
  ['Arkansas', 'AR'],
  ['Armed Forces Americas', 'AA'],
  ['Armed Forces Europe', 'AE'],
  ['Armed Forces Pacific', 'AP'],
  ['California', 'CA'],
  ['Colorado', 'CO'],
  ['Connecticut', 'CT'],
  ['Delaware', 'DE'],
  ['District Of Columbia', 'DC'],
  ['Florida', 'FL'],
  ['Georgia', 'GA'],
  ['Guam', 'GU'],
  ['Hawaii', 'HI'],
  ['Idaho', 'ID'],
  ['Illinois', 'IL'],
  ['Indiana', 'IN'],
  ['Iowa', 'IA'],
  ['Kansas', 'KS'],
  ['Kentucky', 'KY'],
  ['Louisiana', 'LA'],
  ['Maine', 'ME'],
  ['Marshall Islands', 'MH'],
  ['Maryland', 'MD'],
  ['Massachusetts', 'MA'],
  ['Michigan', 'MI'],
  ['Minnesota', 'MN'],
  ['Mississippi', 'MS'],
  ['Missouri', 'MO'],
  ['Montana', 'MT'],
  ['Nebraska', 'NE'],
  ['Nevada', 'NV'],
  ['New Hampshire', 'NH'],
  ['New Jersey', 'NJ'],
  ['New Mexico', 'NM'],
  ['New York', 'NY'],
  ['North Carolina', 'NC'],
  ['North Dakota', 'ND'],
  ['Northern Mariana Islands', 'NP'],
  ['Ohio', 'OH'],
  ['Oklahoma', 'OK'],
  ['Oregon', 'OR'],
  ['Pennsylvania', 'PA'],
  ['Puerto Rico', 'PR'],
  ['Rhode Island', 'RI'],
  ['South Carolina', 'SC'],
  ['South Dakota', 'SD'],
  ['Tennessee', 'TN'],
  ['Texas', 'TX'],
  ['US Virgin Islands', 'VI'],
  ['Utah', 'UT'],
  ['Vermont', 'VT'],
  ['Virginia', 'VA'],
  ['Washington', 'WA'],
  ['West Virginia', 'WV'],
  ['Wisconsin', 'WI'],
  ['Wyoming', 'WY'],
]
function convertAbbr(abbr) {
  let state_name = '';
  states.filter(el => {
    if (el[1] === abbr) {
      state_name = el[0]
    } else {
      return abbr;
    }
  })
  return state_name;
}

