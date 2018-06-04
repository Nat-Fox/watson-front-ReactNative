
export async function fetchDistanceMatrix(origin, destination, mode) {
    const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=${mode}&key=AIzaSyAWtKudlctTzsgnuy_p_dBJJIgMyGmSQFI`)
    const json = await response.json()
    return json
}