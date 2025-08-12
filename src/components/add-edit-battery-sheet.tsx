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
import { onAppSettingsSnapshot } from "@/lib/firebase";
import { AppSettings, Battery, BatterySchema } from "@/lib/types";

const AddEditBatterySheetSchema = z.object({
  id: z.string(),
  type: z.string({ required_error: "Selecione um tipo de bateria." }),
  brand: z.string({ required_error: "Selecione uma marca." }),
  model: z.string().min(1, "O modelo é obrigatório."),
  quantity: z.string(),
  packSize: z.number(),
});


interface AddEditBatterySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batteryToEdit?: Battery | null;
  onSubmit: (data: Battery) => void;
}

type Type = z.infer<typeof AddEditBatterySheetSchema>

export function AddEditBatterySheet({ open, onOpenChange, batteryToEdit, onSubmit }: AddEditBatterySheetProps) {
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  const form = useForm<Type>({
    resolver: zodResolver(AddEditBatterySheetSchema),
    defaultValues: {
      id: undefined,
      type: undefined,
      brand: "",
      model: "",
      quantity: "0",
      packSize: 1,
    },
  });

  const modelRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAppSettingsSnapshot(setAppSettings);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (open) {
      if (batteryToEdit) {
        form.reset({
          ...batteryToEdit,
          quantity: String(batteryToEdit.quantity),
        });
      } else {
        form.reset({
          id: crypto.randomUUID(),
          type: undefined,
          brand: "",
          model: "",
          quantity: "0",
          packSize: 1,
        });
      }
    }
  }, [batteryToEdit, form, open]);

  const handleFormSubmit = (data: z.infer<typeof AddEditBatterySheetSchema>) => {
    const parsedData = BatterySchema.parse(data);
    onSubmit(parsedData);
    onOpenChange(false);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-sm sm:max-w-lg overflow-y-auto max-h-[80vh]">
        <SheetHeader>
          <SheetTitle className="font-headline">{batteryToEdit ? "Editar Bateria" : "Adicionar Nova Bateria"}</SheetTitle>
          <SheetDescription>
            {batteryToEdit ? "Atualize os detalhes desta bateria." : "Preencha os detalhes da nova bateria."}
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
                    <FormLabel>Tipo de Bateria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo de bateria" />
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
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma marca" />
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
                    <FormLabel>Modelo / Tipo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ex: Eneloop, Alcalina" 
                        {...field} 
                        ref={modelRef} 
                        onKeyDown={(e) => handleKeyDown(e, quantityRef)}
                      />
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
                    <FormLabel>Quantidade de Embalagens</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field} 
                        ref={quantityRef} 
                        onKeyDown={(e) => handleKeyDown(e)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="packSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidades por Embalagem</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tamanho da embalagem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appSettings?.packSizes.map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="mt-8 pt-4 border-t">
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button type="submit">
                {batteryToEdit ? "Salvar Alterações" : "Adicionar Bateria"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
