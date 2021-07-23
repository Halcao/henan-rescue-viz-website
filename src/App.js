import './App.css';
import { BaiduMap, Marker, InfoWindow, NavigationControl, GeolocationControl, MarkerClusterer, asyncWrapper } from 'react-baidu-maps';
import { isPointInRect } from "./Utils"
import InfoItem from "./InfoItem"
import { useState } from "react"

const AsyncMap = asyncWrapper(BaiduMap);

function App() {
    const [timeRange, setTimeRange] = useState(8)
    const [data, setData] = useState([])
    const [listData, setListData] = useState([])

    let mapRef = null
    let displayData = []

    fetch("https://api-henan.tianshili.me/parse_json.json")
        .then(res => res.json())
        .then(resp => {
            resp = resp.map(e => {
                const arr = e.link.split('/')
                e.id = arr[arr.length - 1]
                return e
            })

            displayData = resp
            setData(resp)
            // updateList(resp)
        })

    const filterData = () => {
        let filtered_data
        if (timeRange === 12) {
            filtered_data = data
        } else {
            const currentTimestamp = Date.now()
            filtered_data = data.filter( item => currentTimestamp - Date.parse(item["Time"]) < timeRange * 60 * 60 * 1000)
        }
        displayData = filtered_data
        return filtered_data.map(drawPoints)
    }

    const updateList = (items) => {
        items = items || displayData

        let list = []
        if (mapRef != null && typeof(mapRef) !== 'undefined') {
            const bounds = mapRef.getBounds()
            list = items.filter( item => {
                return isPointInRect(item.location, bounds)
            })
        }
        console.log("list updated")
        setListData(list)
    }

    let drawPoints = (record) => <Marker key={record["link"]} position={
        {lng: record["location"]["lng"] + Math.random()/1000, lat: record["location"]["lat"] + Math.random()/1000}
    }>
        <InfoWindow content={
            `
            <div>${record["post"]}</div>
            <div>原微博：<a target="_blank" rel="noopener noreferrer" href=${record["link"]}>${record["link"]}</a></div>
            <div>发布时间: 7月${record["Time"].substring(8,10)}日 ${record["Time"].substring(11, 20)}</div>
            `
        } offset={{width: 0, height: -20}}/>
    </Marker>

    let slider = () => {
        let labelText = "最近" + timeRange + "小时";
        if (timeRange === 12) {
            labelText = "全部记录"
        }
        return <label>
                    <input id="sliderRange" type="range" min="2" max="12" value={timeRange} onChange={handleSliderChange} step="2"/>
                    {labelText}
               </label>
    }

    const list = () => {
        return listData.slice(0, 30).map((item, i) => <InfoItem info={item} key={item.id} />)
    }

    let handleSliderChange = (e) => {
        setTimeRange(e.target.value)
        updateList()
    }

    return (
        <div className={"rootDiv"}>
            <div className="info">
                <div>本网站仅聚合新浪微博上发布的有关2021年7月河南暴雨的求助信息，请大家注意辨别信息真伪。点击标记点可以看到更多信息及原微博地址。</div>
                <br/>    
                {slider()}
                <div className="info-list">
                    { list() }
                </div>
            </div>

            <AsyncMap 
                mapUrl={`https://api.map.baidu.com/api?v=2.0&ak=mTM4lv5gl2AenfvEuC8hV6DMGyWF4mBZ`}
                loadingElement={<div style={{textAlign: 'center', fontSize: 40}}>Loading.....</div>}
                enableScrollWheelZoom
                enableDragging
                onMapInstantiated={(ins) => { mapRef = ins }}
                onZoomend={({map}) => {
                    updateList()
                }}
                onMoveend={({map}) => {
                    updateList()
                }}
                defaultZoom={9} 
                defaultCenter={{lng:113.802193, lat:34.820333}} 
                mapContainer={<div className={"mapDiv"}/>}>
                    {filterData()}
                <NavigationControl
                    type="small"
                    anchor="top_right"
                    offset={{ width: 0, height: 30 }} />
                <GeolocationControl />
            </AsyncMap>
        </div>
    )
}

export default App
