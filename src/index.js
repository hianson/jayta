import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SearchBar from './components/search_bar';
import VideoList from './components/video_list';
import VideoContainer from './components/video_container';
import VideoDescription from './components/video_description';
import YTSearch from 'youtube-api-search';
import { Slider } from 'antd';
import 'antd/dist/antd.css';
import _ from 'lodash';

const API_KEY = 'AIzaSyAhWFg94Jk2Ou8MpmQMxBAg7iIRXCqAHmA';
var player;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      videos: [],
      selectedVideo: null,
      videoLength: null,
      loopStart: 120,
      loopEnd: 126
    }

    this.videoSearch('jimi hendrix red house live')
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

      if (!self.state.selectedVideo) {
        console.log('Loading...')
        window.location.reload();
      }

      player = new YT.Player('ytplayer', {
        videoId: self.state.selectedVideo.id.videoId,
        playerVars: {
          rel: 0,
          showinfo: 0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
      var controller = document.getElementById("controller")
      controller.focus()
    }

    function onPlayerReady(event) {
      player.seekTo(self.state.loopStart);
      self.setState({videoLength: player.getDuration()})
    }

    function onPlayerStateChange(event) {
      if (player.getPlayerState() === 1) {
        setInterval(function() {
          if (player.getCurrentTime() < self.state.loopStart || player.getCurrentTime() > self.state.loopEnd) {
            player.seekTo(self.state.loopStart);
          }
        }, 800)
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
    var controller = document.getElementById("controller")
    this.setState({ selectedVideo }, function() {
      player.loadVideoById(this.state.selectedVideo.id.videoId, 0, "default")
    })
    controller.focus()
  }

  setLoopParams(event) {
    this.setState({
      loopStart: event[0],
      loopEnd: event[1],
      videoLength: player.getDuration()
    })
  }

  tooltipFormatter(value) {
    var videoHours, videoMins, videoSecs, videoLength;

    videoHours = Math.floor(value / 3600)
    value -= (videoHours * 3600)
    videoMins = Math.floor(value / 60)
    value -= (videoMins * 60)
    videoSecs = Math.floor(value)

    if (videoSecs < 10) {
      videoSecs = "0" + videoSecs
    }

    if (videoHours > 0) {
      if (videoMins < 10) {
        videoMins = "0" + videoMins
      }
      videoLength = videoHours + ":" + videoMins + ":" + videoSecs;
    } else {
      videoLength = videoMins + ":" + videoSecs;
    }
    return videoLength;
  }

  decelVideoSpeed() {
    var controller = document.getElementById("controller")

    if (player.getPlaybackRate() === 2) {
      player.setPlaybackRate(1.5)
    } else {
      player.setPlaybackRate(player.getPlaybackRate() - .25)
    }
    controller.focus()
  }

  accelVideoSpeed() {
    var controller = document.getElementById("controller")

    if (player.getPlaybackRate() === 1.5) {
      player.setPlaybackRate(2)
    } else {
      player.setPlaybackRate(player.getPlaybackRate() + .25)
    }
    controller.focus()
  }

  normalizeVideoSpeed() {
    var controller = document.getElementById("controller")

    player.setPlaybackRate(1)
    controller.focus()
  }

  playPauseVideo() {
    if (player.getPlayerState() === 1){
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }

  handleKeyDown(event) {
    event.preventDefault()
    switch (event.keyCode) {
    case 37:
      this.decelVideoSpeed()
      break;
    case 39:
      this.accelVideoSpeed()
      break;
    case 32:
      this.playPauseVideo()
      break;
    default:
      break;
    }
  }

  render() {
    const videoSearch = _.debounce((term) => { this.videoSearch(term) }, 500)

    return (
      <div>
        <VideoContainer
          video={this.state.selectedVideo}
          handleKeyDown={(event) => this.handleKeyDown(event)} />
        <div className="slider-container col-md-12">
          <Slider
            range
            min={0}
            max={this.state.videoLength}
            defaultValue={[0, 0]}
            onAfterChange={event => this.setLoopParams(event)}
            tipFormatter={this.tooltipFormatter}/>
        </div>
        <div className="video-controls">
          <button id="decel" onClick={this.decelVideoSpeed}>&lt;&lt;</button>
          <button id="normalize" onClick={this.normalizeVideoSpeed}>Normal Speed</button>
          <button id="accel" onClick={this.accelVideoSpeed}>&gt;&gt;</button>
        </div>
        <VideoDescription video={this.state.selectedVideo} />
        <div id="search-container">
          <SearchBar onSearchTermChange={videoSearch} />
          <VideoList
            onVideoSelect={selectedVideo => this.changeSelectedVideo(selectedVideo)}
            videos={this.state.videos} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
