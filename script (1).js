
let fetchedtracks = [];
let fetchedjson = [];
let tracks = [];
let IDarr = ["https://dashcraft.io/?t=67116a28d0bace1921b3aaf6", "https://dashcraft.io/?t=673aa258d0bace1921a3fda3", "https://dashcraft.io/?t=67422bc4d0bace1921bd83b7", "https://dashcraft.io/?t=6728231cd0bace19214000bf", "https://dashcraft.io/?t=673a7d54d0bace1921a38c04", "https://dashcraft.io/?t=675e97bdd0bace1921133c39", "https://dashcraft.io/?t=673a1dd7d0bace1921a25a13", "https://dashcraft.io/?t=67394ce5d0bace19219b3db0", "https://dashcraft.io/?t=673c3b78d0bace1921aa670f", "https://dashcraft.io/?t=675f2134d0bace19211486cb", "https://dashcraft.io/?t=674ecbbed0bace1921e6e1d5", "https://dashcraft.io/?t=66f4c8e3f1b32b6e545fff48", "https://dashcraft.io/?t=673c273bd0bace1921aa3dfe", "https://dashcraft.io/?t=67296509d0bace19214a7da1", "https://dashcraft.io/?t=670de238d0bace19219abaa0", "https://dashcraft.io/?t=67416670d0bace1921bb7421", "https://dashcraft.io/?t=6757c78bd0bace1921ff20f2", "https://dashcraft.io/?t=67356ad9d0bace19218d292a", "https://dashcraft.io/?t=673e83d9d0bace1921b106c7", "https://dashcraft.io/?t=66f36694f1b32b6e5458433c", "https://dashcraft.io/?t=675daa64d0bace1921116e78", "https://dashcraft.io/?t=67224240d0bace1921249baa", "https://dashcraft.io/?t=673caafcd0bace1921aba2dc", "https://dashcraft.io/?t=673a1630d0bace1921a2387f", "https://dashcraft.io?t=675f29dcd0bace1921149438"]
  .map(link => link.slice(-24));
let players = [];
let profiles = [];
let working = false;
let usePreset = false;
let page = 0;
let trackPage = 0;
let leaderboard = [];
let filteredPlayers = [];
const numbers = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
const verifiedonly = document.getElementById("verifiedonly");
const removeserphal = document.getElementById("removeserphal");
const recent25 = document.getElementById("recent25");
const leaderboarddropdown = document.getElementById("leaderboarddropdown");
const leaderboarddisplay = document.getElementById("leaderboardlist");
const tracksort = document.getElementById("trackdropdown");
const charthtml = document.getElementById("myChart");
const usernameInput = document.getElementById("usernameInput");
const playerList = document.getElementById("playerList");
const loadingProgress = document.getElementById("loadingProgress");
let verifiedonlybackup = false

// 1 second with preset, 15 seconds without.
// document.getElementById('usePresetInfo').innerText = `Preset Info (outdated but faster)\n${timeAgo('2024-11-24')} ago -- 15x faster -- 15s -> 1s`;

// verifiedonly.addEventListener('change', function() {
  // if (this.checked) {
      // 1 second with preset, 15 seconds without.
//       document.getElementById('usePresetInfo').innerText = `Preset Info (outdated but faster)\n${timeAgo('2024-11-24')} ago -- 15x faster -- 15s -> 1s`;
//   } else {
//       // 13 seconds with preset, 42 minutes without.
//       document.getElementById('usePresetInfo').innerText = `Preset Info (outdated but faster)\n${timeAgo('2024-11-24')} ago -- 195x faster -- 42m -> 13s`;
//   }
// });
// function timeAgo(date) {
//     const targetDate = new Date(date);
//     const today = new Date();
//     let years = today.getFullYear() - targetDate.getFullYear();
//     let months = today.getMonth() - targetDate.getMonth();
//     let days = today.getDate() - targetDate.getDate();
//     if (days < 0) {
//         months--;
//         days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();  // Get the last day of the previous month
//     }
//     if (months < 0) {
//         years--;
//         months += 12;
//     }
//     let result = [];
//     if (years > 0) result.push(`${years}yr`);
//     if (months > 0) result.push(`${months}mo`);
//     if (days > 0) result.push(`${days}d`);
//     return result.join(' ') || '0d';
// }
    
async function setPlayerJson(user, retry = false) {
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
  };

  // Check for existing profiles
  if (profiles.length > 0) {
    let profile = profiles.find((a) => a._id === user._id); // fallback for id
    if (profile) {
      //console.log(profile)
      playerJson.likes = Number(profile.likesCount) //|| 10000;  // Fallback to 0 if undefined
      playerJson.followers = Number(profile.followersCount) // || 10000; // Fallback to 0 if undefined
      return playerJson; // Return early if profile found
    }
    console.log(profile)
    console.log(user)
    // If profile not found and this is the first attempt, fetch data
  if (!retry) {
    console.log(`Profile not found locally. Fetching data for user ID: ${user._id}`);
    
    try {
      const json = await fetchWithRetry("https://api.dashcraft.io/userv2/" + user._id, {
        headers: {
          'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWM0NmMzNGExYmEyMjQyNGYyZTAwMzIiLCJpbnRlbnQiOiJvQXV0aCIsImlhdCI6MTcwNzM3MTU3Mn0.0JVw6gJhs4R7bQGjr8cKGLE7CLAGvyuMiee7yvpsrWg'
        }
      });

      if (!json) {
        console.log("Failed to retrieve data... Skipping this user.");
          return {"message": "failed"}
        //return playerJson; // Skip if the fetch failed
      }

      console.log("Successfully re-gathered profile data.");
      playerJson.likes = json.likesCount || 20000;  // Update with fetched data
      playerJson.followers = json.followersCount || 20000;
      let index = profiles.findIndex((a) => a._id === user._id);
    if (index !== -1) {
      profiles[index] = playerJson; // update the db
    }
      return playerJson;
    } catch (error) {
      console.error("Error fetching data:", error);
      return {"message":"failed2"};
        //return playerJson; // Return the playerJson even if fetch fails
    }
  } else {
    console.log(`Retry already attempted for user ID: ${user._id}`);
  }
  }

  return playerJson;
}



google.charts.load('current', { packages: ['corechart'] });


usernameInput.addEventListener('input', playerLookup)
recent25.addEventListener('change', async function() {trackPage = 0; page = 0; await calculate(usePreset)})
removeserphal.addEventListener('change', async function() {page = 0; await calculate(usePreset)})
leaderboarddropdown.addEventListener('change', async function() {trackPage = 0; page = 0; await generateLeaderboard(usePreset)})
tracksort.addEventListener('change', async function() {trackPage = 0; await trackBrowser(usePreset)})

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
    showTrackBrowser()
  }
}
function trackPageRight() {
  if (trackPage < Math.floor(tracks.length / 25)) {
    trackPage++;
    showTrackBrowser()
  }
}


function findPlayer(playerId) {
 // return players.find((a) => a.id == playerId)
    return playerMap[playerId] || null;
}


async function recommendedPoints(track) {
    let points = 0;

    const likesToPlayersRatio = track.likesCount / (track.leaderboardTotalCount + 1);
    points += likesToPlayersRatio < 0.3 ? 15 * likesToPlayersRatio : 4.5;

    points += 3 * track.likesCount / (track.likesCount + track.dislikesCount + 1);

    // Use findPlayer with optimized lookup map
    const player = findPlayer(track.user._id);
    if (player) {
        points += Math.log10(player.likes + 1);
        points += Math.log2(player.followers + 1);
    } else {
        console.warn(`Player with ID ${track.user._id} not found in players list. Refetching.`);
            const json = await fetchWithRetry("https://api.dashcraft.io/userv2/" + track.user._id, {
                headers: {
                    'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWM0NmMzNGExYmEyMjQyNGYyZTAwMzIiLCJpbnRlbnQiOiJvQXV0aCIsImlhdCI6MTcwNzM3MTU3Mn0.0JVw6gJhs4R7bQGjr8cKGLE7CLAGvyuMiee7yvpsrWg'
                }
            }, 3, 1000, false)
            if (json !== null) { // Skip failed requests
                await setPlayerJson(json);
                points += Math.log10(json.likesCount + 1);
                points += Math.log2(json.followersCount + 1);
            } else {
                console.warn(`Couldn't fetch player with ID ${track.user._id}.`);
            }
    }

    points += track.user.leagueNr / 3;

    if (track.leaderboard.length > 0) {
        points += Math.log2(track.json.trackPieces.length / track.leaderboard[0].time);
    }

    const trackIndex = trackIndexCache[track._id];
    points -= Math.log10((trackIndex / 50) + 2);

    return points;
}

async function playerLookup() {
  playerList.innerHTML = ""

  filteredPlayers = []
  if (usernameInput.value.length != 0) {
    filteredPlayers = players.filter((player) => player.username.includes(usernameInput.value))
    console.log(filteredPlayers)
    for (let i = 0; i < filteredPlayers.length && i < 20; i++) {
      playerList.innerHTML += "<br>" + await playerHTML(filteredPlayers[i].id)
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


async function trackBrowser(presetEnabled = false) {
  if (recent25.checked) {
    if (tracks.length < 25) {
      tracks = structuredClone(fetchedtracks.slice(0, 25))
    }
  } else {
    if (tracks.length < fetchedtracks.length) {
      tracks = structuredClone(fetchedtracks)
    }
  }




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
      tracks.sort(function(a, b) {
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
    const sortedTracks = await Promise.all(tracks.map(async (track) => {
      const points = await recommendedPoints(track);
      return { track, points };
    }));
    sortedTracks.sort((a, b) => b.points - a.points);
    tracks = sortedTracks.map(track => track.track);
  }
  
  showTrackBrowser(presetEnabled)
}

async function showTrackBrowser(presetEnabled = false) {
  var html = "";
  for (let i = trackPage*25; i < trackPage*25+25; i++) {
    if (i < tracks.length) {
      html += '<div class="gallery"><a target="_blank" href="https://dashcraft.io/?t=' + tracks[i]._id + '">'
      html += '<img src="https://cdn.dashcraft.io/v2/prod/track-thumbnail/sm/' + tracks[i]._id + '.jpg?v=4">'
      html += '<div class="desc">' + await playerHTML(tracks[i].user._id, presetEnabled)
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


async function playerHTML(playerId, presetEnabled = false) {
    let playerhtml = "";

    // 2. Lookup player in the map directly, avoiding `find` and `findIndex`
    const playerdata = findPlayer(playerId);

    if (playerdata) {
        playerhtml = "<img src='leagues/" + playerdata.league + ".png' style='width: 14px; height: 14px'>";
        playerhtml += " <a href='https://dashcraft.io/?u=" + playerId + "' target='_blank' style='color: white;'>";
        playerhtml += playerdata.username + "</a>";
    } else {
            console.warn(`Player with ID ${playerId} not found in players list. Refetching.`);
            const json = await fetchWithRetry("https://api.dashcraft.io/userv2/" + playerId, {
                headers: {
                    'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWM0NmMzNGExYmEyMjQyNGYyZTAwMzIiLCJpbnRlbnQiOiJvQXV0aCIsImlhdCI6MTcwNzM3MTU3Mn0.0JVw6gJhs4R7bQGjr8cKGLE7CLAGvyuMiee7yvpsrWg'
                }
            }, 3, 1000, false)
            if (json === null) {playerhtml = "<span style='color: red;'>Player not found</span>"; console.warn(`Couldn't fetch player with ID ${track.user._id}.`); return {}}; // Skip failed requests
            await setPlayerJson(json);
            playerhtml = "<img src='leagues/" + (json.leagueNr+1) + ".png' style='width: 14px; height: 14px'>";
            playerhtml += " <a href='https://dashcraft.io/?u=" + playerId + "' target='_blank' style='color: white;'>";
            playerhtml += json.username + "</a>";
    }
    return playerhtml;
}



async function generateLeaderboard() {
  leaderboard = []
  console.log(leaderboarddropdown.value)
  for (let i = 0; i < players.length; i++) {
    var useradded = true
    if (leaderboarddropdown.value == "finishes" && players[i].tmpoints != 0) {
      leaderboard.push([players[i].username, players[i].totalPositions])
      charttype = "bar"
      sortdir = "descending"
      valuetype = "Points"
    } else if (leaderboarddropdown.value == "tmpoints" && players[i].tmpoints != 0) {
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


  drawLeaderboard()
}



async function drawLeaderboard(presetEnabled = false) {
  let html = "<table><tr><th style='width:15%'>Position</th><th style='width:70%'>Player</th><th style='width:15%'>" + valuetype + "</th></tr>"
  for (let i = 0; i < 20; i++) {
    if (leaderboard.length > page * 20 + i) {
      html += "<tr><td>" + (page * 20 + i + 1) + "</td>"
      html += "<td>" + await playerHTML(leaderboard[page * 20 + i][2].id, presetEnabled) + "</td>"
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
  loadingProgress.innerHTML = "Fetching...";
    
    async function loadGzippedJSON(url) {
        loadingProgress.innerHTML = "Decompressing and reading data buffer...";
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
        return JSON.parse(decompressed);
    }
    
  //   if (verifiedonly.checked) {
  //     verifiedonlychecked = true

  //     fetch1 = fetch('./verified_profiles.json')
  //     .then((response) => response.json())
  //     .then((json) => {
  //       return json;
  //     });

  //   profiles = await fetch1;
  //   fetchedtracks = await loadGzippedJSON('./verified_tracks.json.gz');

  //   usePreset = true;
  // } else {
  //   verifiedonlychecked = false
  //   fetch1 = fetch('./global_profiles.json')
  //     .then((response) => response.json())
  //     .then((json) => {
  //       return json;
  //     });

  //   profiles = await fetch1;
  //   fetchedtracks = await loadGzippedJSON('./global_tracks.json.gz');
    
  //   usePreset = true;
  // }

  // loadingProgress.innerHTML = ""

  // await calculate(true, true);
}

async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000, log = true) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && (response.status === 502 || response.status === 403)) {
        throw new Error(`${response.status} Error`);
      }
      if (log) {
        console.log(`Succeeded after ${i + 1} tries for URL: ${url}`);
      }
      return await response.json();
    } catch (error) {
      if ((error.message === "502 Error" || error.message === "403 Error") && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log(`Retrying... (${i + 1}) for URL: ${url}`);
      } else if (i === retries - 1) {
        console.error(`Failed after ${retries} attempts for URL: ${url}`);
        return null; // Return null to skip failed fetch
      }
    }
  }
}

async function fetchInfo() {
  if (working) return;

    usePreset = false;

  working = true;

   // if (verifiedonly.checked) {
    document.getElementById("followers").hidden = false;
    document.getElementById("likes").hidden = false;
  //} else {
  //  document.getElementById("followers").hidden = true;
  //  document.getElementById("likes").hidden = true;
 //   if (leaderboarddropdown.value == "followers" || leaderboarddropdown.value == "likes") {
 //     leaderboarddropdown.value = "tmpoints"
 //   }
 // }

  // const baseUrl = "https://api.dashcraft.io/trackv2/global3?sort=new&verifiedOnly=";
  // const url = verifiedonly.checked ? `${baseUrl}true&page=` : `${baseUrl}false&page=`;
  
  let progress = 0;
  // loadingProgress.innerHTML = "Fetching Tracks... (0)";
  start = Date.now();

  // let done = false;
  // let j = 0;
  // let IDarr = [];

  // while (!done) {
  //   let fetches = [];
    
  //   for (let i = 0; i < 50; i++) {
  //     fetches.push(
  //       fetchWithRetry(url + (j * 50 + i) + "&pageSize=50")
  //         .then((json) => {
  //           if (json === null) return []; // Skip failed requests
  //           progress += 1;
  //           if (progress % 100 === 0 || done) {
  //             loadingProgress.innerHTML = `Fetching Tracks... (${progress * 50})`;
  //           }
  //           let json1 = json.tracks;
  //           let IDarr = [];
  //           for (let a = 0; a < json1.length; a++) {
  //             IDarr.push(json1[a]._id);
  //           }
  //           return IDarr;
  //         })
  //     );
  //   }

  //   const result = await Promise.all(fetches);
  //   const successfulResults = result.filter(res => res !== null);

  //   if (successfulResults.length > 0 && successfulResults[successfulResults.length - 1].length < 50) {
  //     done = true;
  //   }

  //   for (let i = 0; i < successfulResults.length; i++) {
  //     IDarr = IDarr.concat(successfulResults[i]);
  //   }
  //   j += 1;
  // }

  // console.log("ID fetch time: " + (Date.now() - start) + "ms");



  // Second stage: Fetching track details
  // loadingProgress.innerHTML = "Fetching Tracks... (0/" + IDarr.length + ")";
  progress = 0;
  done = false;
  j = 0;
  let batchSize = 1000;
  while (!done) {
    let fetches = [];
    for (let i = 0; i < batchSize; i++) {
      if (j * batchSize + i >= IDarr.length) {
        done = true;
        break;
      }
      fetches.push(
        fetchWithRetry("https://api.dashcraft.io/trackv2/" + IDarr[i + j * batchSize] + "?supportsLaps1=true", {
          headers: {
            'Authorization': 'your-auth-token'
          }
        })
          .then((json) => {
            if (json === null) return {}; // Skip failed requests
            progress += 1;
            if (progress % 100 === 0 || done) {
              // loadingProgress.innerHTML = `Fetching Tracks... (${progress}/${IDarr.length})`;
            }
            return json;
          })
      );
    }

    const result = await Promise.all(fetches);
    fetchedtracks = fetchedtracks.concat(result.filter(res => res !== null));
    j += 1;
  }

  console.log("Track fetch time: " + (Date.now() - start) + "ms");

  // Third stage: Fetching JSON data for each track
  // loadingProgress.innerHTML = "Fetching Track JSON... (0/" + IDarr.length + ")";
  progress = 0;
  done = false;
  j = 0;
  
  while (!done) {
  let fetches = [];
  for (let i = 0; i < batchSize; i++) {
    if (j * batchSize + i >= IDarr.length) {
      done = true;
      break;
    }
    fetches.push(
      fetchWithRetry("https://cdn.dashcraft.io/v2/prod/track/" + IDarr[i + j * batchSize] + ".json")
        .then((json) => {
          if (json === null) return {}; // Skip failed requests
          progress += 1;
          if (progress % 100 === 0 || done) {
            // loadingProgress.innerHTML = `Fetching Track JSON... (${progress}/${IDarr.length})`;
          }
          return json;
        })
    );
  }

  const result = await Promise.all(fetches);
  fetchedjson = fetchedjson.concat(result.filter(res => res !== null));
  j += 1;
}


  console.log("JSON fetch time: " + (Date.now() - start) + "ms");

  // Fourth stage: Fetching profiles if verified-only is checked
  //if (verifiedonly.checked) {
    let playerids = [];
    for (let i = 0; i < fetchedtracks.length; i++) {
      if (!playerids.includes(fetchedtracks[i].user._id)) {
        playerids.push(fetchedtracks[i].user._id);
      }
      for (let j = 0; j < fetchedtracks[i].leaderboard.length; j++) {
        if (!playerids.includes(fetchedtracks[i].leaderboard[j].user._id)) {
          playerids.push(fetchedtracks[i].leaderboard[j].user._id);
        }
      }
    }

    // loadingProgress.innerHTML = "Fetching Profiles... (0/" + playerids.length + ")";
    progress = 0;
    done = false;
    j = 0;

    while (!done) {
      let fetches = [];
      for (let i = 0; i < batchSize; i++) {
        if (j * batchSize + i >= playerids.length) {
          done = true;
          break;
        }
        fetches.push(
          fetchWithRetry("https://api.dashcraft.io/userv2/" + playerids[i + j * batchSize], {
            headers: {
              'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWM0NmMzNGExYmEyMjQyNGYyZTAwMzIiLCJpbnRlbnQiOiJvQXV0aCIsImlhdCI6MTcwNzM3MTU3Mn0.0JVw6gJhs4R7bQGjr8cKGLE7CLAGvyuMiee7yvpsrWg'
            }
          })
            .then((json) => {
              if (json === null) return {}; // Skip failed requests
              progress += 1;
              if (progress % 10 === 0 || done) {
                // loadingProgress.innerHTML = `Fetching Profiles... (${progress}/${playerids.length})`;
              }
              return json;
            })
        );
      }

      const result = await Promise.all(fetches);
      profiles = profiles.concat(result.filter(res => res !== null));
      j += 1;
    }

    console.log("Profile fetch time: " + (Date.now() - start) + "ms");
  //}

  working = false;

  // Assign fetched JSON to tracks
  for (let i = 0; i < fetchedtracks.length; i++) {
    fetchedtracks[i].json = fetchedjson[i];
  }

  // loadingProgress.innerHTML = "";
  await calculate(false, true);
}


async function calculate(presetEnabled = false, firstInstance = false) { 
  // firstInstance meaning first run, so mapping doesn't occur twice

  if (recent25.checked) {
    tracks = structuredClone(fetchedtracks.slice(0, 25))
  } else {
    tracks = structuredClone(fetchedtracks)
  }

  if (removeserphal.checked) {
    for (let i = 0; i < tracks.length; i++) {
        serphalpos = tracks[i].leaderboard.findIndex(x => x.user._id == "662334de69042c3463e0eefc")
        if (serphalpos != -1) {
          tracks[i].leaderboard.splice(serphalpos, 1)
      }
    }
  }
  console.log("Number of tracks: " + tracks.length)



  players = []
  //console.log(fetchedtracks)
  //console.log(fetchedjson)

  for (let i = 0; i < tracks.length; i++) {
    if (!players.find(x => x.id == tracks[i].user._id)) {
      players.push(await setPlayerJson(tracks[i].user))
    }
    var player = players.find(x => x.id == tracks[i].user._id);
    player.tracks += 1;

    for (let j = 0; j < tracks[i].leaderboard.length; j++) {
      if (!players.find(x => x.id == tracks[i].leaderboard[j].user._id)) {
        players.push(await setPlayerJson(tracks[i].leaderboard[j].user))
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

  if (firstInstance) {
      players.forEach(player => {
          playerMap[player.id] = player;
      });
      console.log(playerMap);

      fetchedtracks.forEach((track, index) => {
          trackIndexCache[track._id] = index;
      });
  }
    
  


  page = 0
  console.log(players)
  if (players.some(player => player.tmpoints > 0)) await generateLeaderboard(presetEnabled)
  await trackBrowser(presetEnabled)

  document.getElementById("data").hidden = false;

  console.log(players);
}

const playerMap = {};
const trackIndexCache = {};

function downloadJSON(obj, filename = 'data.json') {
    const jsonString = JSON.stringify(obj, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
function downloadCompressedJSON(obj, filename = 'data.json.gz') {
    const jsonString = JSON.stringify(obj);
    const compressed = pako.gzip(jsonString);
    const blob = new Blob([compressed], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadPreset(version = 'verified') {
    if (version == 'verified') {
        downloadJSON(profiles, 'verified_profiles.json');
        downloadCompressedJSON(tracks, "verified_tracks.json.gz");
    } else if (version == 'global') {    
        downloadJSON(profiles, 'global_profiles.json');
        downloadCompressedJSON(tracks, "global_tracks.json.gz");
    } else {
        console.log("Please specify if you want to download verified or global info.");
    }
}


fetchInfo()
