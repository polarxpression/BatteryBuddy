"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BatterySchema, batteryTypes, type Battery } from "@/lib/types";


interface AddEditBatterySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batteryToEdit?: Battery | null;
  onSubmit: (data: Battery) => void;
}

export function AddEditBatterySheet({ open, onOpenChange, batteryToEdit, onSubmit }: AddEditBatterySheetProps) {
  const form = useForm<z.infer<typeof BatterySchema>>({
    resolver: zodResolver(BatterySchema),
    defaultValues: {
      type: undefined,
      brand: "",
      model: "",
      quantity: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (batteryToEdit) {
        form.reset(batteryToEdit);
      } else {
        form.reset({
          id: crypto.randomUUID(),
          type: undefined,
          brand: "",
          model: "",
          quantity: 0,
        });
      }
    }
  }, [batteryToEdit, form, open]);

  const handleFormSubmit = (data: z.infer<typeof BatterySchema>) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-headline">{batteryToEdit ? "Edit Battery" : "Add New Battery"}</SheetTitle>
          <SheetDescription>
            {batteryToEdit ? "Update the details for this battery." : "Fill in the details for the new battery."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col justify-between h-full pt-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Battery Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a battery type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {batteryTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Panasonic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model / Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Eneloop, Alkaline" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="mt-8">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit">
                {batteryToEdit ? "Save Changes" : "Add Battery"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
