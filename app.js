import React, {Component} from 'react';
import DeckGL, {ArcLayer} from 'deck.gl';
import MapGL from 'react-map-gl';
import {render} from 'react-dom';

const MAPBOX_ACCESS_TOKEN = process.env.MapboxAccessToken;

const INITIAL_MAP_STATE = {
  longitude: -1.4157267858730052,
  latitude: 52.232395363869415,
  zoom: 6.6,
  pitch: 40.5,
  height: 1500,
  width: 1500
};

class BaseMap extends Component {
  constructor(props){
    super(props);
    this.state = {
      mapViewState: INITIAL_MAP_STATE
    };
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(mapViewState) {
    this.setState({
      mapViewState: {...this.state.mapViewState, ...mapViewState}
    });
  }

  render() {
    console.log(this.props.data);
    return (
      <MapGL {...this.state.mapViewState}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}>
        <DeckGL {...this.state.mapViewState} layers={[
          new ArcLayer({id: 'arc-layer', data: this.props.data, getStrokeWidth: 7, pickable: true})
        ]} />
      </MapGL>
    );
  }
}

class TraceRouteForm extends Component{
  constructor(props){
    super(props);

    this.state = {
      text: 'Text Area',
      traceRoutePoint: undefined
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onTextAreaChange = this.onTextAreaChange.bind(this);
  }

  onSubmit(e){
    e.preventDefault();

    let ipAddrArray = [];
    const refinedTraceRouteResult = this.state.text.split('\n');

    refinedTraceRouteResult.forEach((value) => {
      if(value.includes('*')) return;
      if(value.includes('[open]')){
        ipAddrArray.push(value.split('  ')[1].split(' ')[0])
      }else{
        ipAddrArray.push(value.split('  ')[1])
      }
    });

    console.log(ipAddrArray);
    fetch('http://localhost:7000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'IPAddress': ipAddrArray.filter(item => item) })
    }).then(resp => resp.json())
      .then(result => {
        this.setState({
          traceRoutePoint: result.location
        });
      })
  }

  onTextAreaChange(e){
    this.setState({
      text: e.target.value
    });
  }

  render(){
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <textarea
            value={this.state.text}
            onChange={this.onTextAreaChange}/>
          <div>
            <button type="submit">OK</button>
          </div>
        </form>
        <BaseMap data={this.state.traceRoutePoint} ></BaseMap>
      </div>
    )
  }
}
export {TraceRouteForm};

if (!window.demoLauncherActive) {
  render(<TraceRouteForm />, document.body.appendChild(document.createElement('div')));
}
