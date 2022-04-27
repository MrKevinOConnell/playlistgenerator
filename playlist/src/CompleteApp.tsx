import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {Grid,Button,Link,Typography,Avatar} from '@mui/material';
import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { toast } from 'react-toastify';

const CompleteApp = ({}) => {
    const[currentHashParams,setHashParams] = useState({} as any)
    const[topSongsData,setTopSongsData] = useState([] as any)
    const[topSongsInfo,setTopSongsInfo] = useState([] as any)
    const[topArtistInfo,setTopArtistInfo] = useState({} as any)
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

          const finartist = {name: res.items[0].name,pic: res.items[0].images[0],external_urls: res.items[0].external_urls}
          setTopArtistInfo({...topArtistInfo, artist: {name: res.items[0].name,pic: res.items[0].images[0],external_urls: res.items[0].external_urls }})
            //top songs gotten here
      const songsurl = 'https://api.spotify.com/v1/me/top/tracks/?time_range=short_term';
      await fetch(songsurl , { headers })
        .then(response => response.json())
        .then(async res => {
            setTopSongsInfo([...topSongsInfo,res.items[0],res.items[1]])
          const songs = [...res.items].map(song=> song.id)
          song = `${songs[0]},${songs[1]}`
        })
        .catch(error => {
          // handle error
        })
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
          toast.success("Playlist generated, look at your Spotify!",{
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        })
      })
      .catch(error => {
        // handle error
      })
  })
  .catch(error => {
    // handle error
    
  // handle error
  toast.error(`There was an error when trying to generate the playlist: ${error}`,{
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
  });
      }
    useEffect(()=> {
      setHashParams(getHashParams())
    },[location])
    useEffect(()=> {
        if(currentHashParams.access_token) {
     getRecommendations()
        }
    },[currentHashParams])

    const renderTrackInfo = useCallback(() => {
        return topSongsInfo.length && (
            <Grid justifyContent="center" container direction="row" spacing={2}
            > 
              
   <Grid justifyContent="center" container item direction="row"
    > 
        <Typography mt={2}pl={1} pr={2}>Your playlist will be based on:</Typography>
        
    </Grid>
            { topArtistInfo.artist &&
            <Grid justifyContent="center" container item direction="row" ml={2}
    > 
        <Link mt={2}pl={1} pr={2} style={{textAlign: "center"}} href={topArtistInfo.external_urls ? `${topArtistInfo.external_urls.spotify}`: ''}>{topArtistInfo.artist.name}</Link>
                <Avatar sx={{ width: 60, height: 60}} alt="favorite artist" src={topArtistInfo.artist.pic.url}/>
    </Grid>
    }
    { topSongsInfo.length &&
    <>
    <Grid justifyContent="center" container item direction="row"
    > 
         <Link mt={2}pl={1} pr={2} style={{textAlign: "center"}} href={topSongsInfo[0].external_urls.spotify ? `${topSongsInfo[0].external_urls.spotify}`: ''}>{topSongsInfo[0].name}</Link>
        <Avatar sx={{ width: 60, height: 60}} alt="favorite artist" src={topSongsInfo[0].album.images[0].url}/>
    </Grid>
    <Grid justifyContent="center" container item direction="row"
    > 
       <Link mt={2}pl={1} pr={2} style={{textAlign: "center"}} href={topSongsInfo[0].external_urls.spotify ?`${topSongsInfo[1].external_urls.spotify}`: ''}>{topSongsInfo[1].name}</Link>
        <Avatar sx={{ width: 60, height: 60}} alt="favorite artist" src={topSongsInfo[1].album.images[1].url}/>
    </Grid>
    </>
    }
    </Grid>
        ) 
    },[topSongsInfo,topArtistInfo]);

    useEffect(()=> {
renderTrackInfo()
    },[renderTrackInfo])

   

  
    
   return (
    <Grid container
    spacing={3}
    direction="column"
    alignItems="center"
    justifyContent="space-around"
    style={{ minHeight: '60vh' }} >
        <Grid>
    <Link style={{textAlign: "center"}} href="https://find-new-songs.herokuapp.com/api/login">Sign into Spotify here</Link>
    </Grid>
   
    {!!topSongsInfo.length && renderTrackInfo()}
    <Grid container item justifyContent="center">
   
      <Button size="small" onClick={()=> GenerateNewPlaylist() }>Click here to generate a playlist</Button>
      </Grid>

  
      </Grid>
    )
  };

  export default CompleteApp