const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const querystring = require('querystring')
const { sequelize, room } = require('./../models')
const uuid = require('uuid')
const Sequelize = require('sequelize')
const io = require('./../socket').get();
// this can be used as a seperate module
const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')
}

function topKFrequent(nums, k) {
  let hash = {}
  for (let num of nums) {
    if (!hash[`${num}`]) hash[num] = 0
    hash[`${num}`]++
  }
  const hashToArray = Object.entries(hash)
  const sortedArray = hashToArray.sort((a, b) => b[1] - a[1])
  const finishedElements = sortedArray.filter((element) => element[1] >= k)
  const sortedElements = finishedElements.map((num) => num[0])
  return sortedElements
}


router.get('/login', async (req, res) => {
  const scope = `user-modify-playback-state
    user-read-playback-state
    user-read-currently-playing
    user-library-modify
    user-library-read
    user-top-read
    playlist-read-private
    playlist-modify-public
    playlist-modify-private`
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECTURI
      })
  )
})

router.post('/room', async (req, res, next) => {
  req.transaction = await sequelize.transaction()
  try {
    const { user,token } = req.body
    let finUser = {...user}
    const roomCode = await Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 8)
    const rooms = await room.findAll({
      where: { code: roomCode }
    })
    const existRoom = rooms[0]
    if (!existRoom) {
      const id = await uuid.v4()
    const artisturl = 'https://api.spotify.com/v1/me/top/artists/?limit=60'
    const headers = {
      Authorization: 'Bearer ' + token
    }
    //top artists gotten here
    await fetch(artisturl, { headers })
      .then((response) => response.json())
      .then(async (artistres) => {
        //top songs gotten here
        const songsurl = 'https://api.spotify.com/v1/me/top/tracks/?limit=60'
        await fetch(songsurl, { headers })
          .then((response) => response.json())
          .then(async (res) => {
          finUser = {
              ...finUser,
              artists: artistres.items,
              songs: res.items
            }
          })
          .catch((error) => {
            // handle error
            res.status(401).send("error fetching songs: " + error  )
          })
      })
      .catch((error) => {
        // handle error
        res.status(401).send("error fetching artists: " + error  )
      })
      const newRoom = await room.create({ code: roomCode, users: [finUser], id })
      await req.transaction.commit()
      res.json(newRoom)
    } else {
      res.json(existRoom)
    }
  } catch (err) {
    await req.transaction.rollback()
    err.handler = 'createChatRoom'
    next(err)
  }
})
//,"users":[{"id":"kevinoconnell1","favorites":{"artists":[],"songs":[]}}],
router.post('/joinRoom', async (req, res, next) => {
  req.transaction = await sequelize.transaction()
  try {
    const { roomCode, user,token } = req.body
    let finUser = {...user}
    const opts = { transaction: req.transaction }
    const Room = await room.findOne(
      {
        where: {
          code: roomCode
        }
      },
      opts
    )
    if (Room) {
      let users = [...Room.users]
      const ids = users.map((user) => user.id)
      const index = ids.findIndex((id) => id === user.id)
      if (index === -1) {
        const artisturl = 'https://api.spotify.com/v1/me/top/artists/?limit=60'
        const headers = {
          Authorization: 'Bearer ' + token
        }
        //top artists gotten here
        await fetch(artisturl, { headers })
          .then((response) => response.json())
          .then(async (artistres) => {
            //top songs gotten here
            const songsurl = 'https://api.spotify.com/v1/me/top/tracks/?limit=60'
            await fetch(songsurl, { headers })
              .then((response) => response.json())
              .then(async (res) => {
              finUser = {
                  ...finUser,
                  artists: artistres.items,
                  songs: res.items
                }
              })
              users = [...users, finUser]
              console.log('new users', users)
              await Room.update({ users })
              .catch((error) => {
                // handle error
              })
          })
          .catch((error) => {
            // handle error
          })
        await req.transaction.commit()
        res.status(200).json(Room.users)
        io.emit(`${roomCode}/joined`,`User joined room ${roomCode} `)
      } else {
       res.status(200).json(Room.users)
      }
    } else {
      throw new Error('No room found with this code!')
    }
  } catch (err) {
    await req.transaction.rollback()
    err.handler = 'joinRoom'
    next(err)
  }
})
/*
generates group playlist
*/
router.post('/playlist', async (req, res, next) => {
  req.transaction = await sequelize.transaction()
  try {
    const { roomCode, userId, token } = req.body
    const rooms = await room.findAll({
      where: { code: roomCode }
    })
    const foundRoom = rooms[0]

    if (foundRoom) {
      let commonSongs = []
      let commonArtists = []
      let commonSongIds = []
      const headers = {
        Authorization: 'Bearer ' + token
      }
      const playlistName = foundRoom.users.length
        ? foundRoom.users.map((user) => user.name).join()
        : 'Group Playlist made by Kevin'
      //,"users":[{"id":"kevinoconnell1","favorites":{"artists":[],"songs":[]}}],
      console.log('user length', foundRoom.users.length)
      for (const user of foundRoom.users) {
        const favorites = user.favorites
        const userSongs = favorites.songs.map((song) => song.id)
        const userUris = favorites.songs.map((song) => song.uri)
        const userArtists = favorites.artists.map((artist) => artist.id)
        commonArtists = [...commonArtists, ...userArtists]
        commonSongIds = [...commonSongIds, ...userSongs]
        commonSongs = [...commonSongs, ...userUris]
      }

      commonSongs = topKFrequent(commonSongs, foundRoom.users.length / 2)
      commonArtists = topKFrequent(commonArtists, foundRoom.users.length / 2).slice(0, 5)
      commonSongIds = topKFrequent(commonSongIds, foundRoom.users.length / 2).slice(0, 5)
      console.log('common songs', commonSongs.length)
      console.log('common songids', commonSongIds.length)
      console.log('common Artists', commonArtists.length)
      const artist = commonArtists.length > 1 ? `seed_artists=${commonArtists[0]},${commonArtists[1]}`: commonSongIds.length ? `seed_artists=${commonArtists[0]},${foundRoom.users[1].favorites.artists[0].id}` : `seed_artists=${foundRoom.users[1].favorites.artists[0].id},${foundRoom.users[1].favorites.artists[0].id}`
      //const song = `${commonSongIds[0]},${commonSongIds[1]}`
      const song = commonSongIds.length > 1 ? `&seed_tracks=${commonSongIds[0]},${commonSongIds[1]}`: commonSongIds.length ?   `&seed_tracks=${commonSongIds[0]},${foundRoom.users[1].favorites.songs[0].id}` : `&seed_tracks=${foundRoom.users[0].favorites.songs[0].id},${foundRoom.users[1].favorites.songs[0].id}`
      const remain = commonSongs.length >= 60 ? 0 : 60 - commonSongs.length
      console.log('remain length', remain)
      if (remain > 0) {
        //grabs ids
        const recommendurl = `https://api.spotify.com/v1/recommendations/?${artist}${song}&limit=${remain}`
        await fetch(recommendurl, { headers })
          .then((response) => response.json())
          .then(async (res) => {
            const uris = res.tracks.map((track) => track.uri)
            commonSongs = [...commonSongs, ...uris].slice(0, 60)
          })
          .catch((error) => {
            // handle error
            console.log('error when reccomend', error)
          })
      }

      const uris = commonSongs.join(',')
      console.log('uris')
      const url = `https://api.spotify.com/v1/users/${userId}/playlists`
      const body = JSON.stringify({
        name: playlistName,
        description: 'Generated from here https://github.com/MrKevinOConnell/playlistgenerator.',
        public: false,
        collaborative: true
      })
      await fetch(url, { headers, method: 'POST', body })
        .then((response) => response.json())
        .then(async (playlistres) => {
          const addSongsURL = `https://api.spotify.com/v1/playlists/${playlistres.id}/tracks?uris=${uris}`
          await fetch(addSongsURL, { headers, method: 'POST' })
            .then((response) => response.json())
            .then((res) => {
              console.log('songs', res)
            })
          await req.transaction.commit()
          console.log('playlist res', playlistres)
          res.status(200).json({ url: playlistres.external_urls.spotify })
          io.emit(`${roomCode}/playlist`,{ roomCode:roomCode, url: playlistres.external_urls.spotify })
        })
        .catch((error) => {
          // handle error
          console.log('error', error)
        })
        .catch((error) => {
          // handle error
          err.handler = 'createPlaylist'
          next(error)
        })
    } else {
      res.status('401').send({ error: "room code can't be found" })
    }
  } catch (err) {
    console.log('error when making playlist', err)
    await req.transaction.rollback()
    res.send(err)
  }
})

router.get('/logged', async (req, res) => {
  const body = {
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: process.env.REDIRECTURI,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
  }

  await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    body: encodeFormData(body)
  })
    .then((response) => response.json())
    .then((data) => {
      const query = querystring.stringify(data)
      res.redirect(`${process.env.CLIENT_REDIRECTURI}?${query}`)
    })
})

module.exports = router
