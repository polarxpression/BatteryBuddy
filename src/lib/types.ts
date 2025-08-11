import { z } from "zod";

export const BatterySchema = z.object({
  id: z.string(),
  type: z.string({ required_error: "Selecione um tipo de bateria." }),
  brand: z.string({ required_error: "Selecione uma marca." }),
  model: z.string().min(1, "O modelo é obrigatório."),
  quantity: z.coerce.number().int().min(0, "A quantidade deve ser zero ou mais."),
  packSize: z.coerce.number().int(),
});

export type Battery = z.infer<typeof BatterySchema>;

export const AppSettingsSchema = z.object({
  batteryTypes: z.array(z.string()),
  packSizes: z.array(z.number()),
  batteryBrands: z.array(z.string()),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;
