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
      return hashParams;
    }

    const getRecommendations = async () =>  {
      let artist = ''
      let song = ''
      const artisturl = 'https://api.spotify.com/v1/me/top/artists/?time_range=short_term';
      const headers = {
        Authorization: 'Bearer ' + currentHashParams.access_token
      };
      //top artists gotten here
      await fetch(artisturl , { headers })
        .then(response => response.json())
        .then(async res => {
          artist = res.items[0].id
          
        })
        .catch(error => {
          // handle error
        })
        //top songs gotten here
      const songsurl = 'https://api.spotify.com/v1/me/top/tracks/?time_range=short_term';
      await fetch(songsurl , { headers })
        .then(response => response.json())
        .then(async res => {
          const songs = [...res.items].map(song=> song.id)
          song = `${songs[0]},${songs[1]}`
        })
        .catch(error => {
          // handle error
        })
        //standard genre is here, not sure about the right way to get this.
        const url = `https://api.spotify.com/v1/recommendations/?seed_artists=${artist}&seed_tracks=${song}&limit=50`;
        
        await fetch(url , { headers })
          .then(response => response.json())
          .then(async res => {
            
            const uris = res.tracks.map((track: any)=> track.uri )
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
    const uris = topSongsData.join(',')
    const url = `https://api.spotify.com/v1/users/${data.id}/playlists`;
    const headers = {
      Authorization: 'Bearer ' + currentHashParams.access_token
    };
   const body =  JSON.stringify({name: "Playlist made by Kevin",description: "Generated from here https://github.com/MrKevinOConnell/playlistgenerator.",public: false,collaborative: true})
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
    },[topSongsData])
    
   return (
      <div className="App" style={{justifyContent: "space-between", display: "flex", flexDirection: "column"}}>
          <a href={"https:/find-new-songs.herokuapp.com/api/logged"}>Sign into Spotify here</a>
    <div style={{display:"flex", justifyContent: "center",flexDirection:"column"}}>
      <button onClick={()=> GenerateNewPlaylist() }>Click here to generate a playlist</button>
</div>
      </div>
    )
  };

  export default CompleteApp