import { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {Grid,Button,Link,Typography,Avatar, TextField} from '@mui/material';
import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { toast } from 'react-toastify';

const CompleteApp = ({}) => {
    const[currentHashParams,setHashParams] = useState({} as any)
    const[topSongsData,setTopSongsData] = useState([] as any)
    const[topSongsInfo,setTopSongsInfo] = useState([] as any)
    const[topArtistInfo,setTopArtistInfo] = useState({} as any)
    const[roomCode,setRoomCode] = useState('')
    const[completeData,setCompleteData] = useState({} as any)
    const[connectedRoom,setConnectedRoom] = useState(null as any)
    const[recentPlaylist,setRecentPlaylist] = useState(null as any)
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
      let finData = {}
      let song = ''
      const artisturl = 'https://api.spotify.com/v1/me/top/artists/?limit=25';
      const headers = {
        Authorization: 'Bearer ' + currentHashParams.access_token
      };
      //top artists gotten here
      await fetch(artisturl , { headers })
        .then(response => response.json())
        .then(async artistres => {
          artist = artistres.items[0].id
          setTopArtistInfo({...topArtistInfo, artist: {name: artistres.items[0].name,pic: artistres.items[0].images[0],external_urls: artistres.items[0].external_urls }})
            //top songs gotten here
      const songsurl = 'https://api.spotify.com/v1/me/top/tracks/?limit=25';
      await fetch(songsurl , { headers })
        .then(response => response.json())
        .then(async res => {
          setCompleteData({...completeData,artists:artistres.items, songs:res.items})
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
          toast.success("Playlist generated, please check your spotify!",{
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
  toast.error(`There was an error when trying to create the playlist: ${error}`,{
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

      const CreateGroupPlaylist = () => {
        const url = 'https://api.spotify.com/v1/me';
              const headers = {
                Authorization: 'Bearer ' + currentHashParams.access_token
              };
      
      fetch(url, { headers })
        .then(response => response.json())
        .then(async data => {
              const url = "https://find-new-songs.herokuapp.com/api/playlist";
              const headers = {
                Authorization: 'Bearer ' + currentHashParams.access_token,
                "Content-Type": "application/json"
              };
      
                  //,"users":[{"id":"kevinoconnell1","favorites":{"artists":[],"songs":[]}}],
              const body =  JSON.stringify({roomCode: connectedRoom,userId: data.id,token: currentHashParams.access_token})
      fetch(url, { headers, body, method: "post" })
        .then(response => response.json())
        .then(async data => {
          toast.success(`Group playlist created!`,{
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        console.log('data',data)
        setRecentPlaylist(data.url);
        })
        .catch(error => {
          // handle error
          
        // handle error
        
        })
      })
      .catch(error => {
          // handle error
        toast.error(`There was an error when trying to create the playlist: ${error}`,{
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

        const JoinRoom = (roomCode: string) => {
          console.log('roomCode',roomCode)
          const url = 'https://api.spotify.com/v1/me';
                const headers = {
                  Authorization: 'Bearer ' + currentHashParams.access_token
                };
        
        fetch(url, { headers })
          .then(response => response.json())
          .then(async data => {
                const url = "https://find-new-songs.herokuapp.com/api/joinRoom";
                const headers = {
                  Authorization: 'Bearer ' + currentHashParams.access_token,
                  "Content-Type": "application/json"
                };
                const body =  JSON.stringify({roomCode: roomCode,user: {id: data.id,favorites:completeData}})
        fetch(url, { headers, body, method: "post" })
          .then(response => response.json())
          .then(async data => {
            toast.success(`Room joined!`,{
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          console.log('data',data)
          setConnectedRoom(roomCode);
          })
          .catch(error => {
            // handle error
            
          // handle error
          
          })
        })
        .catch(error => {
            // handle error
          toast.error(`There was an error when trying to create the room: ${error}`,{
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

const CreateRoom = () => {
  const url = 'https://api.spotify.com/v1/me';
        const headers = {
          Authorization: 'Bearer ' + currentHashParams.access_token
        };

fetch(url, { headers })
  .then(response => response.json())
  .then(async data => {
        const url = "https://find-new-songs.herokuapp.com/api/room";
        const headers = {
          Authorization: 'Bearer ' + currentHashParams.access_token,
          "Content-Type": "application/json"
        };

            //,"users":[{"id":"kevinoconnell1","favorites":{"artists":[],"songs":[]}}],
        const body =  JSON.stringify({user:{id: data.id,favorites:completeData}})

fetch(url, { headers, body, method: "post" })
  .then(response => response.json())
  .then(async data => {
    toast.success(`Room created!`,{
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  console.log('data',data)
  setConnectedRoom(data.code);
  })
  .catch(error => {
    // handle error
    
  // handle error
  
  })
})
.catch(error => {
    // handle error
  toast.error(`There was an error when trying to create the room: ${error}`,{
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
      console.log("findata",completeData)
    },[completeData])
    useEffect(()=> {
        if(currentHashParams.access_token) {
     getRecommendations()

        }
    },[currentHashParams])

    const renderTrackInfo = useCallback(() => {
        return topSongsInfo.length && (
            <Grid justifyContent="center" container direction="row" spacing={1}
            > 
            { connectedRoom!! && 
             <Grid justifyContent="center" container item direction="row" ml={2}
    > 
        <Typography mt={2}pl={1} pr={2}>Current room: {connectedRoom}</Typography>
             
    </Grid>
    }
       { recentPlaylist!! && 
             <Grid justifyContent="center" container item direction="row" ml={2}
    > 
        <Typography mt={2}pl={1} pr={2}>recent playlist: {connectedRoom}</Typography>
        <Link mt={2}pl={1} pr={2} style={{textAlign: "center"}} href={recentPlaylist}>here!</Link>
    </Grid>
    }
              
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
    },[topSongsInfo,topArtistInfo,connectedRoom,recentPlaylist]);

    useEffect(()=> {
renderTrackInfo()
    },[renderTrackInfo])

   

  
    
   return (
    <Grid container
    spacing={2}
    direction="column"
    alignItems="center"
    justifyContent="space-around"
    style={{ minHeight: '110vh' }} >
        <Grid>
    <Link style={{textAlign: "center"}} href="http://localhost:8888/api/login">Sign into Spotify here</Link>
    </Grid>
   
    {!!topSongsInfo.length && renderTrackInfo()}
    <Grid container item justifyContent="center">
   
      <Button size="small" onClick={()=> GenerateNewPlaylist() }>Click here to generate a individual playlist</Button>
      </Grid>
      
      <Grid container item justifyContent="center">
   <TextField value={roomCode} onChange={(e)=> setRoomCode(e.target.value)}/>
   <Button size="small" onClick={()=> JoinRoom(roomCode) }>Click here to join a room</Button>
   </Grid>
   <Grid container item justifyContent="center">
   <Button size="small" onClick={()=> CreateRoom() }>Click here to create a room</Button>
   </Grid>
   
   <Grid container item justifyContent="center">
   <Button size="small" onClick={()=> CreateGroupPlaylist() }>Generate group playlist here!</Button>
   </Grid>

  
      </Grid>
    )
  };

  export default CompleteApp