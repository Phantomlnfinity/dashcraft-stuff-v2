let fetchedtracks = [];
let fetchedjson = [];
let tracks = [];
let IDarr = [];
let players = [];
let profiles = [];
let working = false;
let page = 0;
let trackPage = 0;
let leaderboard = [];
let filteredPlayers = [];
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
const loadingProgress = document.getElementById("loadingProgress")
let verifiedonlybackup = false


let progress = 0


function findTime(a, time) {
    if (a.leaderboard.length != 0) {
        return Math.floor(a.leaderboard[0].time * 100) / 100 == time
    } else {
        return false
    }
}

function setPlayerJson(user) {
  let playerJson = { 
    username: user.username, 
    id: user._id, 
    followers: 0,
    likes: 0,
    totalPositions: 0, 
    totalPos: 0, 
    dcpoints: 0, 
    tmpoints: 0, 
    wrcount: 0, 
    tracks: 0, 
    totalTime: 0, 
    levelData: {
      level: user.levelData.level + 1, 
      xpInLevel: user.levelData.xpInLevel, 
      totalXpInLevel: user.levelData.totalXpInLevel, 
      totalXp: user.levelData.totalXp
    }, 
    league: user.leagueNr + 1 
  }
  
  if (profiles.length > 0) {
    playerJson.likes = profiles.find((a) => a._id == user._id).likesCount
    playerJson.followers = profiles.find((a) => a._id == user._id).followersCount
  }
  return playerJson
}


google.charts.load('current', { packages: ['corechart'] });


usernameInput.addEventListener('input', playerLookup)
recent25.addEventListener('change', function() {trackPage = 0; page = 0; calculate()})
removeserphal.addEventListener('change', function() {page = 0; calculate()})
leaderboarddropdown.addEventListener('change', function() {trackPage = 0; page = 0; calculate()})
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


function findPlayer(playerId) {
  return players.find((a) => a.id == playerId)
}



function recommendedPoints(track) {
  
  let points = 0;
  if (track.likesCount / (track.leaderboardTotalCount + 1) < 0.3) {
    points += 15 * track.likesCount / (track.leaderboardTotalCount + 1) // players to like ratio
  } else {
    points += 4.5
  }
  points += 3 * track.likesCount / (track.likesCount + track.dislikesCount + 1) // like to dislike ratio
  points += Math.log10(findPlayer(track.user._id).likes + 1) // total player likes
  points += Math.log2(findPlayer(track.user._id).followers + 1) // user followers
  points += track.user.leagueNr / 3
  if (track.leaderboard.length > 0) {
    points += Math.log2(track.json.trackPieces.length / track.leaderboard[0].time) // track pieces/length (deco amount)
  }
  points -= Math.log10(fetchedtracks.findIndex((a) => a._id == track._id) / 50 + 2); // subtract points from older tracks
  return points
}



function playerLookup() {
  playerList.innerHTML = ""

  filteredPlayers = []
  if (usernameInput.value.length != 0) {
    filteredPlayers = players.filter((player) => player.username.toLowerCase().includes(usernameInput.value.toLowerCase()))
    let filteredPlayer = filteredPlayers.find((player) => player.username == usernameInput.value)
    if (filteredPlayer) {
      filteredPlayers = [filteredPlayer]
    }

    console.log(filteredPlayers)
    for (let i = 0; i < filteredPlayers.length && i < 50; i++) {
      playerList.innerHTML += "<br>" + playerHTML(filteredPlayers[i].id)
    }

    if (filteredPlayers.length == 1) {
      if (filteredPlayers[0].levelData.level != 100) {
        playerList.innerHTML += "<br>Level " + filteredPlayers[0].levelData.level + " (" + filteredPlayers[0].levelData.xpInLevel + "/" + filteredPlayers[0].levelData.totalXpInLevel + ") (" + filteredPlayers[0].levelData.totalXp + " total)"
      } else {
        playerList.innerHTML += "<br>Level 100 (Max) (229124 total)"
      }
      if (tracksort.value == "ownTracks" || tracksort.value == "position") {
        trackPage = 0
      }
    }
  }
  trackBrowser();
}


function trackBrowser() {
  //tracks = fetchedtracks;
  document.getElementById("trackpage").innerHTML = '<button type="button" onclick="trackPageLeft()">&lt;</button><b>Page ' + (trackPage+1) + '</b><button type="button" onclick="trackPageRight()" style="float:right;">&gt;</button>'
  if (tracksort.value == "new") {
    tracks.sort((a, b) => fetchedtracks.findIndex((track) => a._id == track._id) - fetchedtracks.findIndex((track) => b._id == track._id))
  } else if (tracksort.value == "likes") {
    tracks.sort((a, b) => b.likesCount - a.likesCount)
  } else if (tracksort.value == "ratio") {
    tracks = tracks.filter((filterTrack) => filterTrack.likesCount > 0 && filterTrack.dislikesCount > 0)
    tracks.sort((a, b) => b.likesCount/(b.likesCount+b.dislikesCount) - a.likesCount/(a.likesCount+a.dislikesCount))
  } else if (tracksort.value == "players") {
    tracks.sort((a, b) => b.leaderboardTotalCount - a.leaderboardTotalCount)
  } else if (tracksort.value == "length") {
    tracks = tracks.filter((filterTrack) => filterTrack.leaderboard.length > 0)
    tracks.sort((a, b) => b.leaderboard[0].time - a.leaderboard[0].time)
  } else if (tracksort.value == "objects") {
    tracks.sort((a, b) => b.json.trackPieces.length - a.json.trackPieces.length)
  } else if (tracksort.value == "unfinished") {
    tracks = tracks.filter((filterTrack) => filterTrack.leaderboard.length == 0)
  } else if (tracksort.value == "position") {
    if (filteredPlayers.length == 1) {
      tracks.sort(function(b, a) {
        recordA = a.leaderboard.findIndex((c) => c.user._id == filteredPlayers[0].id)
        recordB = b.leaderboard.findIndex((c) => c.user._id == filteredPlayers[0].id)
        if (recordA >= 0 && recordB >= 0) {
          return (recordB + (b.leaderboard[recordB].time - b.leaderboard[0].time)/1000) - (recordA + (a.leaderboard[recordA].time - a.leaderboard[0].time)/1000)
        } else if (recordA >= 0) {
          return 1
        } else if (recordB >= 0) {
          return -1
        } else {
          return 0
        }
      })
    } else {
      tracks = [];
    }
  } else if (tracksort.value == "ownTracks") {
    if (filteredPlayers.length == 1) {
      tracks = tracks.filter((filterTrack) => filterTrack.user._id == filteredPlayers[0].id)
    } else {
      tracks = [];
    }
  } else if (tracksort.value == "recommended") {
    tracks.sort((a, b) => recommendedPoints(b) - recommendedPoints(a))
  }
              
  var html = "";
  for (let i = trackPage*15; i < trackPage*15+15; i++) {
    if (i < tracks.length) {
      html += '<div class="gallery"><a target="_blank" href="https://dashcraft.io/?t=' + tracks[i]._id + '">'
      html += '<img src="https://cdn.dashcraft.io/v2/prod/track-thumbnail/sm/' + tracks[i]._id + '.jpg?v=4">'
      html += '<div class="desc">' + playerHTML(tracks[i].user._id)
      html += '<br><img src = "like.png"style="width: 14px; height: 14px"> ' + tracks[i].likesCount + '/' + tracks[i].dislikesCount
      if (filteredPlayers.length == 1) {
        if (tracks[i].leaderboard.find((c) => c.user._id == filteredPlayers[0].id)) {
          var pos = tracks[i].leaderboard.findIndex((c) => c.user._id == filteredPlayers[0].id) + 1
        } else {
          var pos = "N/A"
        }
      } else {
        var pos = "N/A"
      }
      html += '<br><img src = "podium.png" style="width: 14px; height: 14px"> ' +  pos

      
      html += '</div></a></div>'
    } else {
      html += '<div class="gallery"><img><div class="desc"><br><br><br></div></div>'
    }
  }
  document.getElementById("trackBrowser").innerHTML = html;
}


function playerHTML(player) {
  var playerhtml = ""
  var playerdata = players.find(p => p.id == player)
  playerhtml = "<img src='leagues/" + playerdata.league + ".png' style='width: 14px; height: 14px'>"
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
  loadingProgress.innerHTML = "Fetching..."

  if (verifiedonly.checked) {
    verifiedonlychecked = true

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

    fetch3 = fetch('./presetJson.json')
      .then((response) => response.json())
      .then((json) => {
        return json;
      });

      fetchedtracks = await fetch1
      profiles = await fetch2
      fetchedjson = await fetch3

      for (let i = 0; i < fetchedtracks.length; i++) {
        fetchedtracks[i].json = fetchedjson[i]
      };
  } else {
    verifiedonlychecked = false
    fetch1 = fetch('./presetGlobal.json')
      .then((response) => response.json())
      .then((json) => {
        return json;
      });

    fetchedtracks = await fetch1
    
  }
  


  loadingProgress.innerHTML = ""

  calculate();
}

async function retryFetch(tries, ...args) {
  if (tries > 0) {
    await sleep(5000)
  }
  if (tries > 10) {
    return "fail"
  }
  tries += 1
  return await fetch(...args)
    .then((response) => response.json())
    .catch(() => {
      console.log(...args)
      return retryFetch(tries, ...args)
    })
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

  loadingProgress.innerHTML = "Fetching Tracks... (0)"
  progress = 0

  start = Date.now();
  var done = false
  let j = 0;
  while (done == false) {
    var fetches = [];
    for (let i = 0; i < 50; i++) {
      let tries = 0
      fetches.push(
        retryFetch(tries, url + (j * 50 + i) + "&pageSize=50")
          .then((json) => {
            progress += 1
            loadingProgress.innerHTML = "Fetching IDs... (" + progress * 50 + ")"
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

  loadingProgress.innerHTML = "Fetching Tracks... (0/" + IDarr.length + ")"
  progress = 0

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
      let tries = 0
      fetches.push(
        retryFetch(tries, "https://api.dashcraft.io/trackv2/" + IDarr[i + j * 50] + "?supportsLaps1=true", {
          headers: {
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWM0NmMzNGExYmEyMjQyNGYyZTAwMzIiLCJpbnRlbnQiOiJvQXV0aCIsImlhdCI6MTcwNzM3MTU3Mn0.0JVw6gJhs4R7bQGjr8cKGLE7CLAGvyuMiee7yvpsrWg'
          }
        })
          .then((json) => {
            progress += 1
            loadingProgress.innerHTML = "Fetching Tracks... (" + progress + "/" + IDarr.length + ")"
            return (json)
          })
      );
    }
    fetchedtracks = fetchedtracks.concat(await Promise.all(fetches))
    j += 1
  }

  console.log("Track fetch time: " + (Date.now() - start) + "ms")


  loadingProgress.innerHTML = "Fetching Track JSON... (0/" + IDarr.length + ")"
  progress = 0

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
      let tries = 0
      fetches.push(
        retryFetch(tries, "https://cdn.dashcraft.io/v2/prod/track/" + IDarr[i + j * 50] + ".json")
          .then((json) => {
            progress += 1
            loadingProgress.innerHTML = "Fetching Track JSON... (" + progress + "/" + IDarr.length + ")"
            return (json)
          })
      );
    }
    fetchedjson = fetchedjson.concat(await Promise.all(fetches))
    j += 1
  }

  console.log("JSON fetch time: " + (Date.now() - start) + "ms")
  console.log(fetchedjson)


  if (verifiedonlychecked == true) {

    let playerids = [];
    for (let i = 0; i < fetchedtracks.length; i++) {
      if (fetchedtracks[i] != "fail") {
        if (!playerids.includes(fetchedtracks[i].user._id)) {
          playerids.push(fetchedtracks[i].user._id)
        }
        for (let j = 0; j < fetchedtracks[i].leaderboard.length; j++) {
          if (!playerids.includes(fetchedtracks[i].leaderboard[j].user._id)) {
            playerids.push(fetchedtracks[i].leaderboard[j].user._id)
          }
        }
      }
    }

    loadingProgress.innerHTML = "Fetching Profiles... (0/" + playerids.length + ")"
    progress = 0

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
        let tries = 0
        fetches.push(
          retryFetch(tries, "https://api.dashcraft.io/userv2/" + playerids[i + j * 50], {
            headers: {
              'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWM0NmMzNGExYmEyMjQyNGYyZTAwMzIiLCJpbnRlbnQiOiJvQXV0aCIsImlhdCI6MTcwNzM3MTU3Mn0.0JVw6gJhs4R7bQGjr8cKGLE7CLAGvyuMiee7yvpsrWg'
            }
          })
            
            .then((json) => {
              progress += 1
              loadingProgress.innerHTML = "Fetching Profiles... (" + progress + "/" + playerids.length + ")"
              if (json == "fail") {
                return ({
                  "_id": playerids[i + j * 50],
                  "username": "",
                  "followersCount": 0,
                  "likesCount": 0,
                  "publicTracksCount": 0,
                  "isFollowedByMe": false,
                  "leagueDate": "N/A",
                  "leagueNr": 0,
                  "levelData": {
                      "isMaxLevel": false,
                      "level": 0,
                      "totalXp": 0,
                      "xpInLevel": 0,
                      "totalXpInLevel": 0
                  }
              })
              } else {
                return (json)
              }
            })
        );
      }
      profiles = profiles.concat(await Promise.all(fetches))
      j += 1
    }

    console.log("Profile fetch time: " + (Date.now() - start) + "ms")
  }
  working = false;


  for (let i = 0; i < fetchedtracks.length; i++) {
    if (fetchedtracks[i] != "fail" && fetchedjson[i] != "fail") {
      fetchedtracks[i].json = fetchedjson[i]
    } else {
      fetchedtracks.splice(i, 1)
      fetchedjson.splice(i, 1)
      i--
    }
  };

  loadingProgress.innerHTML = ""


  
  calculate()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
      players.push(setPlayerJson(tracks[i].user))
    }
    var player = players.find(x => x.id == tracks[i].user._id);
    player.tracks += 1;

    for (let j = 0; j < tracks[i].leaderboard.length; j++) {
      if (!players.find(x => x.id == tracks[i].leaderboard[j].user._id)) {
        players.push(setPlayerJson(tracks[i].leaderboard[j].user))
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
    } else if (leaderboarddropdown.value == "followers" && players[i].followers != 0) {
      leaderboard.push([players[i].username, players[i].followers])
      charttype = "bar"
      sortdir = "descending"
      valuetype = "Followers"
    } else if (leaderboarddropdown.value == "likes" && players[i].followers) {
      leaderboard.push([players[i].username, players[i].likes])
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

  document.getElementById("data").hidden = false;

  console.log(players)
}


