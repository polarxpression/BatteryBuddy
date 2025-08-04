import { z } from "zod";

export const batteryTypes = ["AA", "AAA", "C", "D", "9V", "A23"] as const;

export const BatterySchema = z.object({
  id: z.string(),
  type: z.enum(batteryTypes, { required_error: "Selecione um tipo de bateria." }),
  brand: z.string().min(1, "A marca é obrigatória."),
  model: z.string().min(1, "O modelo é obrigatório."),
  quantity: z.coerce.number().int().min(0, "A quantidade deve ser zero ou mais."),
});

export type Battery = z.infer<typeof BatterySchema>;
