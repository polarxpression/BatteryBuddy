"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { Battery, BatterySchema } from "@/lib/types";

const AddEditBatterySheetSchema = z.object({
  id: z.string(),
  type: z.string({ required_error: "Selecione um tipo de bateria." }),
  brand: z.string({ required_error: "Selecione uma marca." }),
  model: z.string().min(1, "O modelo é obrigatório."),
  quantity: z.string(),
  packSize: z.number(),
  barcode: z.string().min(1, "O código de barras é obrigatório."),
  discontinued: z.boolean().optional(),
  location: z.enum(["gondola", "stock"]).optional(),
  imageUrl: z.string().optional(),
  gondolaCapacity: z.number().optional(),
});


import { useAppSettings } from "@/contexts/app-settings-context";

interface AddEditBatterySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batteryToEdit?: Battery | null;
  onSubmit: (data: Battery) => void;
  isDuplicating?: boolean;
}

type Type = z.infer<typeof AddEditBatterySheetSchema>

export function AddEditBatterySheet({ open, onOpenChange, batteryToEdit, onSubmit, isDuplicating }: AddEditBatterySheetProps) {
  const { appSettings } = useAppSettings();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<Type>({
    resolver: zodResolver(AddEditBatterySheetSchema),
    defaultValues: {
      id: batteryToEdit?.id || crypto.randomUUID(),
      type: batteryToEdit?.type || undefined,
      brand: batteryToEdit?.brand || "",
      model: batteryToEdit?.model || "",
      quantity: String(batteryToEdit?.quantity || 0),
      packSize: batteryToEdit?.packSize || 1,
      barcode: batteryToEdit?.barcode || "",
      discontinued: batteryToEdit?.discontinued || false,
      location: batteryToEdit?.location || "gondola",
      imageUrl: batteryToEdit?.imageUrl || "",
      gondolaCapacity: batteryToEdit?.gondolaCapacity || undefined,
    },
  });



  
  const quantityRef = useRef<HTMLInputElement>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLButtonElement>(null);
  const brandRef = useRef<HTMLButtonElement>(null);
  const modelRef = useRef<HTMLButtonElement>(null);
  const packSizeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      if (batteryToEdit) {
        form.reset({
          ...batteryToEdit,
          id: isDuplicating ? crypto.randomUUID() : batteryToEdit.id,
          quantity: String(batteryToEdit.quantity),
          barcode: batteryToEdit.barcode || "",
          discontinued: batteryToEdit.discontinued || false,
          location: batteryToEdit.location || "gondola",
          imageUrl: batteryToEdit.imageUrl || "",
          gondolaCapacity: batteryToEdit.gondolaCapacity || undefined,
        });
        if (batteryToEdit.imageUrl) {
          setImagePreview(batteryToEdit.imageUrl);
        }
      } else {
        form.reset({
          id: crypto.randomUUID(),
          type: undefined,
          brand: "",
          model: "",
          quantity: "0",
          packSize: 1,
          barcode: "",
          discontinued: false,
          location: "gondola",
          imageUrl: "",
        });
        setImagePreview(null);
      }
    }
  }, [batteryToEdit, form, open, isDuplicating]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      setIsUploading(true);
      try {
        const fileRef = storageRef(storage, `batteries/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const imageUrl = await getDownloadURL(fileRef);
        form.setValue("imageUrl", imageUrl);
        setImagePreview(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        // Optionally, show a toast message to the user
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFormSubmit = (data: z.infer<typeof AddEditBatterySheetSchema>) => {
    const { quantity, ...restOfData } = data;

    const finalData = {
      ...restOfData,
      imageUrl: imagePreview || data.imageUrl,
      quantity: quantity,
    };
    if (data.location === "gondola") {
      finalData.gondolaCapacity = data.gondolaCapacity;
    }
    const parsedData = BatterySchema.parse(finalData);
    onSubmit(parsedData);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, nextFieldRef?: React.RefObject<HTMLElement>) => {
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
      <SheetContent className="w-full max-w-sm sm:max-w-lg overflow-y-auto h-full">
        <SheetHeader>
          <SheetTitle className="font-headline">
            {isDuplicating
              ? "Clonar Bateria"
              : batteryToEdit
              ? "Editar Bateria"
              : "Adicionar Nova Bateria"}
          </SheetTitle>
          <SheetDescription>
            {isDuplicating
              ? "Crie uma nova bateria a partir desta."
              : batteryToEdit
              ? "Atualize os detalhes desta bateria."
              : "Preencha os detalhes da nova bateria."}
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
                        <SelectTrigger ref={typeRef} onKeyDown={(e) => handleKeyDown(e, brandRef)}>
                          <SelectValue placeholder="Selecione um tipo de bateria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appSettings?.batteryTypes && Object.values(appSettings.batteryTypes).map((type) => (
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
                        <SelectTrigger ref={brandRef} onKeyDown={(e) => handleKeyDown(e, modelRef)}>
                          <SelectValue placeholder="Selecione uma marca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appSettings?.batteryBrands && Object.values(appSettings.batteryBrands).map((brand) => (
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
                    <FormLabel>Modelo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger ref={modelRef} onKeyDown={(e) => handleKeyDown(e, quantityRef)}>
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appSettings?.batteryModels && Object.values(appSettings.batteryModels).map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
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
                    <FormLabel>Quantidade de Embalagens</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field} 
                        ref={quantityRef} 
                        onKeyDown={(e) => handleKeyDown(e, packSizeRef)}
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
                        <SelectTrigger ref={packSizeRef} onKeyDown={(e) => handleKeyDown(e, barcodeRef)}>
                          <SelectValue placeholder="Selecione o tamanho da embalagem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appSettings?.packSizes && Object.values(appSettings.packSizes).sort((a, b) => a - b).map((size) => (
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
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a localização" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gondola">Gôndola</SelectItem>
                        <SelectItem value="stock">Estoque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Barras</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field}
                        ref={barcodeRef}
                        onKeyDown={(e) => handleKeyDown(e)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("location") === "gondola" && (
                <FormField
                  control={form.control}
                  name="gondolaCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade Máxima da Gôndola (por item)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? undefined : parseInt(value, 10));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Defina a capacidade máxima de baterias para este item na gôndola. Se deixado em branco, a capacidade global será usada.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormItem>
                <FormLabel>Imagem</FormLabel>
                <Tabs defaultValue="url">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <Input
                          placeholder="https://exemplo.com/imagem.png"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setImagePreview(e.target.value);
                          }}
                        />
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="upload">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </TabsContent>
                </Tabs>
                {imagePreview && (
                  <div className="mt-4">
                    <Image src={imagePreview} alt="Battery preview" width={80} height={80} className="h-20 w-20 object-cover rounded-md" />
                  </div>
                )}
              </FormItem>
              <FormField
                control={form.control}
                name="discontinued"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Descontinuada
                      </FormLabel>
                      <FormDescription>
                        Marque esta opção se a bateria não é mais vendida.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="mt-8 pt-4 border-t">
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button type="submit" disabled={isUploading}>
                {isUploading
                  ? "Salvando Imagem..."
                  : isDuplicating
                  ? "Clonar Bateria"
                  : batteryToEdit
                  ? "Salvar Alterações"
                  : "Adicionar Bateria"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}