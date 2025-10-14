import { z } from "zod";
import Mexp from 'math-expression-evaluator';

const mexp = new Mexp();

export const BatterySchema = z.object({
  id: z.string(),
  model: z.string({ required_error: "Selecione um tipo de bateria." }),
  brand: z.string({ required_error: "Selecione uma marca." }),
  type: z.string().optional(),
  quantity: z.string().transform((val) => {
    try {
      return mexp.eval(val);
    } catch {
      return 0;
    }
  }),
  packSize: z.coerce.number().int(),
  barcode: z.string().min(1, "O código de barras é obrigatório."),
  discontinued: z.boolean().optional(),
  location: z.enum(["gondola", "stock"]).optional(),
  imageUrl: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastUsed: z.string().optional(),
  score: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  filesize: z.number().optional(),
  duration: z.number().optional(),
  pool: z.string().optional(),
  fav: z.boolean().optional(),
  favcount: z.number().optional(),
  source: z.string().optional(),
  rating: z.string().optional(),
  gondola: z.string().optional(),
  gondolaCapacity: z.number().optional(),
  gondolaName: z.string().optional(),
}).refine(
  (data) => {
    if (data.location === "gondola") {
      return typeof data.gondolaCapacity === "number";
    }
    return true;
  },
  {
    message: "A capacidade da gôndola deve ser definida se a localização for gôndola.",
    path: ["gondolaCapacity"],
  }
);

export type Battery = z.infer<typeof BatterySchema>;

export const AppSettingsSchema = z.object({
  batteryTypes: z.record(z.string()),
  packSizes: z.record(z.number()),
  batteryBrands: z.record(z.string()),
  batteryModels: z.record(z.string()),
  gondolaCapacity: z.number().optional(),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export type CalculatorResult = {
  data: [string];
};

export interface DailyBatteryRecord {
  date: string;
  batteries: Array<Pick<Battery, "id" | "brand" | "type" | "model" | "quantity" | "packSize">>;
}

export interface AggregatedBatteryData {
  brand: string;
  type: string;
  model: string;
  averageQuantity: number;
}

export interface WeeklyBatteryAverage {
  weekStartDate: string;
  weekEndDate: string;
  averages: AggregatedBatteryData[];
}

export interface MonthlyBatteryAverage {
  month: string;
  year: number;
  averages: AggregatedBatteryData[];
}