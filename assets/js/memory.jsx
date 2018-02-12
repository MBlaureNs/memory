import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default function memory_init(root, channel) {
  ReactDOM.render(<Memory channel={channel}/>, root);
}

class Memory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: this.defaultBoard(),
      clicks: 0,
      active: [],
      lock: false,
      win: false
    };
    
    this.channel = props.channel;
    this.channel.join()
      .receive("ok", this.gotView.bind(this))
      .receive("error", resp => { console.log("Unable to join", resp) });
    this.channel.on('update', this.gotView.bind(this));
  }

  defaultBoard() {
    var board = [];
    for (var i=0; i<16; i++) {
      var data = {
	letter: "?",
	state: "hidden",
	x: i % 4,
	y: i / 4
      }
      board.push(data);
    }
    return board;
  }
  
  resetState() {
    this.channel.push("restart")
	.receive("ok", this.gotView.bind(this));
  }
  
  gotView(view) {
    console.log("New view", view);
    this.setState(view.game);
  }

  handleClick(x, y) {
    if (this.state.lock) {return;}
    this.channel.push("click", {"x": x, "y": y})
	.receive("ok", this.gotView.bind(this));
  }
    
  renderTile(i,j) {
    return (
      <Tile
	 data = {this.state.board[i+j*4]}
	 onClick = {() => this.handleClick(i,j)}
      />
    );
  }
  
  render() {
    return (
      <div className="container main">
	<div className="container status">
	  <div className="row">
	    <RestartBtn onClick={this.resetState.bind(this)}/>
	    <ClickCounter clicks={this.state.clicks}/>
	  </div>
	  <div className="row">
	    <StatusBar win={this.state.win} lock={this.state.lock}/>
	  </div>
	</div>
	<div className="container board">
	  <div className="row">
	    {this.renderTile(0,0)}
	    {this.renderTile(1,0)}
	    {this.renderTile(2,0)}
	    {this.renderTile(3,0)}
	  </div>
	  <div className="row">
	    {this.renderTile(0,1)}
	    {this.renderTile(1,1)}
	    {this.renderTile(2,1)}
	    {this.renderTile(3,1)}
	  </div>
	  <div className="row">
	    {this.renderTile(0,2)}
	    {this.renderTile(1,2)}
	    {this.renderTile(2,2)}
	    {this.renderTile(3,2)}
	  </div>
	  <div className="row">
	    {this.renderTile(0,3)}
	    {this.renderTile(1,3)}
	    {this.renderTile(2,3)}
	    {this.renderTile(3,3)}
	  </div>
	</div>
      </div>
    );
  }
}

function RestartBtn(params) {
    return (
      <div id="restart-div" className="col">
	<Button id="restart-btn" onClick={params.onClick}>restart</Button>
      </div>
    );
}

function ClickCounter(params) {
    return (
      <div id="click-counter" className="col">
	Clicks: {params.clicks}
      </div>
    );
}

function StatusBar(params) {
  if (params.win) {
    return (
      <div id="status-bar-win" className="col">
	WIN
      </div>
    );
  } else if (params.lock) {
    return (
      <div id="status-bar-wait" className="col">
	WAIT
      </div>
    );
  } else {
    return (
      <div id="status-bar-click" className="col">
	CLICK
      </div>
    );
  }
}

function Tile(params) {
  var p = params.data;
  var div_id = "tile-" + p.x + "-" + p.y;
  if (p.state == "complete") {
    return (
      <div id={div_id} className="col tile tile-complete">
	{p.letter}
      </div>
    );
  } else if (p.state == "active") {
    return (
      <div id={div_id} className="col tile tile-active">
	{p.letter}
      </div>
    );
  } else { //p.state == "hidden"
    return (
      <div id={div_id} className="col tile tile-hidden" onClick={params.onClick}>
	?
      </div>
    );
  }
}


