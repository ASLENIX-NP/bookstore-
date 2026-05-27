const STORE_LOCATION = {
  lat: Number(process.env.STORE_LAT || 27.429688077401075),
  lng: Number(process.env.STORE_LNG || 85.03152826822568),
};

const DELIVERY_RULES = [
  {
    maxKm: 50,
    charge: 70,
    days: "1-2 Days",
  },
  {
    maxKm: 150,
    charge: 110,
    days: "2-3 Days",
  },
  {
    maxKm: 250,
    charge: 170,
    days: "3-4 Days",
  },
  {
    maxKm: Infinity,
    charge: 210,
    days: "4-7 Days",
  },
];

const toRadians = (value) => {
  return (value * Math.PI) / 180;
};

const calculateDistanceKm = (from, to) => {
  const earthRadiusKm = 6371;

  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const calculateDelivery = (locationOrDistance) => {
  let distanceKm = 0;

  if (typeof locationOrDistance === "number") {
    distanceKm = Number(locationOrDistance);
  } else {
    const lat = Number(locationOrDistance?.lat);
    const lng = Number(locationOrDistance?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error("Valid customer latitude and longitude are required");
    }

    distanceKm = calculateDistanceKm(STORE_LOCATION, {
      lat,
      lng,
    });
  }

  const deliveryRule = DELIVERY_RULES.find((rule) => distanceKm <= rule.maxKm);

  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    charge: deliveryRule.charge,
    days: deliveryRule.days,
  };
};

module.exports = calculateDelivery;