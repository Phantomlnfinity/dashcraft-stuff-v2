
let fetchedtracks = [];
let tracks = [];
let IDarr = [];
let players = [];
let profiles = [];
let working = false;
let page = 0;
let trackPage = 0;
let leaderboard = [];
const numbers = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]
const verifiedonly = document.getElementById("verifiedonly");
const removeserphal = document.getElementById("removeserphal");
const recent25 = document.getElementById("recent25");
const leaderboarddropdown = document.getElementById("leaderboarddropdown")
const leaderboarddisplay = document.getElementById("leaderboardlist")
const tracksort = document.getElementById("trackdropdown");
const charthtml = document.getElementById("myChart");
const usernameInput = document.getElementById("usernameInput")
const playerList = document.getElementById("playerList")
let verifiedonlybackup = false
document.getElementById("data").hidden = false;

google.charts.load('current', { packages: ['corechart'] });


usernameInput.addEventListener('input', function() {if (usernameInput.value != "") {playerLookup()} else {playerList.innerHTML = ""}})
recent25.addEventListener('change', calculate)
removeserphal.addEventListener('change', calculate)
leaderboarddropdown.addEventListener('change', calculate)
tracksort.addEventListener('change', function() {trackPage = 0; calculate()})

function lbPageLeft() {
  if (page > 0) {
    page--;
    drawLeaderboard()
  }
}
function lbPageRight() {
  if (page < Math.floor(leaderboard.length / 20)) {
    page++;
    drawLeaderboard()
  }
}


function trackPageLeft() {
  if (trackPage > 0) {
    trackPage--;
    trackBrowser()
  }
}
function trackPageRight() {
  if (trackPage < Math.floor(tracks.length / 15)) {
    trackPage++;
    trackBrowser()
  }
}



function playerLookup() {
  const filteredPlayers = players.filter((player) => player.username.includes(usernameInput.value))
  console.log(filteredPlayers)
  playerList.innerHTML = ""
  for (let i = 0; i < filteredPlayers.length; i++) {
    playerList.innerHTML += "<br>" + playerHTML(filteredPlayers[i].id)
  }

  if (filteredPlayers.length == 1) {
    playerList.innerHTML += "<br>Level " + (filteredPlayers[0].levelData.level + 1) + " (" + filteredPlayers[0].levelData.xpInLevel + "/" + filteredPlayers[0].levelData.totalXpInLevel + ") (" + filteredPlayers[0].levelData.totalXp + " total)"
  }
}


function trackBrowser() {
  document.getElementById("trackpage").innerHTML = '<button type="button" onclick="trackPageLeft()">&lt;</button><b>Page ' + (trackPage+1) + '</b><button type="button" onclick="trackPageRight()" style="float:right;">&gt;</button>'
  console.log(tracks)
  if (tracksort.value == "new") {
    tracks.sort((a, b) => fetchedtracks.findIndex((track) => a._id == track._id) - fetchedtracks.findIndex((track) => b._id == track._id))
  } else if (tracksort.value == "likes") {
    tracks.sort((a, b) => b.likesCount - a.likesCount)
  } else if (tracksort.value == "ratio") {
    tracks.sort((a, b) => b.likesCount/(b.likesCount+b.dislikesCount) - a.likesCount/(a.likesCount+a.dislikesCount))
  } else if (tracksort.value == "players") {
    tracks.sort((a, b) => b.leaderboardTotalCount - a.leaderboardTotalCount)
  } else if (tracksort.value == "length") {
    tracks.sort((a, b) => a.leaderboard[0].time - b.leaderboard[0].time)
  }
              
  var html = "";
  for (let i = 0+trackPage*15; i < 15+trackPage*15 && i+trackPage*15 < tracks.length; i++) {
    html += '<div class="gallery"><a target="_blank" href="https://dashcraft.io/?t=' + tracks[i]._id + '">'
    html += '<img src="https://cdn.dashcraft.io/v2/prod/track-thumbnail/sm/' + tracks[i]._id + '.jpg?v=4">'
    html += '<div class="desc">' + playerHTML(tracks[i].user._id) + '</div></a></div>'
  }
  document.getElementById("trackBrowser").innerHTML = html;
}


function playerHTML(player) {
  var playerhtml = ""
  var playerdata = players.find(p => p.id == player)
  playerhtml = "<img src='/leagues/" + playerdata.league + ".png' style='width: 14px; height: 14px'>"
  playerhtml += " <a href='https://dashcraft.io/?u=" + player + "' target='_blank' style='color: white;'>"
  playerhtml += playerdata.username + "</a>"
  return playerhtml
}


function drawLeaderboard() {
  let html = "<table><tr><th style='width:15%'>Position</th><th style='width:70%'>Player</th><th style='width:15%'>" + valuetype + "</th></tr>"
  for (let i = 0; i < 20; i++) {
    if (leaderboard.length > page * 20 + i) {
      html += "<tr><td>" + (page * 20 + i + 1) + "</td>"
      html += "<td>" + playerHTML(leaderboard[page * 20 + i][2].id) + "</td>"
      html += "<td>" + leaderboard[page * 20 + i][1] + "</td></tr>"
    } else {
      html += "<tr><td><br /></td><td><br /></td><td><br /></td></tr>"
    }
  }
  html += "</table>"


  leaderboarddisplay.innerHTML = html

  document.getElementById("leaderboardpage").innerHTML = '<br><button type="button" onclick="lbPageLeft()">&lt;</button><b>Page ' + (page + 1) + '</b><button type="button" onclick="lbPageRight()" style="float:right;">&gt;</button>'
}

function drawChart(data1, type) {
  let data = data1;
  if (type != "pie") {
    data.Wf.splice(25, data.Wf.length - 25)
  }
  // Set Options
  const options = {
    //title: 'Leaderboard',
    backgroundColor: { fill: 'transparent' },
    vAxis: {
      textStyle: {
        fontSize: 15,
        color: 'lightgrey'
      }

    },
    chartArea: { left: 150, top: 0 },

    legend: { textStyle: { color: 'white' } },
    height: 750
  };

  if (type != "pie") {
    options.legend.position = 'none'
  }

  // Draw
  if (type == "pie") {
    chartType = google.visualization.PieChart
    charthtml.height = 200
  } else {
    chartType = google.visualization.BarChart
    charthtml.height = 400
  }
  const chart = new chartType(charthtml);
  chart.draw(data, options);

}

async function usePresetInfo() {
  fetch1 = fetch('./presetTracks.json')
    .then((response) => response.json())
    .then((json) => {
      return json;
    });
  
  fetch2 = fetch('./presetProfiles.json')
    .then((response) => response.json())
    .then((json) => {
      return json;
    });


  fetchedtracks = await fetch1
  profiles = await fetch2
  console.log(fetchedtracks)
  console.log(profiles)
  calculate();
}

async function fetchInfo() {
  if (working) {
    return;
  }
  working = true;

  if (verifiedonly.checked) {
    document.getElementById("followers").hidden = false;
    document.getElementById("likes").hidden = false;
  } else {
    document.getElementById("followers").hidden = true;
    document.getElementById("likes").hidden = true;
    if (leaderboarddropdown.value == "followers" || leaderboarddropdown.value == "likes") {
      leaderboarddropdown.value = "tmpoints"
    }
  }

  if (verifiedonly.checked) {
    var url = "https://api.dashcraft.io/trackv2/global3?sort=new&verifiedOnly=true&page="
  } else {
    var url = "https://api.dashcraft.io/trackv2/global3?sort=new&verifiedOnly=false&page="
  }

  let verifiedonlychecked = verifiedonly.checked

  start = Date.now();
  var done = false
  let j = 0;
  while (done == false) {
    var fetches = [];
    for (let i = 0; i < 50; i++) {
      fetches.push(
        fetch(url + (j * 50 + i) + "&pageSize=50")
          .then((response) => response.json())
          .then((json) => {
            let json1 = json.tracks;
            let IDarr = [];
            for (let a = 0; a < json1.length; a++) {
              IDarr.push(json1[a]._id);
            }
            return IDarr;
          }));
    }
    const result = await Promise.all(fetches)
    if (result[result.length - 1].length < 50) {
      done = true
    }
    for (let i = 0; i < result.length; i++) {
      IDarr = IDarr.concat(result[i]);
    }
    j += 1
  }

  console.log("ID fetch time: " + (Date.now() - start) + "ms")

  start = Date.now();
  done = false;
  j = 0;
  while (done == false) {
    var fetches = [];
    for (let i = 0; i < 50; i++) {
      if (j * 50 + i >= IDarr.length) {
        done = true;
        break;
      }
      fetches.push(
        fetch("https://api.dashcraft.io/trackv2/" + IDarr[i + j * 50] + "?supportsLaps1=true", {
          headers: {
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWM0NmMzNGExYmEyMjQyNGYyZTAwMzIiLCJpbnRlbnQiOiJvQXV0aCIsImlhdCI6MTcwNzM3MTU3Mn0.0JVw6gJhs4R7bQGjr8cKGLE7CLAGvyuMiee7yvpsrWg'
          }
        })
          .then((response) => response.json())
          .then((json) => {
            return (json)
          })
      );
    }
    const result = await Promise.all(fetches)
    fetchedtracks = fetchedtracks.concat(result)
    j += 1
  }

  if (verifiedonlychecked == true) {
    let playerids = [];
    for (let i = 0; i < fetchedtracks.length; i++) {
      if (!playerids.includes(fetchedtracks[i].user._id)) {
        playerids.push(fetchedtracks[i].user._id)
      }
      for (let j = 0; j < fetchedtracks[i].leaderboard.length; j++) {
        if (!playerids.includes(fetchedtracks[i].leaderboard[j].user._id)) {
          playerids.push(fetchedtracks[i].leaderboard[j].user._id)
        }
      }
    }

    console.log("Track fetch time: " + (Date.now() - start) + "ms")

    start = Date.now();
    done = false;
    j = 0;
    while (done == false) {
      var fetches = [];
      for (let i = 0; i < 50; i++) {
        if (j * 50 + i >= playerids.length) {
          done = true;
          break;
        }
        fetches.push(
          fetch("https://api.dashcraft.io/userv2/" + playerids[i + j * 50], {
            headers: {
              'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWM0NmMzNGExYmEyMjQyNGYyZTAwMzIiLCJpbnRlbnQiOiJvQXV0aCIsImlhdCI6MTcwNzM3MTU3Mn0.0JVw6gJhs4R7bQGjr8cKGLE7CLAGvyuMiee7yvpsrWg'
            }
          })
            .then((response) => response.json())
            .then((json) => {
              return (json)                                                      
            })
        );
      }
      const result = await Promise.all(fetches)
      profiles = profiles.concat(result)
      j += 1
    }

    console.log("Profile fetch time: " + (Date.now() - start) + "ms")
  }
  working = false;
  console.log(fetchedtracks);
  console.log(profiles)
  calculate()
}

function calculate() {
  players = []
  tracks = structuredClone(fetchedtracks)

  if (recent25.checked) {
    tracks = tracks.splice(0, 25)
  }
  for (let i = 0; i < tracks.length; i++) {
    if (removeserphal.checked) {
      serphalpos = tracks[i].leaderboard.findIndex(x => x.user._id == "662334de69042c3463e0eefc")
      if (serphalpos != -1) {
        tracks[i].leaderboard.splice(serphalpos, 1)
      }
    }
  }
  console.log("Number of tracks: " + tracks.length)
  for (let i = 0; i < tracks.length; i++) {
    if (!players.find(x => x.id == tracks[i].user._id)) {
      players.push({ username: tracks[i].user.username, id: tracks[i].user._id, totalPositions: 0, totalPos: 0, dcpoints: 0, tmpoints: 0, wrcount: 0, tracks: 0, totalTime: 0, levelData: {level: tracks[i].user.levelData.level + 1, xpInLevel: tracks[i].user.levelData.xpInLevel, totalXpInLevel: tracks[i].user.levelData.totalXpInLevel, totalXp: tracks[i].user.levelData.totalXp}, league: tracks[i].user.leagueNr + 1 })
    }
    var player = players.find(x => x.id == tracks[i].user._id);
    player.tracks += 1;

    for (let j = 0; j < tracks[i].leaderboard.length; j++) {
      if (!players.find(x => x.id == tracks[i].leaderboard[j].user._id)) {
        players.push({ username: tracks[i].leaderboard[j].user.username, id: tracks[i].leaderboard[j].user._id, totalPositions: 0, totalPos: 0, dcpoints: 0, tmpoints: 0, wrcount: 0, tracks: 0, totalTime: 0, levelData: {level: tracks[i].user.levelData.level + 1, xpInLevel: tracks[i].user.levelData.xpInLevel, totalXpInLevel: tracks[i].user.levelData.totalXpInLevel, totalXp: tracks[i].user.levelData.totalXp}, league: tracks[i].leaderboard[j].user.leagueNr + 1 })
      }
      var player = players.find(x => x.id == tracks[i].leaderboard[j].user._id)
      player.totalPositions += 1
      player.totalPos += j + 1
      player.totalTime += tracks[i].leaderboard[j].time
      player.dcpoints += Math.ceil((1.051271) ** (-j) * 1000000 / tracks.length)
      player.tmpoints += Math.round(1000000 / tracks.length / (j + 1))
      if (j == 0) {
        player.wrcount += 1
      }
    }
  }

  console.log("Number of players: " + players.length)

  leaderboard = []
  for (let i = 0; i < players.length; i++) {
    var useradded = true
    if (leaderboarddropdown.value == "tmpoints" && players[i].tmpoints != 0) {
      leaderboard.push([players[i].username, players[i].tmpoints])
      charttype = "bar"
      sortdir = "descending"
      valuetype = "Points"
    } else if (leaderboarddropdown.value == "dcpoints" && players[i].dcpoints != 0) {
      leaderboard.push([players[i].username, players[i].dcpoints])
      charttype = "bar"
      sortdir = "descending"
      valuetype = "Points"
    } else if (leaderboarddropdown.value == "wrcount" && players[i].wrcount != 0) {
      leaderboard.push([players[i].username, players[i].wrcount])
      charttype = "pie"
      sortdir = "descending"
      valuetype = "World Records"
    } else if (leaderboarddropdown.value == "averageposall" && players[i].totalPositions == tracks.length) {
      leaderboard.push([players[i].username, Math.round(players[i].totalPos / players[i].totalPositions * 100) / 100])
      charttype = "bar"
      sortdir = "ascending"
      valuetype = "Average Position"
    } else if (leaderboarddropdown.value == "averagepos" && players[i].totalPositions != 0) {
      leaderboard.push([players[i].username, Math.round(players[i].totalPos / players[i].totalPositions * 100) / 100])
      charttype = "bar"
      sortdir = "ascending"
      valuetype = "Average Position"
    } else if (leaderboarddropdown.value == "totaltime" && players[i].totalPositions == tracks.length) {
      leaderboard.push([players[i].username, players[i].totalTime])
      charttype = "bar"
      sortdir = "ascending"
      valuetype = "Time"
    } else if (leaderboarddropdown.value == "level") {
      leaderboard.push([players[i].username, players[i].levelData.level])
      charttype = "bar"
      sortdir = "descending"
      valuetype = "Level"
    } else if (leaderboarddropdown.value == "tracks" && players[i].tracks != 0) {
      leaderboard.push([players[i].username, players[i].tracks])
      charttype = "pie"
      sortdir = "descending"
      valuetype = "Tracks"
    } else if (leaderboarddropdown.value == "followers" && profiles.find(a => a._id == players[i].id).followersCount != 0) {
      leaderboard.push([players[i].username, profiles.find(a => a._id == players[i].id).followersCount])
      charttype = "bar"
      sortdir = "descending"
      valuetype = "Followers"
    } else if (leaderboarddropdown.value == "likes" && profiles.find(a => a._id == players[i].id).likesCount != 0) {
      leaderboard.push([players[i].username, profiles.find(a => a._id == players[i].id).likesCount])
      charttype = "bar"
      sortdir = "descending"
      valuetype = "Likes"
    } else {
      useradded = false
    }
    if (useradded) {
      leaderboard[leaderboard.length - 1].push(players[i])
    }
  }
  if (sortdir == "descending") {
    leaderboard.sort((a, b) => b[1] - a[1])
  } else if (sortdir == "ascending") {
    leaderboard.sort((a, b) => a[1] - b[1])
  }

  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Player');
  data.addColumn('number', valuetype);
  for (let i = 0; i < leaderboard.length; i++) {
    data.addRow([leaderboard[i][0], leaderboard[i][1]])
  }
  drawChart(data, charttype)


  page = 0
  drawLeaderboard()
  trackBrowser()
  console.log(leaderboard)

  document.getElementById("data").hidden = false;
}


