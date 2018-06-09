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

const inFlowColors = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132]
];

const outFlowColors = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [177, 0, 38]
];

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
    const arcStatus = {
      id: 'arc-layer',
      data: this.props.data,
      getStrokeWidth: 7,
      getSourcePosition: d => d.source,
      getTargetPosition: d => d.target,
      pickable: true
    }

    return (
      <MapGL {...this.state.mapViewState}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}>
        <DeckGL {...this.state.mapViewState} layers={[
          new ArcLayer(arcStatus)
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

  calclateArcData(data) {
    const current_data = data;
    const v = [];

    current_data.forEach((value, index) => {
      if(index == current_data.length - 1){
        v.push({
          source: value,
          target: current_data[0]
        })
      }else{
        v.push({
          source: value,
          target: current_data[index+1]
        })
      }
    })

    return v;
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
        const splited = value.split('  ')

        if(splited[0].length == 0){
          ipAddrArray.push(splited[2]);
        }else{
          ipAddrArray.push(value.split('  ')[1])
        }
      }
    });

    fetch('http://localhost:7000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'IPAddress': ipAddrArray.filter(item => item) })
    }).then(resp => resp.json())
      .then(result => {
        this.setState({
          traceRoutePoint: this.calclateArcData(result.location)
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
