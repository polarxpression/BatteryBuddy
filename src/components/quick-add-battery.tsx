"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BatterySchema, type Battery, AppSettings } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import { onAppSettingsSnapshot } from "@/lib/firebase";

const QuickAddBatterySchema = BatterySchema.extend({
  quantity: z.string(),
});


interface QuickAddBatteryProps {
  onSubmit: (data: Battery) => void;
}

type Type = z.infer<typeof QuickAddBatterySchema>

export function QuickAddBattery({ onSubmit }: QuickAddBatteryProps) {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  const form = useForm<Type>({
    resolver: zodResolver(QuickAddBatterySchema),
    defaultValues: {
      type: undefined,
      brand: undefined,
      model: "",
      quantity: "1",
    },
  });

  const modelRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAppSettingsSnapshot(setAppSettings);
    return () => unsubscribe();
  }, []);

  const handleFormSubmit = (data: z.infer<typeof QuickAddBatterySchema>) => {
    const parsedData = BatterySchema.parse(data);
    onSubmit({ ...parsedData, id: crypto.randomUUID() });
    form.reset({
        id: crypto.randomUUID(),
        type: data.type, // keep type for next entry
        brand: data.brand, // keep brand for next entry
        model: "",
        quantity: "1",
    });
    // Set focus to model field after submission
    modelRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextFieldRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldRef?.current) {
        nextFieldRef.current.focus();
      } else {
        form.handleSubmit(handleFormSubmit)();
      }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Quick Add</CardTitle>
        <CardDescription>
          Quickly add a new battery to your inventory.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Battery Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appSettings?.batteryTypes.map((type) => (
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field}
                        ref={quantityRef}
                        onKeyDown={(e) => handleKeyDown(e, modelRef)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {appSettings?.batteryBrands.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
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
                    name="model"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                        <Input 
                          placeholder="e.g., Eneloop" 
                          {...field}
                          ref={modelRef}
                          onKeyDown={(e) => handleKeyDown(e)}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <Button type="submit" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Battery
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
