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
      loopStart: 221,
      loopEnd: 228
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
        console.log('Oops - silly error which fixes with quick reload.')
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

  render() {
    const videoSearch = _.debounce((term) => { this.videoSearch(term) }, 500)

    return (
      <div>
        <VideoContainer video={this.state.selectedVideo} />
        <div className="slider-container col-md-12">
          <Slider
            range
            min={0}
            max={this.state.videoLength}
            defaultValue={[0, 0]}
            onAfterChange={event => this.setLoopParams(event)}
            tipFormatter={this.tooltipFormatter}/>
        </div>
        <div id="description-container">
          <VideoDescription video={this.state.selectedVideo} />
        </div>
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
