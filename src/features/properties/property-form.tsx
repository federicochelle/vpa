import type { Property } from "@/types/property";
import { FormField } from "@/components/ui/form-field";
import {
  currencyOptions,
  operationTypeOptions,
  propertyStatusOptions,
  propertyTypeOptions,
} from "@/features/properties/property-options";

interface PropertyFormProps {
  action: (formData: FormData) => void | Promise<void>;
  property?: Property | null;
  submitLabel: string;
}

export function PropertyForm({
  action,
  property,
  submitLabel,
}: PropertyFormProps) {
  return (
    <form action={action} className="panel p-6 sm:p-8">
      {property ? <input name="id" type="hidden" value={property.id} /> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField htmlFor="title" label="Titulo">
          <input
            className="input-base"
            defaultValue={property?.title ?? ""}
            id="title"
            name="title"
            required
            type="text"
          />
        </FormField>
        <FormField
          htmlFor="slug"
          hint="Si queda vacio, se genera desde el titulo."
          label="Slug"
        >
          <input
            className="input-base"
            defaultValue={property?.slug ?? ""}
            id="slug"
            name="slug"
            type="text"
          />
        </FormField>
        <FormField htmlFor="operationType" label="Operacion">
          <select
            className="input-base"
            defaultValue={property?.operationType ?? "sale"}
            id="operationType"
            name="operationType"
          >
            {operationTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField htmlFor="propertyType" label="Tipo de propiedad">
          <select
            className="input-base"
            defaultValue={property?.propertyType ?? "apartment"}
            id="propertyType"
            name="propertyType"
          >
            {propertyTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField htmlFor="status" label="Estado">
          <select
            className="input-base"
            defaultValue={property?.status ?? "draft"}
            id="status"
            name="status"
          >
            {propertyStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField htmlFor="currency" label="Moneda">
          <select
            className="input-base"
            defaultValue={property?.currency ?? ""}
            id="currency"
            name="currency"
          >
            <option value="">Sin definir</option>
            {currencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField htmlFor="price" label="Precio">
          <input
            className="input-base"
            defaultValue={property?.price ?? ""}
            id="price"
            name="price"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField htmlFor="bedrooms" label="Dormitorios">
          <input
            className="input-base"
            defaultValue={property?.bedrooms ?? ""}
            id="bedrooms"
            name="bedrooms"
            type="number"
          />
        </FormField>
        <FormField htmlFor="bathrooms" label="Banos">
          <input
            className="input-base"
            defaultValue={property?.bathrooms ?? ""}
            id="bathrooms"
            name="bathrooms"
            type="number"
          />
        </FormField>
        <FormField htmlFor="garages" label="Garages">
          <input
            className="input-base"
            defaultValue={property?.garages ?? ""}
            id="garages"
            name="garages"
            type="number"
          />
        </FormField>
        <FormField htmlFor="builtArea" label="Area construida">
          <input
            className="input-base"
            defaultValue={property?.builtArea ?? ""}
            id="builtArea"
            name="builtArea"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField htmlFor="totalArea" label="Area total">
          <input
            className="input-base"
            defaultValue={property?.totalArea ?? ""}
            id="totalArea"
            name="totalArea"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField htmlFor="landArea" label="Area de terreno">
          <input
            className="input-base"
            defaultValue={property?.landArea ?? ""}
            id="landArea"
            name="landArea"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField htmlFor="neighborhood" label="Barrio">
          <input
            className="input-base"
            defaultValue={property?.neighborhood ?? ""}
            id="neighborhood"
            name="neighborhood"
            type="text"
          />
        </FormField>
        <FormField htmlFor="city" label="Ciudad">
          <input
            className="input-base"
            defaultValue={property?.city ?? ""}
            id="city"
            name="city"
            type="text"
          />
        </FormField>
        <FormField htmlFor="department" label="Departamento">
          <input
            className="input-base"
            defaultValue={property?.department ?? ""}
            id="department"
            name="department"
            type="text"
          />
        </FormField>
        <FormField htmlFor="address" label="Direccion">
          <input
            className="input-base"
            defaultValue={property?.address ?? ""}
            id="address"
            name="address"
            type="text"
          />
        </FormField>
        <FormField htmlFor="latitude" label="Latitud">
          <input
            className="input-base"
            defaultValue={property?.latitude ?? ""}
            id="latitude"
            name="latitude"
            step="0.0000001"
            type="number"
          />
        </FormField>
        <FormField htmlFor="longitude" label="Longitud">
          <input
            className="input-base"
            defaultValue={property?.longitude ?? ""}
            id="longitude"
            name="longitude"
            step="0.0000001"
            type="number"
          />
        </FormField>
        <FormField htmlFor="expenses" label="Gastos comunes">
          <input
            className="input-base"
            defaultValue={property?.expenses ?? ""}
            id="expenses"
            name="expenses"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField htmlFor="constructionYear" label="Ano de construccion">
          <input
            className="input-base"
            defaultValue={property?.constructionYear ?? ""}
            id="constructionYear"
            name="constructionYear"
            type="number"
          />
        </FormField>
      </div>
      <div className="mt-6">
        <FormField htmlFor="description" label="Descripcion">
          <textarea
            className="input-base min-h-40"
            defaultValue={property?.description ?? ""}
            id="description"
            name="description"
          />
        </FormField>
      </div>
      <div className="mt-6 flex flex-wrap gap-6">
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input defaultChecked={property?.published ?? false} name="published" type="checkbox" />
          Publicada
        </label>
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input defaultChecked={property?.featured ?? false} name="featured" type="checkbox" />
          Destacada
        </label>
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input
            defaultChecked={property?.investmentOpportunity ?? false}
            name="investmentOpportunity"
            type="checkbox"
          />
          Oportunidad de inversion
        </label>
      </div>
      <div className="mt-8">
        <button className="button-primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
