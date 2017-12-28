import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SearchBar from './components/search_bar';
import VideoList from './components/video_list';
import VideoDetail from './components/video_detail';
import YTSearch from 'youtube-api-search';
import _ from 'lodash';

const API_KEY = 'AIzaSyDS7Tzkft4cV7YtXYdbdNTKi6enI_CtIHM';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      videos: [],
      selectedVideo: null
    }

    this.videoSearch('surfboards')
  }

  videoSearch(term) {
    YTSearch({key: API_KEY, term: term}, (videos) => {
      this.setState({
        videos: videos,
        selectedVideo: videos[0]
       })
    })
  }

  render() {
    const videoSearch = _.debounce((term) => { this.videoSearch(term) }, 500)

    return (
      <div>
        <VideoDetail video={this.state.selectedVideo} />
        <SearchBar onSearchTermChange={videoSearch} />
        <VideoList
          onVideoSelect={selectedVideo => this.setState({selectedVideo}) }
          videos={this.state.videos} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
