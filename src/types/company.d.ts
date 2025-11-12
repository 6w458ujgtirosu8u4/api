interface Company {
  id: string;
  organization_id: string;
  legal_type_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string | null;
  vat?: string | null;
  registration_date?: string | null;
  created_at: Date;
  updated_at: Date | null;
}

type CompanyFields = Pick<
  Company,
  "name" | "email" | "phone" | "address" | "website" | "vat" | "registration_date" | "legal_type_id"
>;

interface CompanyRow extends Omit<Company, "created_at" | "updated_at"> {
  created_at: string;
  updated_at?: string;
}

type CompanyBody = Omit<Company, "id" | "organization_id" | "created_at" | "updated_at">;
