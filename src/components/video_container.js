import React from 'react';

const VideoContainer = (props) => {
  if (!props.video) {
    return <div>Loading...</div>;
  }

  return (
    <div className="embed-responsive embed-responsive-16by9">
      <div id="ytplayer"></div>
      <input
        type="button"
        id="controller"
        tabIndex="0"
        onKeyDown={props.handleKeyDown}
        />
    </div>
  )
}

export default VideoContainer;
