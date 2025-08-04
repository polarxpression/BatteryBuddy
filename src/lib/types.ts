import { z } from "zod";

export const batteryTypes = ["AA", "AAA", "C", "D", "9V", "A23"] as const;

export const BatterySchema = z.object({
  id: z.string(),
  type: z.enum(batteryTypes, { required_error: "Please select a battery type." }),
  brand: z.string().min(1, "Brand is required."),
  model: z.string().min(1, "Model is required."),
  quantity: z.coerce.number().int().min(0, "Quantity must be zero or more."),
});

export type Battery = z.infer<typeof BatterySchema>;
