function calculateDelivery(distanceKm) {
    if (distanceKm <= 20) {
      return {
        charge: 70,
        days: "2-3 Days",
      };
    }
  
    if (distanceKm <= 120) {
      return {
        charge: 110,
        days: "2-3 Days",
      };
    }
  
    if (distanceKm <= 250) {
      return {
        charge: 170,
        days: "5-7 Days",
      };
    }
  
    if (distanceKm <= 450) {
      return {
        charge: 210,
        days: "5-7 Days",
      };
    }
  
    return {
      charge: 270,
      days: "7+ Days",
    };
  }
  
  module.exports = calculateDelivery;