import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import React from 'react'

const CompleteApp = ({}) => {
    const[currentHashParams,setHashParams] = useState({} as any)
    const[topSongsData,setTopSongsData] = useState([] as any)
    const[topSongsAverage,setTopSongsAverage] = useState({}as any)
    const location = useLocation();
  
  
    const getHashParams = () => {
      const hashParams = {} as any
      let e,
        r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.search.substring(1);
    
      while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2])
      }
      console.log("HASH PARAMS", hashParams)
      return hashParams;
    }
  
    const getTopSongs = async () => {
      const url = 'https://api.spotify.com/v1/me/top/tracks/?time_range=short_term';
      const headers = {
        Authorization: 'Bearer ' + currentHashParams.access_token
      };
      
      await fetch(url , { headers })
        .then(response => response.json())
        .then(async res => {
          console.log("SONGS RETRIEVED",res)
          const songs = [...res.items].map(song=> song.id)
          return songs[0]
            //below gets the audio features for a song
          
        })
        .catch(error => {
          // handle error
        })
    }

    const getTopArtists = async () =>  {
    //'electropop'
      const url = 'https://api.spotify.com/v1/me/top/artists/?time_range=short_term';
      const headers = {
        Authorization: 'Bearer ' + currentHashParams.access_token
      };
      
      await fetch(url , { headers })
        .then(response => response.json())
        .then(async res => {
          console.log("ARTISTS RETRIEVED",res)
          return res.items[0].id
          
        })
        .catch(error => {
          // handle error
        })
    }

    const getRecommendations = async () =>  {
      let artist = ''
      let song = ''
      const artisturl = 'https://api.spotify.com/v1/me/top/artists/?time_range=short_term';
      const headers = {
        Authorization: 'Bearer ' + currentHashParams.access_token
      };
      
      await fetch(artisturl , { headers })
        .then(response => response.json())
        .then(async res => {
          console.log("ARTISTS RETRIEVED",res)
          artist = res.items[0].id
          
        })
        .catch(error => {
          // handle error
        })
      const songsurl = 'https://api.spotify.com/v1/me/top/tracks/?time_range=short_term';
      await fetch(songsurl , { headers })
        .then(response => response.json())
        .then(async res => {
          console.log("SONGS RETRIEVED",res)
          const songs = [...res.items].map(song=> song.id)
          song = songs[0]
            //below gets the audio features for a song
          
        })
        .catch(error => {
          // handle error
        })
      const genre = 'electropop'
      //'electropop'
      //https://api.spotify.com/v1/recommendations \
        const url = `https://api.spotify.com/v1/recommendations/?seed_artists=${artist}&seed_genres=${genre}&seed_tracks=${song}&limit=50`;
        
        await fetch(url , { headers })
          .then(response => response.json())
          .then(async res => {
            
            const uris = res.tracks.map((track: any)=> track.uri )
            console.log("recommendations",uris)
            setTopSongsData(uris)
  
          })
          .catch(error => {
            // handle error
          })
      }

      const GenerateNewPlaylist = () => {
        const url = 'https://api.spotify.com/v1/me';
        const headers = {
          Authorization: 'Bearer ' + currentHashParams.access_token
        };

fetch(url, { headers })
  .then(response => response.json())
  .then(async data => {
    // use data
    console.log("USER DATA",data)
    const uris = topSongsData.join(',')
        console.log("URI's",uris)
    const url = `https://api.spotify.com/v1/users/${data.id}/playlists`;
    const headers = {
      Authorization: 'Bearer ' + currentHashParams.access_token
    };
   const body =  JSON.stringify({name: "Kevin's 5 AM Playlist",description: "I hope this works.", public: false,collaborative: true})
    await fetch(url , { headers,method: "POST", body }, )
      .then(response => response.json())
      .then(async res => {
        
        const addSongsURL = `https://api.spotify.com/v1/playlists/${res.id}/tracks?uris=${uris}`;
        await fetch(addSongsURL , { headers,method: "POST" }, ).then(response => response.json()).then(res => {
          console.log("done!",res)
        })

      })
      .catch(error => {
        // handle error
      })
  })
  .catch(error => {
    // handle error
  });
      }
    useEffect(()=> {
      setHashParams(getHashParams())
    },[location])
    useEffect(()=> {
     getRecommendations()
    },[currentHashParams])
    useEffect(()=> {
      console.log('top song data from use', topSongsData)
    },[topSongsData])
    
   return (
      <div className="App" style={{justifyContent: "space-between", display: "flex", flexDirection: "column"}}>
       
          <a href="http://localhost:8888/api/login">Sign into Spotify here</a>
    <div style={{display:"flex", justifyContent: "center",flexDirection:"column"}}>
      <button onClick={()=> GenerateNewPlaylist() }>Click here to generate a playlist</button>
    {topSongsData.map((song: any) => {
      return (<div key={song.id}>{song.danceability}</div>) 
    })}

</div>
      </div>
    )
  };

  export default CompleteApp