import React from 'react';

const VideoContainer = ({video}) => {
  if (!video) {
    return <div>Loading...</div>;
  }
  // const videoId = video.id.videoId;
  // const url = `https:www.youtube.com/embed/${videoId}`;

  return (
    <div className="video-detail" id="video-container">
      <div className="embed-responsive embed-responsive-16by9">
        <div id="ytplayer"></div>
      </div>
    </div>
  )
}

export default VideoContainer;
