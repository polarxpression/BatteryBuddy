import { z } from "zod";
import Mexp from 'math-expression-evaluator';

const mexp = new Mexp();

export const BatterySchema = z.object({
  id: z.string(),
  type: z.string({ required_error: "Selecione um tipo de bateria." }),
  brand: z.string({ required_error: "Selecione uma marca." }),
  model: z.string().optional(),
  quantity: z.string().transform((val) => {
    try {
      return mexp.eval(val);
    } catch {
      return 0;
    }
  }),
  packSize: z.coerce.number().int(),
});

export type Battery = z.infer<typeof BatterySchema>;

export const AppSettingsSchema = z.object({
  batteryTypes: z.array(z.string()),
  packSizes: z.array(z.number()),
  batteryBrands: z.array(z.string()),
  batteryModels: z.array(z.string()),
  lowStockThreshold: z.number().optional(),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export type CalculatorResult = {
  data: [string];
};


