"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useRef } from "react";

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
import { BatterySchema, batteryTypes, type Battery } from "@/lib/types";
import { PlusCircle } from "lucide-react";


interface QuickAddBatteryProps {
  onSubmit: (data: Battery) => void;
}

export function QuickAddBattery({ onSubmit }: QuickAddBatteryProps) {
  const form = useForm<z.infer<typeof BatterySchema>>({
    resolver: zodResolver(BatterySchema),
    defaultValues: {
      type: undefined,
      brand: "",
      model: "",
      quantity: 1,
    },
  });

  const brandRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = (data: z.infer<typeof BatterySchema>) => {
    onSubmit({ ...data, id: crypto.randomUUID() });
    form.reset({
        id: crypto.randomUUID(),
        type: data.type, // keep type for next entry
        brand: "",
        model: "",
        quantity: 1,
    });
    // Set focus to brand field after submission
    brandRef.current?.focus();
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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Quick Add</CardTitle>
        <CardDescription>
          Quickly add a new battery to your inventory.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field}
                        ref={quantityRef}
                        onKeyDown={(e) => handleKeyDown(e)}
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
                        <FormControl>
                        <Input 
                          placeholder="e.g., Panasonic" 
                          {...field}
                          ref={brandRef}
                          onKeyDown={(e) => handleKeyDown(e, modelRef)}
                        />
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
