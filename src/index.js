import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SearchBar from './components/search_bar';
import VideoList from './components/video_list';
import VideoDetail from './components/video_detail';
import YTSearch from 'youtube-api-search';
import { Slider } from 'antd';
import 'antd/dist/antd.css';
import _ from 'lodash';

const API_KEY = 'AIzaSyDS7Tzkft4cV7YtXYdbdNTKi6enI_CtIHM';
var player;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      videos: [],
      selectedVideo: null,
      videoLength: null,
      loopStart: 30,
      loopEnd: 34
    }

    this.videoSearch('super smash bros melee')
    this.initIframeAPI();
    this.initIframeFunctions();
  }

  initIframeAPI() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  initIframeFunctions() {
    var self = this;
    var YT;

    window.onYouTubePlayerAPIReady = function() {
      YT = window.YT;
      player = new YT.Player('ytplayer', {
        videoId: self.state.selectedVideo.id.videoId,
        playerVars: {
          'rel': 0,
          'showinfo': 0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    function onPlayerReady(event) {
      player.seekTo(self.state.loopStart);
    }

    function onPlayerStateChange(event) {
      if (player.getPlayerState() === 1) {
        setInterval(function() {
          if (player.getCurrentTime() < self.state.loopStart || player.getCurrentTime() > self.state.loopEnd) {
            player.seekTo(self.state.loopStart);
          }
        }, 1000)
      }
    }
  }

  videoSearch(term) {
    YTSearch({key: API_KEY, term: term}, (videos) => {
      this.setState({
        videos: videos,
        selectedVideo: videos[0]
       })
    })
  }

  changeSelectedVideo(selectedVideo) {
    this.setState({ selectedVideo }, function() {
      player.loadVideoById(this.state.selectedVideo.id.videoId, 0, "default")
    })
  }

  videoLength() {
    var videoMins, videoSecs, videoLength;

    videoMins = Math.floor(player.getDuration() / 60).toString()
    videoSecs = Math.floor(player.getDuration() % 60).toString()
    if (videoSecs.toString().length === 1) {
      videoSecs = "0" + videoSecs;
    }
    videoLength = videoMins + ":" + videoSecs
    return videoLength;
  }

  setLoopParams(event) {
    this.setState({
      loopStart: event[0],
      loopEnd: event[1]
    })

    console.log(this.videoLength());

    // just set values of slider to seconds
    // for the tooltip, just take slider's current seconds value and display HH:MM:SS
  }

  render() {
    const videoSearch = _.debounce((term) => { this.videoSearch(term) }, 500)

    return (
      <div>
        <VideoDetail video={this.state.selectedVideo} />
        <div className="slider-container col-md-8">
          <Slider range min={0} max={55} defaultValue={[0, 0]} onChange={event => this.setLoopParams(event)}/>
        </div>
        <SearchBar onSearchTermChange={videoSearch} />
        <VideoList
          onVideoSelect={selectedVideo => this.changeSelectedVideo(selectedVideo)}
          videos={this.state.videos} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
