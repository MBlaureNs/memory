import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default function run_demo(root) {
  ReactDOM.render(<Memory/>, root);
}

class Memory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: makeboard(this),
      clicks: 0,
      active: [],
      hidden: 16,
      lock: false
    };
    this.delay = 1000;
  }
  
  resetState() {
    this.setState({
      board: makeboard(this),
      clicks: 0,
      active: [],
      hidden: 16,
      lock: false
    });
  }

  handleClick(i,j) {
    if (this.state.lock) {return;}
    
    var board = this.state.board.slice();
    board[i][j].active = true;
    var clicks = this.state.clicks + 1;
    var active = this.state.active.slice();
    active.push(board[i][j]);
    var lock = (active.length == 2);
    
    this.setState({
      board: board,
      clicks: clicks,
      active: active,
      lock: lock
    });

    if (lock) {
      setTimeout(
	this.unlockBoard.bind(this),
	this.delay
      );
    }
  }

  unlockBoard() {
    var board = this.state.board.slice();
    var active = this.state.active.slice();
    var hidden = this.state.hidden;
    
    active[0].active = false;
    active[1].active = false;
    
    if (active[0].letter == active[1].letter) {
      active[0].complete = true;
      active[1].complete = true;
      hidden = hidden - 2;
    }
    
    this.setState(
      {
	board: board,
	active: [],
	lock: false,
	hidden: hidden
      }
    );
  }
    
  renderTile(i,j) {
    return (
      <Tile
	 data = {this.state.board[i][j]}
	 onClick = {() => this.handleClick(i,j)}
	/>
    );
  }
  
  render() {
    return (
      <div className="board">
	<div className="row">
	  <RestartBtn onClick={this.resetState.bind(this)}/>
	  <ClickCounter clicks={this.state.clicks}/>
	</div>
	<div className="row">
	  <StatusBar hidden={this.state.hidden} lock={this.state.lock}/>
	</div>
	<div className="row">
	  {this.renderTile(0,0)}
	  {this.renderTile(0,1)}
	  {this.renderTile(0,2)}
	  {this.renderTile(0,3)}
	</div>
	<div className="row">
	  {this.renderTile(1,0)}
	  {this.renderTile(1,1)}
	  {this.renderTile(1,2)}
	  {this.renderTile(1,3)}
	</div>
	<div className="row">
	  {this.renderTile(2,0)}
	  {this.renderTile(2,1)}
	  {this.renderTile(2,2)}
	  {this.renderTile(2,3)}
	</div>
	<div className="row">
	  {this.renderTile(3,0)}
	  {this.renderTile(3,1)}
	  {this.renderTile(3,2)}
	  {this.renderTile(3,3)}
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
  if (params.hidden == 0) {
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
  if (p.complete) {
    return (
      <div id={div_id} className="tile col complete">
	{p.letter}C
      </div>
    );
  } else if (p.active) {
    return (
      <div id={div_id} className="tile col active">
	{p.letter}A
      </div>
    );
  } else {
    return (
      <div id={div_id} className="tile col">
	<Button onClick={params.onClick}>?</Button>
      </div>
    );
  }
}

//generate tile permutation
function makeboard() {
  var letters = 'abcdefghabcdefgh'.split('');
  shuffle(letters);
  
  var board = [];
  for (var i=0; i<4; i++) {
    var row = [];
    for (var j=0; j<4; j++) {
      var data = {
	letter: letters[i*4 + j],
	complete: false,
	active: false,
	x: i,
	y: j
      };
      row.push(data);
    }
    board.push(row);
  }

  return board;
}

// fisher-yates shuffle
// https://www.frankmitchell.org/2015/01/fisher-yates/
function shuffle (array) {
    var i = 0;
    var j = 0;
    var temp = null;

    for (i = array.length - 1; i > 0; i -= 1) {
	j = Math.floor(Math.random() * (i + 1));
	temp = array[i];
	array[i] = array[j];
	array[j] = temp;
    }
}

