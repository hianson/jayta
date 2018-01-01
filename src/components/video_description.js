import React from 'react';

const VideoDescription = ({video}) => {
  if (!video) {
    return <div></div>;
  }

  return (
    <div id="description-container">
      <div className="video-detail details">
        <div>{video.snippet.title}</div>
        <div>{video.snippet.description}</div>
        </div>
      </div>
  )
}

export default VideoDescription;
