export type House = {
  _id?: string;
  title: string;
  address: string;
  description: string;
  location: string;
  price: { week:{startdate : Date , endDate : Date}; price: number }[];
  numberOfRooms: number;
  numberOfBathrooms: number;
  amenities: string[];
  images: string[]; // Updated to be an array of strings representing image URLs
  isAvailable: boolean;
  postedAt: string;
  availablePeriod: string[];
  unavailableDates: string[];
};