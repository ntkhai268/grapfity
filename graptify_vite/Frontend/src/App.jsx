
import React from "react"
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Tab from "./components/Tab";
import Footer from "./components/Footer";
import SongRight from "./components/Song_right";
import UploadWidget from "./components/UploadWidget";
import Song from "./components/All";
import PopularTracks from "./components/Popular_Tracks";
import Tracks from "./components/Tracks";
import Playlists from "./components/Playlist";
import SongHeader from "./components/Manager_Songs/Song-Header";
import Controls from "./components/Manager_Songs/Controls";
import Lyrics from "./components/Manager_Songs/Lyrics";
import Recommendations from "./components/Manager_Songs/Recommendations";
import PopularSongs from "./components/Manager_Songs/PopularSongs";
// import Sidebar from "./components/Sidebar"

const App = () => {
  return (
    <div>
         
    <div className="container">
        <Header />
        <Sidebar />
            <div className="song_side"> 
                <div className="profile_slide">
                    <div className="top_section">
                        <div className="avatar">
                            <img src="assets/User_alt@3x.png" alt="avatar"/>
                        </div>
                        <div className="profile_info">
                            <span>Hồ Sơ</span>
                            <h1>Hưng Nguyễn</h1>
                        </div>
                    </div>
                    <div className="mid_section">              
                        <Tab />                
                        <div className="stats_container">
                            <div className="stats_top">
                                <span className="label">Follower</span>
                                <span className="label">Following</span>
                                <span className="label">Tracks</span>
                            </div>
                            <div className="divider"></div>
                            <div className="stats_bottom">
                                <span className="value">0</span>
                                <span className="value">3</span>
                                <span className="value">5</span>
                            </div>
                        </div>
                    
                        <div className="tabs_below">
                            <span>Recent</span>
                        </div>
                    </div>
                    
                    
                    <div className="bottom_section">
                        <div className="left_section">
                        <Song />
                        <PopularTracks/>
                        <Tracks/>
                        <Playlists/>
                        </div>

                        <UploadWidget/>
                        <SongRight />
                    </div>
                </div>   
                {/* <div className="Management_song">
                    <SongHeader/>
                    <Controls/>
                    <Lyrics/>
                    <Recommendations/>
                    <PopularSongs/>
                </div>       */}
                
        </div>
    </div>
        


    <Footer />

</div>

  );
};
export default App;