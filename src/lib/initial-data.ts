import type { Battery } from "./types";

export const initialBatteries: Battery[] = [
  {
    id: "1",
    type: "AA",
    brand: "Panasonic",
    model: "Eneloop",
    quantity: 12,
  },
  {
    id: "2",
    type: "AA",
    brand: "Duracell",
    model: "Alkaline",
    quantity: 4,
  },
  {
    id: "3",
    type: "AAA",
    brand: "Panasonic",
    model: "Eneloop",
    quantity: 8,
  },
  {
    id: "4",
    type: "AAA",
    brand: "Energizer",
    model: "Lithium",
    quantity: 16,
  },
  {
    id: "5",
    type: "C",
    brand: "Duracell",
    model: "Alkaline",
    quantity: 2,
  },
  {
    id: "6",
    type: "9V",
    brand: "Energizer",
    model: "Max",
    quantity: 1,
  },
  {
    id: "7",
    type: "D",
    brand: "Generic",
    model: "Heavy Duty",
    quantity: 0,
  },
];
