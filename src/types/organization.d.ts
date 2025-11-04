type OrganizationStatus = "inactive" | "active" | "pending";

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  created_at: Date;
  updated_at: Date | null;
}

type OrganizationFields = Omit<Organization, "id" | "created_at" | "updated_at">;

interface OrganizationRow extends Omit<Organization, "status" | "created_at" | "updated_at"> {
  status: number;
  created_at: string;
  updated_at?: string;
}

type OrganizationBody = Omit<OrganizationRow, "id" | "created_at" | "updated_at">;
