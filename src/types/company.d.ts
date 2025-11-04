interface Company {
  id: string;
  organization_id: string;
  name: string;
  created_at: Date;
  updated_at: Date | null;
}

type CompanyFields = Pick<Company, "name">;

interface CompanyRow extends Omit<Company, "created_at" | "updated_at"> {
  created_at: string;
  updated_at?: string;
}

type CompanyBody = Omit<Company, "id" | "organization_id" | "created_at" | "updated_at">;
