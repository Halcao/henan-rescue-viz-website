const isPointInRect = function (point, bounds) {
    const sw = bounds.getSouthWest() //西南脚点
    const ne = bounds.getNorthEast() //东北脚点
    return (point.lng >= sw.lng && point.lng <= ne.lng && point.lat >= sw.lat && point.lat <= ne.lat)
}

export { isPointInRect }